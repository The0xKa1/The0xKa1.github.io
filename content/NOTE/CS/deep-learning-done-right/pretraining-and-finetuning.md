---
title: 预训练与微调
comments: false
statistics: false
---

# 预训练与微调

[训练循环](./data-and-training.md#training-loop)从随机参数开始，每个特征都要由当前数据学出来。如果新任务只有几百张图片，已有模型从其他图片中学到的结构能否继续使用？保留哪些部分、让哪些部分改变，需要用同一份留出数据比较。

???quote "医院后门"
    市一院的物资组要招一个司机，在院区之间送药品和标本。来应聘的乔师傅开了十二年出租车，城里哪条路几点堵、哪个路口好掉头，他心里都有数。

    组长先想起去年的事。去年招的人开过货车，组里让他跟新人一起上三周培训，从认路、看导航讲起。他本来会的东西被重讲一遍，反倒跟原来的习惯打架，三周下来送错了好几趟。

    这次组长没让乔师傅学开车，也没让他学认路。乔师傅不熟的是到了以后的事：标本要送检验科的后门，冷链药品走地下一层的货梯，急诊的东西不能在正门停。组长给了他一本薄薄的交接手册，第一周只照着手册改最后那几十米。手册写了又改，他开车的路子一点没动。

    第二周，组长发现院区里限速比外面低，几个岔口他习惯抢的那一下在这里不合适。组长没让他重练，只是每次出车后提醒一两句，乔师傅每回改一点点，一个月下来，车开得和院里的老司机一样稳，城里的路他照样记得。

    ![出租车停在医院后门的货梯口，司机手里拿着一本小册子](/images/deep-learning-done-right/stories-v2/C08.png)

    改动从哪里开始，是组长定的：先只动最后一段，后来允许别的地方也一点点调。乔师傅这十二年的路程就是预训练，后来这一个月叫微调。

## 预训练 {#pretraining}

从头训练通常随机初始化参数 $\theta_0$，再在目标数据 $D_{\text{target}}$ 上优化。预训练先求得 $\theta_{\text{pre}}$，随后以它初始化目标模型。两阶段可以使用相同结构和不同输出头，也可以继续使用原输出头。

两阶段各有目标：$\theta_{\mathrm{pre}}$ 由源数据上的损失得到，目标阶段从它出发最小化 $L_{\mathrm{target}}$，输出、标签与损失仍要彼此匹配。[学习信号](./problem-and-learning.md)区分目标从哪里来，[损失章](./losses.md#matching)规定这些目标怎样进入计算。

监督预训练使用人工或已有系统提供的标签，例如让视觉编码器学习大规模图像分类。自监督预训练从样本本身构造预测目标，例如遮住文本的一部分并预测它，或用前缀预测下一 token。

BERT 使用遮蔽语言建模等目标预训练双向 Transformer，再针对下游任务微调。遮蔽位置可以利用左右上下文；自回归模型在预测下一 token 时只能读取前缀。[BERT 原论文 §3](https://aclanthology.org/N19-1423/)给出了预训练与微调的连接方式。

以自回归训练为例，某条完整序列是 `[BOS, 我, 爱, 学习, EOS]`。输入可取前四项，目标取后四项。若批次大小为 2、有效长度为 4、词表大小为 10,000，输入 ID 的形状为 $[2,4]$，网络输出 logits 为 $[2,4,10000]$，目标为 $[2,4]$。其损失为

$$
\begin{gathered}
L_{\mathrm{LM}}=-\frac1M\sum_{i,t}m_{it}\log p_\theta(x_{i,t+1}\mid x_{i,\le t}),
\\
 M=\sum_{i,t}m_{it}.
\end{gathered}
$$

$m_{it}$ 标记有效目标位置，$M$ 是计入损失的 token 数。某些模型接口会在内部移动 labels；使用这样的接口时传完整标签，不要在外部再移一次。

这与[逐位置交叉熵](./losses.md#reduction)使用同一分母：损失只在有效预测位置求和，再除以有效 token 数。迁移到新的语料时，改变的是样本、起始参数及允许更新的部分；输出仍是给定前缀下的下一项概率。

预训练留下的不只有权重文件，还有分词器、词表、特殊 token、输入归一化和结构配置。换掉其中任何一项，权重接收到的输入含义都可能变。

旧模型的输出类别可能和新任务完全不同。先保留产生表示的部分、重建最后的任务头，可以单独检验已有表示是否足够；表现不足时再扩大可更新范围。

## 冻结与微调 {#update-scope}

把网络写成 $h=f_\theta(x)$、$z=g_\phi(h)$。$f_\theta$ 是编码器，$g_\phi$ 是任务头。比如输入 $X\in\mathbb R^{B\times3\times224\times224}$，视觉编码器输出 $H\in\mathbb R^{B\times768}$；新任务有 5 类，线性头参数为 $W\in\mathbb R^{5\times768}$、$b\in\mathbb R^5$，输出 logits 为 $[B,5]$，任务头共 $768\times5+5=3845$ 个参数。

| 方式 | 本次更新的参数 | 用途与训练代价 |
| --- | --- | --- |
| 冻结编码器，只训练线性头 | $\phi$ | 直接检查预训练表示能否线性区分类别，可缓存固定特征 |
| 解冻末端若干层 | 部分 $\theta$ 与 $\phi$ | 让较高层表示适应新任务 |
| 全参数微调 | 全部 $\theta,\phi$ | 所有表示可调整，需要保存全部可训练参数的梯度和优化器状态 |
| LoRA 等参数高效微调 | 指定的新参数，通常另含任务头 | 限制更新的表示方式，减少可训练状态 |

冻结表示参数的 `requires_grad=False`。这与评估模式是两个设置：若要保持编码器的 BatchNorm 统计量及关闭 Dropout，还需将其设为 `eval()`。当冻结编码器只位于最前端，且不需要对其输入求导时，可以在 `no_grad()` 中提取特征；若冻结层夹在可训练层之间，仍需保留对输入的梯度路径。

下面的片段假设已经加载与任务匹配的 `encoder`，且它输出 $[B,768]$。它展示“固定特征、训练新头”的实际操作，数据加载复用[训练章](./data-and-training.md#training-loop)：

```python
for p in encoder.parameters():
    p.requires_grad_(False)
encoder.eval()
head = torch.nn.Linear(768, 5)
optimizer = torch.optim.AdamW(head.parameters(), lr=1e-3)

head.train()
for images, labels in train_loader:
    with torch.no_grad():
        features = encoder(images)
    logits = head(features)
    loss = torch.nn.functional.cross_entropy(logits, labels)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
```

全参微调时恢复编码器梯度，移除该 `no_grad()`，并把编码器参数加入优化器。可给编码器较小学习率、随机初始化的任务头较大学习率，然后用验证数据选择。若分阶段解冻，新增参数也必须进入优化器；重新创建优化器会重置原有的矩估计。[PyTorch 迁移学习教程](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)展示了冻结与全参更新两种流程。

如果新任务需要改变内部线性映射，只训练最后一层可能不够，而更新所有大矩阵又要保存大量训练状态。能否保留原矩阵，另外学习一个受约束的增量？

## 低秩适配（LoRA） {#lora}

![LoRA 原论文结构图，输入同时进入冻结的预训练权重和可训练的低秩 A、B 分支，两条输出相加](/images/deep-learning-done-right/training/lora-structure.png)

图 1：Hu 等，2021，[LoRA](https://arxiv.org/abs/2106.09685v2) Figure 1，裁去周围正文。蓝色为冻结权重，橙色为可训练分支。

考虑线性层 $y=W_0x$。$x\in\mathbb R^{d_{\text{in}}}$，$W_0\in\mathbb R^{d_{\text{out}}\times d_{\text{in}}}$。LoRA 冻结 $W_0$，学习

$$
\begin{gathered}
y=W_0x+\frac{\alpha}{r}BAx,
\\
 A\in\mathbb R^{r\times d_{\text{in}}},\\

B\in\mathbb R^{d_{\text{out}}\times r}.
\end{gathered}
$$

$r$ 是选定的秩上限，通常远小于输入输出宽度；$\alpha$ 控制更新缩放。$Ax$ 先得到 $r$ 维向量，$B$ 再把它映射回输出宽度。$BA$ 的秩至多为 $r$，因此用较少参数表达一个受约束的权重更新。

若 $d_{\text{in}}=d_{\text{out}}=4096,r=8$，原矩阵有 $16,777,216$ 个参数，LoRA 分支有 $8(4096+4096)=65,536$ 个，是该原矩阵参数量的 $0.390625\%$。这是可训练权重的比例，原矩阵本身仍要存储。

再用二维算一遍：$W_0=I_2$，$x=(2,1)^\top$，$A=[1,-1]$，$B=(0.1,0.2)^\top$，取 $r=\alpha=1$。有 $Ax=1$，$BAx=(0.1,0.2)^\top$，输出为 $(2.1,1.2)^\top$。更新矩阵为

$$
BA=\begin{bmatrix}0.1&-0.1\\0.2&-0.2\end{bmatrix},
$$

其两行成比例，秩为 1。对普通线性权重且关闭 LoRA Dropout 时，合并成 $W_{\mathrm{merged}}=W_0+(\alpha/r)BA$ 后计算 $W_{\mathrm{merged}}x$，输出相同；量化或重新量化则会另带误差。

原论文采用随机初始化 $A$、零初始化 $B$，使初始增量为零。此时第一步 $A$ 的梯度因 $B=0$ 为零，$B$ 通常可得到非零梯度；更新 $B$ 后，两者都能学习。[原论文 §4.1](https://arxiv.org/pdf/2106.09685v2)给出了参数化与初始化方法。

下面是无 Dropout 的最小线性实现，保留并冻结传入层的已有偏置：

```python
import math
import torch
from torch import nn

class LoRALinear(nn.Module):
    def __init__(self, base, rank=8, alpha=8):
        super().__init__()
        self.base = base
        self.base.requires_grad_(False)
        self.scale = alpha / rank
        self.A = nn.Parameter(base.weight.new_empty(rank, base.in_features))
        self.B = nn.Parameter(base.weight.new_zeros(base.out_features, rank))
        nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))

    def forward(self, x):
        return self.base(x) + self.scale * (x @ self.A.T @ self.B.T)

layer = LoRALinear(nn.Linear(4, 3), rank=2, alpha=2)
x = torch.randn(5, 4)
assert layer(x).shape == (5, 3)
trainable = sum(p.numel() for p in layer.parameters() if p.requires_grad)
assert trainable == 2 * (4 + 3)
```

对 Transformer 进行 LoRA 微调时，要明确替换哪些线性层，例如注意力的 query、value 投影，以及每层的 rank、缩放和 Dropout。冻结 $W_0$ 仍需通过该层把梯度传到更早的可训练分支，因此不能简单把整个基础模型包进 `no_grad()`。反传只免去 $W_0$ 的参数梯度及其优化器状态。

让语言模型按要求作答时，输入既包含用户请求，也包含期望回答。哪些位置是上下文，哪些位置要计入训练目标？这项选择由标签掩码决定，与允许更新多少参数是两件事。

## 指令微调 {#instruction-tuning}

监督指令微调把提示和参考回答组织为序列。比如 `[用户问题, 分隔符, 助手回答, EOS]`，模型读取完整前缀，用下一 token 目标学习回答。有的设置只对助手回答及 EOS 计算损失，提示位置和 padding 的标签设为忽略值。这样输入上下文仍参与前向，但不要求模型在损失中复述用户问题。

需要分别处理两类掩码：因果注意力掩码决定当前位置可读哪些信息，标签掩码决定哪些预测计入损失。多轮对话还要定下是否监督所有助手轮次，并留意截断是否切掉了问题或回答。

较长样本按 token 平均时权重更高；按序列平均时每条样本总权重接近。选定归约方式后，与梯度累积的有效 token 计数保持一致。生成评价还需固定解码温度、最大长度和停止条件，详见[评价章](./evaluation-and-generalization.md#generative-evaluation)。

调整完参数后，如何判断收益来自已有表示还是更多训练预算？先保留不更新或只更新任务头的基线，并让比较共享数据划分与评价口径。

## 微调实验 {#procedure}

1. 固定目标任务、数据划分和指标，排查训练文本与测试题的重复。保留基础模型直接评估或只训练头的结果作为基线。
2. 核对模型配置、输入预处理、标签映射和最大长度。检查实际 batch，而不只查看原始数据文件。
3. 选择更新范围并打印可训练参数名、数量。先在几十条样本上确认损失可以下降，再扩大训练。
4. 使用相同验证集比较学习率、更新步数、冻结范围或 LoRA rank。保存验证最优检查点和完整设置。
5. 在目标任务上评价，并用原任务或通用能力子集检查遗忘。目标任务分数提高而旧任务退步时，记录这项取舍，可再比较较小学习率、较少更新或混合数据。
6. 方案确定后做最终测试。LoRA 交付包含适配器权重、对应基础模型版本和配置；更换基础模型会改变适配器叠加的对象。

数据领域是否接近、目标是否一致、目标样本有多少，都会影响合适的更新范围。比较从头训练、冻结、全参和 LoRA 时，数据量、可训练参数量、训练预算与推理成本要一起列出。

预训练的参数与数据预算见[计算预算](./scaling-and-experts.md#compute-budget)；指令微调之后，成对回答偏好的使用方式见[偏好数据](./alignment-and-reasoning.md#preference-data)。
