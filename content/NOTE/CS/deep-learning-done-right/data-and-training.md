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

模型训练也要区分反复调整、比较方案和最终评估这三种用途。面馆老板自己尝汤、请邻居挑方子、最后记录生客的反应，分别对应训练集、验证集和测试集。验证集上的成绩会影响方案选择，因此最终评估需要另用一份测试集。比较方案时会用到超参数，例如预先设定的学习率，以及检查点，即训练过程中保存的模型状态。

设数据集为 $D=\{(x_i,y_i)\}_{i=1}^N$。$N$ 是样本数，$x_i$ 是输入，$y_i$ 是监督标签。划分时先明确模型将来要处理什么新对象，再决定哪些样本应放在同一个子集中。

| 子集 | 在训练过程中的用途 | 会影响什么 |
| --- | --- | --- |
| 训练集 | 计算损失和梯度，拟合预处理统计量 | 网络权重、偏置，以及均值等统计量 |
| 验证集 | 比较超参数、选择检查点与决策阈值 | 采用哪个模型、在哪一轮停止 |
| 测试集 | 在方案确定后评估一次 | 本次实验最终报告 |

例如有 1,000 名用户，每人 10 条记录，要预测新用户的类别，就应按用户划分。若随机拆分 10,000 行，同一用户的记录可能出现在训练和测试两边，模型利用个人习惯就能取得偏高的成绩。

预测未来销量时，新对象是未来时段的数据，因此按时间划分，训练日期早于验证、测试日期，并检查滑动窗口是否跨越边界。独立图片的分类任务可按类别分层抽样，让各子集保留近似的类别比例。分组、时间切分与交叉验证的适用条件见 [scikit-learn 数据划分文档](https://scikit-learn.org/stable/modules/cross_validation.html)。

数据泄漏是评估阶段才应获得的信息提前参与了训练或选择。除了重复样本，还包括用全体数据拟合归一化、根据测试成绩选模型、把拍摄时间后的信息作为预测输入。

避免泄漏要从划分顺序做起：先保存样本 ID 的划分清单，再在训练子集上拟合所有需要估计统计量的变换。不同模型沿用同一份清单，也便于公平比较。[官方泄漏示例](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage)展示了为何特征选择和预处理也必须遵守这一边界。

## 预处理与批次 {#preprocessing}

标准化把数值特征转换到以均值为中心、以标准差为单位的尺度，减少不同特征量纲和取值范围的差异。设 $x_{ij}$ 是第 $i$ 个样本的第 $j$ 个特征，用训练集估计该特征的均值 $\mu_j$ 和标准差 $s_j$，再做变换：

$$
x'_{ij}=\frac{x_{ij}-\mu_j}{\max(s_j,\varepsilon)}.
$$

分母中的 $\varepsilon>0$ 防止常数列除零。训练集确定了这套变换后，验证和测试样本都使用同一组统计量。

若训练列为 $[2,4,6]$，采用总体标准差，则 $\mu=4$、$s=\sqrt{8/3}\approx1.633$；验证样本 $8$ 转换为 $2.449$。这个结果表示验证值比训练均值高约 2.449 个标准差。

缺失值填补、词表构造和特征筛选同样会从数据中确定处理规则，因此也要明确用于拟合的数据。使用预训练模型时，输入缩放与分词器应遵循所用检查点的约定，保持输入处理方式与预训练时一致。

预处理后的样本按批次送入网络，一批称为一个 batch。把多个样本堆叠起来，可以并行计算它们的预测和损失。若有 $B=32$ 个样本，每个样本 4 个浮点特征，则 $X\in\mathbb R^{32\times4}$。三分类标签 $y\in\{0,1,2\}^{32}$ 使用整数类型；网络给出 $Z\in\mathbb R^{32\times3}$，每行是三个 logits，即网络对三个类别给出的未归一化分数。

图像和文本的批次形状取决于单个样本的结构。图像可组成 $[B,C,H,W]$，其中 $B$ 是批次大小，$C$ 是通道数，$H$、$W$ 是图像的高和宽。文本通常先补齐为 $[B,T]$ 的 token ID，$T$ 是补齐后的序列长度；另存的有效位置掩码用于区分原有 token 与补齐位置。补齐位置既可能需要在注意力中屏蔽，也需要在损失中忽略，以免补齐操作影响学习目标。

一次 epoch 表示遍历一轮训练数据；一次 optimizer step 表示更新一次参数。训练集有 600 个样本，batch size 为 32，每批都更新一次参数，且保留最后不足一批的样本时，每轮有 $\lceil600/32\rceil=19$ 次更新，最后一批有 24 个样本。若使用梯度累积，则先累加多个批次的梯度，再更新一次参数，此时每轮的更新次数会少于批次数。

训练时打乱独立样本能减少固定顺序对连续更新的影响。验证和测试无需打乱。序列任务则要保留样本内部的时间关系；若跨 batch 延续循环状态，就要让状态接着对应的序列传递，并在切换到新序列时重置。

批次顺序改变的是样本出现的先后。要让模型见到同一样本的不同外观，还可以变换输入，这就是数据增强；用于监督学习时，变换后的输入仍须与标签相符。

### 数据增强 {#augmentation}

![SimCLR 原图用实线矩形表示原图、虚线表示裁剪，展示全局与局部视图及相邻视图](/images/deep-learning-done-right/training/simclr-crops.png)

图 1：Chen 等，2020，[SimCLR](https://proceedings.mlr.press/v119/chen20j.html) Figure 3，裁去周围正文。实线框是图像，虚线框是不同裁剪区域。

增强方式应保留任务需要识别的内容。随机裁剪改变了模型能看到的区域，颜色扰动改变了外观。监督分类中，裁掉唯一目标后，原标签可能已经失效；把数字 6 旋转成近似 9，也不能直接保留原标签。分割和检测还要同步变换掩码或框坐标。

自监督训练可把同一原图经过两次不同增强得到的视图定义为正样本对，让模型学习它们共有的内容。图中局部与整体的对应关系因此成为学习信号，具体损失见[对比学习](./losses.md#contrastive)。

训练时采用随机增强，可以在多轮遍历中得到不同输入；普通验证采用固定预处理，使相邻轮次的成绩可以比较。测试时增强若被采用，需要事先固定组合方法，并计入推理成本。

## 四点训练 {#xor-training}

继续使用[基础章的四点](./neural-network-basics.md#activations)：输入依次为 $(0,0),(0,1),(1,0),(1,1)$，标签为 $[0,1,1,0]$。把前三点用于更新，第四点作为测试点始终留出。手工规则 $g=x_1+x_2$ 在前三点上按 $g>0.5$ 判类全部正确，却把第四点判为 1。用随机初始化的网络拟合这三个点，可以观察训练损失下降时，第四点的预测怎样变化。

实验预先固定 $2\to8\to1$ 的 ReLU 网络和步长，进行 500 次全批次更新；测试点只用于观察结果。每次将三个训练点一起输入，输入形状为 $[3,2]$。网络输出压成 $[3]$ 的 logits 后，与三项浮点标签计算二元交叉熵（BCE）。下一节再加入验证集，用它选择检查点。

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
| 测试点正类概率 | 0.5433 | 0.99997 |
| 测试点损失 | 0.7838 | 10.5437 |
| 测试点正确数 | 0/1 | 0/1 |

训练后三点概率约为 $[0.0277,0.9915,0.9906]$。三个训练点的预测逐渐接近标签，测试点的正类概率却升至 0.99997，与它的标签 0 相反。前三点同时符合手工规则和 XOR 规则，训练只约束了这三个位置的输出。要让能够表达 XOR 的网络从多种符合训练数据的规则中选出它，还需要相应的数据或模型偏好。怎样估计目标分布上的表现，由[评价章](./evaluation-and-generalization.md#generalization)说明。

## 分类训练示例 {#training-loop}

四点实验预先固定了更新次数。若要根据训练进展选择何时停止，就需要专门的验证数据。下面在 CPU 上生成 1,000 个四维样本，用已知线性规则产生三类标签，再划分为 600 条训练样本、200 条验证样本和 200 条测试样本。验证集用于选择检查点，测试集用于最后评估，整段代码据此串起完整训练流程。

模型采用 $4\to16\to3$ 的 MLP，将四个输入特征映射为三个类别的分数。第一层产生形状为 $[B,16]$ 的隐藏激活，经过 ReLU 和第二层后，输出形状为 $[B,3]$。交叉熵根据输出和整数标签计算每个样本的损失，再对一批样本取平均，得到用于反向传播的标量。

参数形状可以逐层核对：第一层的权重和偏置分别为 $[16,4]$ 和 $[16]$，第二层分别为 $[3,16]$ 和 $[3]$，共 $64+16+48+3=131$ 个可训练标量。反向传播为每个参数张量计算与它同形状的梯度。

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

在 CPU、PyTorch 2.14.1 上运行这段代码，训练于第 53 轮停止。恢复最佳检查点后，训练集平均损失为 0.0184，最佳验证损失为 0.0374，测试平均损失为 0.0279，测试正确数为 200/200。这组数据的标签由代码中固定的线性规则生成；与四点实验相比，更多独立样本覆盖了同一生成规律，模型在测试集上也取得了较低的损失。

每批训练都先计算当前参数下的梯度，再更新参数。`zero_grad` 清除上一步留下的梯度，前向计算建立求导图，`backward` 沿图累计梯度，最后由 `step` 使用梯度及优化器状态更新权重。这个顺序与 [PyTorch 训练教程](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html)一致。

验证损失要让每个样本占相同的权重。`loss_fn` 返回一批样本的平均损失，因此评估函数先乘该批的实际样本数，还原为损失之和，累加所有批次后再除以总样本数。最后一批较小，直接平均各批的平均损失会给它过大的权重。若序列损失按有效 token 平均，累加时就改用有效 token 数作为权重。

验证时需要保存表现最好的模型，以便训练结束后恢复它。若还要从保存的位置继续训练，就要进一步记录优化器累计的历史等状态，因为后续更新也依赖这些信息。

## 参数与训练状态 {#state}

跨更新保存的训练状态包括模型参数、优化器状态和某些层的缓冲区。权重和偏置是模型参数；Adam 对历史梯度及其平方的移动平均称为一阶与二阶矩估计，属于优化器状态；BatchNorm 的运行均值和方差属于缓冲区，在训练前向过程中按统计规则更新。

前向激活通常只为当前反向传播暂存，完成这次求导后即可释放。RNN 的隐藏状态是否跨批保留则由任务决定，要与前面介绍的批次顺序配合。

验证时通常切换层的行为，并关闭求导记录。`model.train()` 与 `model.eval()` 切换 Dropout、BatchNorm 等层的行为；`torch.no_grad()` 控制是否记录求导运算，所以验证时通常同时使用 `model.eval()` 和 `torch.no_grad()`。冻结参数只停止参数的梯度更新，训练模式下的 BatchNorm 仍可能更新运行统计量。[Autograd 文档](https://docs.pytorch.org/docs/2.14/notes/autograd.html#evaluation-mode-nn-module-eval)说明了模式与梯度记录的区别。

保存推理模型时至少保存模型状态、模型配置、标签映射和预处理统计量。恢复训练还需要优化器、调度器、当前步数、混合精度缩放器及相关随机数状态；这些信息决定后续更新是否能衔接。本例只需恢复模型进行评估，因此保存 `model.state_dict()` 即可；要接着中断处继续进行 Adam 更新，还需保存优化器状态。

保存状态解决了怎样恢复模型的问题，早停规则则决定恢复哪一轮，以及何时结束训练。判断依据是验证集上的损失，测试集留到选择完成后使用。

## 早停与测试 {#stopping}

上例把验证损失作为选择模型的依据，并预先规定最多训练 100 轮。验证损失要比已保存的最佳值下降超过 $10^{-4}$ 才算改善；连续 10 轮未改善就早停，给短暂的波动留出余地。

每次改善时都深拷贝模型状态，训练结束后恢复保存的最佳版本。深拷贝使保存的张量独立于正在更新的张量。若只保存 `best_state = model.state_dict()`，其中张量可能继续随训练改变，无法保留那一轮的模型。

恢复选定检查点后，才在一直保留的测试集上评价。除了验证早停，也可以预先约定固定更新预算或达到某个目标后停止；训练循环按所选规则决定是否继续取批次和更新。

正式运行前，先用少量数据检查训练流程是否工作：查看一批样本的数值范围、标签及形状，再让模型拟合几十个样本。若小样本训练损失也降不下去，逐项检查标签匹配、参数是否进入优化器、梯度是否为零、学习率是否过大。链路跑通后，记录训练和验证曲线、实际更新次数及耗时。如何从这些记录判断欠拟合、过拟合和分布变化，见[评价与泛化](./evaluation-and-generalization.md)。
