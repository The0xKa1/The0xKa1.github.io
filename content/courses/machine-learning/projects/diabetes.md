---
title: 酒精含量预测
comments: false
statistics: false
---

# 酒精含量预测

## 遮住一列，看看能估多准 {#scenario}

翻成分表时，坤坤又盯上了酒精这一列：其他指标都知道，能不能把它估出来？他另存了一份表，把 `alcohol` 列取出来当答案，剩下 12 列交给岭回归。跑完以后，把实测值和预测值并排放着看。光看一长列数字很费眼，画成残差图，偏得远的样品就显出来了。

![酒精含量预测](/images/ml-guide/project-prediction.png)

!!! definition "回归、基线与残差"

    回归预测连续数值；基线是用来比较的简单规则。岭回归（Ridge regression）在线性回归中加入权重平方惩罚。残差是实际值减预测值，用来观察预测偏高还是偏低。

数据包含 178 条葡萄酒记录。将 `alcohol`（酒精）列作为预测目标，另外 12 项指标作为输入。

!!! quote "参考资料"

    [数据说明](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_wine.html)

相关知识：[线性回归](../linear-models.md#linear-regression)、[损失函数](../linear-models.md#loss)、[特征缩放](../linear-models.md#scaling)、[正则化](../evaluation.md#overfitting)、[交叉验证](../evaluation.md#validation)、[数据泄漏](../evaluation.md#leakage)。

## 运行与数据划分

[运行环境](./index.md#setup) · [wine-regression.py](/downloads/ml-guide/wine-regression.py)

```bash
python wine-regression.py
```

`load_wine(as_frame=True)` 读取成分表。用 `y = dataset.data["alcohol"]` 取出目标，`X = dataset.data.drop(columns="alcohol")` 留下其余指标。脚本留出 20% 测试数据，其余用于训练与选参数。缩放放在数据管道（Pipeline，将预处理和模型串联的对象）内，每一折只用该折训练部分计算缩放参数。

## 参数选择

Ridge 在线性回归的训练目标中加入 L2 正则化（权重平方和惩罚），`alpha` 控制约束强度。脚本比较五个候选值：

```python
folds = KFold(n_splits=5, shuffle=True, random_state=42)
search = GridSearchCV(
    model,
    {"ridge__alpha": [0.01, 0.1, 1, 10, 100]},
    scoring="neg_mean_absolute_error",
    cv=folds,
)
search.fit(X_train, y_train)
```

每次用四份训练、一份验证，轮换五次，选择平均验证 MAE（Mean Absolute Error，平均绝对误差）最小的参数。Ridge 拟合使用平方误差加正则项，MAE 用于这里的参数比较。

接口按分数越大越好排序，所以使用负 MAE；打印时取负号还原误差。选定参数后，`GridSearchCV` 默认在全部训练数据上重新拟合，测试集用于最终评价。

!!! quote "参考资料"

    [GridSearchCV 接口](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html)

## 误差与残差

基线始终预测训练标签的均值。脚本在同一测试集上比较基线与 Ridge 的 MAE 和决定系数 R²。MAE 越小越好；R² 为 1 表示完全吻合，0 对应预测测试集目标均值的参照水平，也可能为负。

`wine-residuals.png` 的横轴是预测值，纵轴是“真实值减预测值”。零线上方表示低估，下方表示高估。找找离零线最远的点：模型在哪些预测范围内偏差最大？
