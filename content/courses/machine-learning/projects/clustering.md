---
title: 葡萄酒聚类与降维
comments: false
statistics: false
---

# 葡萄酒聚类与降维

## 把标签收起来再分一次 {#scenario}

分类做完了，坤坤想把这张表再折腾一下。他收起类别标签，让 K-means 只看成分，分成三组。屏幕上的每个点是一份酒样，他把原来的类别也画在旁边，两张图来回对着看。有些样品分在一起，有些换了组；他想找的就是这些不一致的地方，再翻回表里看它们的检测值。

![葡萄酒聚类](/images/ml-guide/project-clusters.png)

!!! definition "聚类与降维"

    聚类在没有类别标签的情况下按相似性分组。K-means（K 均值聚类）用 K 个中心表示分组；主成分分析（Principal Component Analysis，PCA）将数据投影到保留较大方差的少数方向。

相关知识：[标准化](../linear-models.md#scaling)、[K-means 与聚类评价](../unsupervised.md#kmeans)、[PCA](../unsupervised.md#pca)。

## 运行 {#run}

[运行环境](./index.md#setup) · [clustering.py](/downloads/ml-guide/clustering.py)

```bash
python clustering.py
```

脚本使用 scikit-learn 自带的 178 条 Wine 记录，在当前目录保存 `clustering-pca.png` 和 `clustering-metrics.json`。

## 分组与投影 {#pipeline}

```python
X = StandardScaler().fit_transform(data.data)
groups = KMeans(n_clusters=3, n_init=20, random_state=42).fit_predict(X)
projected = PCA(n_components=2).fit_transform(X)
```

K-means 使用全部 13 个标准化特征。PCA 把 13 维测量值压成两个坐标来画图；投影重叠的点，在原来的 13 维空间中也可能相隔较远。图的左右两栏使用相同坐标，分别按聚类组别与真实类别着色；组号与类别各自编号，看两栏中哪些点被分在一起即可。

设置 K=3，将葡萄酒分成三组，与三个类别对照。`n_init=20` 用不同初始中心重复拟合，保留目标值较好的结果。

## 读指标 {#results}

| 输出 | 含义 |
| --- | --- |
| `cluster_sizes` | 各组包含多少条记录 |
| `silhouette` | 组内是否紧凑、组间是否分离；不使用真实标签 |
| `adjusted_rand_index` | 聚类与类别分组的一致程度，简称 ARI（Adjusted Rand Index，调整兰德指数）；使用真实标签 |
| `pca_explained_variance_ratio` | 每个投影方向保留的方差比例 |

ARI 比较哪些样本对被分在一起，并校正随机分组的一致性。1 表示分组完全一致，随机分组的期望约为 0，也可能为负。交换整个组的编号不会改变 ARI。

K-means 偏好紧凑团状分布，成分接近的类别可能被混在一起。二维图、轮廓系数和 ARI 分别反映投影、几何结构和标签一致性，回答的问题不同。

!!! quote "参考资料"

    [Wine 数据说明](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_wine.html) · [KMeans](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html) · [PCA](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html) · [Adjusted Rand Index](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.adjusted_rand_score.html)
