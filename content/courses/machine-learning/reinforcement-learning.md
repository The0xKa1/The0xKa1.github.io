---
title: 强化学习入门
comments: false
statistics: false
---

# 强化学习入门

!!! definition "强化学习"
    强化学习（Reinforcement Learning，RL）研究连续决策。智能体执行动作，环境返回新状态和奖励，动作还会影响后面能遇到什么情况。

例如走迷宫时，当前转弯是否有用，可能要到抵达出口才能判断。

## 马尔可夫决策过程、策略与回报 {#mdp}

!!! definition "MDP"
    马尔可夫决策过程（Markov Decision Process，MDP）用状态、动作、转移概率和奖励描述决策环境。当前状态需包含预测下一步所需的历史信息。

用迷宫举例：

| 要素 | 迷宫中的例子 |
| --- | --- |
| 状态 $s$ | 所在格子；若钥匙影响通行，还要包含是否持有钥匙 |
| 动作 $a$ | 上、下、左、右 |
| 转移 $P(s'\mid s,a)$ | 动作后到达各格子的概率，地面湿滑时可能偏移 |
| 奖励 $r$ | 每走一步 −1，进入出口 +10 |
| 策略 $\pi(a\mid s)$ | 在每个状态选择各动作的概率 |

只记录格子，却遗漏决定门能否打开的钥匙，就可能不满足这个要求。

!!! definition "策略与回报"
    策略（policy）规定给定状态下各动作的选择概率；回报（return）是从当前时刻开始累积的折扣奖励。

回报写为：

$$G_t=r_{t+1}+\gamma r_{t+2}+\gamma^2r_{t+3}+\cdots$$

$\gamma$ 是折扣因子，越接近 1，远期奖励的权重越大。若接下来两步奖励为 −1、10，且之后结束，$\gamma=0.9$ 时回报为 $-1+0.9\times10=8$。训练目标是提高回报的期望；期望就是按各结果的概率加权平均。

![智能体与环境](/images/ml-guide/rl-interaction.png)

!!! quote "参考资料"
    [David Silver：MDP 讲义](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-2-mdp.pdf)；[Spinning Up：状态、动作、策略与回报](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)。

## 价值函数与贝尔曼方程 {#bellman}

!!! definition "价值函数"
    状态价值 $V^\pi(s)$ 表示从状态 $s$ 出发，持续按策略 $\pi$ 行动的期望回报。动作价值 $Q^\pi(s,a)$ 固定第一步动作 $a$，之后再按策略行动。

前者评价位置，后者评价当前位置的具体动作。

贝尔曼方程把整段回报拆成“一步奖励 + 后续价值”：

$$V^\pi(s)=\mathbb E_\pi[r_{t+1}+\gamma V^\pi(s_{t+1})\mid s_t=s]$$

$\mathbb E_\pi$ 表示对策略可能选择的动作，以及环境可能产生的结果求平均。若某动作确定获得 −1 并到达价值为 5 的状态，$\gamma=0.9$，该动作的价值就是 $-1+0.9\times5=3.5$。

最优动作价值 $Q^*$ 满足类似关系，但下一状态使用所有动作中的最大价值：$Q^*(s,a)=\mathbb E[r+\gamma\max_{a'}Q^*(s',a')]$。这让出口的收益可以通过相邻状态逐步传回更远的格子。

!!! quote "参考资料"
    [Spinning Up：价值函数与贝尔曼方程](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html#value-functions)；[David Silver：MDP 中的 Bellman Equations](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-2-mdp.pdf)。

## 动态规划 {#dynamic-programming}

!!! definition "动态规划"
    动态规划（Dynamic Programming，DP）通过复用子问题的结果解决整体问题。在这里，它利用已知的转移概率和奖励，反复按贝尔曼关系更新状态价值。

**策略迭代**交替进行两件事：固定策略，计算它的状态价值；根据这些价值，在各状态选择期望回报更高的动作。**价值迭代**把选择最佳动作直接放进每次价值更新，价值稳定后再提取策略。

迷宫只有几十个格子时，可以用表保存全部价值。如果状态是摄像头图像，状态数量难以枚举，通常要用函数或神经网络近似价值。未知环境下，也无法直接计算对所有转移的期望，需要从交互样本学习。

!!! quote "参考资料"
    [David Silver：动态规划、策略迭代与价值迭代](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-3-planning-by-dynamic-programming-.pdf)。

## 蒙特卡洛与时序差分 {#mc-td}

!!! definition "蒙特卡洛与时序差分"
    蒙特卡洛（Monte Carlo，MC）用完整回合的实际回报估计价值；时序差分（Temporal Difference，TD）用当前奖励和后续价值估计更新价值。两者都能从实际轨迹学习，不要求预先知道转移概率。

=== "蒙特卡洛（MC）"
    一轮任务结束后，计算某状态之后真正得到的回报 $G_t$，用它更新该状态的价值。多次访问的回报平均值，近似这个策略的期望回报。

    一次迷宫路径很长，MC 就要等到结束；不同路径的回报也可能相差很大。它的目标使用实际奖励，不依赖后续状态的价值估计。

=== "时序差分（TD）"
    每走一步，用 $r+\gamma V(s')$ 作为目标，不必等到整轮结束：

    $$V(s)\leftarrow V(s)+\alpha[r+\gamma V(s')-V(s)]$$

    $\alpha$ 是学习率，方括号是 TD 误差。若旧价值为 2，奖励为 −1，下一状态价值为 5，$\gamma=0.9$、$\alpha=0.1$，新价值为 $2+0.1(3.5-2)=2.15$。

    TD 用已有估计帮助更新其他估计，称为自举。这样能及时学习，但目标也会继承当前估计的误差。

真正终止后没有未来奖励，后续价值取 0。仅因运行时间上限截断的轨迹，不一定代表任务终止，处理时要区分这两种情况。

![蒙特卡洛与时序差分](/images/ml-guide/mc-td-targets.png)

!!! quote "参考资料"
    [David Silver：MC 与 TD 预测](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-4-model-free-prediction-.pdf)。

## 两种动作价值学习方法 {#q-learning-sarsa}

!!! definition "Q-learning 与 SARSA"
    两者都学习动作价值 $Q(s,a)$。Q-learning 的更新目标使用下一状态的最大动作价值；SARSA（State–Action–Reward–State–Action）使用下一步实际选出的动作价值。

更新形式都是：旧值加上学习率乘以“目标减旧值”，区别在目标。

| 算法 | 更新目标 | 学习的行为 |
| --- | --- | --- |
| Q-learning | $r+\gamma\max_{a'}Q(s',a')$ | 下一步按当前估计选择最好动作 |
| SARSA | $r+\gamma Q(s',a')$ | 下一步执行实际选出的动作 $a'$ |

SARSA 的名字来自五项记录：当前状态、动作、奖励、下一状态、下一动作。它学习采集数据的当前策略，属于 **on-policy**。Q-learning 的目标可以与实际探索动作不同，属于 **off-policy**。

常见探索方法是 $\varepsilon$-greedy：以 $\varepsilon$ 的概率随机选动作，其余时候选择当前价值最大的动作。只选已有最佳动作，可能永远发现不了更好的路径。

例如沿悬崖走能抄近路，但随机探索可能掉下去。SARSA 的更新会纳入实际探索策略带来的风险；Q-learning 的目标假设后续选最大价值动作，两者可能学到不同路线。

??? info "一个 Q-learning 更新"
    假设 $Q(s,a)=2$，奖励为 1，下一状态最大动作价值为 4，$\gamma=0.9$、$\alpha=0.1$。目标为 $1+0.9\times4=4.6$，更新后为 $2+0.1(4.6-2)=2.26$。若这一步已经到达终止状态，目标只有奖励 1。

!!! quote "参考资料"
    [David Silver：SARSA、Q-learning 与探索](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-5-model-free-control-.pdf)。

## 策略梯度 {#policy-gradient}

!!! definition "策略梯度"
    策略梯度直接计算期望回报对策略参数的梯度，并据此更新策略。

例如一个网络读入状态，输出向左、向右的概率。执行动作并收集回报后，增加高回报动作出现的概率，降低表现较差动作的概率。

REINFORCE 用完整回合的采样回报估计策略梯度，其名称来自 REward Increment = Nonnegative Factor × Offset Reinforcement × Characteristic Eligibility。以下取有限回合、折扣因子 $\gamma=1$，一次更新可写为：

$$\theta\leftarrow\theta+\alpha\,G_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)$$

$\theta$ 是策略参数，$\nabla_\theta$ 是对这些参数的梯度。对数概率的梯度指出如何增加本次动作的概率，$G_t$ 决定更新的权重。它需要对许多采样结果求平均，单次成功未必代表动作可靠。

通常用 $G_t-b(s_t)$ 代替 $G_t$，其中 $b$ 是不依赖本次动作的基线，例如状态价值。这样比较的是“比这个位置平常的结果好多少”，可降低梯度估计的波动。连续动作也可通过参数化概率分布生成，不必枚举每个可能值。

!!! quote "参考资料"
    [Spinning Up：策略梯度与基线](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)；[Williams：REINFORCE 原论文，第 3 节](https://citeseerx.ist.psu.edu/document?doi=e526a65b9ef5afb6639fd3a062f4045d24448232&repid=rep1&type=pdf)。

## Actor–Critic {#actor-critic}

!!! definition "Actor–Critic"
    Actor–Critic 结合策略学习与价值学习：Actor 根据状态给出动作分布，Critic 估计状态或动作价值。Critic 的反馈帮助 Actor 判断本次选择比预期好多少。

一种常见实现使用 TD 误差 $\delta=r+\gamma V(s')-V(s)$ 近似优势：Critic 调整自己的价值预测，Actor 用 $\delta$ 给本次动作的对数概率梯度加权。正误差提高该动作的概率，负误差降低它的概率。

Critic 让策略能更频繁地更新，但它的估计错误也会影响 Actor。训练时同时观察回报、价值损失与多次独立运行的波动；仅看策略网络的损失下降，无法判断任务表现是否变好。

!!! quote "参考资料"
    [David Silver：Actor–Critic](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-7-policy-gradient-methods.pdf)；[Spinning Up：Vanilla Policy Gradient 的策略与价值更新](https://spinningup.openai.com/en/latest/algorithms/vpg.html)。
