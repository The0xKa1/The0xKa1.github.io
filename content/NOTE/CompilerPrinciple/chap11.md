---
comments: true
---

# Chapter 11: Register Allocation

chap10 算出了 **interference graph**（冲突图），chap11 的任务是**给图染色**：每个颜色对应一个物理寄存器，相邻节点不能同色。如果颜色不够（寄存器不足），就把某些变量 **spill** 到内存。

> 寄存器分配 = 图染色问题。图染色是 NP-complete 的，因此使用线性时间近似算法。

---

## 整体流程

Appel 给出的经典算法分为四个阶段：

| 阶段 | 作用 |
|---|---|
| **Build** | 由 liveness 结果构造冲突图 |
| **Simplify** | 反复移除度数 < K 的节点，压入栈 |
| **Spill** | 当图中只剩高度数节点时，选择一个潜在 spill 节点移除 |
| **Select** | 从栈中弹出节点，依次分配颜色；若邻居已用满 K 种颜色，则发生 actual spill |

<div align=center>
<img src="../img/chap11/allocation-pipeline.png" width=760>
</div>

### Graph Coloring vs Linear Scan

课件还强调了另一类常见分配器：**linear scan**。它按 live interval 的起止顺序扫描临时变量，维护当前活跃区间集合，因此实现简单、速度快，常用于 JIT 或编译时间敏感的场景。

| 方法 | 优点 | 代价 |
|---|---|---|
| **Graph coloring** | coalescing 与 spill 决策更精细，生成代码通常更好 | 构图、合并和迭代重写更复杂 |
| **Linear scan** | 编译速度快，工程实现轻 | 对复杂控制流和 MOVE 消除不如图染色细致 |

---

## Coloring By Simplification

### 核心观察

> 若图 G 中存在一个节点 m，其邻居数 < K（K 为寄存器数），则 G 可 K-染色 **当且仅当** G − {m} 可 K-染色。

**原因**：把 m 加回已染色的 G' 时，m 的邻居最多用了 K−1 种颜色，总还剩至少一种颜色可用。

这导出一个**栈式（递归）算法**：

1. 找到度数 < K 的节点，将其从图中移除并压栈；
2. 移除会降低其他节点的度数，可能产生新的低度节点，继续移除；
3. 直到图为空（全部入栈），或只剩度数 ≥ K 的节点。

### 示例（K = 4）

教材 Graph 11.1 的冲突图（虚线表示 MOVE 指令，不是冲突边）：

<div align=center>
<img src="../img/chap11/interference-graph-11-1.png" width=660>
</div>

- 初始低度节点（< 4 个邻居）：g, h, c, f
- 移除 g, h 后，k 的度数降低，也变成低度节点；
- 继续移除 k, d, j, e, f, b, c, m；
- 全部入栈后，依次弹出分配颜色。

<div align=center>
<img src="../img/chap11/stack-example.png" width=620>
</div>

---

## Spill 与 Optimistic Coloring

### Potential Spill

当 simplify 阶段图中**所有剩余节点的度数都 ≥ K** 时，simplify  heuristic 失效。此时必须选择一个节点作为 **potential spill**：

- 假设该节点被存放在内存而非寄存器；
- 乐观地认为它不再与任何其他节点冲突；
- 将其移除并压栈，继续 simplify。

### Actual Spill

在 **Select** 阶段弹出 potential spill 节点 n 时：

- 若 n 的已着色邻居使用了 **< K** 种颜色 → n 可以被着色，**不发生 actual spill**（这就是 optimistic coloring）；
- 若 n 的邻居已用满 **K** 种颜色 → **actual spill**，n 无法获得颜色。

### Start Over

若 Select 阶段出现 actual spill，需要**重写程序**：

- 在每次 **use** 前插入 `fetch`（从内存加载到临时寄存器）；
- 在每次 **def** 后插入 `store`（存回内存）；
- 一个 spilled temporary 变成多个**生命期极短的新 temporary**；
- 重新构建冲突图，再次运行 Build → Simplify → Select。

实际中通常 **1~2 轮迭代** 即可收敛。

---

## Coalescing（合并）

### 动机

如果 MOVE 指令的源和目的在冲突图中**没有冲突边**，就可以把它们合并到同一个节点，从而**删除这条 MOVE**。

<div align=center>
<img src="../img/chap11/coalescing-move.png" width=680>
</div>

### 问题：鲁莽合并可能使图不可染色

合并后的节点继承了双方所有冲突边的**并集**，约束更强。一个原本 K-可染色的图，合并后可能不再 K-可染色。

### Conservative Coalescing（保守合并）

只进行**安全的合并**，即保证合并不会导致图不可染色。两种经典判据：

#### Briggs 判据

> 节点 a 和 b 可以合并，当且仅当合并后的节点 ab 的**高度数邻居（degree ≥ K）少于 K 个**。

**理由**：simplify 阶段会先移除所有低度节点，此时 ab 只与高度数邻居相邻；若高度数邻居 < K，则 simplify 可以移除 ab，因此合并不影响可染色性。

#### George 判据

> 节点 a 和 b 可以合并，当且仅当对 a 的每个邻居 t，要么 t 已经与 b 冲突，要么 t 是低度节点（degree < K）。

**理由**：设 S 为 a 的低度邻居集合。若不合并，simplify 可以移除 S，得到图 G₁；若合并，simplify 同样可以移除 S，得到图 G₂。G₂ 是 G₁ 的子图（ab 对应 b），因此不会更难染色。

### 带合并的完整流程

<div align=center>
<img src="../img/chap11/coalescing-workflow.png" width=720>
</div>

| 阶段 | 说明 |
|---|---|
| **Build** | 构造冲突图；标记 move-related 节点（参与 MOVE 的节点） |
| **Simplify** | 移除低度（< K）且**非 move-related** 的节点 |
| **Coalesce** | 在简化后的图上执行保守合并；合并后若节点不再 move-related，可再次 simplify |
| **Freeze** | 若 simplify 和 coalesce 都无法进行，选择一个低度的 move-related 节点，**放弃合并希望**，将其视为非 move-related，然后继续 simplify |
| **Spill** | 若无低度节点，选择高度数节点作为 potential spill |
| **Select** | 弹出栈分配颜色；actual spill 则 rewrite |

### Constrained Moves

某些 MOVE 既无法合并也无法冻结。例如图中有冲突边 (x, z)，同时有 MOVE x←y 和 MOVE y←z：

- 合并 x 和 y 后，新节点 xy 与 z 有冲突边，MOVE xy←z 无法合并；
- 这种 MOVE 称为 **constrained**，直接移除不再考虑。

---

## Precolored Nodes（预着色节点）

### 概念

某些 temporary **永久绑定**到特定物理寄存器：

- 帧指针 FP、栈指针 SP
- 参数寄存器、返回值寄存器
- caller-save / callee-save 寄存器

这些节点是 **precolored**，颜色已固定。

### 性质

- K 个寄存器对应 K 个 precolored 节点，它们**互相之间全连接**（彼此冲突）；
- **不能 simplify** precolored 节点（颜色已固定，没有自由度）；
- **不能 spill** precolored 节点（机器寄存器就是寄存器，不能放到内存）；
- 因此视为具有 **无限度数**。

### 与普通节点的交互

- 若普通节点与 precolored 节点不冲突，可以给它们分配**相同颜色**（复用该物理寄存器）；
- precolored 节点可与普通节点进行**保守合并**（使用 George 判据时，总是选非 precolored 节点作为 a 来测试）。

### Temporary Copies of Machine Registers

为了缩短 precolored 节点的 live range，前端会生成 MOVE 指令把值移入/移出 precolored 寄存器：

| 写法 | live range 效果 |
|---|---|
| `enter: def(r7)` → `...` → `exit: use(r7)` | `r7` 几乎贯穿整个函数，普通变量很难复用该寄存器 |
| `enter: def(r7); t231 ← r7` → `...` → `r7 ← t231; exit: use(r7)` | `r7` 的实际占用被缩短，中间值由普通 temporary `t231` 承担 |

- 若寄存器压力大，t231 会被 spill；
- 若压力小，t231 会与 r7 合并，MOVE 被删除。

### Caller-Save vs Callee-Save Registers

| 类型 | 特点 | 分配策略 |
|---|---|---|
| **Caller-save** | 调用前后不保留值 | 不跨函数调用的变量优先分配 |
| **Callee-save** | 被调用者负责保存/恢复 | 跨多个函数调用的变量优先分配 |

图染色分配器天然实现这一策略：

- CALL 指令被标注为**定义（def）所有 caller-save 寄存器**；
- 不跨调用的变量不会与 caller-save 冲突，自然分配到 caller-save；
- 跨调用的变量 x 与所有 caller-save 冲突，也与 callee-save 的临时副本（如 t231）冲突；
- 使用 spill cost heuristic（高度数但使用次数少），**t231 会先被 spill**，从而释放 callee-save 寄存器给 x。

---

## Spill Cost Heuristic

选择 spill 节点时，希望溢出**对程序性能影响最小**的节点。常用启发式：

$$
\text{spill priority}(n) =
\frac{u_{\mathrm{out}}(n) + 10 \cdot u_{\mathrm{in}}(n)}{\deg(n)}
$$

其中 $u_{\mathrm{out}}(n)$ 表示循环外的 uses + defs，$u_{\mathrm{in}}(n)$ 表示循环内的 uses + defs。

- 循环内使用频繁的变量溢出代价高（会多次执行 load/store）；
- 度数高（冲突多）的变量更难着色，优先溢出；
- 使用次数少的变量溢出代价低。

---

## 实现要点

### 数据结构

| 结构 | 用途 |
|---|---|
| **adjSet** | 冲突边集合 (u,v)，支持 O(1) 查询 |
| **adjList** | 每个非 precolored 节点的邻接表 |
| **degree** | 每个节点当前度数 |
| **moveList** | 每个节点参与的 MOVE 列表 |
| **alias** | 合并后：alias(v) = u，表示 v 被合并到 u |
| **color** | 每个节点分配的颜色 |

### 工作列表（Work-lists）

为了快速找到可处理节点，维护四个互不相交的集合：

| 集合 | 内容 |
|---|---|
| **simplifyWorklist** | 低度（< K）且非 move-related 的节点 |
| **freezeWorklist** | 低度但 move-related 的节点 |
| **spillWorklist** | 高度数（≥ K）的节点 |
| **worklistMoves** | 可能可合并的 MOVE 指令 |

### 主循环（Main）

```text
procedure Main()
    LivenessAnalysis()
    Build()
    MakeWorklist()
    repeat
        if simplifyWorklist ≠ {}    then Simplify()
        elseif worklistMoves ≠ {}   then Coalesce()
        elseif freezeWorklist ≠ {}  then Freeze()
        elseif spillWorklist ≠ {}   then SelectSpill()
    until all worklists empty
    AssignColors()
    if spilledNodes ≠ {} then
        RewriteProgram(spilledNodes)
        Main()          // 尾递归，重新来过
```

---

## Register Allocation for Trees

图染色处理的是一般控制流图；若目标只是**表达式树**，寄存器分配有更精确的算法。Appel 在本章末尾给出 **Sethi-Ullman** 思路：

- 为每棵子树标注 `need[t]`：求值这棵子树至少需要多少寄存器；
- 对有两个非平凡子树的节点，先计算 `need` 更大的那一侧，可以减少同时 live 的中间结果；
- 若左右子树都需要的寄存器数超过 K，就在子树之间插入 store/fetch，局部处理 spill；
- 即使最终仍使用图染色，按 `need` 降序 emit 子树也能降低寄存器压力，减少后续 spill。

这部分的边界也很清楚：它能优雅处理 expression tree 内部的寄存器使用，但一般程序里的显式 `TEMP`、循环和跨基本块 live range 仍需要 chap10/chap11 的 liveness + graph coloring。

---

## Tiger 编译器中的寄存器分配

Tiger 编译器的寄存器分配模块 `color.h` / `color.c` 实现了上述算法：

```c
/* color.h */
struct COL_result {
    Temp_map coloring;      // temp → 寄存器名
    Temp_tempList spills;   // 实际溢出的 temp 列表
};

struct COL_result COL_color(G_graph ig, 
                            Temp_map initial, 
                            Temp_tempList regs);
```

- `ig`：冲突图（来自 chap10 的 `Live_graph`）；
- `initial`：precolored 节点的初始颜色映射；
- `regs`：可用物理寄存器列表；
- 返回值包含最终的颜色分配和溢出列表。

与 chap10 的衔接：

<div align=center>
<img src="../img/chap11/tiger-regalloc-pipeline.png" width=760>
</div>

---

!!! summary
    1. **寄存器分配 = 图染色**：节点是 temp，边表示不能共享寄存器；颜色对应物理寄存器。
    2. **四阶段算法**：Build → Simplify → Spill → Select；Simplify 利用"低度节点必可染色"的观察，栈式移除节点。
    3. **Spill**：potential spill 在 Select 时可能通过 optimistic coloring 避免 actual spill；若不行则 rewrite 程序插入 load/store，重新迭代。
    4. **Coalescing**：删除冗余 MOVE 的关键；Briggs 和 George 判据保证保守合并不引入新的 spill。
    5. **Precolored 节点**：代表固定用途的物理寄存器，不可 simplify、不可 spill，通过 MOVE 与普通节点交互，实现 caller-save / callee-save 的自动分配。
    6. **实现**：维护多个 work-list 实现 O(1) 节点查找；adjSet + adjList 冗余表示冲突图以支持快速查询。
    7. **树上的分配**：Sethi-Ullman 对 expression tree 可以做到局部最优；即使使用图染色，也可用它降低 emit 顺序造成的寄存器压力。
