# 异常批次侦探

样品冷藏温度与称重记录通常有稳定关系。坤坤需要找出不寻常的批次：阈值太低，正常批次也报警；阈值太高，又可能漏掉问题。

## 看演示 → 写函数 → 做对照 → 挑战

1. 运行默认设置，先看报警，再揭开合成数据的真实标签。
2. 完成 fit_detector、flag_anomalies、evaluate；分数越大越异常。
3. 固定种子，比较 80%、95%、99% 的校准分位数，记录误报、漏报、准确率和召回率。
4. 挑战：添加单变量规则作基线，比较仅看温度与联合看温度、重量。

## 函数接口

### `fit_detector`

输入正常历史记录 N×2；返回拟合后的 IsolationForest。只接收训练集。

### `flag_anomalies`

分数越大越异常；大于等于阈值返回 True，返回布尔数组。

### `evaluate`

输入真实异常布尔标签与报警布尔数组；返回 precision/recall，分母零时取 0。

<details><summary>提示一：思路</summary>

IsolationForest 的 score_samples 越低越异常；调度已取负号。报警阈值从独立正常校准集确定。

</details>

<details><summary>提示二：接口</summary>

IsolationForest.fit；scores >= threshold；precision = TP/(TP+FP)，recall = TP/(TP+FN)。

</details>

完整实现：`solutions/anomaly.py`。练习模式只调用 `projects/anomaly/exercises.py`。

## 完成标准

通过函数检查，跑通练习模式；保存至少两次参数不同的实验记录，说明观察到的变化与原因。检查失败时先核对输入与输出，不要只看图是否漂亮。
