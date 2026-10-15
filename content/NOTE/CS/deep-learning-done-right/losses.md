---
title: 损失函数
comments: false
statistics: false
---

# 损失函数

[基础网络](./neural-network-basics.md#activations)已经能为四个二维输入产生分类分数。若两个模型都把某个正类样本判对，一个给它 0.51 的概率，另一个给 0.99，只记“答对一次”就无法区分这两次预测。预测温度时，误差 2 度与 20 度也需要不同的反馈。怎样把预测与标签之间的差距写成一个能指导参数更新的数？

损失函数把这种差距映射为标量。它由任务输出和误差代价决定，再由[反向传播](./backprop-and-optimization.md)计算参数的修改方向。

记 $B$ 为批次大小，$\theta$ 为全部可训练参数，$\hat y=f_\theta(x)$ 为模型预测。一个 batch 的常见目标为

$$
L(\theta)=\frac1B\sum_{i=1}^{B}\ell(f_\theta(x_i),y_i).
$$

$\ell$ 是单样本损失，$L$ 是批次平均损失。若另加正则项，要写明其系数和是否随 batch 大小缩放。

## 输出与标签 {#matching}

一个样本只能属于一个类别，和一个样本可以同时有多个标签，需要不同的概率模型。先核对输出轴和标签含义，再选择计算式：

| 任务 | 网络输出 | 标签 | 常用损失 |
| --- | --- | --- | --- |
| 每个样本预测 $D$ 个实数 | $[B,D]$ 实数 | $[B,D]$ 浮点数 | MSE、MAE |
| 二分类 | $[B]$ 或 $[B,1]$ logits | 完全同形状的 0/1 浮点数 | BCE with logits |
| $C$ 类单标签分类 | $[B,C]$ logits | $[B]$ 整数类别 ID | 交叉熵 |
| $C$ 个可同时成立的标签 | $[B,C]$ logits | $[B,C]$ 的 0/1 浮点数 | 逐标签 BCE |
| 自回归 token 预测 | $[B,T,V]$ logits | $[B,T]$ 的 token ID | 对有效位置求交叉熵 |

logit 是归一化前的分数，可以为负，也不要求和为 1。多类单标签的 softmax 让类别竞争总和为 1 的概率；多标签的 sigmoid 分别判断每个标签，一张图可以同时有“猫”和“室内”。

PyTorch 的 `CrossEntropyLoss` 对类别 ID 模式要求输入 logits 和整数标签，内部完成 log-softmax。把 softmax 概率再传进去会改变目标。二分类可直接使用 `BCEWithLogitsLoss`，省去单独计算 sigmoid 和取对数的数值不稳定。[交叉熵接口](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html)、[BCE 接口](https://docs.pytorch.org/docs/2.14/generated/torch.nn.BCEWithLogitsLoss.html)给出了形状与类型约定。

## 均方误差与高斯似然 {#mse}

当输出是温度这样的实数，预测值与标签可以直接相减。对 $B$ 个样本、每个 $D$ 个输出，按全部元素平均的均方误差为

$$
\begin{gathered}
L_{\mathrm{MSE}}=\frac1{BD}\sum_{i=1}^{B}\sum_{j=1}^{D}(\hat y_{ij}-y_{ij})^2,
\\

\frac{\partial L}{\partial\hat y_{ij}}=\frac{2}{BD}(\hat y_{ij}-y_{ij}).
\end{gathered}
$$

例如两个标量预测为 $[2,4]$，标签为 $[1,2]$，则 $L=(1^2+2^2)/2=2.5$，对预测的梯度为 $[1,2]$。平方使大误差占更高权重；MAE 使用 $|\hat y-y|$，对远离零点的残差给出大小相同的局部梯度。带离群标签的数据可据任务代价比较 MAE、MSE 或在两者之间过渡的 Huber 损失。

MSE 也对应一个概率假设：给定 $x$，标签由均值 $f_\theta(x)$、固定方差 $\sigma^2$ 的高斯分布产生。单个标量标签的负对数似然为

$$
\begin{aligned}
-\log p_\theta(y\mid x)&=\frac{(y-f_\theta(x))^2}{2\sigma^2}\\
&\quad+\frac12\log(2\pi\sigma^2).
\end{aligned}
$$

固定 $\sigma$ 时，第二项与 $\theta$ 无关，最小化该目标与最小化平方误差得到相同的最优参数。若同时学习 $\sigma$，就必须保留对数项，否则模型可以单纯扩大方差来降低第一项。这一对应的一般形式见 [Deep Learning 第 5 章的最大似然部分](https://www.deeplearningbook.org/contents/ml.html)。

回归尺度也会影响训练：同样的物理误差，以厘米表示会比以米表示产生大 $10^4$ 倍的平方误差。多个输出采用不同单位时，可标准化目标，或按任务代价明确指定权重，并在报告指标时还原单位。

只判断最终选中的类别，会丢掉模型对其余结果保留了多少可能性。一次判断错了，几乎排除真实结果与尚有保留，应当得到一样的反馈吗？

???quote "窑门上的数"
    谭伯的窑厂要选一位看火把头。旧考法简单：每窑封门前，师傅说一句这窑成不成，开窑后记个中或不中。年底一算，崔师傅和老范说中的窑数一样多，分不出高下。

    那年他改了章程。封门时，师傅不报成不成，改报一个成数：这窑有几分把握，亲手写在纸条上，压进窑门的泥封里，泥封一合，谁也不许改口。开窑那天取出纸条对着记分，记法只有一条：只看你给开出来的那个结果，留了几成。

    秋里有一窑，崔师傅报了九成，老范报了六成，两人说的都是“能成”。开窑，砖酥了一半。记分的时候，只看他们给“塌”留的那一份：崔师傅留了一成，老范留了四成。章程往下算，留得越薄，账翻得越狠，崔师傅这一窑的分，比老范低出一大截。腊月又烧一窑，两人还是一个九成，一个六成，这回开出来一窑好砖，记分时崔师傅高，老范低。谭伯看得明白：同一个“能成”，两个人心里其实差了很远；一样是错，把话说满的错，比留着余地的错疼得多。还有一回，崔师傅报了十成，窑塌了，按章程这笔账大到记不下，他半年没再上窑台。

    只看开出来的结果这一条，也有讲究。有一窑老范报了七成，开窑完好，有人嘀咕他那三成“不成”是胆小，谭伯没理：账只算他给“成”留的那七成。

    章程用到开春，谁稳谁飘，泥封里的纸条看得清清楚楚。这种先报把握、再按“给实际结果的那份把握”记账的法子，叫负对数损失：给得越低，账越大，谨慎的错和自信的错，分数从来不会一样。

    ![封窑时两位师傅先后把折起的纸条压进窑门泥封；另一格：开窑后半窑砖塌碎，窑主摊开账本取出纸条对照](/images/deep-learning-done-right/stories-v2/K04.png)

## 二元交叉熵 {#bce}

先把二分类标签写成 $y\in\{0,1\}$，令 $p$ 表示正类概率。一次观测的概率可统一写成 $p^y(1-p)^{1-y}$；对它取负对数，便得到下面的损失。这样选定的计分方式对应最大化观测标签的似然。

给一个 logit $z\in\mathbb R$，sigmoid 输出正类概率

$$
\begin{gathered}
p=\sigma(z)=\frac1{1+e^{-z}},\\

\ell_{\mathrm{BCE}}=-y\log p-(1-y)\log(1-p).
\end{gathered}
$$

$y\in\{0,1\}$。当 $y=1$ 时损失为 $-\log p$；当 $y=0$ 时为 $-\log(1-p)$。若 $p=0.8,y=1$，损失约 $0.2231$；若以同样的概率预测错了，即 $p=0.8,y=0$，损失约 $1.6094$。本章对数均为自然对数。

以“下雨”为正类，设两份预报给出的概率分别为 $p=0.2$ 与 $p=0.01$。实际下雨时，损失为 $-\log0.2\approx1.6094$ 与 $-\log0.01\approx4.6052$；按 0.5 阈值选类别，两者都判错，损失仍能分清错误的确信程度。

将 sigmoid 代入并整理，可得

$$
\begin{gathered}
\begin{aligned}
\ell(z,y)&=\max(z,0)-zy\\
&\quad+\log(1+e^{-|z|}),
\end{aligned}
\\
 \frac{\partial\ell}{\partial z}=\sigma(z)-y.
\end{gathered}
$$

稳定形式避免直接计算极大指数或对接近零的概率取对数。对上例 $p=0.8,y=1$，$z=\log4$，梯度为 $-0.2$；梯度下降会增大 $z$，从而提高正类概率。

正类稀少时可改变采样或使用正类权重，但这会改变优化目标及概率解释。训练后的阈值应在验证集上按漏报、误报代价选择，不能把加权损失变小直接解释成所有评价指标都变好。

把这个目标接回二维四点。按 $(0,0),(0,1),(1,0),(1,1)$ 排列，标签为 $[0,1,1,0]$。先用基础章给出的固定隐藏计算 $o=\operatorname{ReLU}(x_1+x_2)-2\operatorname{ReLU}(x_1+x_2-1)$，再加一个可训练输出 $z=\alpha(2o-1)+\beta$。$o$ 在四点上为 $[0,1,1,0]$，$z$ 才是送进 BCE 的 logit。

从 $\alpha=\beta=0$ 开始，四点概率都为 0.5，平均损失为 $\log2$。由 $\partial\ell/\partial z=p-y$，平均后得 $\partial L/\partial\alpha=-0.5$、$\partial L/\partial\beta=0$。用步长 1 更新一次，$\alpha=0.5$，概率变为约 $[0.3775,0.6225,0.6225,0.3775]$，平均损失降至 $0.4741$。这里学习的是输出层的两个参数；隐藏计算仍由手工指定。[训练章](./data-and-training.md#xor-training)会从随机参数训练网络，并单独保留未参与更新的点。

当候选结果超过两个，独立的“是或否”概率不再自动满足总和为一。需要让所有候选共享同一个归一化分母。

## 多类交叉熵与似然 {#cross-entropy}

单样本的 logits 是 $z\in\mathbb R^C$，softmax 概率为

$$
\begin{gathered}
p_c=\frac{e^{z_c}}{\sum_{k=1}^C e^{z_k}},\\

\ell=-\log p_y=-z_y+\log\sum_{k=1}^{C}e^{z_k}.
\end{gathered}
$$

$C$ 是类别数，$y$ 是正确类别的下标。实现时令 $m=\max_k z_k$，把末项写成 $m+\log\sum_k e^{z_k-m}$，减小溢出风险。比如 $z=[\log2,0,0]$，概率为 $[0.5,0.25,0.25]$；若正确类为第一类，损失为 $\log2\approx0.6931$。

用 one-hot 向量 $q$ 表示标签，交叉熵为 $-\sum_c q_c\log p_c$。其对每个 logit 的梯度是

$$
\frac{\partial\ell}{\partial z_c}=p_c-q_c.
$$

上例梯度为 $[-0.5,0.25,0.25]$，既提高正确类分数，也降低其余类的相对分数。对 batch 平均时，再除以 $B$。softmax 对所有 logits 同加一个常数不变，这也解释了该梯度的分量之和为零。

条件独立样本的似然为 $\prod_i p_\theta(y_i\mid x_i)$。取负对数，把连乘转为各样本交叉熵之和，因此监督分类的交叉熵训练就是这一模型下的最大似然估计。

标签平滑可用 $q_c=(1-\epsilon)\mathbf1[c=y]+\epsilon/C$，其中 $\epsilon\in[0,1]$。它把一部分概率分给其他类别，改变模型受到的训练信号。评价时仍应按真实任务标签计算正确率；平滑系数属于验证集选择的超参数。

同一个交叉熵公式用在文本上，还要决定哪些位置算一次观测。长短序列是否具有相同总权重，取决于损失怎样归约。

### 序列长度与损失归约 {#reduction}

语言模型输出 $[B,T,V]$，$T$ 是序列长度，$V$ 是词表大小。每个位置用 $V$ 个 logits 预测下一个 token。可把 logits 展平为 $[BT,V]$、标签展平为 $[BT]$，忽略 padding 后再平均。若有效 token 数为 $M$，目标是 $L=M^{-1}\sum_{i,t}m_{it}\ell_{it}$，其中 $m_{it}\in\{0,1\}$ 表示该位置是否计入损失。

例如给定前缀依次预测 `A`、`B`、`EOS`，三个正确 token 的条件概率为 $0.5,0.25,0.8$。三个位置的损失相加为 $-\log(0.5\times0.25\times0.8)=2.3026$，按有效 token 平均则为 $0.7675$。额外补齐的位置不增加分母；[自回归模型](./generative-models.md#autoregressive)用同一组数连接逐项训练与序列概率。

“先对每条序列平均，再对序列平均”和“对所有有效 token 平均”给长短序列的权重不同。梯度累积、分布式汇总和验证报告必须使用相同的分母约定。对于分割任务，类别维在 PyTorch 中通常位于第 2 维，即输入 $[B,C,H,W]$，目标 $[B,H,W]$；不能直接套用语言模型最后一维为类别的布局。

如果目标给出的是一整组概率，例如教师模型认为几个类别都可能成立，标签就不再只有一个非零位置。怎样衡量预测分布与这组目标分布的差距？

## KL 散度 {#kl}

令 $q$ 为目标分布，$p$ 为模型分布，两者定义在同一组离散事件上。KL 散度为

$$
\begin{aligned}
D_{\mathrm{KL}}(q\|p)&=\sum_c q_c\log\frac{q_c}{p_c}\\
&=H(q,p)-H(q),
\end{aligned}
$$

其中 $H(q,p)=-\sum_c q_c\log p_c$ 为交叉熵，$H(q)=-\sum_c q_c\log q_c$ 为目标自身的熵。$q$ 固定时，最小化交叉熵与最小化这个方向的 KL 对 $p$ 有相同梯度。若 $q=[1,0,0]$，$H(q)=0$，便得到普通分类损失。

KL 一般不对称。例如 $q=[0.5,0.5]$、$p=[0.75,0.25]$，有 $D_{\mathrm{KL}}(q\|p)\approx0.1438$，反向约 $0.1308$。若 $q_c>0$ 而 $p_c=0$，前向 KL 为无穷大。零概率项按 $0\log0=0$ 的极限处理。

知识蒸馏可把教师的类别分布作为 $q$，训练学生的 $p$；[生成模型](./generative-models.md)中的 VAE 则有后验与先验之间的 KL 项。调用 PyTorch `KLDivLoss` 时，默认 input 接收 $\log p$，target 接收 $q$；`reduction='batchmean'` 先对事件维求和再按 batch 平均，和把所有元素求平均的 `mean` 尺度不同。[官方接口说明](https://docs.pytorch.org/docs/2.14/generated/torch.nn.KLDivLoss.html)明确列出了这一约定。

没有人工类别标签时，仍可构造“在这些候选中认出同一对象”的任务。把同一图像的另一种视图当作正确候选，分类的负对数概率便可用于学习表示。

## 对比损失 {#contrastive}

![SimCLR 原图展示同一图像的两个增强视图经过共享编码器和投影头，再在表示空间计算一致性目标](/images/deep-learning-done-right/training/simclr-framework.png)

图 1：Chen 等，2020，[SimCLR](https://proceedings.mlr.press/v119/chen20j.html) Figure 2，裁去周围正文。$f$ 是编码器，$g$ 是投影头，$h$ 与 $z$ 分别是两者的输出。

取 $N$ 张原图，每张生成两种增强，得到 $2N$ 个视图。编码器和投影头给出 $Z\in\mathbb R^{2N\times d}$，$d$ 是投影维度。同一原图的两个视图形成正样本对 $(i,j)$。以 $i$ 为锚点时，它需要从其余 $2N-1$ 个视图中找出 $j$。

$$
\begin{gathered}
\ell_{i,j}=-\log\frac{\exp(s(z_i,z_j)/\tau)}
{\sum_{k\ne i}\exp(s(z_i,z_k)/\tau)},
\\

s(u,v)=\frac{u^\top v}{\|u\|_2\|v\|_2}.
\end{gathered}
$$

$s$ 是余弦相似度，$\tau>0$ 是温度。分母包含正样本，排除锚点自己。实现可先归一化各行，再计算 $ZZ^\top/\tau$ 得到 $[2N,2N]$ 分数矩阵，屏蔽对角线，指定每行的正样本下标后做交叉熵。

举一个三候选的手算例：正样本相似度为 1，两个负样本均为 0，$\tau=0.5$。正样本概率为 $e^2/(e^2+2)\approx0.7870$，损失约 $0.2395$。较低温度会放大候选间的分数差，也会改变梯度大小。

SimCLR 对全部 $2N$ 个锚点平均，两条增强分支共享参数，梯度共同更新编码器与投影头。正样本定义依赖增强是否保留所需语义；不同原图也可能属于同一语义类别，把它们视作负样本会引入冲突。[原论文 §2 与 §5](https://proceedings.mlr.press/v119/chen20j/chen20j.pdf)给出了目标和相关实验。

公式与接口的差异会直接改变梯度。先在可手算的回归、三分类和二分类输入上检查数值，再把同一个接口接入训练循环。

## 损失计算示例 {#check}

```python
import torch
import torch.nn.functional as F

pred = torch.tensor([2., 4.])
truth = torch.tensor([1., 2.])
print(F.mse_loss(pred, truth).item())  # 2.5

z = torch.log(torch.tensor([[2., 1., 1.]], dtype=torch.float64))
z.requires_grad_()
loss = F.cross_entropy(z, torch.tensor([0]))
loss.backward()
print(loss.item())  # 0.693147...
print(z.grad)       # [[-0.5, 0.25, 0.25]]

logit = torch.tensor([4.]).log()
print(F.binary_cross_entropy_with_logits(logit, torch.ones(1)).item())
# 0.223143...
```

运行真实训练前，先打印一次输出形状、标签类型、有效样本数和损失值。随机初始化的均匀 $C$ 类预测，交叉熵应接近 $\log C$；这能帮助发现类别数或归约方式错误。损失用于更新参数，任务表现还要用[评价指标](./evaluation-and-generalization.md#metrics)检查，例如交叉熵降低时分类阈值下的 F1 未必同步提高。
