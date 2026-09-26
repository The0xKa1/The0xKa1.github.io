---
title: Python 与数据
comments: false
statistics: false
---

# Python 与数据

## Python 基础 {#python}

!!! definition "Python 与基本数据类型"

    Python 是一种编程语言。数字表示可计算的数值，字符串表示文本；列表按顺序保存多个值，字典通过键查找值。循环重复执行操作，条件判断决定执行哪个分支，函数封装可重复调用的操作。

`30` 是数字，`"30"` 是字符串。`for` 用于遍历，`if` 用于条件判断。

下面计算三天的平均学习时长：

```python
def mean_minutes(minutes):
    if len(minutes) == 0:
        return None
    return sum(minutes) / len(minutes)

print(mean_minutes([25, 40, 0]))
```

`return` 返回结果，`print` 显示结果。这里的 0 表示当天没有学习，会参与平均值计算；空列表返回 `None`。

练习：增加一天记录，用循环统计达到 30 分钟的天数。

!!! quote "参考资料"

    [Python：条件、循环与函数](https://docs.python.org/zh-cn/3/tutorial/controlflow.html) · [列表与字典](https://docs.python.org/zh-cn/3/tutorial/datastructures.html)

## 数组与形状 {#arrays}

!!! definition "数组与形状"

    数组（array）是按维度排列的数据。形状（shape）记录每个维度的长度。NumPy（Numerical Python）是支持数组与整组数值运算的 Python 库。

下面每行是一位同学，每列是一天的学习分钟数：

```python
import numpy as np

minutes = np.array([[25, 40, 0], [30, 20, 50]])
print(minutes.shape)        # (2, 3)：2 行、3 列
print(minutes[:, 0])        # 第一天：[25, 30]
print(minutes.mean(axis=1)) # 每位同学的日均时长
```

索引从 0 开始，`:` 选取这一维的全部元素。`axis=1` 对各行求平均，得到两位同学各自的日均时长；`axis=0` 对各列求平均，得到每天两人的平均时长。

!!! quote "参考资料"

    [NumPy 数组入门](https://numpy.org/doc/stable/user/absolute_beginners.html#array-fundamentals) · [李沐：数据操作，P1](https://www.bilibili.com/video/BV1CV411Y7i4?p=1)（视频使用 PyTorch 的多维数组，也称张量；形状和索引的概念相通）

## 数据表与缺失值 {#dataframes}

!!! definition "数据表与缺失值"

    pandas 是处理表格数据的 Python 库。DataFrame 是带行列名称的二维数据表：一行是一条记录，不同列可以保存不同类型。缺失值表示该位置的数据未知或未记录。

```python
import pandas as pd

records = pd.DataFrame({
    "subject": ["Python", "Math", "Python"],
    "minutes": [25, 40, 35],
})
print(records[records["minutes"] >= 30])
print(records.groupby("subject")["minutes"].sum())
```

两次输出分别是时长至少 30 分钟的记录、按科目汇总的总时长。

`pd.read_csv("learning.csv")` 可以读取 CSV（Comma-Separated Values，逗号分隔值）表格文件。`head()` 查看前几行，`dtypes` 查看列类型，`isna().sum()` 统计缺失值。缺失的时长表示未知，填成 0 会改变数据含义。

练习：增加 `hours` 列，将分钟换算为小时。

!!! quote "参考资料"

    [数据预处理](https://zh.d2l.ai/chapter_preliminaries/pandas.html) · [李沐：数据预处理，P3](https://www.bilibili.com/video/BV1CV411Y7i4?p=3)

## 数据可视化 {#plots}

!!! definition "数据可视化"

    数据可视化把数值转换成位置、长度、颜色等视觉信息。柱状图比较各组大小，折线图显示随时间的变化，散点图显示两项测量之间的关系。

下面沿用上节的 `records`，用绘图库 Matplotlib 绘制柱状图：

```python
import matplotlib.pyplot as plt

totals = records.groupby("subject")["minutes"].sum()
totals.plot.bar()
plt.ylabel("Minutes")
plt.tight_layout()
plt.show()
```

图中 Python 为 60 分钟，Math 为 40 分钟。坐标轴标明单位，时序数据按日期排序，柱状图通常从零开始，便于比较大小。

!!! quote "参考资料"

    [pandas 绘图示例](https://pandas.pydata.org/docs/getting_started/intro_tutorials/04_plotting.html)
