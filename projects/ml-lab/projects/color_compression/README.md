# 图片颜色压缩

果盘照片有许多相近颜色。坤坤想做一张只有八种颜色的海报：该保留哪些颜色，每个像素又应该变成哪一种？

## 看演示 → 写函数 → 做对照 → 挑战

1. 观察 2 色、8 色和 32 色的重建，找到最先丢失的细节。
2. 完成 fit_palette、reconstruct、mse；输入像素范围为 0..1。
3. 上传自己的照片，比较颜色数量与均方误差，并下载重建图。
4. 挑战：给不同图像比较误差曲线，解释为什么相同 K 的失真不同。

## 函数接口

### `fit_palette`

输入 N×3 RGB（0..1），颜色数 K；返回 K×3 调色板，仅拟合输入像素。

### `reconstruct`

将 H×W×3 图的每个像素换为最近的调色板颜色，返回相同形状图。

### `mse`

返回所有像素通道的均方误差；相同图应为 0。

<details><summary>提示一：思路</summary>

把每个像素看作 RGB 空间的一个点；中心是调色板颜色，最近中心决定像素的新颜色。

</details>

<details><summary>提示二：接口</summary>

KMeans.cluster_centers_；将图片 reshape(-1,3)，用广播计算像素到各中心的平方距离。

</details>

完整实现：`solutions/color_compression.py`。练习模式只调用 `projects/color_compression/exercises.py`。

## 完成标准

通过函数检查，跑通练习模式；保存至少两次参数不同的实验记录，说明观察到的变化与原因。检查失败时先核对输入与输出，不要只看图是否漂亮。
