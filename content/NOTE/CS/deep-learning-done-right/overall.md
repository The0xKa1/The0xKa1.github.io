---
title: 深度学习知识树
comments: false
statistics: false
---

# 深度学习知识树

深度学习包括定义问题、构造模型、实现模型和模型评估四个部分。

## 原始目标树 {#original-tree}

[![深度学习目标树：定义问题、构造模型、实现模型和模型评估四个主干，以及表示、网络结构和训练循环的下级分支](/images/deep-learning-done-right/overall/learning-tree.svg)](/images/deep-learning-done-right/overall/learning-tree.svg)

图：DeepLearningTree 知识树，点击查看 SVG 大图。

## 定义问题 {#problem}

任务输入指预测时能够获得的信息。图像分类可以接收一张图像，语言模型接收已有文本，交互中的智能体接收当前观测。训练时能够获得的标签或未来信息，未必在预测时也能获得；输入约定决定后续的数据整理和评价方式。

输出可以是类别、数值、生成的序列或动作。类别通常由各类分数或概率得到，连续预测直接产生数值，生成可以连续做多次条件预测，动作则会影响下一步的观测。原图中的分类、生成、决策和预测由这些输出要求引出，具体表示见[问题与输出](./problem-and-learning.md#outputs)和[输出张量、分数与概率](./representations.md#output-representations)。

学习方式按训练信号区分。监督学习使用样本附带的目标，自监督学习从数据内部构造目标，无监督学习拟合数据结构，强化学习利用交互中的奖励。

## 构造模型 {#model}

原始信息先变成数值张量。表格特征需要固定的列顺序，图像需要解释高度、宽度和通道，文本需要从 token 编号查到嵌入向量。batch 轴把多条样本组织成一次计算。对应的[数据表示](./representations.md)包括特征向量、像素张量和嵌入向量。

给定输入 $x$，网络用参数 $\theta$ 定义输出 $f_\theta(x)$。[线性层](./neural-network-basics.md#affine)计算 $Wx+b$，激活函数再改变结果；多层复合得到 MLP。

单层结构的计算方式：

| 原图分支 | 计算方式 | 章节 |
| --- | --- | --- |
| 全连接 | 输出单元读取输入特征的加权组合 | [MLP](./neural-network-basics.md#mlp) |
| 卷积 | 在局部窗口中运算，并在不同位置共享参数 | [卷积与 CNN](./cnn.md#convolution) |
| 循环 | 每一步用当前输入和上一隐藏状态计算新状态 | [RNN](./rnn.md#rnn-cell)、[LSTM](./rnn.md#lstm)、[GRU](./rnn.md#gru) |
| 注意力 | 根据查询与键的匹配程度，对值做加权汇聚 | [注意力](./attention.md#qkv)、[Transformer](./transformer.md#encoder-block) |

“组织多层”把这些运算接成完整网络。[堆叠](./network-composition.md#stacking)把上一层输出交给下一层；[跳跃连接](./network-composition.md#residual)让输入沿另一条路径参与后面的计算；[融合](./network-composition.md#fusion)通过相加、拼接或门控合并信息。CNN、Transformer 和生成网络会复用这些连接方式。

[生成模型](./generative-models.md)包括自回归模型、自编码器、变分自编码器、生成对抗网络和扩散模型，各自定义训练目标与采样过程。

## 实现模型 {#learning}

训练集参与参数更新，验证集用于选择模型和训练设置，测试集用于最终报告。[训练循环](./data-and-training.md#training-loop)包括：

1. 前向传播：把一个 batch 输入网络，得到数值、分数或概率。
2. 计算损失：用与任务匹配的损失比较输出和目标，得到一个标量。
3. 反向传播：沿计算图应用链式法则，求出损失对各参数的梯度。
4. 更新参数：优化器根据梯度及其保存的状态改变参数。
5. 检查停止条件：继续训练就读取后续 batch；达到预定条件后，用选定的模型进入评价。

例如，设一批数据为 $\{(x_i,y_i)\}_{i=1}^{B}$，平均损失为

$$
L(\theta)=\frac{1}{B}\sum_{i=1}^{B}\ell(f_\theta(x_i),y_i).
$$

$B$ 是批量大小，$\ell$ 是单条样本的损失，$L$ 汇总该批次的误差。最基本的梯度下降更新为

$$
\theta \leftarrow \theta-\eta\nabla_\theta L(\theta),
$$

其中 $\eta$ 为学习率。负梯度给出当前点局部减小损失的方向，更新后的损失还取决于步长和函数形状。单样本损失 $\ell$ 的定义见[损失函数](./losses.md)，梯度计算和更新规则见[反向传播与优化](./backprop-and-optimization.md)。

原图的 End？在代码中对应训练轮数、更新步数或验证表现等[停止条件](./data-and-training.md#stopping)。最终评价使用选定的 checkpoint；测试集不参与反复调参。[预训练与微调](./pretraining-and-finetuning.md)进一步解释参数从哪里开始、冻结哪些层，以及 LoRA 怎样改变可训练参数的形式。

## 模型评估 {#evaluation}

“正确性”要落到具体任务上：分类检查类别和概率，回归检查预测误差，生成检查目标分布及样本质量，决策检查回报与任务完成情况。指标的定义决定它能够发现哪些错误，见[评价与泛化](./evaluation-and-generalization.md)。

“泛化性”追问模型能否处理未参与训练的数据。训练误差很低而验证误差很高时，需要检查过拟合、划分方式和分布差异，再考虑数据增强、正则化或调整模型。评价结果因此会返回前面三个主干：重新检查任务约定、表示和结构，或改变训练设置。

<span id="dependencies"></span>

[章节目录](./index.md#chapters)
