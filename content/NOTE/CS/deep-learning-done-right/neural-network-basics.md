---
title: 神经网络基础
comments: false
statistics: false
---

# 神经网络基础

[上一章](./representations.md)已经把一批输入写成 $X\in\mathbb R^{B\times d}$。给定两个取值为 0 或 1 的特征，假设目标是在两者不同时输出 1、相同时输出 0。怎样把这条规则写成可调整参数的计算？先检查加权求和能做到哪一步。

## 仿射变换 {#affine}

设输入有 $d$ 个特征，单个神经元先算

$$
a=\sum_{i=1}^{d}w_ix_i+b.
$$

$x_i$ 是输入的第 $i$ 个值，$w_i$ 是对应权重，$b$ 是偏置，$a$ 是加权结果。权重控制各特征的贡献，偏置让响应阈值能够平移。若 $x=(2,-1)$、$w=(3,4)$、$b=0.5$，则 $a=6-4+0.5=2.5$。

同时计算 $m$ 个神经元，就得到一个全连接层：每个输出都连接全部 $d$ 个输入。本文统一采用“每条样本占一行”的记法：

$$
\begin{gathered}
A=XW+b,\\
X\in\mathbb R^{B\times d},\quad W\in\mathbb R^{d\times m},\\
b\in\mathbb R^m,\quad A\in\mathbb R^{B\times m}.
\end{gathered}
$$

矩阵乘法要求中间维度 $d$ 相同；每个输出 $A_{n,j}=\sum_iX_{n,i}W_{i,j}+b_j$，其中 $n$ 是 batch 内样本下标，$j$ 是输出坐标。偏置沿 batch 轴广播。参数量为 $dm+m$，增加 batch 大小只增加同时计算的样本数。

严格说，带偏置的运算是仿射变换，$b=0$ 时才是线性变换。深度学习库通常仍将这一模块命名为 Linear。PyTorch 保存的 `weight` 形状是 $(m,d)$，实际算 `X @ weight.T + bias`；和本文的 $W$ 互为转置。[Linear 文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html)同时列出了权重与输入输出形状。

加权求和可以比较输入的大小，但它能分开交错排列的两类样本吗？如果一层做不到，多接几层是否就够了？

???quote "楼道灯"
    老周管着一栋筒子楼，每晚要登记楼道灯灭没灭。灯在三楼的拐角，门房里看不见；看得见的只有两个开关，一个在门房边的楼梯口，一个在三楼走廊口，两个都管这一盏灯。

    他先是一趟趟上楼看，后来想省腿，就坐在门房记开关，隔几天上楼对一回。攒了一个月的小纸条，他想找出条章程。起先他以为，有一个扳上去，灯就亮。试了，不对。又以为两个都上去才亮，也不对。他把楼下开关记成两份，楼上记成一份，凑个总数，够线算亮，总有几张纸条对不上。及格线从一份挪到两份，再挪回来，还是错。他又添了道手续，先把两份数加起来再查，查来查去，等于还是在总数上画一条线。

    有天夜里，他把纸条铺了一桌，一张张看过去，看明白了。两个开关都朝上，灯灭；都朝下，也灭；一上一下，不管谁上谁下，灯亮。亮不亮，不看一共凑了几份，看两个开关一不一样。

    新章程就两条线：总数多于半份，少于一份半，算亮。这两道线一围，中间正好装下“一上一下”的两种纸条，“同上”和“同下”都被隔在外头。一条线做不到的，两条线围出一段，就够了。

    这种交错的两类，机器学习里叫异或：一条直线分不开，分量、及格线怎么调都还是一条线；得靠非线性的隐藏单元再添一道线，围出中间一条带。

    ![三格剖面，同一栋筒子楼：每格里都能看到一层门房里的老周、一层楼梯口的开关、三楼走廊口的另一个开关和拐角的灯泡；两格里两个开关同上或同下，灯泡是灭的；一格一上一下，灯泡亮着](/images/deep-learning-done-right/stories-v2/K03.png)

## 激活函数 {#activations}

对输入 $x=(x_1,x_2)$，上述目标称为异或（XOR）：$y=1$ 对应 $(0,1),(1,0)$，$y=0$ 对应 $(0,0),(1,1)$。

先允许仿射分数 $g(x)=w_1x_1+w_2x_2+b$ 用阈值作分类，规定 $g(x)>0$ 判为 1，否则判为 0。正确分类要求

$$
\begin{aligned}
b&\leq0, & w_1+w_2+b&\leq0,\\
w_1+b&>0, & w_2+b&>0.
\end{aligned}
$$

前两个不等式相加得到 $w_1+w_2+2b\leq0$，后两个相加却要求同一个量大于 0；无论怎样取权重和偏置，四个条件都不能同时成立。

若接连使用两个仿射层而不插入激活，结果为

$$
\begin{aligned}
&(XW_1+b_1)W_2+b_2\\
&\quad=X(W_1W_2)+(b_1W_2+b_2).
\end{aligned}
$$

两个层可以合并成一个，增加深度没有改变这类函数的形式。非线性激活逐元素作用于 $A$，使网络能够根据输入所在区域采用不同的响应。

常用 [ReLU](https://docs.pytorch.org/docs/stable/generated/torch.nn.ReLU.html) 为 $\operatorname{ReLU}(a)=\max(0,a)$。例如 $(-2,0.5,3)$ 经 ReLU 后变成 $(0,0.5,3)$。在固定的正负激活模式内，带 ReLU 的 MLP 是仿射函数；跨过某个神经元的零点时，组合方式改变，因此整个网络可以形成分段线性的边界。ReLU 在正半轴导数为 1、负半轴为 0；实现会在零点选一个约定的次梯度，PyTorch 取 0。

其他常见激活有

$$
\sigma(a)=\frac{1}{1+e^{-a}},\qquad
\tanh(a)=\frac{e^a-e^{-a}}{e^a+e^{-a}}.
$$

[sigmoid](https://docs.pytorch.org/docs/stable/generated/torch.nn.Sigmoid.html) 的输出在 $(0,1)$，可表示二元概率或门控系数；[tanh](https://docs.pytorch.org/docs/stable/generated/torch.nn.Tanh.html) 在 $(-1,1)$，可用于有正负号的状态。它们在大绝对值输入处趋于饱和，导数变小。隐藏层激活和输出层的选择由计算目的决定：回归头常直接输出实数，分类头输出 logits 后交给损失函数。

要让同一组四点得到正确输出，可以增加两个隐藏单元。输入 $(x_1,x_2)$ 限于 $\{0,1\}^2$，定义

$$
\begin{aligned}
h_1&=\operatorname{ReLU}(x_1+x_2),\\
h_2&=\operatorname{ReLU}(x_1+x_2-1),\\
o&=h_1-2h_2.
\end{aligned}
$$

四种输入 $(0,0),(0,1),(1,0),(1,1)$ 分别得到 $o=0,1,1,0$。单个仿射函数若在前三点输出 $0,1,1$，就被迫在最后一点输出 2；这个两隐藏单元的网络则通过 ReLU 的折点完成了所需映射。

| 输入 $(x_1,x_2)$ | $h_1$ | $h_2$ | $o=h_1-2h_2$ | 目标 $y$ |
| --- | --- | --- | --- | --- |
| $(0,0)$ | 0 | 0 | 0 | 0 |
| $(0,1)$ | 1 | 0 | 1 | 1 |
| $(1,0)$ | 1 | 0 | 1 | 1 |
| $(1,1)$ | 2 | 1 | 0 | 0 |

两个单元如何构成一个条带？令 $s=x_1+x_2$，把同一计算展开到连续输入：

$$
o(s)=\max(0,s)-2\max(0,s-1)
=\begin{cases}
0,&s\leq0,\\
s,&0<s\leq1,\\
2-s,&s>1.
\end{cases}
$$

第一个单元在 $s>0$ 时开始增加输出；第二个在 $s>1$ 后启动，并以两倍幅度扣回，使总输出转而下降。按 $o>1/2$ 判为 1，接受区域恰为 $1/2<x_1+x_2<3/2$，即两条平行直线之间的条带。$y=1$ 的两点 $s=1$，$y=0$ 的两点 $s$ 分别为 0 和 2。这两条平行直线就是最终分类的边界；隐藏单元先产生分段响应，输出层组合它们，再由阈值划出条带。

按本文的行向量约定，这个网络可写为

$$
W_1=\begin{bmatrix}1&1\\1&1\end{bmatrix},\quad b_1=[0,-1],\quad
W_2=\begin{bmatrix}1\\-2\end{bmatrix},\quad b_2=0.
$$

一批输入的形状依次为 $(B,2)\to(B,2)\to(B,1)$。四点的输出恰好为 0 或 1，连续区域上的 $o$ 则是分数；这里固定参数验证可表达性，如何由数据更新这些参数见本章的[参数更新](#training-step)。


## 多层感知机（MLP） {#mlp}

设第 $l$ 层输入宽度为 $d_{l-1}$、输出宽度为 $d_l$：

$$
H^{(0)}=X,\qquad
H^{(l)}=\phi_l\bigl(H^{(l-1)}W_l+b_l\bigr).
$$

$H^{(l)}\in\mathbb R^{B\times d_l}$ 是第 $l$ 层激活，$W_l\in\mathbb R^{d_{l-1}\times d_l}$、$b_l\in\mathbb R^{d_l}$ 是该层参数，$\phi_l$ 是逐元素激活或输出所需的恒等映射。隐藏层夹在输入和任务输出之间，通常没有逐单元的人为标签；它的值由最终损失通过反传约束。

![Dropout 论文图 1a：输入层经两个全连接隐藏层连接到输出节点](/images/deep-learning-done-right/foundations/dropout-fig1a.png)

图 1：摘自 [Srivastava 等，Dropout，2014，图 1(a)](https://jmlr.org/papers/volume15/srivastava14a/srivastava14a.pdf)，只裁取左侧标准网络。圆点表示单元，连线表示层间权重；从底向上是输入、两个隐藏层与输出。原图右侧的随机删单元机制在[评价与泛化](./evaluation-and-generalization.md)中讨论。

权重和偏置跨样本复用，中间激活随输入变化。一个普通前馈 MLP 不在两次独立样本调用之间保存循环状态。训练需要保留部分中间值以便求导；优化器还可能为每个参数保存动量等状态。这些数据的数量和网络参数量应分别计算。

## 前向传播计算示例 {#forward-example}

取一条输入 $X=[1,2]$，网络宽度为 $2\to3\to2$。先算隐藏层：

$$
W_1=\begin{bmatrix}1&-1&0\\0&1&1\end{bmatrix},\quad
b_1=[0,0,-3].
$$

于是

$$
\begin{aligned}
A_1&=XW_1+b_1=[1,1,-1],\\
H&=\operatorname{ReLU}(A_1)=[1,1,0].
\end{aligned}
$$

输出层取

$$
W_2=\begin{bmatrix}1&0\\-1&1\\2&-1\end{bmatrix},\quad
b_2=[0.5,-0.5].
$$

得到两类 logits：

$$
\begin{aligned}
Z&=HW_2+b_2=[0.5,0.5],\\
p&=\operatorname{softmax}(Z)=[0.5,0.5].
\end{aligned}
$$

若标签是类别 0，交叉熵为 $-\log0.5\approx0.693147$。第一层有 $2\times3+3=9$ 个参数，第二层有 $3\times2+2=8$ 个，总共 17 个。第三个隐藏单元在这条输入上为 0，但其输入权重仍属于模型参数，并可能在别的样本上参与计算。

## 参数更新 {#training-step}

对单样本 softmax 交叉熵，输出分数的梯度是 $p-y_{\mathrm{onehot}}$。本例标签的 one-hot 为 $[1,0]$，因此 $\partial\ell/\partial Z=[-0.5,0.5]$。根据矩阵乘法的求导规则，

$$
\frac{\partial\ell}{\partial W_2}=H^\top[-0.5,0.5]
=\begin{bmatrix}-0.5&0.5\\-0.5&0.5\\0&0\end{bmatrix}.
$$

沿第一层继续传播，得到 $\partial\ell/\partial A_1=[-0.5,1,0]$，其中第三项被 ReLU 的零导数截断。使用学习率 $\eta=0.1$ 的 SGD，对全部权重和偏置作 $\theta\leftarrow\theta-\eta\nabla_\theta\ell$ 后，再算同一输入，logits 约为 $[1.535,-0.235]$，类别 0 概率约为 $0.85446$，损失约为 $0.15729$。

下面代码固定了参数，可以复现上述结果。

```python
import torch
from torch import nn

net = nn.Sequential(nn.Linear(2, 3), nn.ReLU(), nn.Linear(3, 2))
with torch.no_grad():
    net[0].weight.copy_(torch.tensor([[1., 0.], [-1., 1.], [0., 1.]]))
    net[0].bias.copy_(torch.tensor([0., 0., -3.]))
    net[2].weight.copy_(torch.tensor([[1., -1., 2.], [0., 1., -1.]]))
    net[2].bias.copy_(torch.tensor([.5, -.5]))

x = torch.tensor([[1., 2.]])
y = torch.tensor([0], dtype=torch.long)
optimizer = torch.optim.SGD(net.parameters(), lr=0.1)
optimizer.zero_grad()
logits = net(x)
loss = nn.functional.cross_entropy(logits, y)
loss.backward()
optimizer.step()
print(logits.detach(), loss.item())
print(net(x).detach())                # tensor([[ 1.5350, -0.2350]])
assert sum(p.numel() for p in net.parameters()) == 17
```

`cross_entropy` 直接接收 logits，内部组合了对数归一化与负对数似然，因此训练代码没有先调 softmax；输入格式见[官方文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html)。预测时可以取 `logits.argmax(-1)`，它与 softmax 后选最大概率得到相同类别。

实际训练通常随机初始化不同单元的权重，以打破它们完全相同的响应。批量训练将损失在样本轴上归约，再对同一组参数累积梯度。增加层宽会提高参数量与计算量；对于图像，直接把每个像素连到所有隐藏单元开销很大。例如 $3072\to128$ 的第一层已有 $393344$ 个参数。[卷积网络](./cnn.md)通过局部连接与共享权重处理这种空间输入。
