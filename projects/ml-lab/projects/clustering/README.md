# 聚类与降维

一组点是怎样形成的？

## 先观察

从二维点集开始，拖动步骤条，看“分组—更新中心”如何交替。修改K与种子，比较轨迹和目标值。转到 Wine 后，先观察分组，再揭开标签。

## 填写函数

### `distances`

将每个样本与每个中心相减，平方后对特征维求和。

<details><summary>提示 1：思路</summary>

将每个样本与每个中心相减，平方后对特征维求和。

</details>

<details><summary>提示 2：接口</summary>

X[:,None,:] 与 centers[None,:,:] 广播；结果为 N×K。

</details>

### `assign_groups`

每个样本选择距离最小的中心。

<details><summary>提示 1：思路</summary>

每个样本选择距离最小的中心。

</details>

<details><summary>提示 2：接口</summary>

对距离矩阵使用 argmin(axis=1)。

</details>

### `update_centers`

新中心是该组样本均值；空组保留原中心。

<details><summary>提示 1：思路</summary>

新中心是该组样本均值；空组保留原中心。

</details>

<details><summary>提示 2：接口</summary>

先复制 old_centers，再按 groups==i 取行求 mean(axis=0)。

</details>

### `converged`

每个中心计算一次移动距离，最大的也不超过阈值才停止。

<details><summary>提示 1：思路</summary>

每个中心计算一次移动距离，最大的也不超过阈值才停止。

</details>

<details><summary>提示 2：接口</summary>

np.linalg.norm(new-old,axis=1)；不能只看某一个中心。

</details>

### `best_restart（进阶）`

多个初始位置会得到不同局部最优，比较最终目标值。

<details><summary>提示 1：思路</summary>

多个初始位置会得到不同局部最优，比较最终目标值。

</details>

<details><summary>提示 2：接口</summary>

返回 inertias 中最小值的位置，不能直接返回最小值。

</details>

## 进阶实验

完成多次初始化并和 scikit-learn 比较。分别在13维和二维投影中聚类，查看轮廓系数、组内距离和标签对照；不同输入尺度下的目标值不要直接横向比较。

## 检查与记录

保存 `exercises.py` 后，先点“检查练习”，再切换到练习模式运行。未完成函数会显示名称；错误检查显示小输入和预期行为。记录参数、结果和一两句解释；实验记录可以下载。完整参考实现位于 `solutions/clustering.py`。
