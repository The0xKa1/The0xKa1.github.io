---
title: Q-learning 格子导航
comments: false
statistics: false
---

# Q-learning 格子导航

## 送个样品，别再绕远路了 {#scenario}

坤坤从样品架走到检测台，得绕过中间的实验桌。写寻路程序时，他就拿这段路当地图：架子是起点，检测台是终点，桌子占掉的格子不能走。小车在屏幕里试着送样，每走一步扣一分，送到加十分。坤坤把训练轮数从 10 改到 100，再改到 2000，看看它什么时候能少绕几个弯。

![机器人寻路](/images/ml-guide/project-gridworld.png)

!!! definition "强化学习与 Q-learning"

    强化学习通过动作得到的奖励学习决策。Q-learning 学习动作价值 Q：在一个状态执行某个动作后，未来能得到多少折扣奖励的估计。

所需知识：[Python 函数与循环](../python-data.md#python)、[决策过程与回报](../reinforcement-learning.md#mdp)、[贝尔曼方程](../reinforcement-learning.md#bellman)、[Q-learning 与探索](../reinforcement-learning.md#q-learning-sarsa)。

## 运行 {#run}

下载 [gridworld.py](/downloads/ml-guide/gridworld.py)，使用 Python 3 运行，无需安装第三方库。

```bash
python gridworld.py --episodes 2000 --seed 42
```

地图中的 `S` 是起点，`G` 是终点，`#` 是墙。坐标从 0 开始，格式为 `(行, 列)`。

```text
S...
.##.
....
.#.G
```

## 环境定义 {#environment}

| 要素 | 脚本中的设置 |
| --- | --- |
| 状态 | 当前格子的坐标 |
| 动作 | 上、右、下、左 |
| 转移 | 确定移动；撞墙或越界时留在原地 |
| 奖励 | 进入终点 +10，其余动作 −1 |
| 终止 | 到达终点 |
| 截断 | 一轮执行 80 步仍未到达终点，就重置起点 |

一步代价让绕路和撞墙都损失奖励。地图固定且完全可观测，坐标足以描述状态。

## 价值更新与探索 {#training}

每个可通行格子保存 4 个 Q 值，初始为 0。交互产生当前状态、动作、奖励和下一状态后，执行：

```python
target = reward if terminated else reward + gamma * max(q[next_state])
q[state][action] += alpha * (target - q[state][action])
```

学习率 `alpha=0.2` 控制每次更新幅度，折扣因子 `gamma=0.95` 控制未来奖励的权重。到达终点后，目标只有当前奖励。80 步上限是人为截断，脚本仍保留下一状态的价值项。

训练采用 ε-greedy：ε 的概率随机选择动作，其余情况选择 Q 值最大的动作。ε 从 1 逐渐降到 0.05，训练后期仍有少量探索。相同 Q 值之间随机打破平局，避免始终偏好动作列表中的第一项。随机种子固定后，可以复现同一运行环境中的结果。

## 结果与对照 {#evaluation}

广度优先搜索（Breadth-First Search，BFS）按离起点的步数逐层搜索，在这张每步代价相同的网格中可求最短步数。用它算出的最短步数，对照机器人学到的路线。

默认设置的一次运行得到：

```text
Greedy success: True
Steps: 6; shortest possible: 6
Undiscounted evaluation reward: 5
```

评估关闭 ε 随机探索，按最大 Q 值选择动作。6 步到终点，其中前 5 步各 −1，最后一步 +10，未折扣总奖励为 5。最短路径可能不止一条。

=== "训练轮数"
    分别运行 `--episodes 10`、`--episodes 100`、`--episodes 2000`，比较是否到达终点和路径长度。换几个随机种子重复运行，看看训练多少轮后能稳定送达。

=== "随机种子"
    保持 2000 轮，分别设置 `--seed 0`、`--seed 1`、`--seed 2`。记录每次是否送达、走了多少步。

=== "探索"
    将训练函数中的 `epsilon` 改为常数 0.05 或 0.5，比较训练成功比例与最终贪心路径。分别记录训练中的路线长度和关闭探索后的路线长度，观察随机试走怎样影响结果。

还可以移动几堵墙，重新训练，看看机器人会找到什么路线。

!!! quote "参考资料"
    [David Silver：动作价值学习与探索](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-5-model-free-control-.pdf)。
