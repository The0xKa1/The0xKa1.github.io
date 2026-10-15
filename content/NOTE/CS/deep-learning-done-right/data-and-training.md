---
title: 数据与训练流程
comments: false
statistics: false
---

# 数据与训练流程

[一次参数更新](./backprop-and-optimization.md#worked-backprop)已经能让同一样本的损失下降。若不断重复，何时停止，保留哪一次参数，又拿什么判断它能否处理新输入？这些决定需要把用于练习的数据与用于作判断的数据分开。

???quote "新汤底"
    老周在菜市场口卖了十年牛肉面，今年想换一锅新汤底。他每天熬一锅，自己尝，淡了加盐，腻了撇油。熬到第三个星期，他觉得这锅汤已经没得挑了。

    他老婆尝了一口，说咸。老周不服，他自己尝过几十遍。老婆说，你天天尝的就是这一锅，舌头早就跟着它走了。

    于是他改了做法。每天照旧自己尝、自己调。到了周六，他把这一周最满意的三锅各盛一碗，端给隔壁修鞋的、卖水果的和对门理发的。三个人说哪锅好，下周就从那一锅接着调；后来三个人连着两周都说不出新旧有什么区别，他就不再改了。

    方子定下来那晚，老婆提醒他：那三位的口味已经熬进汤里了，他们说好，不能全算数。想知道陌生人爱不爱喝，得找从没尝过的人。儿子出主意，先请几个过路的尝尝再调一调。老婆说，尝过、调过，那几个人也就不算生人了。

    两人商量好：下周一，前五十碗只卖给生客，只记两样，多少人把汤喝光，多少人第二天又来。记完这一回，就决定菜单换不换。

    ![面馆灶台边，老板手里抓着盐罐，老板娘按住了他的手腕，桌边坐着几位陌生食客](/images/deep-learning-done-right/stories-v2/K07.png)

    周一卖到第二十来碗，有个客人说咸。老周抓起盐罐就要往锅里撒，老婆按住了他的手：这锅一改，今天记下来的就说不清是哪锅汤的成绩。老周把盐罐放了回去。五十碗卖完，他照着记下的数换了菜单牌。

    训练模型也把数据分成三份。训练集用来反复拟合；验证集用来比较方案、挑超参数、决定什么时候停，所以它也参与了决定；测试集要等所有决定都做完，才评估一次。评估阶段的信息一旦提前参与训练或选择，就是数据泄漏，测试结果也就不再独立。

## 数据集划分 {#splits}

设数据集为 $D=\{(x_i,y_i)\}_{i=1}^N$。$N$ 是样本数，$x_i$ 是输入，$y_i$ 是监督标签。划分的基本单位应与实际部署的新对象一致。

| 子集 | 在训练过程中的用途 | 会影响什么 |
| --- | --- | --- |
| 训练集 | 计算损失和梯度，拟合预处理统计量 | 网络权重、偏置，以及均值等统计量 |
| 验证集 | 比较超参数、选择检查点与决策阈值 | 采用哪个模型、在哪一轮停止 |
| 测试集 | 在方案确定后评估一次 | 本次实验最终报告 |

例如有 1,000 名用户，每人 10 条记录，要预测新用户的类别，就应按用户划分。若随机拆分 10,000 行，同一用户的记录可能出现在训练和测试两边，模型利用个人习惯就能取得偏高的成绩。预测未来销量则按时间划分，训练日期早于验证、测试日期，并检查滑动窗口是否跨越边界。独立图片的分类任务可按类别分层抽样，让各子集保留近似的类别比例。分组、时间切分与交叉验证的适用条件见 [scikit-learn 数据划分文档](https://scikit-learn.org/stable/modules/cross_validation.html)。

数据泄漏是评估阶段才应获得的信息提前参与了训练或选择。除了重复样本，还包括用全体数据拟合归一化、根据测试成绩选模型、把拍摄时间后的信息作为预测输入。先保存样本 ID 的划分清单，再在训练子集上拟合所有有统计量的变换。这样同一清单可以用于不同模型的公平比较。[官方泄漏示例](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage)展示了为何特征选择和预处理也必须遵守这一边界。

## 预处理与批次 {#preprocessing}

对数值特征 $j$，用训练集的均值 $\mu_j$ 和标准差 $s_j$ 做标准化：

$$
x'_{ij}=\frac{x_{ij}-\mu_j}{\max(s_j,\varepsilon)}.
$$

$i$ 是样本下标，$j$ 是特征下标，$\varepsilon>0$ 防止常数列除零。若训练列为 $[2,4,6]$，采用总体标准差，则 $\mu=4$、$s=\sqrt{8/3}\approx1.633$；验证样本 $8$ 转换为 $2.449$。验证值不参与重新计算均值。缺失值填补、词表构造、特征筛选也要明确其拟合数据；使用预训练模型时，输入缩放与分词器应遵循该检查点的约定。

batch 是一次并行送入网络的样本集合。若有 $B=32$ 个样本，每个样本 4 个浮点特征，则 $X\in\mathbb R^{32\times4}$。三分类标签 $y\in\{0,1,2\}^{32}$ 使用整数类型；网络给出 $Z\in\mathbb R^{32\times3}$，每行是三个 logits。图像可组成 $[B,C,H,W]$；文本通常先补齐为 $[B,T]$ 的 token ID，并另存有效位置掩码。补齐位置既可能需要在注意力中屏蔽，也需要在损失中忽略。

一次 epoch 表示遍历一轮训练数据；一次 optimizer step 表示更新一次参数。训练集有 600 个样本，batch size 为 32，保留最后不足一批的样本时，每轮有 $\lceil600/32\rceil=19$ 次更新，最后一批有 24 个样本。使用梯度累积后，两者不再一一对应。

训练时打乱独立样本能减少固定顺序对连续更新的影响。验证和测试无需打乱。序列任务则要保留样本内部的时间关系；若跨 batch 延续循环状态，还必须同步处理顺序与状态重置。

数据固定后，还能否改变输入外观，让同一任务出现更多训练情形？先判断标签在变换后是否仍然成立。

### 数据增强 {#augmentation}

![SimCLR 原图用实线矩形表示原图、虚线表示裁剪，展示全局与局部视图及相邻视图](/images/deep-learning-done-right/training/simclr-crops.png)

图 1：Chen 等，2020，[SimCLR](https://proceedings.mlr.press/v119/chen20j.html) Figure 3，裁去周围正文。实线框是图像，虚线框是不同裁剪区域。

随机裁剪改变了模型能看到的区域，颜色扰动改变了外观。监督分类中，变换后的标签必须仍然成立：裁掉唯一目标后，原标签可能已经失效；把数字 6 旋转成近似 9，也不能直接保留原标签。分割和检测还要同步变换掩码或框坐标。

自监督训练可把同一原图的两次增强定义为正样本对。图中局部与整体的对应关系因此成为学习信号，具体损失见[对比学习](./losses.md#contrastive)。训练数据增强采用随机变换，普通验证采用固定预处理，便于比较相邻轮次。测试时增强若被采用，需要事先固定组合方法，并计入推理成本。

## 四点训练 {#xor-training}

继续使用[基础章的四点](./neural-network-basics.md#activations)：输入依次为 $(0,0),(0,1),(1,0),(1,1)$，标签为 $[0,1,1,0]$。把前三点用于更新，第四点始终留出。手工规则 $g=x_1+x_2$ 在前三点上按 $g>0.5$ 判类全部正确，却把第四点判为 1。随机初始化的网络会自动避免这个问题吗？

下面固定 $2\to8\to1$ 的 ReLU 网络，训练 500 次全批次更新，不根据留出点调整步长、宽度或步数。输入为 $[3,2]$，输出压成 $[3]$ logits 后与三项浮点标签计算 BCE。完整的三份划分见下一节代码。

```python
import torch
from torch import nn

torch.manual_seed(7)
torch.set_num_threads(1)
x = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
y = torch.tensor([0., 1., 1., 0.])
model = nn.Sequential(nn.Linear(2, 8), nn.ReLU(), nn.Linear(8, 1))
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

@torch.no_grad()
def measure():
    z = model(x).squeeze(1)
    losses = nn.functional.binary_cross_entropy_with_logits(
        z, y, reduction='none')
    return z.sigmoid(), losses[:3].mean(), losses[3]

print('before:', measure())
for step in range(500):
    optimizer.zero_grad()
    z = model(x[:3]).squeeze(1)
    loss = nn.functional.binary_cross_entropy_with_logits(z, y[:3])
    loss.backward()
    optimizer.step()
print('after:', measure())
```

CPU、PyTorch 2.14.1 下的一次复算如下；阈值固定为 0.5。

| 观测量 | 更新前 | 500 次更新后 |
| --- | --- | --- |
| 训练平均损失 | 0.6931 | 0.0154 |
| 训练正确数 | 2/3 | 3/3 |
| 留出点正类概率 | 0.5433 | 0.99997 |
| 留出点损失 | 0.7838 | 10.5437 |
| 留出正确数 | 0/1 | 0/1 |

训练后三点概率约为 $[0.0277,0.9915,0.9906]$。训练目标确实被优化，留出点却更确信地犯错。它的标签没有进入更新，前三点也不足以唯一确定第四点的答案；网络能表达 XOR，不代表仅凭这三个观测就会选中那条规则。怎样估计目标分布上的表现，由[评价章](./evaluation-and-generalization.md#generalization)说明。

## 分类训练示例 {#training-loop}

要选择何时停止，还需有专门的验证数据。下面在 CPU 上生成 1,000 个四维样本，用已知线性规则产生三类标签；600 条训练、200 条选择检查点、200 条最终测试，用于检查训练链路。

模型为 $4\to16\to3$ 的 MLP。第一层参数形状为 $[16,4]$ 和 $[16]$，第二层为 $[3,16]$ 和 $[3]$，共 $64+16+48+3=131$ 个可训练标量。隐藏激活为 $[B,16]$，经 ReLU 后输出 $[B,3]$。分类损失把该批输出和整数标签汇总成标量，反传为每个参数计算同形状的梯度。

```python
import copy
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(7)
torch.set_num_threads(1)
x = torch.randn(1000, 4)
teacher = torch.tensor([[1., -1., 0., .5],
                        [-.5, 1., 1., 0.],
                        [0., 0., -1., -1.]])
y = (x @ teacher.T).argmax(dim=1)
ids = torch.randperm(len(x))
train_ids, val_ids, test_ids = ids[:600], ids[600:800], ids[800:]
mean = x[train_ids].mean(dim=0)
std = x[train_ids].std(dim=0, unbiased=False).clamp_min(1e-6)
x = (x - mean) / std

def loader(indices, shuffle=False):
    return DataLoader(TensorDataset(x[indices], y[indices]),
                      batch_size=32, shuffle=shuffle)

train_loader = loader(train_ids, shuffle=True)
val_loader = loader(val_ids)
test_loader = loader(test_ids)
model = nn.Sequential(nn.Linear(4, 16), nn.ReLU(), nn.Linear(16, 3))
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=0.01,
                             weight_decay=0.001)

@torch.no_grad()
def evaluate(batches):
    model.eval()
    loss_sum, correct, count = 0., 0, 0
    for xb, yb in batches:
        logits = model(xb)
        loss_sum += loss_fn(logits, yb).item() * len(yb)
        correct += (logits.argmax(dim=1) == yb).sum().item()
        count += len(yb)
    return loss_sum / count, correct / count

best_loss, best_state, stale = float('inf'), None, 0
for epoch in range(100):
    model.train()
    for xb, yb in train_loader:
        optimizer.zero_grad(set_to_none=True)
        logits = model(xb)
        loss = loss_fn(logits, yb)
        loss.backward()
        optimizer.step()
    val_loss, val_acc = evaluate(val_loader)
    if val_loss < best_loss - 1e-4:
        best_loss = val_loss
        best_state = copy.deepcopy(model.state_dict())
        stale = 0
    else:
        stale += 1
    if stale >= 10:
        break

model.load_state_dict(best_state)
test_loss, test_acc = evaluate(test_loader)
print(f'test loss={test_loss:.4f}, accuracy={test_acc:.3f}')
```

在 CPU、PyTorch 2.14.1 上运行这段代码，训练于第 53 轮停止。恢复最佳检查点后，训练集平均损失为 0.0184，最佳验证损失为 0.0374，测试平均损失为 0.0279，测试正确数为 200/200。这里标签由代码中固定的线性规则生成；与四点实验相比，已有更多独立样本覆盖同一生成规律。

`zero_grad` 清除上一步留下的梯度；前向计算建立求导图；`backward` 沿图累计梯度；`step` 使用梯度及优化器状态更新参数。调用 `backward` 后，权重本身还没有变化。这个顺序与 [PyTorch 训练教程](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html)一致。

最后一批较小，所以验证损失先乘实际样本数，再除总数。直接平均各批的平均损失，会给较小的最后一批过大的权重。若序列损失按有效 token 平均，累加的权重也应改为有效 token 数。

选中了某一轮模型，为什么只记下权重还不足以从这一轮继续训练？下一步不仅依赖当前参数，还可能依赖优化器累计的历史与层内统计量。

## 参数与训练状态 {#state}

训练的持久状态包含权重和偏置、Adam 的一阶与二阶矩估计，以及某些层的缓冲区。BatchNorm 的运行均值和方差属于缓冲区，不由梯度更新。前向激活通常只为当前反传暂存；RNN 的隐藏状态是否跨批保留由任务决定。

`model.train()` 与 `model.eval()` 切换 Dropout、BatchNorm 等层的行为；`torch.no_grad()` 控制是否记录求导运算。二者负责不同事情，验证时通常同时使用。即使全部参数被冻结，处于训练模式的 BatchNorm 仍可能更新运行统计量。[Autograd 文档](https://docs.pytorch.org/docs/2.14/notes/autograd.html#evaluation-mode-nn-module-eval)说明了模式与梯度记录的区别。

保存推理模型时至少保存模型状态、模型配置、标签映射和预处理统计量。恢复训练还需要优化器、调度器、当前步数、混合精度缩放器及相关随机数状态；这些信息决定后续更新是否能衔接。仅保存 `model.state_dict()` 足以用于本例的最佳检查点评估，但不能完整恢复被中断的 Adam 训练。

训练损失可以一直下降，但保留数据不再改善时，应当保存哪一轮？先规定判断规则，才能避免看到测试结果后再延长训练。

## 早停与测试 {#stopping}

例子预先规定最多 100 轮；验证损失至少下降 $10^{-4}$ 才算改善，连续 10 轮未改善就早停。每次改善时深拷贝权重，最后恢复最佳版本。若只保存 `best_state = model.state_dict()`，其中张量可能继续随训练改变，无法保留那一轮的模型。

训练循环在未满足停止条件时继续取批次和更新，满足条件后恢复选定检查点，在一直保留的测试集上评价。停止规则可以是固定更新预算、验证早停或达到预设目标。

运行前先检查一批样本的数值范围、标签及形状，再让模型拟合几十个样本。若小样本训练损失也降不下去，逐项检查标签匹配、参数是否进入优化器、梯度是否为零、学习率是否过大。链路跑通后，记录训练和验证曲线、实际更新次数及耗时。如何从这些记录判断欠拟合、过拟合和分布变化，见[评价与泛化](./evaluation-and-generalization.md)。
