# 图像处理工作台

坤坤给果盘拍了一张照片。灯光偏暗、像素里有噪声，他想把图变清楚，却发现滤波窗口越大，水果边缘也越模糊。

## 看演示 → 写函数 → 做对照 → 挑战

1. 观察亮度和对比度的作用；再比较原图、加噪图与滤波结果。
2. 完成 grayscale、adjust、mean_filter、edge_strength 四个函数。
3. 固定噪声种子，比较窗口 1、3、9、15；记录 MSE 与边缘清晰度。
4. 挑战：实现中值滤波，添加椒盐噪声，和均值滤波比较。

## 函数接口

### `grayscale`

输入 H×W×3、0..1 RGB；返回 H×W 亮度。例：纯红像素约为 0.2126。

### `adjust`

以 0.5 为中心调整对比度，再加亮度；裁剪到 0..1，不改变形状。

### `mean_filter`

输入二维灰度图、奇数窗口；边缘复制填充，返回等尺寸窗口均值。

### `edge_strength`

返回相邻像素差的梯度幅度，右/下边界差置零；输出 H×W。

<details><summary>提示一：思路</summary>

灰度是 RGB 的加权和；均值滤波用邻域替代中心值。先处理等尺寸和边界。

</details>

<details><summary>提示二：接口</summary>

numpy.pad 的 edge 模式保留边界；sliding_window_view 可以取得窗口；np.diff 计算相邻差。

</details>

完整实现：`solutions/image_lab.py`。练习模式只调用 `projects/image_lab/exercises.py`。

## 完成标准

通过函数检查，跑通练习模式；保存至少两次参数不同的实验记录，说明观察到的变化与原因。检查失败时先核对输入与输出，不要只看图是否漂亮。
