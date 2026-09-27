---
title: 实验编程入门
comments: false
statistics: false
---

# 实验编程入门

本页介绍实验用到的 Python、NumPy、pandas、scikit-learn 和 PyTorch。安装与启动步骤见[项目实践首页](./index.md#setup)。

| 实验 | 对应章节 |
| --- | --- |
| 图像处理工作台 | [函数](#python)、[数组](#arrays)、[图像与窗口](#images) |
| 分类边界擂台 | [scikit-learn](#sklearn)、[评价结果](#metrics) |
| 葡萄酒研究室 | [数据表](#dataframes)、[训练管道](#sklearn)、[距离与分组](#broadcasting) |
| 图片颜色压缩 | [形状变换](#shapes)、[距离与分组](#broadcasting)、[K-Means 接口](#kmeans) |
| 手写数字识别 | [Tensor](#tensors)、[网络构建](#modules)、[训练与评价](#training)、[完整示例](#pytorch-example) |
| 小车送样 | [索引与筛选](#indexing)、[随机数与 Q 表](#q-table) |

## 编写与运行 {#running}

在解压后的 `ml-lab` 文件夹中新建 `scratch.py`，写入以下代码并保存：

```python
message = "Hello, lab!"
print(message)
```

另开终端，进入包含 `app.py` 的文件夹，运行 `scratch.py`。Windows 使用 `.venv\Scripts\python.exe scratch.py`；macOS / Linux 使用 `.venv/bin/python scratch.py`。屏幕应显示 `Hello, lab!`。这是终端命令，不要写进 `.py` 文件，也不要把 Markdown 代码框的三个反引号复制进去。

本页代码示例可独立运行，依赖前文的示例会单独注明。实验代码写在 `projects/项目名/exercises.py`，保存后在网页检查；`scratch.py` 用于试算。

实验包已经列出基础依赖。数字识别另外需要 PyTorch，在同一个虚拟环境里安装：

```sh
# macOS / Linux，在 ml-lab 文件夹中执行
.venv/bin/python -m pip install -r requirements-torch.txt
```

Windows 对应命令为 `.venv\Scripts\python.exe -m pip install -r requirements-torch.txt`。示例可在 CPU 上运行。遇到 `No module named ...` 时，先检查安装依赖与运行文件是否使用了同一个 Python。

## Python 基础与函数 {#python}

`import numpy as np` 导入 NumPy，并将其别名设为 `np`。`from torch import nn` 从 `torch` 导入 `nn`。安装名和导入名可能不同，例如安装 `scikit-learn`，代码中使用 `import sklearn`。

Python 用缩进表示代码属于哪个函数或条件分支，通常每层四个空格。以下函数统计达到阈值的测量值个数：

```python
def count_passed(values, threshold=0.5):
    """返回达到阈值的测量值个数。"""
    count = 0
    for value in values:
        if value >= threshold:
            count += 1
    return count

answer = count_passed([0.2, 0.7, 0.8])
print(answer)                              # 2
print(count_passed([0.2, 0.7], threshold=0.8))  # 0
```

`def` 定义函数，括号里是它接收的参数。`threshold=0.5` 给出默认值，调用时可以省略，也可以用参数名覆盖。`for` 依次取出列表中的值，`if` 决定是否执行缩进里的加一操作。`=` 是赋值，判断相等要写 `==`。

`return` 把结果交给调用方，并结束这次函数调用；`print` 只是把内容显示出来。如果题目要求返回数字，只打印数字会让调用方收到 `None`。

函数也可以返回多个结果或字典：

```python
def summarize(values):
    total = sum(values)
    return total, len(values)

s, n = summarize([2, 4, 6])       # 按顺序解包：s=12，n=3
report = {"total": s, "count": n}
print(report["total"])          # 12：按键名取字典中的值
```

列表 `[2, 4, 6]` 保存一串值；元组 `(total, count)` 常用于按固定顺序返回几项结果；字典 `{"total": 12}` 则通过键名取值。题目要求 `(预测, 概率)` 时，顺序不能反；要求字典包含 `mae` 时，键名也要一致。

三引号内是函数说明，`#` 后面是注释，`TODO` 标记待完成的任务。`raise NotImplementedError(...)` 标记未实现的函数，完成后删除。`raise ValueError(...)` 表示输入不合法，用于输入检查：

```python
def checked_mean(values):
    if len(values) == 0:
        raise ValueError("至少需要一个测量值")
    return sum(values) / len(values)

print(checked_mean([2, 4]))      # 3.0
```

练习：检查 `count_passed` 对空列表的返回值，再比较 `return count` 位于循环内外时的执行结果。

## 数组与形状 {#arrays}

NumPy 数组适合整组数值计算。Python 列表乘以 2 会重复内容，数组乘以 2 则会把每个数乘以 2：

```python
import numpy as np

print([1, 2] * 2)                         # [1, 2, 1, 2]
a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float32)
print(a * 2)                             # 每个元素都乘以 2
print(a.shape, a.ndim, a.dtype)           # (2, 3)  2  float32
print(a.mean(axis=0))                     # [2.5, 3.5, 4.5]
print(a.mean(axis=1))                     # [2., 5.]
print(a.mean())                           # 3.5
```

`shape` 记录每个轴的长度；`ndim` 是轴的数量；`dtype` 是元素类型。`float32` 用来保存小数，类别标签一般保存成整数，比较结果则是布尔值 `True` / `False`。

`axis` 指定求均值的轴。形状 `(2, 3)` 沿 `axis=0` 求均值，得到三个列均值；沿 `axis=1` 求均值，得到两个行均值。省略 `axis` 时，对全部元素求均值。

常见形状如下，字母表示各维长度。

| 形状 | 维度含义 |
| --- | --- |
| `(N, D)` | N 个样本，每个有 D 个特征 |
| `(N,)` | N 个标签或预测值，一维数组 |
| `(H, W, 3)` | 高、宽、RGB 三个颜色通道 |
| `(N, 1, 28, 28)` | N 张灰度数字图，每张一个通道、高宽各 28 |
| `(N, 10)` | N 张图，每张对应十个数字类别的分数 |

`(N,)` 和 `(N, 1)` 不相同。两个数组相减前要确认形状；一维目标与二维单列预测相减，可能被广播成 `(N, N)`，程序不报错，误差却已经算错。

### 索引、筛选与复制 {#indexing}

索引从 0 开始。`a[1]` 是第二行，`a[:, 0]` 是第一列，`a[0:2]` 取第 0、1 行，切片右端不包含在内。

```python
import numpy as np

X = np.array([[1., 2.], [3., 4.], [5., 6.]])
groups = np.array([0, 1, 0])
mask = groups == 0
print(mask)                              # [True, False, True]
print(X[mask])                           # 第 0、2 行
print(X[mask].mean(axis=0))               # [3., 4.]
print(np.flatnonzero(mask))               # [0, 2]：满足条件的位置

changed = X.copy()
changed[0, 0] = 99
assert X[0, 0] == 1                       # 原数组仍然没变
```

布尔数组可以用来筛选样本，`flatnonzero` 返回其中为真的位置。聚类会按组号筛选样本，分类评价会按预测是否错误找位置。筛选结果为空时，没有均值可算；聚类练习要求空组保留旧中心。

`changed = X` 让两个变量指向同一个数组。切片也可能共享原数组内存；题目要求“不修改输入”时，先 `.copy()` 再改。浮点数比较用 `np.allclose(a, b)` 更合适，因为小数计算可能存在舍入误差。

### 形状变换 {#shapes}

`reshape` 重新组织元素，元素总数必须相同；`-1` 表示让 NumPy 推算这一维。加一个长度为 1 的轴可以用 `None`。以下示例用全零数组演示形状变换：

```python
import numpy as np

rgb = np.zeros((4, 5, 3), dtype=np.float32)
pixels = rgb.reshape(-1, 3)
print(pixels.shape)                       # (20, 3)：20 个 RGB 像素
restored = pixels.reshape(4, 5, 3)
assert restored.shape == rgb.shape

images = np.zeros((2, 28, 28), dtype=np.uint8)
x = images[:, None, :, :].astype(np.float32) / 255.0
print(x.shape)                            # (2, 1, 28, 28)
```

颜色压缩需要把图片展开成像素表，处理后再按原顺序还原；卷积网络需要保留图片行列，只增加灰度通道轴。若要把彩色图的 `(H, W, 3)` 变成 `(3, H, W)`，应使用 `transpose(2, 0, 1)` 调换轴，单纯 `reshape` 会打乱颜色与位置的对应关系。

归一化前还要检查输入。`np.isfinite(images).all()` 判断是否全是有限值；`((images < 0) | (images > 255)).any()` 判断是否存在越界值。数组里的逐元素“或”写 `|`，每个比较式加括号；Python 的 `or` 用于普通真假条件，不能直接组合整组布尔数组。

## 图像、窗口与边界 {#images}

一张 RGB 图片的最后一轴依次是红、绿、蓝。灰度图只保留亮度，因此从三维变为二维。用通道切片取颜色，再乘权重相加即可。`np.clip(values, 0, 1)` 可以限制调整后的亮度范围；它适用于亮度调整，不应用来掩盖归一化题中的非法输入。

均值滤波要访问像素周围的小窗口。以只有四个像素的图为例，先复制边缘补上一圈，再取 3×3 窗口：

```python
import numpy as np
from numpy.lib.stride_tricks import sliding_window_view

image = np.array([[0., .3], [.6, .9]])
padded = np.pad(image, 1, mode="edge")
windows = sliding_window_view(padded, (3, 3))
print(windows.shape)                      # (2, 2, 3, 3)
print(windows[0, 0])                      # 左上像素对应的九个邻域值
print(windows.mean(axis=(-2, -1)))         # [[.3, .4], [.5, .6]]
```

前两个轴标记原图位置，后两个轴是窗口内部。`axis=(-2, -1)` 只对最后两个轴求平均，因此输出仍是 `(2, 2)`。窗口大小为 `size` 时，每边补 `size // 2` 格；`//` 是整除，练习要求 `size` 为正奇数。

边缘差分可以用 `image[:, 1:] - image[:, :-1]` 同时计算所有右邻居与当前像素的差，结果少一列。若要求保持原图大小，先用 `np.zeros_like(image)` 建立全零结果，再把差分填入 `result[:, :-1]`，最后一列保持零。垂直方向同理。两个方向合成时用 `np.sqrt(dx**2 + dy**2)`；`**2` 表示平方。

## 距离计算、广播与分组 {#broadcasting}

NumPy 广播可批量计算样本与中心的距离。两个数组的形状从右侧对齐，对应轴长度相同或其中一个为 1 时，可以进行运算。参见 [NumPy 广播规则](https://numpy.org/doc/stable/user/basics.broadcasting.html)。

```python
import numpy as np

X = np.array([[0., 0.], [3., 4.]])         # (N=2, D=2)
centers = np.array([[0., 0.], [6., 8.]])   # (K=2, D=2)
difference = X[:, None, :] - centers[None, :, :]
print(difference.shape)                  # (N, K, D) = (2, 2, 2)
distances = (difference ** 2).sum(axis=2)
print(distances)                         # [[0., 100.], [25., 25.]]
print(distances.argmin(axis=1))           # [0, 0]
```

`X[:, None, :]` 是 `(N, 1, D)`，中心是 `(1, K, D)`，相减得到每个样本与每个中心的差。沿特征轴求平方和，留下 `(N, K)` 距离表。`argmin` 返回最小值的位置；`min` 返回最小值本身。`argmax` 与 `max` 也有同样区别。NumPy 的 `argmin` / `argmax` 在并列时返回第一次出现的位置。

颜色压缩中，`D=3` 表示 RGB。选出每个像素最近的中心后，`palette[groups]` 就能按组号取回代表色。酒样聚类则用 `X[groups == k].mean(axis=0)` 更新第 k 个中心；先确认这组有样本。判断收敛时可用 `np.linalg.norm(new - old, axis=1)` 求每个中心的移动距离，再检查是否全部小于等于阈值。

距离数组的大小随像素数与代表色数量的乘积增长，处理大图时需注意内存占用。

## 数据表与缺失值 {#dataframes}

pandas 的 `DataFrame` 是带列名和行索引的二维表，`Series` 是其中的一列。葡萄酒实验用列名区分检测指标，用行索引定位酒样。

```python
import pandas as pd

wine = pd.DataFrame({
    "alcohol": [12.0, 13.0, 14.0],
    "acid": [1.2, 1.8, 1.5],
}, index=[10, 20, 30])
y = wine["alcohol"].copy()                 # Series，形状 (3,)
X = wine.drop(columns="alcohol")           # DataFrame，形状 (3, 1)
print(wine.loc[20, "acid"])               # 1.8：按标签找行
print(wine.iloc[1, 1])                    # 1.8：按零起始位置找行列
print(wine[wine["alcohol"] >= 13])         # 筛选酒样
```

`wine["alcohol"]` 是一维 Series，`wine[["alcohol"]]` 则是二维单列表。`.loc` 按标签取值，`.iloc` 按位置取值；经过划分的数据通常不会再有连续行号。实验中“错分位置 1”表示当前数组的第二项，并不表示索引标签为 1 的酒样。这一区别也见 [pandas 索引文档](https://pandas.pydata.org/docs/user_guide/indexing.html)。

预测酒精含量时，必须把 `alcohol` 从 `X` 中去掉，否则模型能直接读取答案。`drop` 默认返回新表，不会删除原表的列。

`pd.read_csv("samples.csv")` 读取已有的 CSV 文件；相对路径从终端当前文件夹开始查找。先用 `head()` 看几行、`dtypes` 看列类型、`isna().sum()` 数每列缺失项。未知测量不能随意当成零。需要估计填充值时，也只能用训练数据估计，不能先拿完整数据计算。

调参结果可以由一组字典组成：

```python
import pandas as pd

results = pd.DataFrame([
    {"alpha": 0.1, "valid_mae": 0.4},
    {"alpha": 1.0, "valid_mae": 0.3},
    {"alpha": 10.0, "valid_mae": 0.3},
], index=[10, 20, 30])
best_label = results["valid_mae"].idxmin()
print(results.loc[best_label, "alpha"])   # 1.0
```

`idxmin()` 返回最小值对应的行标签，并列时取第一行，因此后面接 `.loc`。这里挑的是验证误差最小的超参数，测试集留到最终评价。

## scikit-learn：创建、训练和预测 {#sklearn}

scikit-learn 封装了常见的分类、回归与聚类算法。创建模型只是选好方法和设置；调用 `fit` 才开始从数据学习，`predict` 则对样本输出预测。下面的数据来自库自带的 Wine 数据集，无须另找 CSV。

```python
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_wine(return_X_y=True, as_frame=True)
X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)
model = make_pipeline(
    StandardScaler(),
    LogisticRegression(C=1.0, max_iter=2000),
)
model.fit(X_train, y_train)
predictions = model.predict(X_valid)
print(predictions.shape, y_valid.shape)   # 都是 (45,)
print((predictions == y_valid.to_numpy()).mean())
```

`test_size=0.25` 指定留出比例，这里把留出的部分当验证集；`stratify=y` 尽量维持各类别比例；`random_state=42` 让划分可复现。这个小例子只演示训练和验证。正式葡萄酒实验另外保留了独立测试集，不要把它混回开发数据。

`StandardScaler` 学习训练集每列的均值和标准差，`Pipeline` 把缩放与分类连在一起：`fit` 时学习缩放参数并训练分类器，`predict` 时复用这些参数。若先对所有数据做标准化，再划分，验证数据就提前参与了训练准备。[scikit-learn 的常见陷阱说明](https://scikit-learn.org/stable/common_pitfalls.html)建议用管道避免这种泄漏。

在 `build_model(...)` 填空里，只需要创建并返回未拟合的管道，外层程序负责调用 `fit`。对象上的 `.fit(...)`、`.predict(...)` 叫作方法；括号前的 `model` 是这次操作针对的对象。

| 实验中的组件 | 导入位置 | 设置与用途 |
| --- | --- | --- |
| `StandardScaler` | `sklearn.preprocessing` | 学习每列缩放参数；用 `transform` 应用缩放 |
| `LogisticRegression` | `sklearn.linear_model` | `C` 越小，正则约束越强；输出类别 |
| `Ridge` | `sklearn.linear_model` | `alpha` 越大，正则约束越强；输出连续数值 |
| `DecisionTreeClassifier` | `sklearn.tree` | `max_depth` 限制树深度，`random_state` 控制随机性 |
| `SVC` | `sklearn.svm` | 实验用 `kernel="rbf"`、`C` 和 `gamma="scale"` 控制非线性分类 |
| `KMeans` | `sklearn.cluster` | `n_clusters` 指定组数，拟合后读取中心 |

例如把管道最后一层换成 `Ridge(alpha=1.0)` 就能做数值预测，但此时 `y` 必须换成连续目标，不能继续沿用 Wine 的类别标签。`C` 和 `alpha` 对正则强弱的方向相反，应分别设置。分类擂台对 SVC 的具体参数要求以当前练习说明为准。

### K-Means 拟合结果 {#kmeans}

```python
import numpy as np
from sklearn.cluster import KMeans

pixels = np.array([[0., 0., 0.], [.1, .1, .1],
                   [.9, .9, .9], [1., 1., 1.]])
model = KMeans(n_clusters=2, n_init=3, random_state=42)
model.fit(pixels)
print(model.cluster_centers_.shape)       # (2, 3)：两个 RGB 中心
print(model.labels_.shape)                # (4,)：四个训练像素的组号
```

`n_init=3` 表示尝试三次初始化，保留其中较好的结果。以 `_` 结尾的属性常表示拟合后得到的结果；模型还没 `fit` 时不能读取中心。组号不代表固定颜色；中心顺序不同，分组结果仍可能相同。

葡萄酒的聚类填空要求自己写距离、分组和中心更新，不能用一次 `KMeans.fit` 代替这些题；颜色压缩的调色板题则允许调用这个接口。

### 评价结果：标量、数组与字典 {#metrics}

```python
import numpy as np
from sklearn.metrics import confusion_matrix

actual = np.array([0, 1, 2])
predicted = np.array([0, 2, 2])
report = {
    "accuracy": float((actual == predicted).mean()),
    "matrix": confusion_matrix(actual, predicted, labels=[0, 1, 2]),
    "wrong": np.flatnonzero(actual != predicted),
}
print(report["accuracy"], report["wrong"])  # 约 0.667，[1]

measured = np.array([1., 3.])
estimated = np.array([2., 2.])
residuals = measured - estimated
print(float(np.abs(residuals).mean()))    # MAE = 1.0
print(float((residuals ** 2).mean()))     # MSE = 1.0
```

混淆矩阵的行是真实类别，列是预测类别，固定 `labels` 可以保留本批未出现的类别。准确率是正确比例；MAE 先取绝对值再平均；MSE 先平方再平均。残差保留正负，能看出预测偏高还是偏低。返回值的形状和键名是接口的一部分，不能只把它们打印出来。

## PyTorch 张量 {#tensors}

PyTorch 的 Tensor（张量）也有形状和元素类型，还能放到不同计算设备上，并记录计算过程以便求梯度。NumPy 通常负责实验的数据整理，PyTorch 负责数字识别网络的计算和训练。

```python
import numpy as np
import torch

array = np.array([[1., 2.], [3., 4.]], dtype=np.float32)
x = torch.tensor(array, dtype=torch.float32)
y = torch.tensor([0, 1], dtype=torch.long)
print(x.shape, x.dtype, x.device)         # torch.Size([2, 2])，float32，cpu
print(x.mean(dim=1))                      # tensor([1.5000, 3.5000])
print(y.shape)                           # torch.Size([2])
```

PyTorch 的 `dim` 对应 NumPy 常用的 `axis`。实验里，图片用 `torch.float32`，交叉熵的类别标签用 `torch.long`。`torch.tensor(array)` 会复制数据；`torch.from_numpy(array)` 在 CPU 上与原数组共享内存，改动时要留意影响。

输入和模型参数应位于同一设备。切换设备时，分别调用 `model.to(device)`、`x.to(device)` 和 `y.to(device)`。`.to(...)` 返回转换后的对象，张量通常要写成 `x = x.to(device)`。

### 梯度与自动求导 {#autograd}

若损失为 `(w-3)²`，当前 `w=1`，把 `w` 稍微增大会让损失降低。梯度描述这种变化的方向与速度；PyTorch 可以沿记录下来的运算自动求出它。

```python
import torch

w = torch.tensor(1.0, requires_grad=True)
loss = (w - 3) ** 2
loss.backward()
print(loss.item())                       # 4.0
print(w.grad.item())                     # -4.0
```

`requires_grad=True` 开启梯度跟踪，`backward()` 把梯度写入 `.grad`。它还没有修改 `w`。在网络训练中，优化器用这些梯度更新参数，普通输入图片不必设置 `requires_grad=True`。

`.item()` 从只有一个元素的 Tensor 中取出 Python 数字，适合记录损失。若先把损失变成 Python 数字，再调用 `backward()`，计算图已经不在了。应先对原损失张量反向传播，最后再取数字用于显示。

## 网络构建 {#modules}

`torch.nn` 提供网络层。`nn.Linear(4, 8)` 接收每个样本的四个特征，输出八个数，内部保存需要学习的权重和偏置。`nn.ReLU()` 把负数变成零，引入非线性。`nn.Sequential` 把若干层串起来，前一层的输出交给下一层：

```python
import torch
from torch import nn

model = nn.Sequential(
    nn.Linear(4, 8),
    nn.ReLU(),
    nn.Linear(8, 3),
)
x = torch.zeros(2, 4)
logits = model(x)
print(logits.shape)                      # torch.Size([2, 3])
print(sum(p.numel() for p in model.parameters()))  # 67 个可训练参数
```

`nn.Linear(...)` 是创建一层，`model(x)` 是把输入送入网络做一次前向计算。创建模型时已有初始参数，但这些参数还没有学到任务规律。`model.parameters()` 让优化器找到需要更新的参数。

本实验使用 `Sequential` 组合网络层。自定义网络可继承 `nn.Module`：在 `__init__` 中创建层，在 `forward(self, x)` 中定义计算过程，通过 `model(x)` 调用。

### MNIST 卷积网络 {#cnn-code}

MNIST 的原始输入是 `(N, 28, 28)`、0～255 灰度像素。先除以固定的 255，再补通道轴，得到 float32 的 `(N, 1, 28, 28)`。卷积接收的四个轴依次是批次、通道、高、宽。

| 层 | 本实验的设置 | 输出形状 |
| --- | --- | --- |
| 输入 | 一个灰度通道 | `(N, 1, 28, 28)` |
| 第一层卷积与 ReLU | `Conv2d(1, 16, 3, padding=1)` | `(N, 16, 28, 28)` |
| 第一次池化 | `MaxPool2d(2)` | `(N, 16, 14, 14)` |
| 第二层卷积与 ReLU | `Conv2d(16, 32, 3, padding=1)` | `(N, 32, 14, 14)` |
| 第二次池化 | `MaxPool2d(2)` | `(N, 32, 7, 7)` |
| 展平 | `Flatten()`，默认从轴 1 开始 | `(N, 1568)` |
| 隐藏层与 ReLU | `Linear(1568, hidden)` | `(N, hidden)` |
| 输出层 | `Linear(hidden, 10)` | `(N, 10)` |

`Conv2d` 前两个参数是输入和输出通道数，第三个是卷积核大小。这里步长默认为 1，`padding=1` 在边缘补一圈，让 3×3 卷积前后高宽不变。池化每次把高宽减半，所以进入全连接层的长度是 `32*7*7=1568`。

卷积本身的工作方式见[卷积网络](../neural-networks.md#cnn)。写代码时可以先用 `torch.zeros(2, 1, 28, 28)` 试算，每经过一层打印一次 `.shape`。若展平时把批次轴一起合并，两张图片就会被误当成一个样本。

网络输出的十个值叫 logits，是尚未转换成概率的分数。数字 7 对应第 7 列，不能因为索引从零开始就把标签改成 1～10。

## 训练与评价 {#training}

一次训练步处理一个小批次：前向计算分数，计算损失，对损失求梯度，再更新参数。交叉熵接收 `(N, C)` 的原始 logits 和 `(N,)` 的 long 类别标签；MNIST 中 `C=10`。网络末尾不加 softmax，交叉熵已经包含相应的归一化计算。

| 操作 | 作用 |
| --- | --- |
| `model.train()` | 切换到训练模式，影响 Dropout、BatchNorm 等层的行为 |
| `optimizer.zero_grad()` | 清除旧梯度，避免本批与上批的梯度意外累加 |
| `logits = model(x)` | 用当前参数计算本批预测分数 |
| `loss = criterion(logits, y)` | 得到衡量本批错误的标量损失 |
| `loss.backward()` | 计算参数梯度，此时参数还未更新 |
| `optimizer.step()` | 按优化器规则更新参数 |

`model.train()` 只切换模式，参数更新需要单独调用优化器。优化器应在模型建立后创建，供各个训练步重复使用；每批重新创建 Adam 会丢失它积累的状态。

评价时，调用 `model.eval()` 并进入 `torch.no_grad()`。前者切换层的行为，后者关闭梯度记录；评价没有 `backward()` 或 `step()`。这些操作的职责也可对照 [PyTorch 入门示例](https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html)。

取得概率时用 `torch.softmax(logits, dim=1)`，沿每张图的十个类别归一化。再用 `.argmax(dim=1)` 得到预测数字。要把 Tensor 交回 NumPy 页面，可以用 `tensor.detach().cpu().numpy()`：先脱离计算图，再移到 CPU，最后转换数组。

### 完整训练示例 {#pytorch-example}

以下示例对随机二维点分类，标签表示第二个分量是否大于第一个分量。代码可独立运行，无须下载数据。

```python
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
X = torch.rand(160, 2)
y = (X[:, 1] > X[:, 0]).long()
X_train, y_train = X[:120], y[:120]
X_valid, y_valid = X[120:], y[120:]

# Dataset 把一条输入和它的标签配成一对；DataLoader 每次取一小批。
train_data = TensorDataset(X_train, y_train)
loader = DataLoader(train_data, batch_size=24, shuffle=True)
model = nn.Sequential(nn.Linear(2, 8), nn.ReLU(), nn.Linear(8, 2))
optimizer = torch.optim.Adam(model.parameters(), lr=0.02)
criterion = nn.CrossEntropyLoss()

for epoch in range(20):
    model.train()
    loss_sum = 0.0
    sample_count = 0
    for x_batch, y_batch in loader:
        optimizer.zero_grad()
        logits = model(x_batch)
        loss = criterion(logits, y_batch)
        loss.backward()
        optimizer.step()
        loss_sum += loss.item() * len(x_batch)
        sample_count += len(x_batch)
    print(f"epoch={epoch + 1:02d}, loss={loss_sum / sample_count:.4f}")

model.eval()
with torch.no_grad():
    probabilities = torch.softmax(model(X_valid), dim=1)
    predictions = probabilities.argmax(dim=1)
    accuracy = (predictions == y_valid).float().mean().item()
print("Validation accuracy:", accuracy)
print("Probability shape:", probabilities.cpu().numpy().shape)  # (40, 2)
```

完整遍历一次训练集叫一个 epoch；一次小批次更新叫一个 step。这里 120 个训练样本、每批 24 个，每轮执行五个 step。`shuffle=True` 每轮打乱取样顺序；如果最后一批不足指定大小，默认仍会保留。代码把各批平均损失乘以实际批量再累加，因此即使最后一批较小，也能算对整轮样本平均损失。

`f"...{value:.4f}"` 是格式化字符串，`.4f` 表示显示四位小数。每轮损失不保证严格下降。正式实验会使用验证集选设置，并另留测试集报告最终结果。

练习：注释 `optimizer.step()`，观察停止参数更新后的损失。恢复后减小学习率，比较训练速度。每次只修改一项设置。

### 参数保存与加载 {#saving}

接续上一示例，保存参数并加载到同结构网络：

```python
from pathlib import Path

Path("outputs").mkdir(exist_ok=True)
torch.save(model.state_dict(), "outputs/toy-model.pt")
restored = nn.Sequential(nn.Linear(2, 8), nn.ReLU(), nn.Linear(8, 2))
restored.load_state_dict(torch.load(
    "outputs/toy-model.pt", map_location="cpu", weights_only=True
))
restored.eval()
with torch.no_grad():
    assert torch.allclose(model(X_valid), restored(X_valid))
```

`state_dict()` 保存参数等模型状态，加载前要创建相同结构。隐藏层宽度改了，参数形状也会改变。MNIST 实验由页面导出模型；预测时须保持网络结构与像素预处理一致。恢复完整训练还涉及优化器状态，本段只演示保存后用于预测。

## 小车实验：随机数与 Q 表 {#q-table}

小车的表格强化学习使用 NumPy。Q 表为每个状态保存四个动作的价值，取出一行就得到 `choose_action` 接收的 `values`。

```python
import numpy as np

rng = np.random.default_rng(42)
q_table = np.zeros((16 * 16, 4), dtype=np.float64)
state = 3 * 16 + 5                       # 第 3 行、第 5 列的状态编号
q_table[state] = [1., 3., 3., 0.]
values = q_table[state]
best_actions = np.flatnonzero(values == values.max())
action = int(rng.choice(best_actions))
print(best_actions, action)              # 候选为 [1, 2]，选其中一个
```

这里用“行号×地图宽度+列号”演示状态编号；正式练习接收外层传入的 Q 值，不需要重写环境。`rng.random()` 生成 `[0, 1)` 的随机数，`rng.integers(4)` 从 0～3 均匀取一个整数，`rng.choice(indices)` 从候选索引中取一个。

epsilon-greedy 用 `rng.random() < epsilon` 决定是否探索。探索从全部动作中抽取；利用从所有最高价值动作中抽取。因此 `argmax()` 固定取第一个并列最大值，不满足本题随机打破平局的要求。只在外部创建一次生成器，把它传进函数；每次调用都重设种子会反复从同一随机序列起点开始。

更新函数返回一个新数值，由外层写回 Q 表。三种方法的差别在于下一步价值：

| 方法 | 用于组成目标的下一步价值 |
| --- | --- |
| Q-learning | `next_values.max()` |
| SARSA | 已经实际选中的下一动作价值 `next_value` |
| Expected SARSA | `epsilon * next_values.mean() + (1 - epsilon) * next_values.max()` |

未终止时，目标是 `reward + gamma * 下一步价值`；真正终止时只用 `reward`。再按 `current + alpha * (target - current)` 修正当前估计。达到步数上限是截断，本实验仍保留未来价值。原理见[Q-learning 与 SARSA](../reinforcement-learning.md#q-learning-sarsa)。

## 数据可视化 {#plots}

折线图用于观察训练变化，散点图用于查看样本分布。以下使用实验依赖中的 Plotly 绘制误差曲线：

```python
import plotly.graph_objects as go

figure = go.Figure(go.Scatter(
    x=[1, 2, 3, 4], y=[0.8, 0.5, 0.4, 0.35], mode="lines+markers"
))
figure.update_layout(xaxis_title="Epoch", yaxis_title="Loss")
figure.write_html("training-curve.html", auto_open=False)
```

运行后在当前文件夹打开 `training-curve.html`。这里四个数是说明用的数据；记录真实实验时，要用实际运行的损失。图题与坐标轴使用英文，报告里再解释数据来源。训练损失下降只能说明模型更贴合训练目标，还要结合验证表现判断。

## 常见错误与排查 {#debugging}

报错信息的末行通常包含错误类型，上方列出调用位置。根据文件名和行号定位代码，再检查输入的形状、类型与范围。

| 现象 | 检查项 |
| --- | --- |
| `NotImplementedError` | 是否仍有填空未完成，或编辑了另一个文件 |
| `IndentationError` / `SyntaxError` | 缩进、冒号、括号，以及是否用了中文标点 |
| `ModuleNotFoundError` | 依赖是否安装在当前运行的虚拟环境中 |
| 函数返回 `None` | 是否漏了 `return`，或只在某个分支返回 |
| `mat1 and mat2 shapes cannot be multiplied` | 展平后的特征数是否等于 `Linear` 的输入长度 |
| 卷积提示通道数不匹配 | 是否缺少通道轴，或把 HWC 当成 NCHW |
| 交叉熵提示标签类型不对 | 标签是否为 `(N,)` 的 `torch.long`，范围是否为 0～C-1 |
| 无法直接转换成 NumPy | 是否需要先 `.detach().cpu()` |
| 训练参数一直不变 | 是否调用了 `backward`、`step`，优化器是否绑定当前模型 |
| 准确率高得反常 | 是否把答案放进特征，或拿训练数据当验证数据 |

使用可手算的小样本验证函数。用 `assert` 检查形状，`np.allclose` 检查浮点结果，再运行实验页的题目检查。

参考：[Python 函数与控制流](https://docs.python.org/zh-cn/3/tutorial/controlflow.html) · [NumPy 数组入门](https://numpy.org/doc/stable/user/absolute_beginners.html) · [神经网络与深度学习](../neural-networks.md) · [项目实践](./index.md)。
