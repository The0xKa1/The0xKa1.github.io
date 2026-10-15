---
title: 序列计算与存储
comments: false
statistics: false
---

# 序列计算与存储

[KV cache](./transformer.md#kv-cache)避免了重算旧 token 的投影，但新 query 仍要读取历史 K/V。训练长序列时，另一个大对象是每头的 $T\times T$ 注意力分数。缓存长度、临时分数矩阵和计算量来自不同的运算，要分开计数。

本章把一个注意力头的 query/key 宽度及 value 宽度都取为 $d_h$。$B$ 为批量，$T$ 为当前序列长度，$L$ 为层数。

## 分组查询注意力 {#grouped-query}

标准多头注意力为每个 query 头保存独立 K/V。若几个 query 头共用一套 K/V，缓存可以缩小，而每个 query 仍能产生自己的注意力分布。

设 query 头数为 $h_q$，K/V 头数为 $h_{kv}$，满足 $h_q$ 可被 $h_{kv}$ 整除。每组有 $r=h_q/h_{kv}$ 个 query 头。输入 $X\in\mathbb R^{B\times T\times d}$ 使用行向量投影：

$$
\begin{gathered}
W_Q\in\mathbb R^{d\times h_qd_h},\\
W_K,W_V\in\mathbb R^{d\times h_{kv}d_h}.
\end{gathered}
$$

投影并拆头后，Q 为 $(B,h_q,T,d_h)$，K/V 为 $(B,h_{kv},T,d_h)$。对从 0 开始的 query 头 $a$，使用组号 $g(a)=\lfloor a/r\rfloor$ 对应的 K/V：

$$
O_a=\operatorname{softmax}\left(
\frac{Q_aK_{g(a)}^\top}{\sqrt{d_h}}+M
\right)V_{g(a)}.
$$

$M$ 是因果或 padding 掩码，softmax 沿 key 位置轴归一化；$O_a$ 为 $(B,T,d_h)$。各头输出拼成 $(B,T,h_qd_h)$ 后，再由输出矩阵投影回宽度 $d$。若采用[旋转位置编码](./modern-transformer.md#rope)，所有 query 头及每个实际保存的 key 头分别按位置旋转。

| K/V 头数 | 名称 | 共享关系 |
| --- | --- | --- |
| $h_{kv}=h_q$ | 多头注意力（MHA） | 每个 query 头独享 K/V |
| $1<h_{kv}<h_q$ | 分组查询注意力（GQA） | 每组 query 共用 K/V |
| $h_{kv}=1$ | 多查询注意力（MQA） | 所有 query 共用 K/V |

[GQA §2.2](https://arxiv.org/html/2305.13245v3#S2.SS2)用这一分组统一三个配置。共享的是 K/V 投影与缓存，query 和最终的注意力权重仍各头独立；从 MHA 改成这种结构需要训练适配。

### 头与投影

取 $d=8,h_q=4,h_{kv}=2,d_h=2$。Q投影矩阵为 $(8,8)$，K/V投影各为 $(8,4)$。query头0、1读取K/V头0，query头2、3读取K/V头1。拼头输出宽度仍为8，输出投影为 $(8,8)$。

省略偏置，这组注意力有 $64+32+32+64=192$ 个投影参数；同尺寸MHA为256个，MQA为160个。query数量没有减少，每个query仍要与可见历史key比较。

用同一组缓存的两个标量query看共享的含义。取 $d_h=1$，两个历史key为 $[1,2]$，value为 $[10,20]$；两个query分别是0和1。query为0时，分数 $[0,0]$，输出为15。query为1时，softmax权重约为 $[0.268941,0.731059]$，输出约为17.310586。同一份K/V读出了不同的结果。

### 缓存字节

每层K和V各有 $BT h_{kv}d_h$ 个标量。若每个标量占 $s$ 字节，全模型缓存为

$$
C_{KV}=2LBT h_{kv}d_hs.
$$

最前面的2来自K与V。固定层数、批量、长度和头宽，与MHA相比，缓存比例为 $h_{kv}/h_q$。

沿用 $h_q=4,h_{kv}=2,d_h=2$，另取 $L=2,B=1,T=3,s=2$，得到

$$
C_{KV}=2\times2\times1\times3\times2\times2\times2=96\text{ 字节}.
$$

每层48字节；长度增长到4时，全模型增至128字节。相同条件的MHA占192字节，MQA占48字节。

实现时若图方便把每个共享头复制 $r$ 份长期缓存，省下的空间又花掉了。缓存应保留 $(B,h_{kv},T,d_h)$，读取时通过分组索引或支持分组的算子复用。[Stanford CS336 推理讲义的缓存核算与GQA部分](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/lecture_10.py)也将K/V占用与参数占用分别计算。

另一项开销来自注意力计算中间产生的分数与概率矩阵。

???quote "补给站放在哪"
    城市马拉松办完，志愿者队要给明年加一个补给站。三千多张跑者反馈表堆在仓库里，每张写一个公里数，再打一个一到十的分，表示有多想在那里喝到水。规则早定好了：补给站放在所有公里数的加权平均处，分数每高一分，那张表的分量翻一倍。

    去年算这件事的是阿宽。他借了体育馆，想把表全摊在地板上，先找出最高分，再一张张算分量、加总。地板摆不下，他抱着成箱的表在仓库和体育馆之间来回跑，花了两天，大半时间在路上。

    今年只有帐篷里一张折叠桌，桌面放得下一箱。林姐在一张小纸条上记三个数：到目前为止的最高分；按这个最高分折算的总分量，最高分的表算一份，每低一分减半；每张表的公里数乘上分量后的累加。一箱算完，更新这三个数，箱子搬回去，再拿下一箱。

    第五箱里冒出一张比之前最高分还高三分的表。原来的“一份”现在只值八分之一份，林姐没有回头翻前四箱，把纸条上的总分量和累加各除以八，接着往下算。

    ![帐篷里的小折叠桌上只放着一箱表格和一张小纸条](/images/deep-learning-done-right/stories-v2/C04.png)

    最后一箱算完，累加除以总分量，得出三十一点四公里。阿宽不放心，照去年的办法在体育馆又算一遍，结果一位不差。每张表照样都算了一次，省下的是地板和来回搬箱子的路。

    FlashAttention 计算注意力也是分块的：每次只把一小块 key/value 读进快速存储，用在线 softmax 记住最大值、归一化和与加权和，遇到更大的分数就把旧的累计量重新缩放。

## 分块注意力 {#flash-attention}

对单个头，设 $Q,K,V\in\mathbb R^{T\times d_h}$。普通实现先形成

$$
S=QK^\top/\sqrt{d_h}+M,\qquad
P=\operatorname{softmax}(S),\qquad O=PV.
$$

$S,P$ 都是 $(T,T)$，$O$ 是 $(T,d_h)$。GPU的高带宽显存（HBM）能存大量数据，片上SRAM容量更小、访问更快。若先把完整S写回HBM，接着读出做softmax，再存取P，注意力会搬运大量最终并不需要保留的中间元素。

FlashAttention将Q、K、V分块载入片上存储，在块内算分数，再把贡献合入输出。难点在于softmax分母要统计所有key，每一块各自归一化后再平均，一般会算错。[FlashAttention §3.1与算法1](https://arxiv.org/html/2205.14135v2#S3.SS1)给出了用额外统计量连接各块的方法。

### 在线 softmax

固定一条query。设第 $j$ 个key的缩放分数为 $s_j$，value向量为 $v_j\in\mathbb R^{d_h}$。处理过的一组位置记为 $J$，保存三个量：

$$
\begin{gathered}
m=\max_{j\in J}s_j,\\
\ell=\sum_{j\in J}e^{s_j-m},\qquad
u=\sum_{j\in J}e^{s_j-m}v_j.
\end{gathered}
$$

$m,\ell$ 为标量，$u$ 为宽度 $d_h$ 的向量；最终输出为 $o=u/\ell$。减最大值让指数参数不大于0，避免大正数溢出。

新一块的位置集合为 $I$，先求块最大值 $\widehat m=\max_{j\in I}s_j$。新的共同基准是 $m'=\max(m,\widehat m)$。旧项从基准 $m$ 改成 $m'$ 时，每项都多乘 $e^{m-m'}$，于是

$$
\begin{aligned}
\ell'&=e^{m-m'}\ell+\sum_{j\in I}e^{s_j-m'},\\
u'&=e^{m-m'}u+\sum_{j\in I}e^{s_j-m'}v_j.
\end{aligned}
$$

这两个式子可以直接由拆分旧集合与新集合的求和得到，不需要保存旧分数。初始 $m=-\infty,\ell=0,u=0$；遇到第一块有效key后建立有限的最大值。全被mask的块应跳过，否则计算 $-\infty-(-\infty)$ 会产生非数。

对一块 $b_q$ 条query，每条分别维护一组统计量，$m,\ell$ 为 $(b_q,)$，$u$ 为 $(b_q,d_h)$。当前分数块为 $(b_q,b_k)$，其中 $b_k$ 是key块大小；处理完即可复用这块空间。

### 两块算例

令四个分数为 $[0,\log2,\log3,\log4]$，标量value为 $[1,2,3,4]$。一次性softmax得到权重 $[1,2,3,4]/10$，输出

$$
o=\frac{1+4+9+16}{10}=3.
$$

先处理前两个位置：$m=\log2$，指数权重为 $[1/2,1]$，所以 $\ell=1.5,u=2.5$。第二块最大值为 $\log4$，新的基准是 $m'=\log4$，旧累计量需乘 $e^{\log2-\log4}=1/2$。新块的指数权重为 $[3/4,1]$，于是

$$
\begin{aligned}
\ell'&=0.5\times1.5+0.75+1=2.5,\\
u'&=0.5\times2.5+0.75\times3+1\times4=7.5,\\
o&=7.5/2.5=3.
\end{aligned}
$$

若各块先单独归一化，输出分别为 $5/3$ 与 $25/7$，简单平均约为2.619048，结果不对：局部归一化丢掉了各块分母的相对大小。

下面实现一条query的分块累计；传入的分数已完成缩放和mask，允许mask为负无穷，但要求至少一个有效key。

```python
import numpy as np

def online_attention(scores, values, block=2):
    scores = np.asarray(scores, dtype=np.float64)
    values = np.asarray(values, dtype=np.float64)
    assert scores.ndim == 1 and values.ndim == 2
    assert values.shape[0] == scores.size and block > 0
    assert np.all(np.isfinite(scores) | np.isneginf(scores))
    assert np.all(np.isfinite(values))
    m, total = -np.inf, 0.0
    acc = np.zeros(values.shape[1])
    for start in range(0, scores.size, block):
        s = scores[start:start+block]
        v = values[start:start+block]
        keep = np.isfinite(s)
        if not keep.any():
            continue
        s, v = s[keep], v[keep]
        new_m = max(m, s.max())
        old_scale = 0.0 if total == 0.0 else np.exp(m - new_m)
        weights = np.exp(s - new_m)
        acc = old_scale * acc + np.einsum('t,td->d', weights, v)
        total = old_scale * total + weights.sum()
        m = new_m
    if total == 0.0:
        raise ValueError('query has no visible key')
    return acc / total

scores = np.log(np.array([1., 2., 3., 4.]))
values = np.arange(1., 5.)[:, None]
np.testing.assert_allclose(online_attention(scores, values), [3.])
```

这段代码只核验累计公式。完整的FlashAttention还要安排块之间的加载、融合操作与反向重计算；训练时保存必要统计量，在反向阶段重算局部分数，避免持久保存整张概率矩阵。

### 资源变化

取 $B=1,h_q=4,T=1024$，单个完整分数张量有 $4,194,304$ 个元素，float32占16 MiB。若query/key块都为64，单头当前分数块只有4096个元素，占16 KiB；片上同时还要放Q/K/V块和累计输出。

稠密注意力仍处理全部可见位置对，主要算术量仍为 $O(Bh_qT^2d_h)$。减少的是中间矩阵存储和HBM读写，数学目标仍为同一个softmax注意力；浮点运算顺序变化可能产生小误差。[原论文定理1及§3.2](https://arxiv.org/html/2205.14135v2#S3.SS2)分别讨论算术量与IO复杂度。

GQA与FlashAttention可以一起使用：前者改变K/V头的数量，后者改变计算与搬运顺序。

## 状态空间模型 {#state-space}

如果流式处理希望每到一个token只更新固定大小的记忆，可以回到[递归状态](./rnn.md#rnn-cell)的思路。离散线性状态空间模型（state space model，SSM）的一种基本形式是

$$
\begin{aligned}
h_t&=\overline A h_{t-1}+\overline B x_t,\\
y_t&=C h_t.
\end{aligned}
$$

这里先考虑标量输入 $x_t$、标量输出 $y_t$，状态 $h_t\in\mathbb R^N$；$\overline A\in\mathbb R^{N\times N}$、$\overline B\in\mathbb R^{N\times1}$、$C\in\mathbb R^{1\times N}$。横线表示已用于离散步进的系数。给定这些系数就能递推，当前步只需旧状态与新输入；在学习模型里，这些系数由可训练参数构造。

取 $N=1,\overline A=0.5,\overline B=C=1,h_0=0$，输入依次为 $[2,0,1]$：

| 步骤 | 状态计算 | 输出 |
| --- | --- | --- |
| 1 | $h_1=0.5\times0+2=2$ | 2 |
| 2 | $h_2=0.5\times2+0=1$ | 1 |
| 3 | $h_3=0.5\times1+1=1.5$ | 1.5 |

旧输入的影响不断衰减，推理时只保留一个状态数。如果第二个输入其实是应当忽略的占位，它照样让旧状态减半：固定系数没法根据输入是否重要来调整保留程度。

### 选择性状态

Mamba的选择性SSM让步长、输入和输出映射随当前输入变化，再用适合硬件的扫描算法计算。原论文中连续状态转移参数 $A$ 是固定的可训练参数，离散转移随输入相关的步长而变。[Mamba §3.2及算法2](https://arxiv.org/html/2312.00752v2#S3.SS2)列出了这些量的尺寸与依赖。

用一个最小门控递推观察“选择”的效果：

$$
h_t=(1-g_t)h_{t-1}+g_tx_t,\qquad 0<g_t<1.
$$

$g_t$ 由当前输入的可训练函数产生，较小的值让旧状态保留得更多。原论文§3.5.1给出一个标量SSM与该门控形式的联系。这里直接给定教学门值 $[0.5,0.1,0.5]$，仍用输入 $[2,0,1]$，得到

$$
h_1=1,\qquad h_2=0.9,\qquad h_3=0.95.
$$

若三个门都为0.5，则状态依次为 $[1,0.5,0.75]$。减小第二步的门，该步对旧状态的冲淡就少了。完整的Mamba还含多通道状态、投影、局部卷积与门控分支。

对于每通道N个状态、内部宽度D、批量B的一层模型，递归状态含BDN个标量；固定这些尺寸时，它不随已读长度T增长。对角或结构化状态转移使这部分扫描的算术量可为 $O(BTDN)$；如果每步使用任意稠密 $N\times N$ 矩阵，则还会带入 $N^2$ 成本。

| 方法 | 推理时保留什么 | 新输入怎样用过去信息 |
| --- | --- | --- |
| MHA/GQA | 各层历史K/V，随T增长 | 当前query分别比较历史key |
| FlashAttention | 不改变模型的持久缓存约定 | 分块计算同一注意力结果 |
| 递归SSM | 固定尺寸状态，完整模块还可能有短卷积缓存 | 将过去压进状态，再更新和读出 |

固定状态要把历史汇总进有限的表示，精确检索许多旧细节和紧凑的流式记忆是两种不同的需求，选择性状态改善的是保留方式。
