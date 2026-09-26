# 葡萄酒分类

模型为什么分错这份样品？

## 先观察

先比较多数类基线与逻辑回归，再改两个坐标轴。背景边界只属于两特征模型；完整13特征模型的成绩在下面。选择错分点，查看成分和类别概率。

## 填写函数

### `split_data`

这里收到的是开发数据；在其中保留四分之一作为验证集。

<details><summary>提示 1：思路</summary>

这里收到的是开发数据；在其中保留四分之一作为验证集。

</details>

<details><summary>提示 2：接口</summary>

train_test_split(..., test_size=.25, stratify=y, random_state=seed)。

</details>

### `build_model`

缩放器和分类器要一起 fit；预测时不能重新学习均值和标准差。

<details><summary>提示 1：思路</summary>

缩放器和分类器要一起 fit；预测时不能重新学习均值和标准差。

</details>

<details><summary>提示 2：接口</summary>

Pipeline 或 make_pipeline；StandardScaler 后接 LogisticRegression。

</details>

### `evaluate`

准确率计算预测正确的比例；错分位置是数组位置，不是原表的样本编号。

<details><summary>提示 1：思路</summary>

准确率计算预测正确的比例；错分位置是数组位置，不是原表的样本编号。

</details>

<details><summary>提示 2：接口</summary>

np.flatnonzero；confusion_matrix(..., labels=[0,1,2]) 保持三类矩阵形状。

</details>

### `compare_depths（进阶）`

每个深度重新训练一棵树，分别记录训练和验证准确率。

<details><summary>提示 1：思路</summary>

每个深度重新训练一棵树，分别记录训练和验证准确率。

</details>

<details><summary>提示 2：接口</summary>

DecisionTreeClassifier(max_depth=depth, random_state=seed)。

</details>

## 进阶实验

运行树深度对照，找出训练准确率增加而验证结果没有改善的区间。用验证结果选配置，再评价测试集；不要为追求测试分数反复选择。

## 检查与记录

保存 `exercises.py` 后，先点“检查练习”，再切换到练习模式运行。未完成函数会显示名称；错误检查显示小输入和预期行为。记录参数、结果和一两句解释；实验记录可以下载。完整参考实现位于 `solutions/wine_classification.py`。
