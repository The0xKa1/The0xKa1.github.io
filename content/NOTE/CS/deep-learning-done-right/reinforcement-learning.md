---
title: 强化学习
comments: false
statistics: false
---

# 强化学习

图像分类的数据通常已经给定；智能体选择动作时，动作会改变接下来看到的数据。例如向左走会看到另一条走廊，某次探索还能带来以后才收到的奖励。强化学习研究怎样通过这种交互改善决策。

## 马尔可夫决策过程（MDP） {#mdp}

在时刻 $t$，智能体获得状态 $s_t$，按策略 $\pi(a\mid s_t)$ 选动作 $a_t$，环境给出奖励 $r_{t+1}$ 和下一状态 $s_{t+1}$。一次经验可以记录为 $(s_t,a_t,r_{t+1},s_{t+1},d_t)$，其中 $d_t$ 标记任务是否真正终止。

马尔可夫决策过程（MDP）用状态空间 $\mathcal S$、动作空间 $\mathcal A$、转移规律 $P(s',r\mid s,a)$、初始状态分布和折扣因子 $\gamma$ 描述问题。马尔可夫性质表示：给定当前状态和动作，下一状态、奖励的分布不再需要更早历史。

现实中传感器往往只给观测 $o_t$。一帧画面未必包含速度，两个相同画面可能需要不同动作。可以堆叠相邻帧或使用 [RNN](./rnn.md)汇总历史，作为策略的输入表示。

![DQN 论文中的五种 Atari 游戏画面，包括 Pong、Breakout、Space Invaders、Seaquest 和 Beam Rider](/images/deep-learning-done-right/training/dqn-atari.png)

图 1：Mnih 等，2013，[Playing Atari with Deep Reinforcement Learning](https://arxiv.org/abs/1312.5602v1) Figure 1，裁去周围正文。游戏屏幕提供观测，动作由控制器发出，分数变化提供奖励。

监督学习直接提供目标标签 $y$；强化学习的奖励评价采取动作后的结果，通常没有告诉智能体当前最优动作是什么。训练数据随策略变化，并具有时间相关性。探索还会决定哪些动作得到尝试，从而影响估计的覆盖范围。

动作已经改变了后续状态。如果只按眼前奖励挑动作，早先的决定造成的返程损失要记到哪里？

???quote "七点的两张单"
    晚上七点，商场门口。小蒋的手机同时跳出两单：一单送城东开发区，配送费十八块；一单送隔两条街的小区，七块。他点了十八块那单。

    他一直这么接，哪单钱多接哪单。可每月结算，他总比同站的阿梅少一截。阿梅七点在商场门口，接的常常是近单。

    小蒋跟着她跑了一个晚上。近单送完，阿梅人还在商圈里，没出电梯手机又响了，一个钟头跑了五单。换到他自己那晚：开发区的写字楼九点以后没人下单，他空车往回骑了四十分钟，进了商圈，晚高峰已经过了。那十八块，差不多就是他后半晚的全部。

    阿梅说，一单好不好，要看接了它以后这一晚怎么走。越往后的单越说不准，算的时候可以打点折扣，但不能不算。

    小蒋不服。有一回他七点又接了远单，刚到开发区就有人下单回城，那晚挣得比阿梅还多。站长在骑手群里把这个月翻了一遍：七点在商场门口接远单的，全站有三十多回，大多数那晚都少挣了，像他那样走运的只有几回。

    ![晚高峰的商场门口，骑手低头看手机，一条路通向远处的写字楼](/images/deep-learning-done-right/stories-v2/C10.png)

    从一个状态出发选一个动作，此后整段经历的奖励打过折扣再加起来，叫回报；把各种可能的经历都算进去，回报的期望叫动作价值，小蒋走运的那一晚只是其中一个样本。

## 回报、价值与 Bellman 方程 {#value}

从时刻 $t$ 开始的折扣回报为

$$
G_t=\sum_{k=0}^{T-t-1}\gamma^k r_{t+k+1}.
$$

$T$ 是终止时刻，$\gamma\in[0,1]$ 控制未来奖励的权重。有限回合可取 $\gamma=1$；无限时域通常取 $\gamma<1$ 并要求回报存在。若接下来两步奖励为 0、1，$\gamma=0.9$，则 $G_t=0+0.9\times1=0.9$。

设两条两步路径的奖励分别为 $(6,-8)$ 和 $(2,2)$，固定两步后终止、$\gamma=0.9$，第一条路径的回报为 $6+0.9(-8)=-1.2$，第二条为 $2+0.9(2)=3.8$。只比第一步会选 6，按整段路径比较则选 3.8。环境有随机性时，一趟的回报只是一个样本，要比较的是同一状态下多次经历的期望。

状态价值和动作价值定义为

$$
\begin{gathered}
V^\pi(s)=\mathbb E_\pi[G_t\mid s_t=s],\\

Q^\pi(s,a)=\mathbb E_\pi[G_t\mid s_t=s,a_t=a].
\end{gathered}
$$

期望包含环境随机性与策略后续的动作选择。根据 $G_t=r_{t+1}+\gamma G_{t+1}$，有

$$
\begin{aligned}
Q^\pi(s,a)&=\mathbb E_{s',r\mid s,a}\Bigl[\\
&\quad r+\gamma\sum_{a'}\pi(a'\mid s')Q^\pi(s',a')\Bigr].
\end{aligned}
$$

终止状态的后续价值取零。最优动作价值 $Q^*$ 把下一步策略平均替换为最大值：

$$
Q^*(s,a)=\mathbb E_{s',r\mid s,a}
\left[r+\gamma\max_{a'}Q^*(s',a')\right].
$$

Bellman 关系把长序列问题写成“一步奖励加下一状态价值”，于是可以用已有的价值估计构造学习目标。状态、策略、回报、价值函数与 Bellman 方程的定义可对照 [OpenAI Spinning Up 的基本概念说明](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)。

## Q-learning {#q-learning}

若每次都要等完整返航，更新就只能在回合末得到结果。已经有下一状态的价值估计时，能否用“本步奖励加估计的后续价值”先修正当前判断？Bellman 关系给出了这个自举目标。

表格 Q-learning 为每个状态动作对存一个数。观测到一条转移后，构造目标和 TD 误差：

$$
\begin{gathered}
y=r+\gamma(1-d)\max_{a'}Q(s',a'),\\

\delta=y-Q(s,a),\\
 Q(s,a)\leftarrow Q(s,a)+\eta\delta.
\end{gathered}
$$

$\eta$ 是更新步长，$d=1$ 表示真正终止。TD 是 temporal difference，指这两个相邻时间位置估计之间的差异。

设当前 $Q(s,a)=0.5$，本步奖励 $r=1$，下一状态最佳动作价值为 2，$\gamma=0.9,\eta=0.1,d=0$。则 $y=2.8$、$\delta=2.3$，更新为 $0.73$。若这一步已经终止，$y=1$，更新为 $0.55$。

行为策略可以采用 $\epsilon$-greedy：以概率 $\epsilon$ 随机选动作，其余时间选当前 Q 最大的动作。更新目标仍使用下一状态的最大 Q，因此它学习的目标策略可以与采样动作的行为策略不同，这称为 off-policy。表格方法的收敛条件不能照搬为神经网络的收敛保证。

## 深度 Q 网络（DQN） {#dqn}

一张 Q 表需要逐个存储状态动作对；连续坐标或像素画面几乎不会原样重复。怎样把一个状态上的经验用于其他相似输入？让神经网络从状态特征预测整行 Q 值，再用同一种 TD 目标训练。

状态空间很大时，用网络 $Q_\theta(s,\cdot)$ 输出所有离散动作的价值。一个输入四维状态、具有两个动作的教学网络可采用 $4\to64\to64\to2$ 的 MLP，隐藏层用 ReLU。批次输入为 $[B,4]$，输出为 $[B,2]$，共 $(4\times64+64)+(64\times64+64)+(64\times2+2)=4610$ 个参数。

输出中的两个数是预期回报估计，无需 softmax，也不要求位于 $[0,1]$。按动作下标 gather 后得到 $[B]$ 的已执行动作价值，再与 $[B]$ 的 TD 目标比较。

DQN 使用经验回放存储过去的转移，从中随机采样 batch，削弱连续帧相关性并复用数据。常用的目标网络版本另存参数 $\bar\theta$，计算

$$
\begin{gathered}
y_i=r_i+\gamma(1-d_i)\max_{a'}Q_{\bar\theta}(s'_i,a'),\\

L(\theta)=\frac1B\sum_i\ell(Q_\theta(s_i,a_i),y_i).
\end{gathered}
$$

$\ell$ 可以是平方误差或 Huber 损失。计算 $y_i$ 时停止梯度，只更新在线网络 $\theta$；每隔一定更新次数复制 $\bar\theta\leftarrow\theta$，或按固定比例缓慢更新目标网络。

2013 年论文给出了经验回放与像素输入方法；这里的独立目标网络对应 2015 年 [Nature DQN](https://www.nature.com/articles/nature14236) 的训练设计。上面的四维 MLP 是教学实例，论文 Atari 网络使用卷积处理图像。

下面片段展示一个回放 batch 的训练步骤。`states/next_states` 为 $[B,4]$，`actions` 为整数 $[B]$，`rewards` 为浮点 $[B]$，`terminated` 为布尔 $[B]$；`online`、`target` 均输出 $[B,2]$：

```python
q_taken = online(states).gather(1, actions[:, None]).squeeze(1)
with torch.no_grad():
    next_q = target(next_states).max(dim=1).values
    td_target = rewards + 0.99 * (~terminated).float() * next_q
loss = torch.nn.functional.smooth_l1_loss(q_taken, td_target)
optimizer.zero_grad(set_to_none=True)
loss.backward()
torch.nn.utils.clip_grad_norm_(online.parameters(), 10.0)
optimizer.step()
# 按预先设定的更新间隔执行：target.load_state_dict(online.state_dict())
```

完整交互循环先采样动作，执行环境一步，把转移放入回放；缓冲区有足够数据后开始采样训练，定期更新目标网络。[PyTorch DQN 教程](https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html)提供了环境交互、回放和训练的完整实现。

### 终止与时间截断 {#termination}

到达任务终点或失败状态是 termination，后续回报为零。因采样预算耗尽而停止一段仍在继续的任务是 truncation，通常仍应从真实的最后观测估计后续价值。Gymnasium 分别返回 `terminated` 和 `truncated`；环境重置条件可用二者的或，TD 目标的 bootstrap 掩码要按任务终止语义设置。

若时间上限本来就是任务定义的一部分，剩余时间也应进入状态，到期按真正终止处理。自动重置的向量环境还要取到重置前的最后观测，不能把新回合第一帧当成 $s'$。[Gymnasium 时间限制文档](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/)解释了此处对价值目标的影响。

## 策略梯度 {#policy-gradient}

动作很多或连续时，对所有候选求最大 Q 不容易。可以直接学习“在这个状态下怎样抽取动作”，再用实际回报提高好选择的概率。

另一条路线让网络输出策略 $\pi_\theta(a\mid s)$。离散动作可用 softmax，连续动作可输出高斯分布的均值和尺度。策略按该分布采样动作，训练目标为最大化期望回报。

以有限回合、折扣目标 $J(\theta)=\mathbb E[\sum_{t=0}^{T-1}\gamma^t r_{t+1}]$ 为例，一种 Monte Carlo 策略梯度估计为

$$
\begin{aligned}
\nabla_\theta J&\approx\frac1K\sum_{k=1}^{K}\sum_{t=0}^{T_k-1}\gamma^t\\
&\quad\cdot\nabla_\theta\log\pi_\theta(a_t^{(k)}\mid s_t^{(k)})\\
&\quad\cdot\bigl(G_t^{(k)}-b(s_t^{(k)})\bigr).
\end{aligned}
$$

$K$ 是本次采样的轨迹数，$G_t$ 为从 $t$ 起、相对该时刻折扣的回报，$b(s_t)$ 是不依赖当前动作的基线。外侧 $\gamma^t$ 对应本式从回合起点定义的折扣目标；若采用不折扣有限回合目标，取 $\gamma=1$。策略梯度的形式及函数逼近条件见 [Sutton 等，1999](https://proceedings.neurips.cc/paper_files/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html)。

直观上，优于基线的动作提高其对数概率，低于基线则降低。单步二动作例子中，策略 logits 为 $[0,0]$，选了动作 0，优势取 2。用最小化形式 $L=-2\log\pi_\theta(0\mid s)$，其对 logits 的梯度为 $[-1,1]$。学习率为 0.1 时更新后 logits 为 $[0.1,-0.1]$，动作 0 的概率从 0.5 增至约 0.5498。

策略损失中的回报或优势在本次反传中作为固定权重。用很久以前的策略采到的数据会改变估计，没有重要性修正时，这种 on-policy 更新不能用来回放任意旧数据。

## Actor-critic {#actor-critic}

完整回报能评价一次动作，却要等到后面才得到，且不同轨迹之间波动很大。能否让一个网络学习动作分布，同时让另一个网络估计后续价值，及时提供比较基准？

actor 输出动作分布，critic 估计 $V_\phi(s)$。两者可以共用编码器，也可以是独立网络。以 $B$ 个状态、$A$ 个离散动作为例，actor logits 为 $[B,A]$，critic 输出为 $[B]$。

一阶 TD 优势估计为

$$
\hat A_t=r_{t+1}+\gamma(1-d_t)V_\phi(s_{t+1})-V_\phi(s_t).
$$

将 $y_t=r_{t+1}+\gamma(1-d_t)V_\phi(s_{t+1})$ 停止梯度后，critic 用 $\frac12(V_\phi(s_t)-y_t)^2$ 拟合目标。actor 用 $-\log\pi_\theta(a_t\mid s_t)\operatorname{stopgrad}(\hat A_t)$ 更新，若遵循前面的起点折扣目标，还应带上对应的 $\gamma^t$ 权重。共享编码器时，总损失汇总两项的梯度，并明确 critic 权重。

例如 $r=1,\gamma=0.9,V(s')=2,V(s)=0.5$，优势为 2.3，actor 提高已采动作概率，critic 把当前预测向 2.8 推近。critic 的自举减少等待整段回合的需要，也会引入价值估计误差。

可额外最大化策略熵 $H(\pi)=-\sum_a\pi(a\mid s)\log\pi(a\mid s)$，在最小化目标里写成 $-\beta H(\pi)$，$\beta\ge0$ 控制探索鼓励强度。评价时要固定用采样动作还是贪心动作。价值函数、优势和策略优化的实践关系可参见 [OpenAI Spinning Up 的策略优化推导](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)。

## 训练与评价 {#evaluation}

先确定观测、动作、奖励和终止条件，再测随机策略或简单规则的回报。奖励缩放与裁剪会改变数值尺度，奖励设计还会决定模型愿意牺牲什么。例如仅奖励速度的导航策略可能频繁碰撞，所以报告应同时列出成功率、碰撞率和耗时。

训练时记录环境交互步数、梯度更新次数、探索设置和各随机种子的曲线。评价使用固定的环境版本、独立初始条件、回合数与时间上限；分开记录真正完成和超时。最终汇总多个独立训练种子，每个策略再运行多个评估回合。大量回合能减小某个策略的测试波动，不能替代多个训练种子来测量训练不稳定性。指标汇总与置信区间见[评价与泛化](./evaluation-and-generalization.md#uncertainty)。

语言模型利用奖励更新策略的过程见[RLHF](./alignment-and-reasoning.md#rlhf)与[可验证奖励](./alignment-and-reasoning.md#verifiable-rewards)；从成对偏好直接构造训练目标的推导见[DPO](./alignment-and-reasoning.md#dpo)。
