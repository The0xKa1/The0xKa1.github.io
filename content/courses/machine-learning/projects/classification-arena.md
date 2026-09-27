---
title: 分类边界擂台
comments: false
statistics: false
---

# 分类边界擂台

坤坤想根据两项检测指标，把两类食品样本分开。第一批样本用一条直线就能分得不错，换一批数据，样本却围成了圈。原来的办法开始频繁出错。

![不同形状的数据与分类边界](/images/ml-guide/teaser-classification.png)

在同一批数据上比较几种分类方法，帮坤坤选出合适的模型。看看它们各自画出的分界线，再加入噪声、调整参数，判断谁能分清新样本，谁只是记住了眼前这些点。

## 相关知识

- [逻辑回归](../linear-models.md#logistic)：理解线性分类边界从哪里来。
- [决策树](../trees-clustering.md#decision-tree)与[核方法](../supervised-methods.md#kernels)：看看分块切分和弯曲边界怎样处理直线分不开的样本。
- [训练集与测试集](../basics.md#split)：用没参与训练的样本比较模型，避免只看训练成绩。
- [过拟合与正则化](../evaluation.md#overfitting)：判断更复杂的边界是在学习规律，还是跟着噪声走。

[进入实验：下载完整项目包](/downloads/ml-guide/ml-lab.zip) · [查看全部项目](./index.md)

打开项目后选择「分类边界擂台」。运行方法见包内 `GETTING_STARTED.md`，原理讲解和练习引导在实验页面里。
