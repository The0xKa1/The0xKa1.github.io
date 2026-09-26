---
title: 项目实践
comments: false
statistics: false
---

# 项目实践

| 项目 | 内容 | 所需知识 |
| --- | --- | --- |
| [实验时间统计](./learning-log.md) | 读取逗号分隔值（Comma-Separated Values，CSV）文件、按任务和日期汇总、绘图 | [Python](../python-data.md#python)、[数据表](../python-data.md#dataframes)、[绘图](../python-data.md#plots) |
| [葡萄酒分类](./iris.md) | 训练分类器，比较基线与分类结果 | [特征与标签](../basics.md#features-labels)、[数据划分](../basics.md#split)、[逻辑回归](../linear-models.md#logistic)、[评价指标](../evaluation.md#metrics) |
| [酒精含量预测](./diabetes.md) | 岭回归、交叉验证、残差分析 | [回归](../linear-models.md#linear-regression)、[正则化](../evaluation.md#overfitting)、[交叉验证](../evaluation.md#validation)、[数据泄漏](../evaluation.md#leakage) |
| [聚类与二维投影](./clustering.md) | 按相似性分组并投影到二维 | [聚类](../unsupervised.md#kmeans)、[主成分分析](../unsupervised.md#pca) |
| [数字识别](./digits.md) | 三种框架的网络训练 | [前馈网络](../neural-networks.md#neurons)、[反向传播](../neural-networks.md#backprop)、[框架接口](../experiments.md#frameworks) |
| [格子世界](./gridworld.md) | 动作价值学习与探索 | [马尔可夫决策过程](../reinforcement-learning.md#mdp)、[动作价值](../reinforcement-learning.md#q-learning-sarsa) |

## 运行环境 {#setup}

Python 3.10 或更新版本，普通中央处理器（Central Processing Unit，CPU）即可。在项目文件夹创建虚拟环境：

```bash
python -m venv .venv
```

Windows 激活命令为 `.venv\Scripts\activate`，macOS、Linux 为 `source .venv/bin/activate`。系统使用 `python3` 命令时，将上述命令中的 `python` 替换为 `python3`。

安装依赖：

```bash
python -m pip install "numpy>=1.24,<3" "pandas>=2,<3" "scikit-learn>=1.4,<2" "matplotlib>=3.8,<4"
```

也可以下载 [requirements.txt](/downloads/ml-guide/requirements.txt)，运行 `python -m pip install -r requirements.txt`。

!!! quote "参考资料"

    [Python：虚拟环境与包](https://docs.python.org/zh-cn/3/tutorial/venv.html)
