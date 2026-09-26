---
title: 葡萄酒分类
comments: false
statistics: false
---

# 葡萄酒分类

## 这瓶酒该分到哪一类 {#scenario}

坤坤拿到一张葡萄酒成分表，横着有 13 项指标，往下翻还有一百多行。酒精、苹果酸、总酚，单独看都认识，放在一起就不太好判断了。他留出一部分带类别标签的记录，让模型从中学规律，再把剩下的标签遮住，看看它能认对多少。认错的几条单独列出来，回头对着成分表慢慢看。

![葡萄酒分类](/images/ml-guide/project-specimens.png)

!!! definition "分类与混淆矩阵"

    分类学习输入特征与类别之间的对应关系。混淆矩阵将真实类别放在行、预测类别放在列，每个格子记录一种预测组合的数量。

数据由 scikit-learn 提供，共 178 条记录、3 个类别。

!!! quote "参考资料"

    [数据说明](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_wine.html)

相关知识：[特征与标签](../basics.md#features-labels)、[数据划分](../basics.md#split)、[基线](../basics.md#baseline)、[逻辑回归](../linear-models.md#logistic)、[特征缩放](../linear-models.md#scaling)、[分类指标](../evaluation.md#metrics)。

## 运行与数据划分

[运行环境](./index.md#setup) · [wine-classification.py](/downloads/ml-guide/wine-classification.py)

```bash
python wine-classification.py
```

`X` 的 13 列是检测指标，`y` 是类别。脚本使用 142 条训练记录、36 条测试记录；`stratify=y` 保持类别比例，`random_state=42` 固定划分结果。

## 缩放与分类

```python
model = Pipeline([
    ("scale", StandardScaler()),
    ("logistic", LogisticRegression(max_iter=1000)),
])
model.fit(X_train, y_train)
```

Pipeline 在训练集上拟合缩放参数与分类器。预测测试集时使用相同的缩放参数。

基线 `DummyClassifier` 始终预测训练集中最多的类别。它与模型使用同一测试集计算准确率。想比较不同设置，可以在训练数据内加入[验证集或交叉验证](../evaluation.md#validation)。

## 分类结果

脚本输出分类报告，并保存 `wine-confusion-matrix.png`。混淆矩阵的行是真实类别，列是预测类别；对角线表示正确分类，其他格子显示哪些类别发生了混淆。

报告中的 precision（精确率）、recall（召回率）和 F1 score（精确率与召回率的调和平均）按类别计算，support 是各类测试样本数。换几个 `random_state`，看看这 36 条测试记录换一批后，准确率会变多少。
