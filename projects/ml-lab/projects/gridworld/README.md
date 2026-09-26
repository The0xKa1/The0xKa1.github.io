# 格子导航

从随机试走到稳定送达。

## 先观察

从10回合开始，再增加到100、2000。选择训练阶段，对比探索轨迹与贪心评价；拖动动画步骤条可以逐步前进。箭头并列表示多个动作的价值相同。

## 填写函数

### `choose_action`

先判断是否探索；利用时从所有最大Q值中随机选一个。

<details><summary>提示 1：思路</summary>

先判断是否探索；利用时从所有最大Q值中随机选一个。

</details>

<details><summary>提示 2：接口</summary>

rng.random()<epsilon；rng.choice(np.flatnonzero(values==values.max()))。

</details>

### `update_value`

终点之后没有下一步回报；步数耗尽仍不算真正终止。

<details><summary>提示 1：思路</summary>

终点之后没有下一步回报；步数耗尽仍不算真正终止。

</details>

<details><summary>提示 2：接口</summary>

target=reward if terminated else reward+gamma*max(next_values)；current+alpha*(target-current)。

</details>

### `exploration_rate`

episode 从0开始，开始全探索，后期保留少量随机动作。

<details><summary>提示 1：思路</summary>

episode 从0开始，开始全探索，后期保留少量随机动作。

</details>

<details><summary>提示 2：接口</summary>

max(.05,1-episode/(.8*episodes))。

</details>

## 进阶实验

修改地图重新训练；比较固定探索率和衰减策略。运行三地图×三种子×两种策略对照，记录送达率与多走步数。BFS只作最短距离参照，不参与训练。

## 检查与记录

保存 `exercises.py` 后，先点“检查练习”，再切换到练习模式运行。未完成函数会显示名称；错误检查显示小输入和预期行为。记录参数、结果和一两句解释；实验记录可以下载。完整参考实现位于 `solutions/gridworld.py`。
