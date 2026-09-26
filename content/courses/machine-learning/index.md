---
title: 机器学习导学
comments: false
statistics: false
---

# 机器学习导学

!!! definition "机器学习"

    机器学习（Machine Learning，ML）通过数据学习用于预测、分组或决策的模型。模型的规则或参数由训练得到。

## 数据与建模 {#foundations}

| 章节 | 内容 |
| --- | --- |
| [Python 与数据](./python-data.md) | 条件与循环、数组形状、表格、缺失值、绘图 |
| [从数据到模型](./basics.md) | 特征与标签、数据划分、基线、经验风险、概率与统计 |
| [线性模型](./linear-models.md) | 向量与矩阵、线性回归、梯度下降、逻辑回归、多分类概率、正则化 |
| [模型评价](./evaluation.md) | 分类与回归指标、交叉验证、偏差与方差、过拟合、数据泄漏 |

## 模型与方法 {#methods}

| 章节 | 内容 |
| --- | --- |
| [距离、间隔与分类](./supervised-methods.md) | 近邻、感知机、支持向量机、核方法 |
| [树模型与集成](./trees-clustering.md) | 决策树、随机森林、梯度提升、自助聚合与堆叠集成 |
| [聚类、降维与异常检测](./unsupervised.md) | K 均值、层次聚类、高斯混合、期望最大化、主成分分析、特征选择、流形学习 |
| [概率与图模型](./probabilistic-models.md) | 似然与后验估计、朴素贝叶斯、隐马尔可夫、图模型、主题模型、采样与变分推断 |
| [神经网络与深度学习](./neural-networks.md) | 前馈网络、反传、卷积与循环网络、注意力、Transformer、训练技巧 |
| [强化学习](./reinforcement-learning.md) | 决策过程、贝尔曼方程、回报估计、动作价值、策略梯度与评价器 |
| [进阶专题](./advanced-topics.md) | 半监督与自监督、迁移与元学习、因果、主动学习、解释、公平与隐私、基础模型、自动机器学习 |
| [实验与模型选择](./experiments.md) | 特征工程、数据管道、超参搜索、三种框架、练习与实验记录 |

## 项目 {#projects}

| 项目 | 实验内容 |
| --- | --- |
| [实验时间统计](./projects/learning-log.md) | 读取表格文件、汇总统计、绘图 |
| [葡萄酒分类](./projects/iris.md) | 分类器、基线与混淆矩阵 |
| [酒精含量预测](./projects/diabetes.md) | 岭回归、交叉验证与残差 |
| [聚类与二维投影](./projects/clustering.md) | 聚类、主成分投影、组号与真实标签 |
| [数字识别](./projects/digits.md) | 用 scikit-learn、PyTorch 或 TensorFlow 训练网络 |
| [格子世界](./projects/gridworld.md) | 从奖励学习动作价值与策略 |

## 课程与教材 {#references}

!!! quote "参考资料"

    [吴恩达：机器学习](https://www.coursera.org/learn/machine-learning) · [李沐：动手学深度学习课程](https://c.d2l.ai/zh-v2/) · [《动手学深度学习》](https://zh.d2l.ai/)。
