---
title: 偏好学习与推理计算
comments: false
statistics: false
---

# 偏好学习与推理计算

[监督微调](./pretraining-and-finetuning.md)用示范回答训练模型。模型随后可能给出两个语句通顺的回答：一个遵守题目要求，一个遗漏了条件。直接让标注者比较两者，能提供示范文本之外的学习信号。

???quote "镜子前的两张图"
    老韩在菜市场后面开理发店二十年。他最得意的是一款两边推短、顶上留长的发型，自己觉得利落，见人就推荐。剪完客人都说好，回头的却不多。

    儿子给他装了一个平板。客人坐下说一句要什么，老韩就在平板上调出两张图，都是照着这句话想出来的剪法，请客人指一张。那句话、指了哪张、没指哪张，平板都存下来。

    客人不用打分，只说这张比那张好，这比打分容易得多。说“下周去面试”的，两张图里一张是老韩的招牌，一张是短而平的寸头，十个里有八个指寸头。说“下周当伴郎”的，招牌那款反倒常被指中。同一个客人，说的事不一样，指的也不一样。

    半年后，老韩再听到“面试”，先想到的是寸头；听到“婚礼”，才把招牌那款拿出来。两张图照样一起给，只是常被指中的那一类，出现得越来越多。回头客也多了。

    ![理发店的镜子前，客人指着平板上并排的两张发型图](/images/deep-learning-done-right/stories-v2/C11.png)

    在同一个请求的两个回答里挑一个，记下请求、选中的和没选中的，这就是偏好数据。标签只说两个里哪个更合适，据此调整之后，更受偏好的回答更可能出现。

## 偏好数据 {#preference-data}

一条成对偏好样本记为 $(x,y_w,y_l)$：$x$ 是提示或任务，$y_w$ 是被选中的完整回答，$y_l$ 是未被选中的回答。下标 $w,l$ 表示比较结果。标签只表示同一任务下的相对选择，两段回答的长度可以不同。

例如提示要求“只给出两条建议”，回答甲给两条可执行建议，回答乙给五条泛泛建议。标注规则可以同时要求遵循条数、内容相关和表述清楚。展示顺序可能左右选择，所以要随机交换两份回答的位置；标注者分歧或平局也要显式处理，硬把每对都定出胜负会把噪声带进训练。

对长度为 $T$ 的回答 $y=(y_1,\ldots,y_T)$，自回归策略 $\pi_\theta(y\mid x)$ 是参数为 $\theta$ 的语言模型给这段回答的条件概率。定义序列对数概率

$$
\ell_\theta(x,y)=\log\pi_\theta(y\mid x)
=\sum_{t=1}^{T}\log\pi_\theta(y_t\mid x,y_{<t}).
$$

$y_{<t}$ 是已经给定的回答前缀，所有对数取自然对数。这里对回答 token 求和，包含约定的 EOS；提示 token 提供条件，不计入求和。使用教师强制输入原回答即可并行计算各位置概率，不需要现场生成这段回答。长度归一化会改变后文的序列概率比，所以这里用求和而不是均值。

## 人类反馈强化学习 {#rlhf}

一个经典 RLHF（Reinforcement Learning from Human Feedback）流程先学习奖励，再用奖励更新策略。[InstructGPT §3.1、§3.5](https://arxiv.org/pdf/2203.02155v1)给出了 SFT、奖励模型和 PPO 策略更新的路径。下面区分数据如何流动以及哪些参数改变：

```text
示范 (x,y) ──监督训练──> SFT 策略
                            ├──复制并冻结──> 参考策略 π_ref
                            └──初始化─────> 可更新策略 π_θ
比较 (x,y_w,y_l) ──训练 φ──> 奖励模型 r_φ

提示 x ──当前 π_θ 采样──> 回答 y
        y ──冻结 r_φ 打分─────────┐
        y ──π_θ 与 π_ref 算概率比─┤──构造反馈──更新 θ
                                 └──价值基线可另行训练
```

奖励模型 $r_\phi(x,y)\in\mathbb R$ 读入完整提示与回答，输出一个标量。$\phi$ 是它的可训练参数；例如隐藏表示形状为 $[B,S,d]$，从每条有效序列末位置取 $d$ 维向量，再投影为 $[B]$ 的分数。这里 $B$ 是批次大小，$S$ 是补齐后的总序列长度，$d$ 是隐藏宽度。

采用 Bradley–Terry 偏好模型时，两个回答的胜率由奖励差决定：

$$
P(y_w\succ y_l\mid x)=\sigma(r_\phi(x,y_w)-r_\phi(x,y_l)),
\qquad \sigma(a)=\frac1{1+e^{-a}}.
$$

符号 $\succ$ 表示被偏好。奖励差为零时胜率为 $1/2$，差为 $\log3$ 时胜率为 $3/4$。给定比较数据集 $\mathcal D$，最小化负对数似然

$$
L_{\rm RM}(\phi)=-\mathbb E_{(x,y_w,y_l)\sim\mathcal D}
\log\sigma(r_\phi(x,y_w)-r_\phi(x,y_l)).
$$

期望在实现中是 batch 内样本均值。只观察奖励差，不能确定奖励的绝对零点：给同一提示的所有回答加同一个常数，偏好概率保持不变。

随后冻结奖励模型，更新策略 $\pi_\theta$。常用目标是

$$
J(\theta)=\mathbb E_x\left[
\mathbb E_{y\sim\pi_\theta(\cdot\mid x)}r_\phi(x,y)
-\beta D_{\rm KL}(\pi_\theta(\cdot\mid x)\Vert\pi_{\rm ref}(\cdot\mid x))
\right],
$$

其中 $\pi_{\rm ref}$ 是冻结的参考策略，$\beta>0$ 控制偏离参考分布的代价。序列分布上的 KL 定义为

$$
D_{\rm KL}(\pi_\theta\Vert\pi_{\rm ref})
=\mathbb E_{y\sim\pi_\theta}
[\ell_\theta(x,y)-\ell_{\rm ref}(x,y)].
$$

KL 的期望非负，单条采样的对数概率差可以为负。逐 token 对数比相加给出这条序列的样本估计。PPO 等方法用采样轨迹与优势估计更新策略；价值网络估计未来反馈作为基线，与判断整段回答好坏的奖励模型分工不同。[策略梯度](./reinforcement-learning.md)解释奖励怎样变成参数更新，本节采用其结果。

当奖励模型把某种措辞误判为高质量时，策略会更频繁地产生它。所以评估要有独立的人类判断或任务指标，并留出奖励模型没有拟合过的提示。KL 只限制分布移动的幅度，纠正不了错误的比较标签或奖励标准。

## 直接偏好优化 {#dpo}

RLHF 要训练奖励模型，还要反复采样更新策略。若已有固定的成对偏好数据，可以把奖励表示成策略与参考策略的概率比，直接得到一个可微的分类损失。这是 DPO（Direct Preference Optimization）的构造。[原论文 §4、附录 A.1–A.2](https://arxiv.org/html/2305.18290v3#S4)从同一个 KL 正则目标导出它。

### 从奖励到策略

先固定一个提示 $x$ 和一个标量奖励函数 $r(x,y)$，暂时把完整回答概率 $\pi(y\mid x)$ 当作可自由优化的变量。考虑参考策略有正概率的回答集合，要求归一化常数有限。对约束 $\sum_y\pi(y\mid x)=1$ 引入拉格朗日乘子 $\lambda$：

$$
\mathcal F=\sum_y\pi(y\mid x)r(x,y)
-\beta\sum_y\pi(y\mid x)\log\frac{\pi(y\mid x)}{\pi_{\rm ref}(y\mid x)}
+\lambda\left(\sum_y\pi(y\mid x)-1\right).
$$

对某个回答的概率求导并令其为零：

$$
r(x,y)-\beta\left(\log\frac{\pi(y\mid x)}{\pi_{\rm ref}(y\mid x)}+1\right)+\lambda=0.
$$

因此最优策略为

$$
\pi^*(y\mid x)=\frac{\pi_{\rm ref}(y\mid x)e^{r(x,y)/\beta}}{Z(x)},
\quad
Z(x)=\sum_y\pi_{\rm ref}(y\mid x)e^{r(x,y)/\beta}.
$$

$Z(x)$ 是只依赖提示的归一化常数。对固定奖励，$\beta$ 越大，指数重加权越弱。把上式取对数、移项得

$$
r(x,y)=\beta\log\frac{\pi^*(y\mid x)}{\pi_{\rm ref}(y\mid x)}+\beta\log Z(x).
$$

将两个回答的奖励相减，$\beta\log Z(x)$ 消去。于是可以用可训练策略 $\pi_\theta$ 代替 $\pi^*$，直接拟合 Bradley–Terry 偏好概率。定义校正后的概率差

$$
\Delta_\theta=
[\ell_\theta(x,y_w)-\ell_\theta(x,y_l)]
-[\ell_{\rm ref}(x,y_w)-\ell_{\rm ref}(x,y_l)],
$$

得到

$$
L_{\rm DPO}(\theta)=-\mathbb E_{\mathcal D}\log\sigma(\beta\Delta_\theta).
$$

参考模型冻结，训练只更新 $\theta$，不需要显式计算 $Z(x)$，也不需要单独拟合奖励网络。这一变换依赖偏好概率模型和 KL 目标，而且分两步：闭式解是在所有合法分布中求出的，之后才由神经网络在有限数据上拟合，网络能表示什么、数据有多少都会影响结果。[CS336 第 15 讲第 56–58 页](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/61eddac004df975466cff0329b615f2d24230069/nonexecutable/2025%20Lecture%2015%20-%20RLHF%20Alignment.pdf)也区分了这两步。通常的离线 DPO 只在已收集的两份回答上计算损失，不像在线强化学习那样在训练中不断向当前策略采样。

### 概率差与梯度

设一条样本的序列对数概率如下，均为回答 token 的总和：

| 模型 | 被偏好回答 $y_w$ | 另一回答 $y_l$ | 两者之差 |
| --- | --- | --- | --- |
| 当前策略 | $-4$ | $-6$ | $2$ |
| 参考策略 | $-5$ | $-5.5$ | $0.5$ |

取 $\beta=0.2$，则 $\Delta_\theta=1.5$，分类 logit 为 $a=\beta\Delta_\theta=0.3$，预测偏好概率为 $\sigma(0.3)=0.574443$，单样本损失为

$$
-\log\sigma(0.3)=\log(1+e^{-0.3})\approx0.554355.
$$

对校正差的导数为

$$
\frac{\partial L}{\partial\Delta_\theta}
=-\beta\sigma(-\beta\Delta_\theta)\approx-0.0851115.
$$

梯度下降倾向增大被偏好回答相对于另一回答的对数概率差。这是相对约束：共享网络的一次更新也会改变其他回答的概率，正例的绝对概率未必上升。若当前策略与参考策略相同，$\Delta_\theta=0$，损失为 $\log2$；若已经把偏好对排得很开，梯度的绝对值会减小。

### 序列掩码

设每对回答分别放在批次前后两半，模型 logits 形状为 $[2B,S,V]$，$V$ 是词表大小。位置 $t$ 的 logits 预测位置 $t+1$ 的 token，故移位后形状为 $[2B,S-1,V]$。从词表维取出目标 ID 的 log-prob，得到 $[2B,S-1]$。

回答掩码与“目标 token 所在位置”对齐：提示为 0，回答和 EOS 为 1，padding 为 0。第一个回答 token 的概率来自最后一个提示位置的 logits：这个位置的输入是提示，目标却是回答。attention mask 让模型忽略 padding，回答掩码决定哪些目标概率进入损失。

以下函数接收已经按序列位置对齐的 `answer_mask`，输入 `ids` 中 padding 也是合法词表 ID。它采用右侧补齐、每条保留至少一个提示 token 的约定：

```python
import torch
import torch.nn.functional as F


def sequence_logprob(logits, ids, answer_mask):
    # logits [2B,S,V]; ids, answer_mask [2B,S]
    logp = logits[:, :-1].float().log_softmax(dim=-1)
    target = ids[:, 1:]
    picked = logp.gather(-1, target.unsqueeze(-1)).squeeze(-1)
    mask = answer_mask[:, 1:].bool()
    return picked.masked_fill(~mask, 0.0).sum(dim=-1)  # [2B]


def dpo_loss(policy_logp, reference_logp, beta):
    # 前 B 项为 chosen，后 B 项为对应 rejected
    chosen, rejected = policy_logp.chunk(2)
    ref_chosen, ref_rejected = reference_logp.detach().chunk(2)
    margin = (chosen - rejected) - (ref_chosen - ref_rejected)
    return -F.logsigmoid(beta * margin).mean()

p = torch.tensor([-4.0, -6.0], requires_grad=True)
r = torch.tensor([-5.0, -5.5])
loss = dpo_loss(p, r, beta=0.2)
loss.backward()
print(loss.item())  # 约 0.554355
print(p.grad)      # 约 [-0.0851115, 0.0851115]
```

真正训练时先让当前策略前向，再在 `torch.no_grad()` 中让冻结参考模型对相同 ID、attention mask 前向，分别调用 `sequence_logprob`。参考模型应关闭 dropout；截断策略必须保证提示一致、有效回答未被截空。`log_softmax` 和 `logsigmoid` 直接在对数域计算，避免先求整段序列概率再取比值造成下溢。

偏好数据如果只奖励更长或更讨好的回答，DPO 也会学习这种排序。事实准确性要另用任务标准检验，偏好胜率与可验证任务的正确率应分开看。

## 可验证奖励 {#verifiable-rewards}

数学题的最终数值、程序在测试集上的输出等，可以由预先规定的规则检查。令 $v(x,y)\in\{0,1\}$ 表示验证器是否接受回答。在采用可验证奖励的强化学习（RLVR）中，模型在训练阶段采样回答，用 $v$ 等反馈更新参数。

例如解方程 $2u+3=11$，$u$ 是待求数。解析器从回答中提取数值 $\hat u$，验证 $2\hat u+3=11$，正确给 1，否则给 0。如果答案格式无法解析，也要事先规定处理规则。代码任务则可按通过测试的比例或全部通过与否给奖励；漏掉的测试条件不会自动得到保障。

简化到一次完整回答作为一个动作，设 $b(x)$ 是不依赖本次采样回答的基线。奖励视为不可微标量时，策略梯度估计可写为

$$
\nabla_\theta\mathbb E_{y\sim\pi_\theta}v(x,y)
=\mathbb E_{y\sim\pi_\theta}
[(v(x,y)-b(x))\nabla_\theta\ell_\theta(x,y)].
$$

例如基线为 0.25，一条通过的回答权重为 0.75，一条失败回答为 -0.25；在梯度上升中分别推动和抑制对应轨迹。实际训练还会加入 KL、裁剪或组内基线。

[DeepSeek-R1 v1 §2.2.2](https://arxiv.org/html/2501.12948v1#S2.SS2.SSS2)描述 R1-Zero 的规则奖励，包括可检查的准确性和格式要求。结果奖励仅评价它检查的结果：最终数字正确不表示中间每一步都有效；程序通过有限测试不等于对全部输入都正确。训练集、验证规则与独立测试集应分开，以免把记住答案或利用检查漏洞当作泛化。

???quote "樟木箱上的挂锁"
    奶奶从老屋搬回一只樟木箱，铜挂锁还锁着，钥匙早就没了。孙女小鹿拎着锁，去找街口配钥匙的冯师傅。

    冯师傅看了看锁孔，拿出五片空白的钥匙坯，按他估计的齿形一片片切，每片的深浅各差一点。切完一片片插进锁里试。前三片转不动，第四片转了半圈卡住了。他把第四片拿回台上，在卡住的那一齿上锉了一下，再试，锁开了。

    小鹿说：“冯师傅您真厉害，一下就配出来了。”冯师傅说，他手上的功夫跟昨天一样，今天不过多切了几片、多试了几回。哪片能用，是锁说了算。

    他没马上把钥匙递过去，又用指肚把齿口摸了一遍，挑出一根毛刺锉平。锁只管转不转得开，不管钥匙会不会刮手，也不管用上一年会不会磨断。那几样还得他自己看。

    ![锁匠的工作台上，几片切好的钥匙坯排成一排，其中一片插在铜挂锁里](/images/deep-learning-done-right/stories-v2/C12.png)

    最后他把打开锁的那一片交给小鹿，另外四片扔进了废料盒。

    这就是推理时计算：权重不变，一次任务里生成多个候选，交给验证器逐个检查，或者按检查结果改一改再查，最后返回通过的那一个。验证器只核对它覆盖的那几样性质。

## 推理时计算 {#test-time-compute}

推理阶段固定模型参数 $\theta$，仍可以改变候选数量、上下文和选择程序。训练阶段的 RLVR 改变权重；这里每次调用使用同一检查点，变化的是当前问题的计算过程。[Snell 等 §2–3](https://arxiv.org/html/2408.03314v1#S2)将候选生成与验证选择分开分析，也研究顺序修订。

对同一个问题“解 $2u+3=11$ 并核验”，可以采用以下策略：

| 策略 | 调用过程 | 返回方式 |
| --- | --- | --- |
| 一次生成 | 生成一份解答 | 直接返回 |
| 多候选 | 独立采样 $K$ 份解答 | 验证或打分后选一份 |
| 多数投票 | 采样多份，提取并归一化最终答案 | 选频次最高的答案 |
| 顺序修订 | 初稿、检查、带反馈修订 | 复查后返回选定版本 |

$K$ 是候选数。best-of-$K$ 用评分函数 $s(x,y)$，在候选集合中选择 $\hat y=\arg\max_j s(x,y_j)$，$j$ 是候选编号。评分可来自规则、单独训练的验证器或另一次模型调用。多数投票只依赖答案出现次数：若模型多次重复同一个代数错误，它们会一起投错。用 $2\hat u+3=11$ 检查则利用了题目本身的约束。

### 候选覆盖与实际选择

假设每次独立采样正确的概率为 $p$，那么 $K$ 次中至少一次正确的概率为

$$
P(\text{至少一个正确})=1-(1-p)^K.
$$

取 $p=0.4,K=4$，结果为 0.8704。这描述 pass@4 的候选覆盖事件，部署系统仍必须找出其中正确的一条。若候选里存在正确答案时，选择器选对的条件概率为 $q=0.75$，且只从原候选中返回，则最终正确率为 $0.8704\times0.75=0.6528$。

独立性也有实际含义：如果四次始终给出同一份答案，覆盖率仍为 0.4。统计多题表现时，各题难度不同，应先对每题计算覆盖事件，再平均；把全部题的平均 $p$ 塞进上式通常不等价。

再看一个可逐项检查的选择例。四份回答的最终数值为 $(3,3,4,5)$，唯一正确值是 4，故该题候选覆盖成功。多数投票返回 3；若一个学得的评分器依次打出 $(0.9,0.8,0.7,0.6)$，best-of-4 也返回 3；方程验证器会选第三份。

### 预算与延迟

总预算应包含未选中的候选、检查和修订。设 $T_j$ 是第 $j$ 次调用生成的 token 数，$R$ 是实际调用次数，则输出 token 总量为 $T_{\rm out}=\sum_{j=1}^R T_j$。它是容易统计的预算轴，但不足以代表完整计算：每次还要处理输入，长上下文会提高 prefill 与 decode 的成本，不同大小的验证器每 token 成本也不同。

下面把输出上限固定为 1200 token，所有生成式调用使用相同模型，给同一问题分配预算：

| 分配 | 候选/初稿 | 检查 | 修订 | 输出总上限 |
| --- | --- | --- | --- | --- |
| 单份长回答 | $1\times1200$ | 0 | 0 | 1200 |
| 并行候选后逐份评分 | $4\times250$ | $4\times50$ | 0 | 1200 |
| 顺序修订 | 400 | $2\times100$ | 600 | 1200 |

第二行的检查输入要包含待评分回答；第三行修订要读初稿与反馈，最后还要检查修订稿。因此即使输出 token 上限相同，输入 token、FLOPs 与延迟仍不同。规则检查没有输出 token，但有 CPU 时间或工具调用费用。

并行候选可以重叠生成，顺序修订必须等反馈才能继续。固定资源下比较延迟时，所有候选占用的设备都要算进去。

### 修订与停止

顺序修订将问题、初稿和反馈拼成下一次输入。比如初稿给出 $u=3$，检查返回“代入左侧得到 9，与 11 不等”，模型下一次有了具体差错位置。参数未变，条件上下文改变了。只有“再想一想”的提示不提供独立证据，可能让模型保留原错，也可能改坏本来正确的答案。

可以规定检查通过即停止，或达到调用/token 上限即停止；如果没有候选通过，就返回失败状态或按预设规则选择。验证器可靠时，多次尝试能把部分失败转成成功；验证器偏向某种错误时，搜索越多，越容易找到迎合它的回答。

## 参考文献

- Ouyang et al. *Training language models to follow instructions with human feedback*. 2022，[arXiv:2203.02155v1](https://arxiv.org/pdf/2203.02155v1)，§3。
- Rafailov et al. *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*. 2023，[arXiv:2305.18290v3，2024 修订](https://arxiv.org/html/2305.18290v3)，§3–4、附录 A。
- DeepSeek-AI. *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*. 2025，[arXiv:2501.12948v1](https://arxiv.org/html/2501.12948v1)，§2.2。
- Snell et al. *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters*. 2024，[arXiv:2408.03314v1](https://arxiv.org/html/2408.03314v1)，§2–3、§5–6。
