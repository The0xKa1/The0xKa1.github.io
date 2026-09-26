# 数字识别

训练之后，再看看错题。

## 先观察

先运行 scikit-learn 基线。安装 PyTorch 后填写网络和训练步骤，比较训练曲线。错题墙标题“3 → 8”表示真实数字3被预测成8。点选编号，观察概率，再尝试噪声和平移。

## 填写函数

### `normalize`

像素的已知范围为0到16，转换为0到1并展平。

<details><summary>提示 1：思路</summary>

像素的已知范围为0到16，转换为0到1并展平。

</details>

<details><summary>提示 2：接口</summary>

reshape(-1,64).astype("float32") / 16；先检查形状、范围与有限性。

</details>

### `build_network`

隐藏层用 ReLU；最后输出10个类别得分。

<details><summary>提示 1：思路</summary>

隐藏层用 ReLU；最后输出10个类别得分。

</details>

<details><summary>提示 2：接口</summary>

nn.Sequential(nn.Linear(64,hidden), nn.ReLU(), nn.Linear(hidden,10))。

</details>

### `train_step`

每个批次先清除旧梯度，再计算损失、反向传播并更新参数。

<details><summary>提示 1：思路</summary>

每个批次先清除旧梯度，再计算损失、反向传播并更新参数。

</details>

<details><summary>提示 2：接口</summary>

optimizer.zero_grad() → model(x) → cross_entropy → backward() → optimizer.step()。

</details>

### `evaluate`

预测时关闭梯度计算，返回概率和概率最大的类别。

<details><summary>提示 1：思路</summary>

预测时关闭梯度计算，返回概率和概率最大的类别。

</details>

<details><summary>提示 2：接口</summary>

model.eval() 与 torch.no_grad()；softmax(dim=1)，再转 numpy。

</details>

## 进阶实验

固定数据划分和种子，分别改变隐藏层宽度、学习率、训练轮数。根据验证曲线选配置，再打开测试集。TensorFlow 为完整接口对照，不要求三套框架都安装。

## 检查与记录

保存 `exercises.py` 后，先点“检查练习”，再切换到练习模式运行。未完成函数会显示名称；错误检查显示小输入和预期行为。记录参数、结果和一两句解释；实验记录可以下载。完整参考实现位于 `solutions/digits.py`。
