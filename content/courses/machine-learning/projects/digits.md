---
title: 数字识别与训练框架
comments: false
statistics: false
---

# 数字识别与训练框架

## 这个编号写的是 3 还是 8 {#scenario}

坤坤正在把实验记录里的样品编号录进电脑。有个数字上半圈挤在一起，看着像 3，又像 8。他放大照片看了半天，顺手记下一个小想法：让程序认数字试试。于是找来现成的手写数字图片，训练一个小网络。跑完先看它认错了什么，尤其是那些自己也容易看花眼的数字。

![手写数字识别](/images/ml-guide/project-digits.png)

!!! definition "图像分类与前馈网络"

    图像分类为每张图片预测一个类别。前馈神经网络让输入依次经过若干层计算；本项目将 64 个像素值映射为 10 个类别得分，选择得分最高的数字。

scikit-learn 自带 1797 张图像，不需要额外下载数据。每个像素的取值为 0 到 16；展开后得到 64 维输入。

相关知识：[数组形状](../python-data.md#arrays)、[前馈网络](../neural-networks.md#neurons)、[反向传播](../neural-networks.md#backprop)、[框架接口](../experiments.md#frameworks)、[模型选择](../experiments.md#search)。

## 下载与运行 {#run}

下载 [食品实验室完整项目包](/downloads/ml-guide/ml-lab.zip)，按[运行环境](./index.md#setup)安装并启动。在左侧选择“数字识别”。

本实验的练习文件：`projects/digits/exercises.py`。先运行演示，再填写函数；保存后点击“检查练习”，通过后切到练习模式运行。

![数字识别运行预览](/images/ml-guide/lab-digits.png)

## 看图与实验 {#results}

先运行 scikit-learn 基线。安装 PyTorch 后填写网络和训练步骤，比较训练曲线。错题墙标题“3 → 8”表示真实数字3被预测成8。点选编号，观察概率，再尝试噪声和平移。

数据集含1797张8×8图像，每张展开为64个输入，像素从0—16缩放到0—1。训练、验证、测试按固定划分分别占约60%、20%、20%。

PyTorch 主线网络为64个输入、一个带整流线性单元（Rectified Linear Unit，ReLU）的隐藏层、10个类别得分。训练时使用交叉熵；评价时转换为各类概率。

错题墙标题“3 → 8”表示真实数字3被预测成8。选择样本后可增加噪声或水平平移；图像使用相同灰度范围，概率图固定在0—1，方便比较变化。平移空出的位置补零，不把右侧像素绕回左侧。

## 填写函数 {#exercises}

### `normalize`

像素的已知范围为0到16，转换为0到1并展平。

??? tip "接口提示"

    reshape(-1,64).astype("float32") / 16；先检查形状、范围与有限性。

### `build_network`

隐藏层用 ReLU；最后输出10个类别得分。

??? tip "接口提示"

    nn.Sequential(nn.Linear(64,hidden), nn.ReLU(), nn.Linear(hidden,10))。

### `train_step`

每个批次先清除旧梯度，再计算损失、反向传播并更新参数。

??? tip "接口提示"

    optimizer.zero_grad() → model(x) → cross_entropy → backward() → optimizer.step()。

### `evaluate`

预测时关闭梯度计算，返回概率和概率最大的类别。

??? tip "接口提示"

    model.eval() 与 torch.no_grad()；softmax(dim=1)，再转 numpy。

## 训练框架

scikit-learn 是可直接运行的基线。PyTorch 用来填写网络与训练步骤，额外安装：

```bash
python -m pip install -r requirements-torch.txt
```

TensorFlow 保留完整对照示例，按需安装 `requirements-tensorflow.txt`。三个框架共享数据划分；初始化和优化实现不同，分数差异需要结合设置分析。

## 进阶与记录 {#comparison}

固定数据划分和种子，分别改变隐藏层宽度、学习率、训练轮数。根据验证曲线选配置，再打开测试集。TensorFlow 为完整接口对照，不要求三套框架都安装。

“实验记录”保存当前会话中的参数、种子、指标和结果表，可下载 CSV 或 JSON。修改代码或训练参数后，旧结果会提示待更新；查看图中样本不会重新训练。完整参考实现放在 `solutions/digits.py`。
