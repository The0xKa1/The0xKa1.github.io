---
title: 反向传播与优化
comments: false
statistics: false
---

# 反向传播与优化

[损失函数](./losses.md)把预测与目标的差距变成了一个数。同样的末端误差，可能来自第一层的权重，也可能来自最后一层的偏置。逐个试改参数需要反复运行整个网络；一次改动多个参数，又难以分清各自的影响。能否利用每个运算已经算出的结果，求出每个参数改动一点会让损失变化多少？

???quote "褂子该贵几文"
    顺记成衣铺的少东家接到染坊的信：下月起，靛蓝涨一成。秋褂的价得跟着定，他要知道，一件褂子到底该贵几文。

    他不拍脑袋，从自家柜台往回走。先问自家裁缝：工钱、铺租、素布里子都按住不动，单是面料钱涨一成，褂子价得涨几成？裁缝给了个数。再走到布庄问：别的都按住不动，染费涨一成，布价涨几成？布庄给了个数。最后走到染坊问：靛蓝涨一成，染费涨几成？染坊也给了个数。三家各答自己那一段的比率，谁也管不了别家的账。他把三段比率一路乘回来，得了面料这一路的账。

    还没完。褂子领口的滚边绣线，也是这缸靛蓝染的。绣线这一路，得从绣坊再问到染坊，乘出另一个数。一件褂子上，面料和绣线两路账汇到一处，得加。加完，才是靛蓝涨一成落在一件褂子上的总数。他照着这个数，把秋褂的价抬了几文。

    这笔账他也知道边界。各家给的比率，只在眼下的行市附近作数。过了两年，靛蓝涨了三倍，染坊换了染法，布庄改了配货，原来的三段比率一并作废，他又重新一段一段问了一遍。

    这套往回问价的走法，机器学习里叫反向传播，靠的是链式法则：每一段只管自己的局部变化率，从结果那一头往回走，一路相乘，岔开又合拢的几路相加，走到源头，就知道最上游动一动，末端该跟着动多少，往哪边动。

    ![古镇一条街上，成衣铺少东家拿着账本从布庄走向染坊，染坊门口晾着一排蓝布；另一格：成衣铺柜台上一件蓝布褂子，领口滚边绣线也是蓝色，账本摊在一旁](/images/deep-learning-done-right/stories-v2/K05.png)

## 链式法则与计算图 {#chain-rule}

导数描述当前位置附近的变化率。对标量参数 $\theta$ 和可微损失 $L$，足够小的改动 $\Delta\theta$ 满足

$$
L(\theta+\Delta\theta)-L(\theta)
=\frac{dL}{d\theta}\Delta\theta+o(|\Delta\theta|).
$$

其中余项除以 $|\Delta\theta|$ 后趋于零。若导数为正，略微减小参数会降低损失；若导数为负，则应略微增大。多个参数的偏导数组成梯度 $\nabla_\theta L$，每个偏导都在其余参数固定时计算。

计算图用节点表示中间量、连线表示依赖。若 $u=g(\theta)$，$L=f(u)$，且两个函数在当前对应位置可微，则

$$
\frac{dL}{d\theta}=\frac{dL}{du}\frac{du}{d\theta}.
$$

$\theta$ 是参数，$u$ 是中间结果。前向计算先求 $u$ 和 $L$；反向从 $dL/dL=1$ 出发，用下游传来的导数乘当前运算的局部导数。若一个变量同时流向多条分支，各条路径对它的贡献要相加。

取一个标量计算图。设

$$
a=2\theta,\qquad p=3a,\qquad q=a,\qquad s=p+q.
$$

$\theta$ 是共同的上游输入，$a$ 是分叉前的中间量，$p,q$ 是两路结果，$s$ 是相加后的总量。沿左路的变化率为 $3\times2=6$，右路为 $1\times2=2$，因此

$$
\frac{ds}{d\theta}
=\left(\frac{\partial s}{\partial p}\frac{dp}{da}
+\frac{\partial s}{\partial q}\frac{dq}{da}\right)\frac{da}{d\theta}
=(1\times3+1\times1)\times2=8.
$$

进一步指定目标 $s_\star=6$，损失为 $L=\tfrac12(s-s_\star)^2$。在 $\theta=1$ 时，$a=2,p=6,q=2,s=8,L=2$。先从损失得到 $\partial L/\partial s=2$。由于 $s=p+q$，两条输入各收到 $2$，接着在共同的 $a$ 处累加：

$$
\frac{\partial L}{\partial a}=2\times3+2\times1=8,
\qquad
\frac{dL}{d\theta}=8\times2=16.
$$

加法节点把下游导数原样传给每个输入；同一变量被多处使用时，则把这些使用处传回的贡献求和。这两个动作发生在不同节点。将 $\theta$ 减少 $0.001$，直接重算得到 $s=7.992$、$L=1.984032$；一阶估计给出 $2-16\times0.001=1.984$。

更一般地，若 $L=F(u(\theta),v(\theta))$，各函数在当前点可微，则

$$
\frac{dL}{d\theta}
=\frac{\partial F}{\partial u}\frac{du}{d\theta}
+\frac{\partial F}{\partial v}\frac{dv}{d\theta}.
$$

各项带着自己的符号相加。例如 $u=2\theta,v=-3\theta,F=u+v$ 的总导数为 $-1$。当中间量是向量 $a=g(\theta)\in\mathbb R^m$、参数 $\theta\in\mathbb R^n$，列向量约定下应写成 $\nabla_\theta L=J_g^\top\nabla_aL$，其中 $J_g\in\mathbb R^{m\times n}$ 的第 $(i,j)$ 项为 $\partial a_i/\partial\theta_j$；矩阵乘法同时完成局部影响的相乘与跨分量求和。

共享权重的网络也按这一规则累计来自多个位置的梯度。[RNN](./rnn.md)会从多个时间步累计，[注意力](./attention.md)会从多条矩阵运算路径累计。

反向传播按计算图的逆依赖顺序应用链式法则，累计标量损失对各个参数的导数；优化器再用这些导数决定参数更新。自动微分系统在前向时记录运算及反传所需的中间量，反向按依赖关系执行局部求导。这避免为每个参数单独扰动一次输入，也不需要显式存下庞大的完整 Jacobian。[PyTorch Autograd 文档](https://docs.pytorch.org/docs/2.14/notes/autograd.html)介绍了这类动态计算图及中间量保存方式。

## 反向传播计算示例 {#worked-backprop}

取一个二特征样本 $x=(1,2)^\top$，标量标签 $y=1$。网络只有一个隐藏单元：

$$
\begin{gathered}
a=w^\top x+b,\\
 h=\operatorname{ReLU}(a),\\

\hat y=vh+c,\\
 L=\frac12(\hat y-y)^2.
\end{gathered}
$$

$w\in\mathbb R^2$，$b,v,c,a,h,\hat y,L$ 都是标量，共 5 个可训练参数。这里的 $1/2$ 用来抵消平方求导产生的 2；它与默认 MSE 的尺度不同。

初始参数为 $w=(0.5,-0.25)^\top$、$b=1$、$v=2$、$c=-0.5$。前向结果为

$$
\begin{gathered}
a=0.5\times1-0.25\times2+1=1,\\
 h=1,\\

\hat y=2\times1-0.5=1.5,\\
 L=0.125.
\end{gathered}
$$

从末端回传：

$$
\begin{gathered}
\frac{\partial L}{\partial\hat y}=\hat y-y=0.5,
\\

\frac{\partial L}{\partial v}=0.5h=0.5,
\\

\frac{\partial L}{\partial c}=0.5.
\end{gathered}
$$

输出对 $h$ 的局部导数为 $v=2$，所以 $\partial L/\partial h=0.5\times2=1$。当前 $a=1>0$，ReLU 的局部导数为 1，继续得到

$$
\begin{gathered}
\frac{\partial L}{\partial a}=1,\\

\frac{\partial L}{\partial w}=x=(1,2)^\top,\\

\frac{\partial L}{\partial b}=1.
\end{gathered}
$$

算出了当前位置的影响，还不能知道一次改多少最合适。同一个起点、同一个下降方向，为什么有的更新反而使损失增大？

???quote "定音"
    县文工团晚上有演出，日头还偏西，排练厅里两把二胡都等着定音。

    小邹耳朵不赖，弦一响就听得出高了还是低了，拧轴的方向从没错过：高了就松，低了就紧。可他手重，每把都拧得猛。一把下去，偏高成了偏低；回过一把，又冲成偏高。来来回回，弦越拧越毛，嘣的一声断了一根。他只得翻出新弦，从头再上，比一开始还耽误工夫。

    老沈另是一种拧法：每回只拧一丝，拧完就停，拉一弓，听完再动手。他说不上哪一下能到位。每一丝拧下去音走多少，跟弦眼下的松紧有关，上一把攒下的手感，这一把未必作数，只能拧一下，听一下。

    开演前，老沈的琴安安稳稳定了音；小邹换过弦，还在一把一把地找。两个人拧的方向从头到尾一样：高了松，低了紧。差的只是每把拧多少。

    这个分寸，机器学习里叫学习率：误差只指出眼下该往哪边动；步子太大，会越过最准的地方，落得比刚才还偏；方向对了，还得步子小，每拧一把，重新听一回。

    ![排练厅一角，两把二胡并排：左边一人猛拧弦轴，一根弦崩断弹起；右边一人只拧了一丝，正拉弓侧耳细听](/images/deep-learning-done-right/stories-v2/K06.png)

按参数顺序 $(w_1,w_2,b,v,c)$，梯度为 $(1,2,1,0.5,0.5)$。学习率取 $\eta=0.01$，使用同一次前向所算的全部梯度同时更新：

$$
\begin{gathered}
w'=(0.49,-0.27)^\top,\\
 b'=0.99,\\
 v'=1.995,\\
 c'=-0.505.
\end{gathered}
$$

再次前向有 $a'=0.94$、$\hat y'=1.3703$，损失约 $0.068561$，小于更新前的 $0.125$。学习率过大则可能越过局部下降区域；负梯度只提供当前位置的一阶下降方向。

如果前向时 $a<0$，这个隐藏单元经 ReLU 传回的梯度为零，$w,b$ 在该样本上不会获得更新。$a=0$ 是不可导点，框架要选择一个约定；PyTorch 在这里采用零梯度。

单个样本的逐项求导怎样变成一整批数据的计算？把每个样本的输入排成一行，反传就要沿样本轴累计共享参数的贡献，同时保留每个激活自己的梯度。

## 矩阵求导 {#matrix-gradients}

采用每行一个样本的约定，令

$$
\begin{gathered}
X\in\mathbb R^{B\times d},\\
 W\in\mathbb R^{d\times h},\\

b\in\mathbb R^{h},\\
 A=XW+b,\\
 H=\phi(A).
\end{gathered}
$$

$B$ 是批次大小，$d$ 为输入维度，$h$ 为输出宽度；$b$ 广播到每一行。若下游已经给出 $G_H=\partial L/\partial H\in\mathbb R^{B\times h}$，逐元素激活的反传为

$$
\begin{gathered}
G_A=G_H\odot\phi'(A),\\

\frac{\partial L}{\partial W}=X^\top G_A,\\

\frac{\partial L}{\partial X}=G_AW^\top,\\

\frac{\partial L}{\partial b}=\sum_{i=1}^{B}(G_A)_{i,:}.
\end{gathered}
$$

$\odot$ 表示逐元素乘法。尺寸依次为 $[B,h]$、$[d,h]$、$[B,d]$、$[h]$，与被求导变量一致。偏置在所有行共享，因此必须对 batch 维求和。若上游损失已经按 batch 平均，$G_H$ 已含 $1/B$，这里不再重复除以 $B$。PyTorch `Linear` 存储的 weight 是 $[h,d]$，前向等价于 $XW_{\text{torch}}^\top+b$，读代码时要转换这一记号。

手算得到一组梯度后，怎样检查符号、转置和累加是否正确？在同一个参数点分别比较自动求导与小扰动造成的实际损失变化。

## 自动求导与有限差分 {#gradient-check}

```python
import torch

theta = torch.tensor([.5, -.25, 1., 2., -.5],
                     dtype=torch.float64, requires_grad=True)

def objective(t):
    h = torch.relu(t[0] + 2 * t[1] + t[2])
    prediction = t[3] * h + t[4]
    return .5 * (prediction - 1).square()

loss = objective(theta)
loss.backward()
print(theta.grad)  # [1., 2., 1., .5, .5]

eps = 1e-6
numeric = []
with torch.no_grad():
    for j in range(theta.numel()):
        delta = torch.zeros_like(theta)
        delta[j] = eps
        numeric.append(((objective(theta + delta) -
                         objective(theta - delta)) / (2 * eps)).item())
    updated = theta - .01 * theta.grad
print(numeric)
print(objective(updated).item())  # 0.068561045...
```

中心差分近似 $\partial L/\partial\theta_j\approx[L(\theta+\epsilon e_j)-L(\theta-\epsilon e_j)]/(2\epsilon)$，$e_j$ 是第 $j$ 个坐标方向。这个例子使用双精度、固定输入，并远离 ReLU 的折点。过小的 $\epsilon$ 会放大浮点消减误差，过大则增加近似误差。对于含随机操作的网络，先固定随机性；逐坐标数值检查的成本随参数量增长，只适合小张量和局部运算。

## SGD、动量与 Adam {#optimizers}

设第 $t$ 次更新前的参数为 $\theta_{t-1}$，当前 batch 梯度为 $g_t=\nabla_\theta L_t(\theta_{t-1})$。SGD 使用

$$
\theta_t=\theta_{t-1}-\eta_t g_t.
$$

$\eta_t>0$ 是学习率。小批次梯度随抽样变化，因此相邻步骤的损失可以上升。固定同一批数据才适合检查单步更新是否符合预期。

固定一个标量二次目标 $L(\theta)=\tfrac12\theta^2$，梯度是 $\theta$，一次更新得到 $\theta'=(1-\eta)\theta$。当 $\theta\ne0$ 时，损失严格下降等价于

$$
(1-\eta)^2<1\quad\Longleftrightarrow\quad0<\eta<2.
$$

从 $\theta=-1$ 出发，$\eta=2.5$ 会落到 $\theta'=1.5$，损失从 0.5 升到 1.125；$\eta=0.5$ 则到 $-0.5$，损失降到 0.125。这个上界来自本例的曲率。若目标改成 $\tfrac12\lambda\theta^2$、$\lambda>0$，同样推导得到 $0<\eta<2/\lambda$；坡面越陡，需要的尺度越小。

小批次更新还会随样本改变方向。若多个连续步骤大致同向，能否保留一部分过去的更新信息，减少来回摆动？

带动量的一个常见约定为

$$
\begin{gathered}
v_t=\mu v_{t-1}+g_t,\\

\theta_t=\theta_{t-1}-\eta_t v_t,\\
 v_0=0.
\end{gathered}
$$

$0\le\mu<1$ 控制历史梯度的保留。$v_t$ 与参数同形状，要随检查点保存。若连续两次梯度都是 2，$\mu=0.9$，则 $v_1=2,v_2=3.8$；另一种把梯度乘 $1-\mu$ 的定义会改变尺度，比较公式和实现时要先统一约定。

不同坐标的梯度尺度也可能相差很大。Adam 利用每个坐标过去的梯度与梯度平方，分别估计方向和缩放量：

$$
\begin{gathered}
m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,\\

v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2,
\end{gathered}
$$

$$
\begin{gathered}
\hat m_t=\frac{m_t}{1-\beta_1^t},\\

\hat v_t=\frac{v_t}{1-\beta_2^t},\\

\theta_t=\theta_{t-1}-\eta_t\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon}.
\end{gathered}
$$

平方、平方根和除法逐元素进行。$m_t,v_t$ 初始为零；$\beta_1,\beta_2$ 是衰减系数；$\epsilon>0$ 避免分母为零。偏差修正补偿零初始化导致的早期缩小。若首步标量梯度为 2，$\beta_1=0.9,\beta_2=0.999$，则 $m_1=0.2,v_1=0.004$，修正后为 2 和 4；忽略极小的 $\epsilon$，首步参数减少约 $\eta_1$。

![Adam 原论文对比使用和不使用偏差修正时，不同二阶矩衰减系数下的训练成本曲线](/images/deep-learning-done-right/training/adam-bias-correction.png)

图 1：Kingma 与 Ba，[Adam](https://arxiv.org/abs/1412.6980v9) Figure 4，裁去周围正文。红线使用偏差修正，绿线不使用；横轴是学习率的常用对数，纵轴是损失。左右两组分别在训练 10 轮和 100 轮后测量，上下两行与各列改变矩估计的衰减系数。原实验使用 VAE；算法公式见原文 Algorithm 1。

Adam 保存两组与参数同尺寸的矩估计和步数。模型权重之外，梯度、优化器状态与前向激活都会消耗显存。把参数转成较低精度也不代表所有状态都使用同样精度。

AdamW 把权重衰减单独应用到参数，例如先做 $\theta\leftarrow(1-\eta_t\lambda)\theta$，再执行 Adam 更新。$\lambda$ 是衰减系数。将 $\lambda\theta$ 加入梯度的 L2 惩罚会进入 Adam 的矩估计与逐坐标缩放，二者一般不等价。[AdamW 原论文](https://arxiv.org/abs/1711.05101)和 [PyTorch 接口](https://docs.pytorch.org/docs/2.14/generated/torch.optim.AdamW.html)说明了这一分离方式。

## 学习率、裁剪与梯度累积 {#practical-updates}

学习率决定每步走多远。可先用少量训练数据观察损失，寻找能稳定下降的数量级，再在验证集上比较。warmup 在最初若干更新中逐渐提高学习率，随后按预定规则下降。一种余弦调度为

$$
\begin{gathered}
\eta_t=\eta_{\min}+\frac{\eta_{\max}-\eta_{\min}}2
\left(1+\cos\frac{\pi t}{T}\right),\\
 0\le t\le T.
\end{gathered}
$$

这里 $t$ 是 warmup 结束后的更新计数，$T$ 为余弦阶段的总更新数。梯度累积改变每轮 optimizer step 的数量，因此调度器按“轮”还是按“更新”推进必须明确。依赖验证损失的调度器则在完成验证后接收该指标。

全局范数裁剪把所有待更新梯度拼成一个向量，使用

$$
g\leftarrow g\min\left(1,\frac{c}{\|g\|_2}\right),
$$

其中 $c>0$ 是阈值，$g=0$ 时保留原值。裁剪限制这次更新所见的梯度幅度，无法修复错误标签或前向中的 NaN。PyTorch 通常在 `backward()` 之后、`step()` 之前调用 `clip_grad_norm_`。

显存不足时可将一个有效 batch 拆成微批次。例如 4 个各 8 样本的微批，累计后相当于对 32 样本的平均损失求导，前提是样本之间没有改变结果的批次耦合操作。每个微批的平均损失应乘 $8/32$，每组只清零和更新一次。BatchNorm 的微批统计量不同，因此有 BatchNorm 时一般不能宣称与大批次完全等价。

下列片段假设 `group` 是本次更新的若干 `(xb, yb)` 微批，`loss_fn` 按样本平均：

```python
optimizer.zero_grad(set_to_none=True)
count = sum(len(yb) for _, yb in group)
for xb, yb in group:
    loss = loss_fn(model(xb), yb)
    (loss * len(yb) / count).backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()
```

按实际样本数加权可以处理最后不足一组的微批。若损失按 token 平均，这里的权重改为有效 token 数。采用浮点混合精度和梯度缩放时，先反传缩放后的损失，再取消梯度缩放，然后裁剪，最后由缩放器执行更新；[官方 AMP 示例](https://docs.pytorch.org/docs/stable/notes/amp_examples.html)给出了顺序。

检查训练异常时，可以记录损失、学习率、梯度范数以及参数更新量。若损失不降，先确认梯度存在且更新确实发生；若梯度爆炸，定位首次出现非有限值的运算。优化链路正常后，再用[评价与泛化](./evaluation-and-generalization.md)判断模型是否只是更好地记住了训练数据。
