---
title: 手写数字识别
comments: false
statistics: false
---

# 手写数字识别

坤坤整理实验记录时，发现样本编号都是手写的。有人的 4 像 9，有人的 3 少了一笔。他希望电脑先读出这些数字，把容易认错的留给自己复核。

![手写编号经过卷积网络得到识别结果](/images/ml-guide/teaser-digits.png)

用 MNIST 的 28×28 手写数字训练一个卷积神经网络，再拿自己的笔迹试试。除了识别率，还要检查模型混淆了哪些数字：换一种写法、挪动笔画，看看它什么时候会认错。

## 相关知识

- [卷积神经网络](../neural-networks.md#cnn)：理解模型怎样从局部笔画中提取特征，并在不同位置复用同一组参数。
- [Softmax 与交叉熵](../linear-models.md#softmax)：理解十个数字类别的预测概率，以及训练时怎样衡量预测错误。
- [反向传播](../neural-networks.md#backprop)与[PyTorch 训练循环](../neural-networks.md#pytorch)：了解一次预测之后，误差如何用于更新网络参数。
- [分类指标与混淆矩阵](../evaluation.md#metrics)：除了总准确率，还要找出模型经常认混的数字。
- [训练集、验证集与测试集](../basics.md#split)：把训练、调参和最终评价分开，再观察自己的笔迹与训练数据有什么不同。

[进入实验：下载完整项目包](/downloads/ml-guide/ml-lab.zip) · [查看全部项目](./index.md)

打开项目后选择「手写数字识别」。运行方法见包内 `GETTING_STARTED.md`，原理讲解和练习引导在实验页面里。
