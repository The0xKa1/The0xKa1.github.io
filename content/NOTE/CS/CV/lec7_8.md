---
comments: true
---

# CNN Architectures in history

## AlexNet
AlexNet 是一种深度卷积神经网络（CNN）架构，由 Alex Krizhevsky、Ilya Sutskever 和 Geoffrey Hinton 在 2012 年开发。它在 ImageNet 大规模视觉识别挑战赛（ILSVRC）中取得了显著的成功，标志着深度学习在计算机视觉领域的突破。

<figure>
    <img src="../img/lec7-1.png" alt="AlexNet" style="width: 90%;">
    <figcaption>AlexNet</figcaption>
</figure>
>池化层的FLOP相对卷积层来说很小，可以忽略不计



<figure>
    <img src="../img/lec7-2.png" alt="AlexNet" style="width: 90%;">
    <figcaption>AlexNet.cont</figcaption>
</figure>

大部分的Memory都在卷积层，大部分的超参数都在展平之后，因为这里需要把256\*6\*6展平成9216，再变成4096，需要矩阵的大小为9216\*4096；

而浮点数的乘法加法运算集中在卷积层；


## ZFnet

ZFNet 是由 Matthew Zeiler 和 Rob Fergus 开发的一种卷积神经网络架构。它于 2013 年推出，作为 AlexNet 的改进版本，主要关注于更好地可视化和理解 CNN 的中间层。

CONV1: 7x7, instead of 11x11 减小了滤波器的大小，使得原本图像的信息损失更少；

CONV3，4，5： instead of 384, 384, 256 filters use 512, 1024, 512  增加了通道数，增加了模型的复杂度；

与AlexNet一样，模型的得出都是通过实验得出的，而不是理论推导；


## VGG

<figure>
    <img src="../img/lec7-3.png" alt="AlexNet" style="width: 90%;">
    <figcaption>VGG</figcaption>
</figure>

VGG 是由牛津大学的 Visual Geometry Group 开发的一种深度卷积神经网络架构。VGG 网络以其简单而深度的结构著称，通常使用 3x3 的卷积核和 2x2 的池化层。

- **深度**: VGG 网络有多种变体，最常见的是 VGG16 和 VGG19，分别包含 16 和 19 个权重层。
- **卷积核**: 使用小的 3x3 卷积核，能够捕捉到更细致的特征。
- **池化层**: 使用 2x2 的最大池化层来减小特征图的尺寸。
- **全连接层**: 在卷积层之后，通常有几个全连接层，用于分类任务。

VGG 网络在 2014 年的 ImageNet 大规模视觉识别挑战赛中表现优异，展示了深度网络在图像识别任务中的强大能力。


### Features of VGG

<span style="color:blue">All conv are 3x3 stride 1 pad 1</span>,即通过3x3的卷积核，stride为1，padding为1，来代替大尺寸的卷积核，从而减少参数量和计算量；


!!!Example
    - Option1: Conv(5x5,C,C),即一个5x5的卷积核，输入通道为C,有C个这样的卷积核，output size为 $H\times W\times C$

    - Params: $5*5*C*C=25C^2$
    - FLOPs: $(H*W*C)*(5*5*C)=25HWC^2$

    - Option2: tow Conv(3x3,C,C),即一个3x3的卷积核，输入通道为C,有C个这样的卷积核，output size为 $H\times W\times C$,经过两层3x3的卷积，由于从后往前每一次感受野增加K-1,所以总感受野为$1+2(K-1)=2K-1=5$,与5x5的卷积的感受野相同，但是

    - Params: $2*(3*3*C*C)=18C^2$
    - FLOPs: $(H*W*C)*(3*3*C)*2=18HWC^2$
    
    超参数和计算量都比5x5的卷积小

<span style="color:blue">All max pool are 2x2 stride 2,After pool, double #channel</span>

!!!Example
    - Option1: Input: $C \times 2H \times 2W$, Layer: Conv(3x3, $C \rightarrow C$)
      - Memory: $4HWC$
      - Params: $9C^2$
      - FLOPs: $(2H*2W*C)*(3*3*C)=18HWC^2$

    - Option2: Input: $2C \times H \times W$, Layer: Conv(3x3, $2C \rightarrow 2C$)
      - Memory: $2HWC$
      - Params: $9(2C)^2=36C^2$
      - FLOPs: $(H*W*2C)*(3*3*2C)=36HWC^2$
    
    池化操作会减少特征图的空间尺寸（即宽度和高度），从而降低计算复杂度。通过增加通道数，可以在不增加计算量的情况下，保持或增加模型的表达能力。

### AlexNet vs VGG

<figure>
    <img src="../img/lec7-4.png" alt="AlexNet vs VGG" style="width: 90%;">
    <figcaption>AlexNet vs VGG</figcaption>
</figure>

从图中可以直观的看出VGG远比AlexNet深，且参数更多，计算量更大；这说明更深的网络可以获得更好的性能,可以处理更复杂的特征；


## GoogLeNet
> Focus on efficiency


GoogLeNet 是一种深度卷积神经网络架构，由 Google 的研究团队开发，并在 2014 年的 ImageNet 大规模视觉识别挑战赛中取得了优异的成绩。GoogLeNet 的一个显著特点是引入了 Inception 模块，这种模块化设计使得网络能够在保持计算效率的同时，增加深度和宽度。


### Stem network

<figure>
    <img src="../img/lec7-5.png" alt="Stem network" style="width: 90%;">
    <figcaption>Stem network</figcaption>
</figure>

>at the start aggressively downsamples input

<figure>
    <img src="../img/lec7-6.png" alt="Stem network" style="width: 90%;">
    <figcaption>Stem network</figcaption>
</figure>

将输入的大数据进行下采样(3x224x224) -> (192x28x28)

### Inception Module

<figure>
    <img src="../img/lec7-7.png" alt="Inception Module" style="width: 90%;">
    <figcaption>Inception Module</figcaption>
</figure>
> Local unit with parallel branches

Inception模块的设计允许在 **并行** 的情况下使用多种滤波器尺寸（例如1x1、3x3、5x5）进行卷积，从而使网络能够捕捉不同尺度的特征。

它还包括一个池化操作。这些操作的输出在深度维度上进行连接，这有助于网络在不显著增加计算成本的
情况下学习更复杂的特征。

这使得局部特征在可以重复出现很多次；

- 1x1卷积：减少通道数，降低后面卷积网络的计算量；
- 3x3卷积：捕捉局部特征；
- 5x5卷积：捕捉更大范围的特征；
- 池化操作：捕捉全局特征；

经过不同卷积核的卷积操作（为了让输出的大小一致，这其中也使用的padding），最后将所有输出在深度维度上进行连接；

### Global Average Pooling

<figure>
    <img src="../img/lec7-8.png" alt="Global Average Pooling" style="width: 90%;">
    <figcaption>Global Average Pooling</figcaption>
</figure>

No large FC layers at the end! Instead uses global average pooling to 
collapse spatial dimensions, and one linear layer to produce class scores
(Recall VGG-16: Most parameters were in the FC layers!)

在AlexNet中最后需要将整个输入展平成一个向量，然后进行全连接操作，而在GoogLeNet中，最后使用一个大小与输入大小相同的卷积核，然后进行全局平均池化，得到了一个紧凑的向量，然后进行单层全连接，大大减小了参数量和计算量；


!!!info
    无论是GoogleNet还是VGG，当时都没有Batch Normalization，所以训练多层网络时很困难，为了解决这个问题，它们都是用了一些辅助分类器来使得训练可以正确进行；

    在网络的多个中间点附加“辅助分类器”，这些分类器也尝试对图像进行分类并接收损失。这种方法帮助改善梯度传播问题。

    有了BatchNorm后，就不再需要使用这种技巧来改善训练。

    <figure>
        <img src="../img/lec7-10.png" alt="Global Average Pooling" style="width: 90%;">
        <figcaption>Auxiliary Classifiers</figcaption>
    </figure>

## ResNet

<figure>
    <img src="../img/lec7-11.png" alt="ResNet" style="width: 90%;">
    <figcaption>ImageNet Classification Challenge</figcaption>
</figure>

2015年，ResNet在ImageNet竞赛中取得了惊人的成绩，其错误率仅为3.57%，远低于第二名（4.75%）；同时ResNet的层数达到了惊人的152层！

Once we have Batch Normalization, we can train networks with 10+ layers. What happens as we go deeper?

按理说，网络越深，效果应该越好，因为深层的网络可以通过让其中一些层做恒等变换来拟合浅层的网络，但是一开始人们却发现：

<figure>
    <img src="../img/lec7-12.png" alt="ResNet" style="width: 90%;">
    <figcaption>Underfitting</figcaption>
</figure>

Why?

深层模型在优化上更具挑战性，特别是在学习恒等函数以模拟浅层模型时。这是因为随着网络深度的增加，模型的参数和复杂性也随之增加，这使得优化过程变得更加困难。

!!!Solution
    Change the network so learning identity functions with extra layers is easy!

    通过引入残差块来使得数据可以跳过一些层，从而使得数据可以更容易地学习到恒等函数，从而避免出现欠拟合的现象；

    <figure>
        <img src="../img/lec7-13.png" alt="ResNet" style="width: 90%;">
        <figcaption>Residual Block</figcaption>
    </figure>
    > 如果我们把中间的卷积层设置为0，这就是一个恒等连接~

    具体来说:

    ResNet通过引入残差块来解决深层网络的退化问题。残差块通过“跳跃连接”（skip connection）将输入直接传递到输出，允许网络学习残差映射（即，期望的输出与输入之间的差异），而不是直接学习复杂的映射。这种设计使得网络更容易优化。

    在残差块中，输入通过一个或多个卷积层后，与原始输入相加。这种跳跃连接可以帮助梯度更好地反向传播，缓解梯度消失问题。

    通过使用残差块，ResNet能够有效地训练非常深的网络（如152层），而不会出现退化问题。这是因为即使在深层网络中，跳跃连接也能确保信息流的顺畅传递。

### Structure of ResNet

<figure>
    <img src="../img/lec7-14.png" alt="ResNet" style="width: 90%;">
    <figcaption>ResNet</figcaption>
</figure>
>相同颜色的是一个Block

Like GoogleNet：

- At the beginning, aggressively downsamples input using stem network
- At the end of convolutional layers, use global average pooling to collapse spatial dimensions, and one linear layer to produce class scores


!!!key-point "2 major ResNet Structures"
    **ResNet-18**

    - Stem: 1 conv layer
    - Stage 1 (C=64): 2 res. block = 4 conv
    - Stage 2 (C=128): 2 res. block = 4 conv
    - Stage 3 (C=256): 2 res. block = 4 conv
    - Stage 4 (C=512): 2 res. block = 4 conv
    - Linear
    - ImageNet top-5 error: 10.92
    - GFLOP: 1.8

    **ResNet-34**

    - Stem: 1 conv layer
    - Stage 1: 3 res. block = 6 conv
    - Stage 2: 4 res. block = 8 conv
    - Stage 3: 6 res. block = 12 conv
    - Stage 4: 3 res. block = 6 conv
    - Linear
    - ImageNet top-5 error: 8.58
    - GFLOP: 3.6


### Block design

#### Bottleneck Block

<figure>
    <img src="../img/lec7-15.png" alt="ResNet" style="width: 90%;">
    <figcaption>Bottleneck Block</figcaption>
</figure>

在ResNet中，Bottleneck Block是一种特殊的残差块设计，用于在保持网络深度的同时减少计算量和参数量。Bottleneck Block通过引入1x1卷积层来压缩和扩展特征通道，从而提高网络的效率。

- **1x1卷积层（压缩）**: 这个层用于减少输入特征图的通道数，从而降低计算复杂度。它起到压缩特征的作用。

- **3x3卷积层**: 这是一个标准的卷积层，用于在压缩后的特征图上进行卷积操作，提取特征。

- **1x1卷积层（扩展）**: 这个层用于将特征图的通道数恢复到原始输入的大小。


通过在3x3卷积前后使用1x1卷积，Bottleneck Block能够在不显著增加计算量的情况下增加网络的深度。这种设计使得ResNet可以在更深的网络中保持高效的计算性能。Bottleneck Block特别适合用于非常深的网络（如ResNet-50、ResNet-101、ResNet-152），因为它能够在保持网络深度的同时控制计算复杂度。


#### Relu position

<figure>
    <img src="../img/lec7-16.png" alt="ResNet" style="width: 90%;">
    <figcaption>Relu position</figcaption>
</figure>
>ReLU after residual addition  Cannot actually learn identity function since  outputs are nonnegative

通过在卷积之前应用批归一化和ReLU，预激活结构可以更好地保留输入信息，使得学习恒等映射更容易。这种设计改善了梯度流动，帮助网络更有效地训练。

这种调整虽然带来了轻微的性能提升，但由于复杂性增加，在实际应用中并不总是采用。

## Summary

在图像分类比赛中，以下是各种神经网络的复杂度和性能的总结：

<figure>
    <img src="../img/lec7-17.png" alt="ResNet" style="width: 90%;">
    <figcaption>Summary1</figcaption>
</figure>

<figure>
    <img src="../img/lec7-18.png" alt="ResNet" style="width: 90%;">
    <figcaption>Summary2</figcaption>
</figure>


## Group Convolution

<figure markdown="span">
    ![](./images/lec8-1.png){ width="70%" }
    <figcaption>标准卷积</figcaption>
</figure>

传统的卷积操作中, 每个卷积核的通道数与输入的通道数相同, 即一个卷积核的通道数为$C_{in}$。

<figure markdown="span">
    ![](./images/lec8-2.png){ width="70%" }
    <figcaption>Group Convolution</figcaption>
</figure>

而Group Convolution将输入通道分成若干组（Groups），每组独立进行卷积操作，最后合并结果。

输入通道被均分为 \( G \) 组，每组有 \( C/G \) 个通道。

每个卷积核也对应分成 \( G \) 组，每组卷积核仅处理对应的输入通道组。
>每个Group也可以多个卷积核

各组卷积结果在通道维度拼接，形成最终输出。

!!!Note "Group Convolution"
    - input: $C_{in} \times H \times W$
    - output: $C_{out} \times H \times W$
    - weight: $G \times \dfrac{C_{out}}{G} \times \dfrac{C_{in}}{G} \times K \times K$
    - FLOPS: $C_out \times H \times W \times K \times K \times \dfrac{C_{in}}{G}$

    如果是常规的卷积，那么$G=1$,FLOPS: $C_out \times H \times W \times K \times K \times C_{in}$

计算量直接变为$\dfrac{1}{G}$

<figure markdown="span">
    ![](./images/lec8-5.png){ width="70%" }
    <figcaption>Group Convolution</figcaption>
</figure>

**并行性增强**：各组可并行计算（如在多GPU训练中）。

**模型表达能力调整**：通过调整组数 \( G \)，平衡效率与性能（如ResNeXt通过增加组数提升性能）。

> 在torch.nn.Conv2d中，可以通过groups参数设置分组卷积。

!!!Example 
    <figure markdown="span">
    ![](./images/lec8-3.png){ width="70%" }
    <figcaption>Parallel Convolution</figcaption>
    </figure>

    对于常规的卷积操作，其FLOPS为：

    - 第一层：$HWC \times 4C\times 1\times 1$
    - 第二层：$HWC \times C\times 3\times 3$
    - 第三层：$4HWC \times C\times 1\times 1$

    总的为$17HWC^2$

    对于Parallel Convolution，每一小组的$C_{out}$为$c$

    每一小组的FLOPS为

    - 第一层：$HWc \times 4C \times 1\times 1$
    - 第二层：$HWc \times c\times 3\times 3$
    - 第三层：$HWc \times 4c\times 1\times 1$

    总的为$G(8Cc+9c^2)HWG$,通过设置不同的参数可以实现一样的计算量

    <figure markdown="span">
        ![](./images/lec8-4.png){ width="70%" }
        <figcaption>具体的实现，是在中间分组</figcaption>
    </figure>
   

















    
    
 