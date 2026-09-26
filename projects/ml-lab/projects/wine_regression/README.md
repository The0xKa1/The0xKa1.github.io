# 酒精含量预测

误差到底大在哪里？

## 先观察

先看实测—预测图：虚线是理想预测。残差为实测减预测，零线上方表示低估。选择偏差大的点，查看原始成分。再比较 alpha 曲线和标准化系数。

## 填写函数

### `split_target`

目标列必须从输入中移除，保留相同索引。

<details><summary>提示 1：思路</summary>

目标列必须从输入中移除，保留相同索引。

</details>

<details><summary>提示 2：接口</summary>

X=data.drop(columns="alcohol")；y=data["alcohol"]。

</details>

### `errors`

残差保留正负号，绝对误差去掉符号后求平均。

<details><summary>提示 1：思路</summary>

残差保留正负号，绝对误差去掉符号后求平均。

</details>

<details><summary>提示 2：接口</summary>

np.asarray(actual)-np.asarray(predicted)；np.abs(...).mean()。

</details>

### `build_model`

每折训练内部都要重新拟合标准化。

<details><summary>提示 1：思路</summary>

每折训练内部都要重新拟合标准化。

</details>

<details><summary>提示 2：接口</summary>

用 make_pipeline(StandardScaler(), Ridge(alpha=alpha)) 返回未拟合模型。

</details>

### `select_alpha`

只比较 valid_mae，不能按训练误差选择。

<details><summary>提示 1：思路</summary>

只比较 valid_mae，不能按训练误差选择。

</details>

<details><summary>提示 2：接口</summary>

idxmin() 找到最小验证误差所在行，再取 alpha。

</details>

## 进阶实验

只选两三项成分，再恢复全部12项，比较五折验证误差和波动。说明岭回归与均值基线、普通线性回归的差异，最后用测试集评价选定配置。

## 检查与记录

保存 `exercises.py` 后，先点“检查练习”，再切换到练习模式运行。未完成函数会显示名称；错误检查显示小输入和预期行为。记录参数、结果和一两句解释；实验记录可以下载。完整参考实现位于 `solutions/wine_regression.py`。
