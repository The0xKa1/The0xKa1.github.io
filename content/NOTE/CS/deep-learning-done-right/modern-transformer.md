---
title: 现代 Transformer
comments: false
statistics: false
---

# 现代 Transformer

[Transformer](./transformer.md) 已能用因果注意力预测下一个 token。继续搭建语言模型时，还需要决定：位置信息怎样进入注意力，残差分支怎样归一化，前馈层怎样变换通道。这三件事可以分开选择，不必把原论文的结构整套搬来。

## 现代解码器 {#decoder-block}

保留每层两次残差相加，把归一化放在子层之前，可以写成

$$
\begin{aligned}
U&=X+\operatorname{Attn}(\operatorname{Norm}_1(X)),\\
Y&=U+\operatorname{FFN}(\operatorname{Norm}_2(U)).
\end{aligned}
$$

$X,U,Y\in\mathbb R^{B\times T\times d}$；$B$ 是批量，$T$ 是序列长度，$d$ 是模型宽度。两个 Norm 参数独立，注意力只读取当前位置及过去位置。堆栈末尾再归一化并投影到词表，训练目标仍是[下一 token 交叉熵](./transformer.md#training)。

[LLaMA（2023）§2.2](https://arxiv.org/html/2302.13971v1#S2.SS2)把来源不同的位置处理、归一化和前馈构件组合进同一个解码器。本章用小尺寸逐项核对这些操作。

输入嵌入加上一张位置表，“相距多远”就得由网络自己学出来。能否把相对位移直接放进 query 与 key 的比较中？

???quote "操场上的转身"
    体育课上，周老师带全班玩一个配对游戏。每个孩子戴一顶帽子，帽檐上画一个箭头，方向自己挑。大家沿跑道上的白线站成一排，再按脚下的线转身：站第一条线的转一格，第二条线的转两格，往后每多一条线多转一格。转完之后，两个人帽檐上的箭头越朝同一边，配合分越高。

    以前她用名单配对，上面写着“三号线和五号线一组”。有一次操场东头积水，全班挪到十号线以后去站，三号线上根本没人，名单只能作废。

    换成转身以后，积水又来了一回。全班往后挪了七条线，每个人都多转了七格。阿哲和小禾原来隔着两个人，现在还是隔着两个人，两顶帽子之间差的角度没变，配合分和上周一样。后来小禾自己换到了队尾，两人之间差的格数变了，帽檐对不上，分数才跟着变。

    隔得一样远，分数也不一定一样。阿哲和小禾原本画的箭头就差不多，转完仍然挨得近；另一对同样隔两个人，一个画朝北，一个画朝南，转完还是对不上。

    ![一排戴箭头帽子的孩子在跑道白线上各自转身](/images/deep-learning-done-right/stories-v2/C03.png)

    配好对的两个人要互相扔沙包。沙包从手里递出去，用不着跟帽子一起转。

    旋转位置编码（RoPE）也是这样：query 和 key 各按自己的位置旋转一个角度再做内积，整体平移不改变结果，value 不参与旋转。

## 旋转位置编码 {#rope}

旋转位置编码（rotary position embedding，RoPE）对每个注意力头中投影完成的 query 和 key 施加旋转。这里用列向量推导，单头宽度 $d_h$ 为偶数。$q_m,k_n\in\mathbb R^{d_h}$ 是旋转前的内容向量，$m,n$ 是从 0 开始的位置；本节的 value 不旋转。

先看二维。逆时针转过角度 $\phi$ 的矩阵是

$$
R(\phi)=
\begin{bmatrix}
\cos\phi&-\sin\phi\\
\sin\phi&\cos\phi
\end{bmatrix}.
$$

乘以 $q=(q_0,q_1)^\top$ 后，两项分别为 $q_0\cos\phi-q_1\sin\phi$ 和 $q_0\sin\phi+q_1\cos\phi$。因此旋转保持长度，同时让向量方向变化。

在位置 $m$ 使用角度 $m\theta$，其中 $\theta$ 是每移动一个位置增加的弧度：

$$
\widetilde q_m=R(m\theta)q_m,\qquad
\widetilde k_n=R(n\theta)k_n.
$$

更宽的向量分成通道对 $(0,1),(2,3),\ldots$。第 $i$ 对使用

$$
\theta_i=b^{-2i/d_h},\qquad
0\le i<d_h/2,
$$

$b>1$ 是频率基数。RoFormer 的设置取 $b=10000$；$d_h$ 是单头宽度，不能换成整个模型的宽度 $d$。每对独立旋转，再拼回向量，相当于乘一个分块对角矩阵

$$
\mathcal R_m=
\operatorname{diag}\bigl(R(m\theta_0),\ldots,R(m\theta_{d_h/2-1})\bigr).
$$

不同通道对转速不同，给位置差提供多种尺度。频率是预设的，不引入可训练的位置参数。RoPE 放在 Q/K 投影之后，输入端不再叠加原 Transformer 的正弦位置表。[RoFormer §3.2](https://arxiv.org/html/2104.09864v5#S3.SS2)给出了二维及分块形式。

## 相对位置内积 {#relative-dot}

为什么两次绝对位置旋转能产生相对位移？先把两条旋转规则展开：旋转矩阵的转置使角度取反，同平面的连续旋转使角度相加，所以

$$
R(\alpha)^\top R(\beta)
=R(-\alpha)R(\beta)=R(\beta-\alpha).
$$

将它代入内积：

$$
\begin{aligned}
\widetilde q_m^\top\widetilde k_n
&=(R(m\theta)q_m)^\top(R(n\theta)k_n)\\
&=q_m^\top R(m\theta)^\top R(n\theta)k_n\\
&=q_m^\top R((n-m)\theta)k_n.
\end{aligned}
$$

这里的正负号由列向量和逆时针旋转约定决定。将两个位置同时加上 $c$，$(n+c)-(m+c)=n-m$，内积不变。令 $n=m$ 则旋转完全抵消，恢复 $q_m^\top k_m$。

更一般地，记 $q_m^{(i)},k_n^{(i)}\in\mathbb R^2$ 为第 $i$ 个通道对，旋转后的缩放点积分数为

$$
s_{mn}=\frac1{\sqrt{d_h}}
\sum_{i=0}^{d_h/2-1}
(q_m^{(i)})^\top R((n-m)\theta_i)k_n^{(i)}.
$$

分数同时依赖内容向量和位置差。[RoFormer §3.1与§3.2](https://arxiv.org/html/2104.09864v5#S3.SS1)将这种内积关系作为构造目标。

### 二维算例

取教学角频率 $\theta=\pi/2$，它用于方便手算；标准频率表的第一项是 1。令 $m=1,n=2$，$q=(1,2)^\top,k=(2,1)^\top$。旋转后

$$
\widetilde q=(-2,1)^\top,\qquad
\widetilde k=(-2,-1)^\top.
$$

两者内积为 $4-1=3$。也可只把 $k$ 转过相对角度 $(2-1)\pi/2$：$R(\pi/2)k=(-1,2)^\top$，再与 $q$ 点乘，得到 $-1+4=3$。旋转前内积是 4，因此位置差确实改变了分数；注意力中使用的是 $3/\sqrt2\approx2.1213$。

把位置改成 $m=4,n=5$，差值仍为 1，内积仍是 3。两向量的平方范数都为 5，旋转后也保持为 5。

### 四维算例

取 $d_h=4,b=10000$，得到 $\theta_0=1,\theta_1=0.01$。令

$$
q=(1,2,3,4)^\top,\quad k=(2,1,0,1)^\top,
\quad m=1,\ n=3.
$$

对 $q$ 的两对通道分别旋转 1 和 0.01 弧度；对 $k$ 则旋转 3 和 0.03 弧度：

$$
\begin{aligned}
\widetilde q&\approx(-1.142640,1.922076,2.959851,4.029800)^\top,\\
\widetilde k&\approx(-2.121105,-0.707752,-0.029996,0.999550)^\top.
\end{aligned}
$$

内积约为 $5.002509$，除以 $\sqrt4=2$ 后为 $2.501254$。另一条计算路径将 $k$ 的两对分别旋转 2 和 0.02 弧度，再与原 $q$ 点乘，得到相同内积。不同频率并没有破坏二维证明，因为各通道对的结果最后只是相加。

### 实现与缓存 {#rope-cache}

计算时张量按 $(B,h,T,d_h)$ 排列；$h$ 是头数。下面用 NumPy 的末维保存向量坐标，公式仍逐对执行相同旋转。`positions` 的长度必须等于本次输入长度，正弦余弦表从 $(T,d_h/2)$ 广播到 $(1,1,T,d_h/2)$。

```python
import numpy as np

def rope(x, positions, base=10000.0):
    # x: (B, h, T, dh)，positions: (T,)
    x = np.asarray(x, dtype=np.float64)
    positions = np.asarray(positions, dtype=np.float64)
    dh = x.shape[-1]
    assert x.ndim == 4 and dh % 2 == 0
    assert positions.shape == (x.shape[2],)
    freq = base ** (-np.arange(0, dh, 2, dtype=np.float64) / dh)
    angles = positions[:, None] * freq[None, :]
    c = np.cos(angles)[None, None, :, :]
    s = np.sin(angles)[None, None, :, :]
    even, odd = x[..., 0::2], x[..., 1::2]
    out = np.empty_like(x)
    out[..., 0::2] = even * c - odd * s
    out[..., 1::2] = even * s + odd * c
    return out

q = np.array([1., 2., 3., 4.]).reshape(1, 1, 1, 4)
k = np.array([2., 1., 0., 1.]).reshape(1, 1, 1, 4)
left = np.sum(rope(q, [1]) * rope(k, [3]))
right = np.sum(q * rope(k, [2]))
np.testing.assert_allclose(left, right, atol=1e-12, rtol=1e-12)
```

这里配对相邻偶奇通道。有些实现先存所有第一分量，再存所有第二分量，使用前半/后半配对。两种布局差一个通道置换，加载权重时要连同投影通道的排列一起对上。

[KV cache](./transformer.md#kv-cache)中保存已经旋转的 K 和未旋转的 V。若前缀已处理 3 个 token，新 token 的位置是 3，不能又从 0 开始旋转。旧 K 已带各自位置，不随新步重复旋转。

下面比较同一个单层、单头注意力的两条路径。一次计算所有位置时加因果 mask；逐 token 路径每次只查询已追加的缓存。固定教学 Q/K/V，关闭随机操作，两个输出应逐项一致。

```python
# 与上一个代码块连用
rng = np.random.default_rng(7)
q0, k0, v0 = [rng.normal(size=(1, 1, 4, 4)) for _ in range(3)]

def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

qr, kr = rope(q0, np.arange(4)), rope(k0, np.arange(4))
scores = np.einsum('bhtd,bhsd->bhts', qr, kr) / 2.0
allowed = np.arange(4)[None, :] <= np.arange(4)[:, None]
full = np.einsum('bhts,bhsd->bhtd',
                 softmax(np.where(allowed, scores, -np.inf)), v0)

kc = np.empty((1, 1, 0, 4))
vc = np.empty((1, 1, 0, 4))
outputs = []
for pos in range(4):
    qt = rope(q0[:, :, pos:pos+1], [pos])
    kt = rope(k0[:, :, pos:pos+1], [pos])
    kc = np.concatenate([kc, kt], axis=2)
    vc = np.concatenate([vc, v0[:, :, pos:pos+1]], axis=2)
    s = np.einsum('bhtd,bhsd->bhts', qt, kc) / 2.0
    outputs.append(np.einsum('bhts,bhsd->bhtd', softmax(s), vc))
cached = np.concatenate(outputs, axis=2)
np.testing.assert_allclose(full, cached, atol=1e-12, rtol=1e-12)
```

最后缓存 K/V 各为 $(1,1,4,4)$，输出也是 $(1,1,4,4)$。多层模型为每一层分别维护缓存；修改旧前缀、旋转频率配置或位置映射后，受影响的缓存要重新构造。

## 长度外推 {#long-context}

旋转公式能代入更大的位置数，为什么模型到了长文本仍可能失败？训练只约束了有限位置范围内的行为。更大的相对距离会产生没见过的相位组合，内容表示、检索目标和干扰项数量也随上下文而变。

从二维式子就能看出，固定内容时内积含正弦和余弦项，会随距离振荡，并不是距离越远就越小。所以相对位移恒等式本身保证不了训练长度以外的回答质量。

位置插值把更长的目标窗口压回原先的位置尺度。设训练窗口长度为 $L$，目标窗口长度为 $L'>L$，使用

$$
m'=m\frac{L}{L'},\qquad
\widetilde q_m=\mathcal R_{m'}q_m.
$$

例如 $L=2048,L'=4096$，位置 3000 映为 1500，原先相距 100 的两处映为相距 50。压缩降低了远距离的相位变化，也改变了相邻 token 的角度间隔，所以通常还要配合适配训练和评价。[位置插值论文 §2](https://arxiv.org/html/2306.15595v2#S2)讨论了直接外推的问题与这一映射。

长文本困惑度、单点检索成功和跨段推理回答测的是不同能力。检验扩展效果，要在不同长度、证据位置和干扰数量下分别测检索与推理，同时保留短上下文任务。

位置表和三角函数还涉及数值精度：较大位置在低精度类型中可能无法逐个区分，所以先用足够的精度构造位置与角度，再转换成模型使用的类型。长度增长带来的缓存与计算成本，由[分组查询和分块注意力](./efficient-sequence-models.md)处理。

## RMSNorm {#rmsnorm}

[LayerNorm](./transformer.md#layernorm)先减均值，再按标准差缩放。若只控制每个位置的幅度，可用均方根归一化。对 $x\in\mathbb R^d$，本章采用带可训练缩放、不带偏置的形式：

$$
\operatorname{RMSNorm}(x)_j=
\gamma_j\frac{x_j}{\sqrt{\frac1d\sum_{i=1}^{d}x_i^2+\epsilon}}.
$$

$\gamma\in\mathbb R^d$ 是可训练参数，$\epsilon>0$ 防止零输入除零。输入为 $(B,T,d)$ 时，只沿最后一维求均方，统计量形状为 $(B,T,1)$；不同样本和位置分别计算。没有 BatchNorm 式运行统计量，训练和推理采用同一公式。[RMSNorm §4](https://arxiv.org/html/1910.07467v1#S4)给出均方根归一化及其不变性分析。

取 $x=[1,3]$、$\gamma=[1,1]$，暂忽略微小的 $\epsilon$，均方根为 $\sqrt5$，输出为 $[0.447214,1.341641]$。同一输入的无仿射 LayerNorm 输出为 $[-1,1]$。RMSNorm没有把输出均值变为零；给输入统一加 1，输出会变为 $[2,4]/\sqrt{10}$，不等于原结果。

忽略 $\epsilon$ 时，将非零输入乘正数 $a$，分子与分母同乘 $a$，输出保持；有限 $\epsilon$ 使这一性质只近似成立。

## SwiGLU {#swiglu}

普通 FFN 把输入扩宽、激活、再投回原宽度。怎样让扩宽后的某个通道贡献多少，也由当前输入决定？可以让输入同时产生一条内容分支和一条门控分支，再逐元素相乘。

采用行向量记法，$x\in\mathbb R^{1\times d}$；对批量张量则在最后一维执行同样操作：

$$
\begin{gathered}
\operatorname{SiLU}(z)=z\sigma(z),\qquad
\sigma(z)=\frac1{1+e^{-z}},\\
\operatorname{SwiGLU}(x)=
\bigl(\operatorname{SiLU}(xW_g)\odot(xW_u)\bigr)W_d.
\end{gathered}
$$

$W_g,W_u\in\mathbb R^{d\times f}$ 是两条上投影，$W_d\in\mathbb R^{f\times d}$ 是下投影，$f$ 为中间宽度，$\odot$ 表示逐元素乘法。本例省略偏置。门控分支经过 SiLU 后可以为负，也不限制在 $[0,1]$。[GLU Variants Improve Transformer 的式 (6)](https://arxiv.org/html/2002.05202v1)给出了该 FFN 形式。

取 $x=[1,2]$，令

$$
W_g=\begin{bmatrix}1&-1\\0&0\end{bmatrix},\quad
W_u=\begin{bmatrix}2&1\\0&1\end{bmatrix},\quad W_d=I_2.
$$

两条投影分别得到 $[1,-1]$ 和 $[2,3]$。SiLU 后为 $[0.731059,-0.268941]$，逐元素相乘得到 $[1.462117,-0.806824]$，再乘单位阵即为输出。这一计算只发生在同一位置的通道之间，跨位置通信仍由注意力完成。

没有偏置时，普通 FFN 中间宽度 $d_{ff}$ 的参数量为 $2dd_{ff}$，SwiGLU 为 $3df$。若都使用同一个中间宽度，后者参数更多；要对齐这部分参数预算，应取 $f=2d_{ff}/3$，再按实现需要处理整数及硬件对齐。下面的教学配置取 $d=8,d_{ff}=24,f=16$，两者恰好都是 384 个参数。

### 一层的尺寸与参数

将各部件放回第一节的残差结构。取 $B=2,T=3,d=8,h=2,d_h=4,f=16$，使用标准多头注意力、无偏置投影和两个 RMSNorm：

| 运算 | 输入或权重 | 输出 |
| --- | --- | --- |
| RMSNorm 1 | $X:(2,3,8)$，缩放 $(8,)$ | $(2,3,8)$ |
| Q/K/V 投影 | 三个 $(8,8)$ 矩阵 | 各 $(2,3,8)$ |
| 拆头并旋转 Q/K | 2 头，头宽 4 | Q/K/V 各 $(2,2,3,4)$ |
| 因果注意力 | 分数 $(2,2,3,3)$ | $(2,2,3,4)$ |
| 拼头、输出投影、残差 | $W_o:(8,8)$ | $U:(2,3,8)$ |
| RMSNorm 2 | 缩放 $(8,)$ | $(2,3,8)$ |
| 两条上投影 | $W_g,W_u:(8,16)$ | 各 $(2,3,16)$ |
| SiLU、逐元素相乘、下投影 | $W_d:(16,8)$ | $(2,3,8)$ |
| 残差相加 | 加回 $U$ | $Y:(2,3,8)$ |

注意力投影共 $4d^2=256$ 个参数，SwiGLU 有 $3df=384$ 个，两个归一化共 $2d=16$ 个，总计 656 个。这里未计嵌入、堆栈末端归一化及词表头。RoPE没有增加训练参数；K/V缓存则是由当前输入产生、随序列增长的推理状态。

前馈分支还可以按 token 选用不同的[专家](./scaling-and-experts.md#mixture-of-experts)，被选中的专家内部做的仍是这样的通道变换。
