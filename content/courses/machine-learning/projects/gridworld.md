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

## 下载与运行 {#run}

下载 [食品实验室完整项目包](/downloads/ml-guide/ml-lab.zip)，按[运行环境](./index.md#setup)安装并启动。在左侧选择“格子导航”。

本实验的练习文件：`projects/gridworld/exercises.py`。先运行演示，再填写函数；保存后点击“检查练习”，通过后切到练习模式运行。

![格子导航运行预览](/images/ml-guide/lab-gridworld.png)

## 看图与实验 {#results}

从10回合开始，再增加到100、2000。选择训练阶段，对比探索轨迹与贪心评价；拖动动画步骤条可以逐步前进。箭头并列表示多个动作的价值相同。

地图用蓝色机器人表示起点、棋旗表示终点，砖墙格子不能通行。撞墙或越界会留在原地；进入终点得到+10，其余动作得到−1。地图可直接编辑，改动后需要重新训练。

每格保存上、右、下、左四个动作价值。ε-greedy 以 ε 的概率随机探索，其他时候选择最大Q值；多个动作并列时随机选择。

```python
target = reward if terminated else reward + gamma * max(next_values)
new_value = current + alpha * (target - current)
```

到达终点是真正终止；回合步数耗尽只是截断，仍保留下一状态价值。广度优先搜索（Breadth-First Search，BFS）只计算最短距离作参照，不参与训练。

动画可切换训练阶段和路线类型，比较训练中的探索轨迹与关闭探索后的贪心路线。策略箭头并列表示Q值并列；热图色阶在各阶段保持一致。

## 填写函数 {#exercises}

### `choose_action`

先判断是否探索；利用时从所有最大Q值中随机选一个。

??? tip "接口提示"

    rng.random()<epsilon；rng.choice(np.flatnonzero(values==values.max()))。

### `update_value`

终点之后没有下一步回报；步数耗尽仍不算真正终止。

??? tip "接口提示"

    target=reward if terminated else reward+gamma*max(next_values)；current+alpha*(target-current)。

### `exploration_rate`

episode 从0开始，开始全探索，后期保留少量随机动作。

??? tip "接口提示"

    max(.05,1-episode/(.8*episodes))。

## 进阶与记录 {#comparison}

修改地图重新训练；比较固定探索率和衰减策略。运行三地图×三种子×两种策略对照，记录送达率与多走步数。BFS只作最短距离参照，不参与训练。

“实验记录”保存当前会话中的参数、种子、指标和结果表，可下载 CSV 或 JSON。修改代码或训练参数后，旧结果会提示待更新；查看图中样本不会重新训练。完整参考实现放在 `solutions/gridworld.py`。


## 直接画地图

在地图上方选择墙壁、擦除、起点或终点工具，再点击方格。蓝色机器人表示起点，棋旗表示终点；不必输入字符地图。修改后重新训练，旧策略会标记为待更新。

路线使用图形小车与方格墙壁显示，支持播放、暂停、重置、下一步和拖动进度。不可达地图会明确提示；策略热图与动作 Q 值用于解释小车为什么这样走。
