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

## 先把模型差异看清楚

建议先做[分类边界擂台](./classification-arena.md)：月牙、同心圆与交叉点让线性模型和非线性模型的差异一眼可见。回到本项目，再看真实 Wine 成分数据是否同样需要复杂边界。数据集比较容易分开，准确率接近时，更值得比较两个特征与全部特征、浅树与深树的错误位置。

## 下载与运行 {#run}

下载 [食品实验室完整项目包](/downloads/ml-guide/ml-lab.zip)，按[运行环境](./index.md#setup)安装并启动。在左侧选择“葡萄酒分类”。

本实验的练习文件：`projects/wine_classification/exercises.py`。先运行演示，再填写函数；保存后点击“检查练习”，通过后切到练习模式运行。

![葡萄酒分类运行预览](/images/ml-guide/lab-wine_classification.png)

## 看图与实验 {#results}

先比较多数类基线与逻辑回归，再改两个坐标轴。背景边界只属于两特征模型；完整13特征模型的成绩在下面。选择错分点，查看成分和类别概率。

固定留出20%测试数据；剩余数据再按3:1分成训练和验证两部分。缩放器只在训练数据上拟合，与分类器放入同一个管道。

上方决策边界来自仅使用所选两个特征的模型。下方比较多数类基线、逻辑回归与决策树，另外列出两特征模型供对照。完整13特征模型的表现不能从二维背景直接推断。

混淆矩阵的行是真实类别、列是预测类别。选择错分样本可查看成分、真实类别、预测类别和三类概率；某次验证没有错分时，页面会明确显示。

## 填写函数 {#exercises}

### `split_data`

这里收到的是开发数据；在其中保留四分之一作为验证集。

??? tip "接口提示"

    train_test_split(..., test_size=.25, stratify=y, random_state=seed)。

### `build_model`

缩放器和分类器要一起 fit；预测时不能重新学习均值和标准差。

??? tip "接口提示"

    Pipeline 或 make_pipeline；StandardScaler 后接 LogisticRegression。

### `evaluate`

准确率计算预测正确的比例；错分位置是数组位置，不是原表的样本编号。

??? tip "接口提示"

    np.flatnonzero；confusion_matrix(..., labels=[0,1,2]) 保持三类矩阵形状。

### `compare_depths（进阶）`

每个深度重新训练一棵树，分别记录训练和验证准确率。

??? tip "接口提示"

    DecisionTreeClassifier(max_depth=depth, random_state=seed)。

## 进阶与记录 {#comparison}

运行树深度对照，找出训练准确率增加而验证结果没有改善的区间。用验证结果选配置，再评价测试集；不要为追求测试分数反复选择。

“实验记录”保存当前会话中的参数、种子、指标和结果表，可下载 CSV 或 JSON。修改代码或训练参数后，旧结果会提示待更新；查看图中样本不会重新训练。完整参考实现放在 `solutions/wine_classification.py`。
