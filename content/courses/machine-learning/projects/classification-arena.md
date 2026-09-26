---
title: 分类边界擂台
comments: false
statistics: false
---

# 分类边界擂台

两类样品在特征平面上绕成了月牙。坤坤画了一条直线，总有一片分错；换成能弯曲的边界，结果会怎样？这里先用合成点集隔离模型差异，再到葡萄酒项目使用真实数据。

![分类边界擂台实际运行预览](/images/ml-guide/lab-classification_arena.png)

## 下载与运行 {#run}

[下载食品实验室完整项目包](/downloads/ml-guide/ml-lab.zip)。第一次使用，先按[环境配置教程](./index.md#setup)打开终端、安装 Python 和依赖。启动后在左侧选择“分类边界擂台”。

练习文件：`projects/classification_arena/exercises.py`。演示查看参考实现；练习使用自己保存的函数。

## 看演示 → 写函数 → 做对照 → 挑战

1. 在三种点集上并排观察逻辑回归、决策树、RBF 核方法。
2. 完成 build_model 与 accuracy；缩放器只能在训练数据上拟合。
3. 固定数据与噪声，比较复杂度 1、3、20；再增加噪声，观察训练与验证差距。
4. 挑战：添加 KNN，比较邻居数；选好配置再运行最终测试。

## 函数接口

### `build_model`

kind 为 逻辑回归/决策树/RBF 核方法；complexity>0。树深取整数，其他模型作 C。返回未拟合模型。

### `accuracy`

两个等长非空一维标签数组；返回正确比例。例：[0,1] 对 [0,0] -> 0.5。

??? tip "提示一：思路"

    直线无法分开交叉点；RBF 用距离形成弯曲的边界，树用轴对齐区域划分。

??? tip "提示二：接口"

    make_pipeline(StandardScaler(), model)；LogisticRegression、DecisionTreeClassifier、SVC(probability=True)。

完整实现：`solutions/classification_arena.py`。练习模式只调用 `projects/classification_arena/exercises.py`。

## 完成标准

通过函数检查，跑通练习模式；保存至少两次参数不同的实验记录，说明观察到的变化与原因。检查失败时先核对输入与输出，不要只看图是否漂亮。
