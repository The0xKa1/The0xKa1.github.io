---
comment: true
---

# Chapter 3: Syntax Analysis

## Syntax Analysis Overview

语法分析是编译器前端（Front-end）的重要组成部分。在词法分析器（Lexer）将源程序转化为词法标记流（Stream of tokens）之后，语法分析器（Parser）负责解析程序的短语结构，并生成抽象语法树，为后续的语义分析做准备。

<div align="center">
    <img src="../img/chap3/img1.png" alt="Syntax Analysis" width="500">
</div>

> 需要知道编程语言的语法规则，才能进行语法分析。

为什么需要语法分析？

* 语法检查: 检查输入源代码的语法是否合法。有些代码可能没有词法错误，但包含多个语法错误（如括号不匹配、缺少分号等）。
* 构建语法分析树 (Parse Tree): 明确表达式和语句的结构，理清操作符的结合关系，从而简化后续阶段（如表达式的求值计算）。

<div align="center">
    <img src="../img/chap3/img2.png" alt="Syntax Analysis" width="500">
</div>

---

## Context-Free Grammars (CFG)

为了构建语法分析器，我们需要精确地描述编程语言的语法。正则表达式（Regular languages）虽然广泛使用，但它的表达能力不足以处理编程语言中常见的递归结构（例如嵌套的括号 `((1+2) + 3)`）。因此，我们需要使用更强大的上下文无关文法（CFG）。

### CFG Components

一个上下文无关文法包含以下四个基本元素：

1. 终结符集合 (Terminals, $T$): 字母表中的基本符号。在语法分析中，终结符就是词法分析器生成的词法标记 (Lexical tokens)。
- 非终结符集合 (Non-terminals, $N$): 用于表示语法结构的变量。
- 起始符号 (Start symbol, $S$): 属于非终结符集合中的一个特殊符号（$S \in N$）。
- 产生式集合 (Productions/Rules): 形式为 $X \rightarrow Y_1 Y_2 \dots Y_k$，其中 $X$ 是非终结符，右侧的 $Y_i$ 可以是终结符、非终结符或空串 $\epsilon$。

### Derivations

推导是根据文法生成字符串的过程：

1. 从仅包含起始符号 $S$ 的字符串开始。
- 找到字符串中的任意一个非终结符 $X$，用它的某个产生式的右半部分（$Y_1 \dots Y_k$）进行替换。
- 重复替换步骤，直到字符串中只剩下终结符为止。

<div align="center">
    <img src="../img/chap3/img3.png" alt="Derivations" width="500">
</div>

一个字符串如果能从起始符号推导出来，那么它就属于该文法所定义的语言 $L(G)$。

\[
L(G) = \{ w \in T^* \mid S \rightarrow^* w \}
\]


!!!Example "straight line syntax"
    <div align="center">
        <img src="../img/chap3/img4.png" alt="Straight Line Syntax" width="500">
    </div>

---



## Parse Tree

推导的过程可以用树状结构来直观展示，即语法分析树：

* 根节点: 起始符号 $S$。
* 内部节点: 非终结符。
* 叶子节点: 终结符。对叶子节点进行中序遍历（In-order traversal），就能得到原始的输入字符串。

<div align="center">
    <img src="../img/chap3/img5.png" alt="Parse Tree" width="500">
</div>


### Left-most Derivation and Right-most Derivation

* 最左推导 (Left-most derivation): 每一步推导总是选择替换最左边的非终结符。
* 最右推导 (Right-most derivation): 每一步推导总是选择替换最右边的非终结符。

在无二义性的文法中，最左推导和最右推导最终都会生成完全相同的语法分析树。最左和最右推导的概念在实现具体的语法分析算法时非常重要。

---

## Ambiguous Grammars

### What is Ambiguity?

如果一个文法可以为同一个字符串生成两棵或多棵不同的语法分析树（或者说，同一个字符串存在多个不同的最左/最右推导），那么这个文法就是二义性文法。

编译器依赖语法分析树来推导程序的实际含义。如果文法存在二义性，程序的含义就会变得不明确（Ill-defined）。

!!!example  
    例如，对于表达式 `2 * 3 + 4`，如果文法不加区分，可以生成两种树：
    
    1. 先计算 `2 * 3` 再加 `4`（结果为 `10`）。
    2. 先计算 `3 + 4` 再乘 `2`（结果为 `14`）。

---

## Handling Ambiguity

<div align="center">
    <img src="../img/chap3/img6.png" alt="Handling Ambiguity" width="500">
</div>


处理二义性最直接的方法是将二义性文法转化为无二义性文法。我们可以通过引入新的非终结符来强制规定操作符的优先级和结合性。

### Precedence

* 核心思想: 优先级越高的操作符，在语法推导过程中应该被越晚推导出来（在语法树中更靠近叶子节点）。
* 实现方式: 引入类似表达式 (Expression, $E$)、项 (Term, $T$) 和因子 (Factor, $F$) 的层次结构。
  例如，为了让乘除 `* /` 的优先级高于加减 `+ -`，文法设计为：
  ```text
  E -> E + T | E - T | T
  T -> T * F | T / F | F
  F -> id | num | (E)
  ```
  这样定义后，加法操作会在更高的树层级被处理，从而保证了乘法先结合。

### Left-Association
* 核心思想: 同级操作符（如连减 `1 - 2 - 3`）应该被解析为 `(1 - 2) - 3` 而不是 `1 - (2 - 3)`。
* 实现方式: 使用左递归 (Left recursion)。即产生式右侧的第一个符号与左侧的符号相同。例如使用 `X -> X op Y` 而不是 `X -> Y op X`。在上面的例子中，`E -> E + T` 就是典型的左递归，它保证了加法是左结合的。因为这样生成的树就是左边高度比右边高.

(注：某些语言天生具有二义性且无法转化为无二义性文法，这类语言作为编程语言会带来问题。)

---

## EOF Marker

在语法分析的最后，我们需要确保整个文件被完整解析，而不是只解析了开头的一部分。

* 为此，我们引入一个特殊的文件结束标记 `$` (EOF)。
* 并在文法中添加一个新的起始符号（如 $S'$）和一条新的产生式：`S' -> S$`。
* 这表明在完成一个完整的 $S$ 结构解析之后，必须紧接着到达文件末尾。



## 语法分析器类型概述

语法分析器总体上可以分为三大类：通用分析器（效率太低，不用于生产环境）、自顶向下分析器（Top-Down）和自底向上分析器（Bottom-Up）。

* 自顶向下分析 (Top-Down Parsing): 从语法树的根节点向叶子节点构建，通常从左到右扫描输入流，其本质是为输入字符串寻找最左推导 (Leftmost derivation)。

* 大部分现代编程语言的语法都可以使用 LL 文法（常用于手工编写的自顶向下分析器）或 LR 文法（表达能力更强，常用于自动生成工具）来描述。

从上到下，从左到右匹配输入流。

<div align="center">
    <img src="../img/chap3/img7.png" alt="Top-Down Parsing" width="500">
</div>

---

## Recursive-Descent Parsing

递归下降分析是自顶向下分析的一种通用形式，它的特点是简单且可以手工编写。

* 为文法中的每一个非终结符编写一个递归函数。调用该函数即表示尝试匹配该非终结符。
* 文法产生式的右侧转化为函数体内部的具体逻辑（例如使用 `switch` 语句）。
* 维护一个全局标记（如 `tok`），并通过诸如 `eat(token)` 的辅助函数来消耗匹配成功的终结符并获取下一个标记。

### Backtracking

如果面对某个输入标记（如 `num`）时有多个产生式可以选择，简单的递归下降可能需要“猜测”并尝试。如果猜错，就会面临回溯。回溯的代价极高，会导致尝试的路径呈指数级爆炸。

!!!example
    考虑如下文法：

    ```text
    A -> num + num
    A -> num * num
    ```

    当输入为 `num * num` 时，分析器在开始处理 `A` 时，看到的第一个输入符号是 `num`。但两条产生式都以 `num` 开头，因此无法仅凭当前符号立即决定该选哪一条。

    如果分析器先“猜”第一条产生式 `A -> num + num`，那么它会先匹配第一个 `num`，接着期待下一个符号是 `+`。但实际读到的却是 `*`，说明这次猜测失败。

    这时分析器就必须退回到刚开始处理 `A` 的位置，撤销前面的尝试，再改用第二条产生式 `A -> num * num` 重新匹配。这个“猜错后退回重试”的过程，就是回溯。

---

## Predictive Parsing

为了解决回溯带来的性能问题，引入了预测分析。它是递归下降分析的特例，不需要回溯。

### LL(k) Parsing

预测分析通过向前查看（Lookahead）固定数量的符号（通常是 $k=1$ 个）来精准决定应该使用哪条产生式。这种分析方法可以解析 LL(k) 文法（从左到右解析，最左推导）。

### Predictive Analysis Core Conditions

要在 $k=1$ 的情况下精准选择产生式，我们必须提前知道每条产生式推导后可能出现的首个终结符。这就引入了构建预测分析表所需的三大核心概念：Nullable、First 集合和 Follow 集合。

---

## Core Collections: Nullable, FIRST and FOLLOW

在计算这些集合时，为了保证算法的高效性，通常按照以下顺序进行迭代计算：先计算 Nullable，再计算 FIRST，最后计算 FOLLOW。

!!!Definition
    === "Nullable"

        * 定义: 如果非终结符 $X$ 能够推导出空串 $\epsilon$（即 $X \rightarrow^* \epsilon$），则 `Nullable(X) = True`。
        * 计算方法: 类似于闭包计算，通过迭代查找。如果产生式 $X \rightarrow Y_1 Y_2 \dots Y_k$ 中的所有 $Y_i$ 都是 Nullable，那么 $X$ 也是 Nullable。

        <div align="center">
            <img src="../img/chap3/img8.png" alt="Nullable" width="500">
        </div>

    === "FIRST Collection"

        * 定义: $FIRST(\gamma)$ 指的是从符号串 $\gamma$ 推导出的字符串中，可能作为起始位置的所有终结符的集合。
        * 计算规则:
            * 如果 $X$ 是终结符，则 $FIRST(X) = \{X\}$。
            * 如果 $X \rightarrow Y_1 Y_2 \dots Y_k$，则将 $FIRST(Y_1)$ 加入 $FIRST(X)$；如果 $Y_1$ 是 Nullable，还要把 $FIRST(Y_2)$ 加入，依此类推。
        
        \[
            FIRST(X) = FIRST(X) \cup \bigcup_{i=1}^{k} F_i
        \]

        - $F_1 = FIRST(Y_1)$
        - $F_2 = FIRST(Y_2) if Y_1 is Nullable else F_2 = \emptyset$
        - $F_3 = FIRST(Y_3) if Y_1 and Y_2 are Nullable else F_3 = \emptyset$
        - ...
        - $F_k = FIRST(Y_k) if Y_1, Y_2, ..., Y_{k-1} are Nullable else F_k = \emptyset$

    === "FOLLOW Collection"

        * 定义: 对于非终结符 $X$，$FOLLOW(X)$ 指的是在某个句型中，可能紧跟在 $X$ 之后出现的所有终结符的集合。对于开始符号，还需要将输入结束标记 `$` 加入其 FOLLOW 集合。
        * 计算规则:
            1. 对于每个文法的开始符号 $S$，将输入结束符号（如 \$）加入 $FOLLOW(S)$。
            2. 对于文法中每条产生式 $Y \rightarrow \alpha X \beta$：
                - 将 $FIRST(\beta)$ 中的所有终结符加入 $FOLLOW(X)$（注意不包括 $\epsilon$)。
                - 如果 $\beta$ 可以导出 $\epsilon$（即 $\beta \Rightarrow^* \epsilon$，$\beta$ 是 Nullable），再将 $FOLLOW(Y)$ 加入 $FOLLOW(X)$。
            3. 不断迭代以上规则，直到所有集合都不再发生变化。

        - 归纳表达式：
            - 对于任意 $\alpha, \beta$，若 $Y \rightarrow \alpha X \beta$，则 $FOLLOW(X) = FOLLOW(X) \cup FIRST(\beta)$
            - 若 $Y \rightarrow \alpha X \beta$ 且 $\beta \Rightarrow^* \epsilon$，则 $FOLLOW(X) = FOLLOW(X) \cup FOLLOW(Y)$

<div align="center">
    <img src="../img/chap3/img9.png" alt="FOLLOW Collection" width="500">
</div>

## Predictive Parsing Tables

利用上述三个集合，我们可以构建一个二维的预测分析表 $M$。表的行代表非终结符 $X$，列代表前瞻终结符 $t$，单元格内的内容表示遇到 $t$ 时应选择的产生式。

### Filling the Table

对于文法中的每条产生式 $X \rightarrow \gamma$：

1. 如果终结符 $t \in FIRST(\gamma)$，则在表格的 $[X, t]$ 处填入 $X \rightarrow \gamma$。
- 如果 $\gamma$ 是 Nullable（即能推导出空串），并且 $t \in FOLLOW(X)$，同样在表格的 $[X, t]$ 处填入 $X \rightarrow \gamma$。

<div align="center">
    <img src="../img/chap3/img10.png" alt="Predictive Parsing Table" width="500"> 
</div>


!!!Summary
    对于$FIRST$和$FOLLOW$集合:

    - $FIRST(X)$ 包含了所有可能作为 $X$ 推导出的字符串的第一个符号的终结符,是X内部的概念。
    - $FOLLOW(X)$ 包含了所有可能紧跟在 $X$ 后面出现的终结符,是X外部的概念。

### Syntax Errors and LL(1) Definition

* 空白单元格: 如果表格中的某个单元格为空，说明在当前非终结符下遇到该输入属于语法错误 (Syntax errors)。
* LL(1) 文法: 如果按照上述规则构建的预测分析表没有任何包含重复产生式的单元格（即没有冲突），那么该文法就被称为 LL(1) 文法。任何二义性文法都不可能是 LL(k) 文法。

---

## Non-Recursive Predictive Parser

除了编写递归函数外，还可以通过显式地维护一个栈 (Stack) 来实现非递归的预测分析器。

* 基本动作:
    * 将起始符号 $S$ 和 EOF 标记 `$` 压入栈中。
    * 查看栈顶符号和当前的输入符号。
    * 如果栈顶是终结符且与输入匹配，则执行 Match（消耗输入符号并弹出栈顶）。
    * 如果栈顶是非终结符，则查阅预测分析表，找到对应的产生式（如 $S \rightarrow (S)S$），将栈顶非终结符弹出，并将其产生式的右侧逆序压入栈中。
    * 如果栈为空（只剩下 `$ `），则接受解析 (Accept)。

> 这就类似于PDA和CFG的互推

---

## Grammar Transformations

当一个文法无法生成无冲突的 LL(1) 分析表时，我们需要对其进行改写。

### Eliminate Left-Recursion

* 问题: 左递归产生式（例如 $E \rightarrow E + T$）会导致 $FIRST(E+T) \subseteq FIRST(E)$ 且 $FIRST(E) \subseteq FIRST(E+T)$，从而使得 $FIRST(E) = FIRST(E+T)$。这会在 LL(1) 解析表中产生多重条目冲突，导致自顶向下分析器无法处理。
* 解决方案: 将左递归转换为右递归 (Right recursion)。
    * 原始: $A \rightarrow A\alpha \mid \beta$
    * 转换后: $A \rightarrow \beta A'$ 且 $A' \rightarrow \alpha A' \mid \epsilon$。

### Left Factoring

* 问题: 如果同一个非终结符的两个产生式以相同的符号串开头（例如 $S \rightarrow \text{if } E \text{ then } S \text{ else } S$ 和 $S \rightarrow \text{if } E \text{ then } S$），它们将在 LL(1) 分析表中的同一单元格产生冲突。
* 解决方案: 提取公共前缀，延迟决策 (Delay the decision)。引入一个新的非终结符来处理剩余的部分。
    * 转换后: $S \rightarrow \text{if } E \text{ then } S X$ 且 $X \rightarrow \text{else } S \mid \epsilon$。

---

## Error Recovery

当预测分析器查表遇到**空白条目**时，即发现了语法错误。常见的处理方式：

* **抛出异常并退出:** 直接停止解析（不推荐，对用户不友好）。
* **打印错误并尝试恢复:**
    * 可以通过插入、删除或替换 Token 来恢复。
    * **通过删除恢复 (Deletion):** 这是更安全的做法。跳过当前的输入 Token，直到遇到属于当前非终结符 **FOLLOW 集合** 中的 Token 为止（例如使用 `skipto(Tprime_follow)` 函数）。这保证了循环最终会在遇到 EOF 时终止，避免死循环。