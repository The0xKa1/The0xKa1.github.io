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

## 运行 {#run}

下载 [digits.py](/downloads/ml-guide/digits.py)。三个版本使用相同的数据划分和网络宽度，分别运行即可；无需同时安装三个框架。

=== "scikit-learn"

    ```bash
    python -m pip install numpy scikit-learn
    python digits.py --framework sklearn
    ```

=== "PyTorch"

    ```bash
    python -m pip install numpy scikit-learn torch
    python digits.py --framework pytorch
    ```

=== "TensorFlow"

    ```bash
    python -m pip install numpy scikit-learn tensorflow
    python digits.py --framework tensorflow
    ```

脚本默认运行在中央处理器（Central Processing Unit，CPU），训练 40 轮。`--epochs 80` 可以修改轮数。scikit-learn 提示未收敛时，表示到达了设定的训练上限。

!!! quote "参考资料"

    [digits 数据集](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html) · [PyTorch 安装](https://pytorch.org/get-started/locally/) · [TensorFlow 安装](https://www.tensorflow.org/install/pip)

## 模型与输出 {#model}

网络结构为 **64 个输入 → 32 个整流线性单元（Rectified Linear Unit，ReLU）隐藏单元 → 10 个类别得分**。像素统一除以 16，缩放到 0—1。训练集占 80%，测试集占 20%，划分保留各类别比例。

输出文件名为 `digits-sklearn.json`、`digits-pytorch.json` 或 `digits-tensorflow.json`，保存在脚本旁边，包含准确率与混淆矩阵。矩阵的行是真实数字，列是预测数字。观察非对角线元素，可以知道哪些数字容易混淆。

三个版本的初始化和默认优化设置不同，分数差异也会受这些设置影响。

## 对照实验 {#comparison}

| 改动 | 观察内容 | 对应知识 |
| --- | --- | --- |
| 隐藏单元从 32 改为 8 或 64 | 容量、训练耗时、验证表现 | [欠拟合与过拟合](../evaluation.md#overfitting) |
| 输入用主成分分析（Principal Component Analysis，PCA）压缩 | 维度减少后的准确率和耗时 | [无监督学习与降维](../unsupervised.md) |
| 使用不同随机种子重复训练 | 各次分数及其波动 | [实验记录](../experiments.md#reproduction) |

比较这些设置时，从训练集划出一部分作验证集。用验证结果选好配置，再运行一次测试集，记录最终成绩。
