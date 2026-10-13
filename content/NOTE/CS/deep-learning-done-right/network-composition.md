---
title: 堆叠、残差与特征融合
comments: false
statistics: false
---

# 堆叠、残差与特征融合

一层运算已经能把输入变为新表示。组织多层时，还需确定哪些表示继续向前，哪些跨层保留，来自不同分支的信息在哪里汇合。这些选择会同时改变前向信息流、参数量和梯度路径。

## 顺序堆叠 {#stacking}

令 $H_0=X$，依次计算

$$
H_l=f_l(H_{l-1};\theta_l),\qquad l=1,\ldots,L.
$$

$H_l$ 是第 $l$ 个模块输出，$\theta_l$ 是它的参数，$L$ 是模块数。整个网络为 $f_L\circ\cdots\circ f_1$。每个模块可以是一层线性变换，也可以是“卷积、归一化、激活”的组合。上一层输出尺寸必须符合下一层输入约定。

例如 $X\in\mathbb R^{B\times4}$，经过 `Linear(4,6) → ReLU → Linear(6,2)`，形状依次为 $(B,6),(B,6),(B,2)$。参数量是 $4\times6+6+6\times2+2=44$。ReLU 改变数值但不改变形状，也没有参数。

深层网络的反传包含多层导数相乘。若沿某一标量路径每层导数都是 0.5，经过 10 层后的乘积是 $0.5^{10}\approx0.000977$；若都是 2，则为 $1024$。真实网络的导数是矩阵，但这个例子能说明梯度缩小或增大的来源。增加深度还可能带来更难优化的训练目标，ResNet 论文据此研究了普通网络加深后的训练误差变化。[原论文第 1、3 节](https://openaccess.thecvf.com/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf)给出了比较设定。

## 残差连接 {#residual}

设块输入为 $X\in\mathbb R^{B\times d}$，主分支 $F(X;\theta)$ 输出同样形状。最基本的残差相加是

$$
Y=X+F(X;\theta).
$$

$F$ 学习要添加到输入上的变化。假设一条输入 $x=(1,-2,3)$，主分支算出 $F(x)=(0.2,0.5,-1)$，则相加为 $(1.2,-1.5,2)$。若该块在相加后还使用 ReLU，最终输出就是 $(1.2,0,2)$。

![ResNet 图 2：输入分为两路，一路经过两个权重层，一路直接连接到相加节点，之后接 ReLU](/images/deep-learning-done-right/foundations/resnet-fig2.png)

图 1：摘自 [He 等，ResNet，CVPR 2016，图 2](https://openaccess.thecvf.com/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf)。裁去周围正文，保留相加后的 ReLU。图中 $F(x)$ 经过两个权重层，identity 分支直接传入 $x$。

前向过程中两个分支都使用同一个输入，相加后仍是宽度 $d$ 的表示。恒等分支没有可学习参数，相加需做逐元素加法。参数量由主分支决定；若主分支是 $d\to m\to d$ 的两层 MLP，则有 $dm+m+md+d$ 个参数。

残差也改变反传。先考虑没有相加后激活的 $y=x+F(x)$，对单条样本临时采用列向量记法，令 $J_F=\partial F/\partial x\in\mathbb R^{d\times d}$：

$$
\nabla_x\ell=(I_d+J_F)^\top\nabla_y\ell.
$$

$I_d$ 是 $d\times d$ 单位矩阵，$\ell$ 是最终标量损失。右侧含直接传回的 $\nabla_y\ell$ 与经过主分支的梯度。若再接 ReLU，需要先乘其激活导数；负值位置会被截断。初始化、主分支尺度和归一化仍会影响梯度传播。

## 投影分支 {#projection}

若主分支把 $(B,32,28,28)$ 变成 $(B,64,14,14)$，输入无法原样相加。可以在短接上放投影 $P$：

$$
Y=F(X)+P(X).
$$

选择 $1\times1$ 卷积、stride 2，把 32 个通道映射为 64 个通道，并同时下采样。无偏置时，投影参数量为 $64\times32=2048$。主分支和短接分支需要相同的张量尺寸，各空间位置也要对应相同的采样布局。

一个带 BatchNorm 的卷积残差块可以这样写：

```python
import torch
from torch import nn

class ResidualBlock(nn.Module):
    def __init__(self, cin, cout, stride=1):
        super().__init__()
        self.main = nn.Sequential(
            nn.Conv2d(cin, cout, 3, stride=stride, padding=1, bias=False),
            nn.BatchNorm2d(cout), nn.ReLU(),
            nn.Conv2d(cout, cout, 3, padding=1, bias=False),
            nn.BatchNorm2d(cout),
        )
        self.skip = (
            nn.Identity() if cin == cout and stride == 1
            else nn.Sequential(
                nn.Conv2d(cin, cout, 1, stride=stride, bias=False),
                nn.BatchNorm2d(cout),
            )
        )

    def forward(self, x):
        return torch.relu(self.main(x) + self.skip(x))

block = ResidualBlock(32, 64, stride=2)
x = torch.randn(2, 32, 28, 28)
y = block(x)
assert y.shape == (2, 64, 14, 14)
assert sum(p.numel() for p in block.parameters()) == 57728
```

这里是便于教学的投影残差块。两层主分支卷积分别有 $64\cdot32\cdot9=18432$ 和 $64\cdot64\cdot9=36864$ 个权重；加上短接投影的 2048 个，以及三组 BatchNorm 各 $2\cdot64$ 个可学习参数，总计 $57728$。BatchNorm 的运行均值、方差是另外保存的状态。ResNet 原论文也讨论了无参数补零短接和投影短接等选择。

## 相加、拼接与门控 {#fusion}

当两个分支都描述同一批对象时，可以选择不同的汇合方式。

相加要求各轴匹配，且坐标需要通过设计或训练对应起来。若 $u,v\in\mathbb R^{B\times d}$，则 $u+v$ 仍为 $B\times d$。例如 $(1,2)+(3,4)=(4,6)$，输出已将两路信息叠到同一组坐标。

拼接则沿一个轴保留两路坐标。若 $u\in\mathbb R^{B\times d_1}$、$v\in\mathbb R^{B\times d_2}$，

$$
H=\operatorname{concat}(u,v)\in\mathbb R^{B\times(d_1+d_2)}.
$$

对于 $(1,2)$ 与 $(3,4)$，拼接结果为 $(1,2,3,4)$。拼接本身没有参数，后接 $W\in\mathbb R^{(d_1+d_2)\times m}$ 的线性层才学习如何组合两路信息。例如图像向量宽 128、数值特征宽 16，拼接后宽 144，再投影到 64 维，需要 $144\times64+64=9280$ 个参数。可直接用 `torch.cat([u, v], dim=-1)`，其[文档](https://docs.pytorch.org/docs/stable/generated/torch.cat.html)要求除拼接轴外其余尺寸一致。

对空间特征，$(B,C_1,H,W)$ 与 $(B,C_2,H,W)$ 沿通道拼接成为 $(B,C_1+C_2,H,W)$。编码器深层特征与浅层细节可能有不同高宽，需要先上采样、裁剪或做坐标对齐。[U-Net 原论文](https://arxiv.org/abs/1505.04597)通过上采样与来自编码器的裁剪后特征拼接，将定位细节带入解码过程；原始结构的裁剪与其无补零卷积有关。

还可以让模型决定各路占比。以同形状 $u,v\in\mathbb R^{B\times d}$ 为例：

$$
\begin{aligned}
\alpha&=\sigma([u;v]W_g+b_g),\\
h&=\alpha\odot u+(1-\alpha)\odot v.
\end{aligned}
$$

$[u;v]$ 表示沿特征轴拼接，$W_g\in\mathbb R^{2d\times d}$、$b_g\in\mathbb R^d$ 生成门控，$\sigma$ 是 sigmoid，$\odot$ 是逐元素乘法。每个 $\alpha$ 坐标在 0 到 1 之间。若 $u=(1,2),v=(3,4),\alpha=(0.25,0.75)$，得到 $h=(2.5,2.5)$。门控网络有 $2d^2+d$ 个参数，训练时与两路编码器共同接收最终损失的梯度。多位置的内容相关加权见[注意力](./attention.md)。

## 归一化 {#normalization}

归一化模块按指定的一组坐标计算均值和方差，再缩放、平移：

$$
\hat x_i=\frac{x_i-\mu}{\sqrt{v+\varepsilon}},\qquad
 y_i=\gamma_i\hat x_i+\beta_i.
$$

$\mu,v$ 是该组的均值、方差，$\varepsilon>0$ 避免分母过小，$\gamma,\beta$ 是可学习的缩放和平移。模块之间的重要区别是“哪一组值共享统计量”和“预测时用什么统计量”。

BatchNorm2d 对 $(B,C,H,W)$ 的每个通道，在 batch 与空间位置共 $BHW$ 个值上计算统计量。默认训练模式下用当前 batch 的均值、方差，并维护运行统计量；默认评估模式使用运行统计量。可学习的 $\gamma,\beta$ 各有 $C$ 个元素，运行均值和方差各有 $C$ 个元素，但不由优化器梯度更新。PyTorch 训练归一化使用有偏方差估计，更新运行方差使用无偏估计；两者区别见 [BatchNorm2d 文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d.html)。

LayerNorm 常用于 $(B,T,d)$ 的序列表示，在每个样本、每个位置的最后 $d$ 个特征上算均值和方差。设 `normalized_shape=d`，则 $\gamma,\beta$ 各有 $d$ 个元素。训练和评估都根据当前输入算统计量，不需要 BatchNorm 那样的运行均值。[LayerNorm 原论文](https://arxiv.org/abs/1607.06450)与[官方实现](https://docs.pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html)给出了这种归一化轴的选择。

例如一个位置的特征 $x=(1,3)$，其均值为 2、方差为 1。取 $\gamma=(1,1),\beta=(0,0)$，忽略很小的 $\varepsilon$ 时，归一化结果约为 $(-1,1)$。若用 BatchNorm，参与统计的数值来自同一通道的其他样本及位置，结果一般会不同。

归一化与相加的顺序也改变函数。原始 ResNet 的常见块是 `Conv → BN → ReLU → Conv → BN → Add → ReLU`。序列模型中常见的两种排列是

$$
Y=X+F(\operatorname{LN}(X))\quad\text{（Pre-LN）},
$$

$$
Y=\operatorname{LN}(X+F(X))\quad\text{（Post-LN）}.
$$

LN 表示 LayerNorm。前者把归一化放在主分支内，短接路径直接相加；后者对相加后的结果再归一化。二者在反传中的路径不同，相关分析见 [Xiong 等，On Layer Normalization in the Transformer Architecture](https://proceedings.mlr.press/v119/xiong20b.html)。具体 Transformer block 的完整信息流由[对应章节](./transformer.md)展开。

## 残差块训练示例 {#training}

前向时，框架记录分支运算；反传遇到相加节点，会把输出梯度传给两路，再把汇到同一输入或共享参数上的梯度累加。拼接反传则按原分支宽度切分梯度。除非主动冻结参数或截断计算图，主分支、投影、门控和各编码器都可以由同一个最终损失联合训练。

保存模型时，应同时保存参数和 BatchNorm 运行统计量；要继续原来的优化过程，还需保存优化器状态。`model.eval()` 会改变 BatchNorm、Dropout 等模块的行为，`torch.no_grad()` 则控制是否记录求导所需的计算图。两者分别服务于推理行为和内存计算开销，见 [PyTorch 自动求导说明](https://docs.pytorch.org/docs/stable/notes/autograd.html)。

上面的投影块输入 $(2,32,28,28)$，两路都得到 $(2,64,14,14)$ 后相加；三个 BatchNorm 的统计状态随训练更新，卷积、缩放和平移参数由损失梯度更新。
