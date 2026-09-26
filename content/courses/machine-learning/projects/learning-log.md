---
title: 实验时间统计
comments: false
statistics: false
---

# 实验时间统计

## 报告怎么又写到周日了 {#scenario}

周日晚上，坤坤还在补食品化学的实验报告。做实验时没觉得花了多久，回来找记录、整理表格，半天就过去了。他决定下周随手记一下用时，预习、做实验、写报告各记一笔。攒满一周后，把这些记录放进表格，看看时间究竟耗在了哪儿。

![实验时间统计](/images/ml-guide/project-study.png)

!!! definition "数据表与分组统计"

    数据表用行保存记录、列保存字段。分组统计把同一任务或日期的记录放在一起，再求和或求平均。CSV（Comma-Separated Values，逗号分隔值）是保存这类表格的一种纯文本格式。

相关知识：[函数与列表](../python-data.md#python)、[pandas](../python-data.md#dataframes)、[绘图](../python-data.md#plots)。

## 数据与运行

[运行环境](./index.md#setup) · [learning-log.py](/downloads/ml-guide/learning-log.py) · [learning-log.csv](/downloads/ml-guide/learning-log.csv)

脚本与 CSV 放在同一文件夹，运行：

```bash
python learning-log.py
```

示例文件里放了一周的实验用时记录。`date` 是日期，`subject` 是任务（Prep 为实验预习、Experiment 为做实验、Report 为整理报告），`minutes` 是分钟数。每行代表一段用时记录，同一天可以有多行。

脚本打印各任务和各日期的汇总，在同一文件夹保存 `learning-log-summary.png`。

## 分组统计

```python
totals = records.groupby("subject")["minutes"].sum()
daily = records.groupby("date")["minutes"].sum()
```

第一行将同任务的时长相加，第二行按日期相加。脚本还检查日期、缺失值和负数。缺失时长表示未知，0 表示该项任务没有用时；日均值只覆盖有记录的日期。

## 修改与分析

把示例换成自己的记录，保留列名即可。再加一张按日期排列的折线图：哪天的实验排得最满？整理报告的时间是不是都挤到了周日？
