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

两个二值特征的[分类例子](./neural-network-basics.md#activations)要求特征不同为 1、相同为 0。单个仿射分类器无法分开这四个点，继续复合仿射层也不改变这一限制；加入非线性后，隐藏表示才可以组合出所需的分类区域。

给定输入 $x$，网络用参数 $\theta$ 定义输出 $f_\theta(x)$。[线性层](./neural-network-basics.md#affine)计算 $Wx+b$，激活函数再改变结果；多层复合得到 MLP。

单层结构的计算方式：

| 原图分支 | 要解决的问题与计算方式 | 章节 |
| --- | --- | --- |
| 全连接 | 输出单元读取输入特征的加权组合 | [MLP](./neural-network-basics.md#mlp) |
| 卷积 | 同一局部模式会出现在不同位置：用局部窗口与共享参数处理 | [卷积与 CNN](./cnn.md#convolution) |
| 循环 | 输入逐步到来：用当前输入和上一隐藏状态更新历史信息 | [RNN](./rnn.md#rnn-cell)、[LSTM](./rnn.md#lstm)、[GRU](./rnn.md#gru) |
| 注意力 | 相同记录需回应不同查询：根据查询与键的匹配程度汇聚值 | [注意力](./attention.md#qkv)、[Transformer](./transformer.md#encoder-block) |

“组织多层”把这些运算接成完整网络。[堆叠](./network-composition.md#stacking)把上一层输出交给下一层；[跳跃连接](./network-composition.md#residual)让输入沿另一条路径参与后面的计算；[融合](./network-composition.md#fusion)通过相加、拼接或门控合并信息。CNN、Transformer 和生成网络会复用这些连接方式。

[两字符采样](./rnn.md#conditional-sampling)固定输出词表为 A、B，每次根据已生成的前缀计算下一项分布。网络输出 logits，softmax 得到概率，采样得到离散 ID，查词表才成为字符。[Transformer](./transformer.md)改变的是计算上下文表示与条件分布的网络结构；序列概率仍按条件概率相乘。

[生成模型](./generative-models.md)进一步比较自回归、AE、VAE、GAN 与扩散中的网络输出、训练目标和采样操作。AE 只以重建输入为训练目标；从潜变量分布取样生成新样本的过程需要另行规定。

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

[最初的四点分类实验](./problem-and-learning.md#task-contract)用前三点拟合分数，训练错误为 0/3，第四点却预测错误；它把训练拟合与留出表现分开。基础章的手工非线性构造证明四点可以被表示，参数如何从数据中学到仍需由训练过程检验。

“泛化性”追问模型能否处理未参与训练的数据。训练误差很低而验证误差很高时，需要检查过拟合、划分方式和分布差异，再考虑数据增强、正则化或调整模型。评价结果因此会返回前面三个主干：重新检查任务约定、表示和结构，或改变训练设置。

## 概念依赖 {#dependencies}

| 计算对象 | 依赖与延伸 |
| --- | --- |
| 二维分类 | [输入与目标](./problem-and-learning.md#task-contract) → [张量轴](./representations.md#tensor-axes) → [非线性表示](./neural-network-basics.md#activations) → [损失](./losses.md#matching)、[梯度](./backprop-and-optimization.md#chain-rule) → [训练](./data-and-training.md#training-loop)与[留出评价](./evaluation-and-generalization.md#generalization) |
| 字符序列 | [词嵌入](./representations.md#embedding) → [状态更新](./rnn.md#rnn-cell)与[条件采样](./rnn.md#conditional-sampling) → [按内容读取](./attention.md#qkv) → [Transformer 层](./transformer.md#encoder-block) → [完整序列生成](./generative-models.md#autoregressive) |
| 参数复用 | [训练状态](./data-and-training.md#state)与[泛化](./evaluation-and-generalization.md#generalization) → [预训练与微调](./pretraining-and-finetuning.md) |
| 交互决策 | [学习信号](./problem-and-learning.md#reinforcement)、网络与参数更新 → [状态、动作与回报](./reinforcement-learning.md#mdp) → [长期价值](./reinforcement-learning.md#value) |
| 位置与现代解码器 | [位置编码](./transformer.md#position)与[Q、K、V](./attention.md#qkv) → [RoPE](./modern-transformer.md#rope)与[长度外推](./modern-transformer.md#long-context)；[LayerNorm](./transformer.md#layernorm)与[FFN](./transformer.md#ffn) → [RMSNorm](./modern-transformer.md#rmsnorm)、[SwiGLU](./modern-transformer.md#swiglu) |
| 序列存储与计算 | [KV cache](./transformer.md#kv-cache) → [GQA](./efficient-sequence-models.md#grouped-query)；[注意力计算成本](./attention.md#training-cost) → [分块注意力](./efficient-sequence-models.md#flash-attention)；[循环状态](./rnn.md#rnn-cell) → [状态空间模型](./efficient-sequence-models.md#state-space) |
| 模型规模与专家 | [预训练](./pretraining-and-finetuning.md#pretraining) → [计算预算与规模规律](./scaling-and-experts.md#compute-budget)；预训练与[SwiGLU](./modern-transformer.md#swiglu) → [混合专家](./scaling-and-experts.md#mixture-of-experts) |
| 偏好与推理计算 | [指令微调](./pretraining-and-finetuning.md#instruction-tuning)与[策略梯度](./reinforcement-learning.md#policy-gradient) → [RLHF](./alignment-and-reasoning.md#rlhf)、[DPO](./alignment-and-reasoning.md#dpo)；[条件采样](./rnn.md#conditional-sampling)与[评价](./evaluation-and-generalization.md) → [推理时计算](./alignment-and-reasoning.md#test-time-compute) |
| 条件图像生成 | [VAE](./generative-models.md#vae)、[扩散](./generative-models.md#diffusion)与[交叉注意力](./attention.md#mask) → [潜空间生成](./generative-models.md#latent-generation)、[条件引导](./generative-models.md#guidance)、[DiT](./generative-models.md#diffusion-transformer)与[流匹配](./generative-models.md#flow-matching) |
| 图像与语言 | [嵌入表示](./representations.md#embedding)、[CNN](./cnn.md)、[Transformer](./transformer.md) → [图文对比对齐](./multimodal-learning.md#contrastive-alignment)与[视觉 token](./multimodal-learning.md#visual-tokens)；视觉 token 与[指令微调](./pretraining-and-finetuning.md#instruction-tuning) → [视觉指令学习](./multimodal-learning.md#visual-instruction) |

[深度学习的来路与远方](./history-and-horizons.md)回顾这些方法的历史与应用边界。

[章节目录](./index.md#chapters)
