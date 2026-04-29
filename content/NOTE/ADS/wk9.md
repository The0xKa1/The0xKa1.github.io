# NP完全性

## 基本概念

!!!Definition
    === "P问题"
        由多项式时间算法解决的问题集合。

        其中多项式时间算法指的是{==算法的时间复杂度与输入的长度之间是多项式关系==}
    
    === "NP问题"
         NP(Non-deterministic Polynomial time)问题是指可以在多项式时间内验证一个解的问题集合。但是并不确定能不能在多项式时间内找到一个解。

        ???note "多项式时间验证"
            we say $B$ is an efficient verifier for problem $X$ if 

            - $B$ runs in polynomial time,taking two arguments: an instance $x$ and a certificate $y$.

            - there exists a polynomial $p$ such that for every $x$ in $X$, there is a certificate $y$ of length at most $p(|x|)$ such that $B$
            accepts $(x,y)$


    === "NP-hard问题"
         NP-hard问题是指所有的NP问题都能在多项式时间内约化为该问题。NP-hard问题不一定是NP问题,它是比NP问题更难的问题。

    === "NP完全问题"
         NPC(NP-Complete)问题是指既是NP问题，又是NP问题中最难的问题(NP-hard)。如果能在多项式时间内解决一个NPC问题，那么所有的NP问题都能在多项式时间内解决。也就是说

        \[
            P=NP \Rightarrow P=NP=NPC
        \]


    !!!property "四者关系"
        - P问题能在多项式时间内解决，自然也能在多项式时间内验证，所以P问题是NP问题的子集。$P \subseteq NP$
        - NPC问题是NP问题的子集，$NPC \subseteq NP$
        - NPC问题也是NP-hard问题的子集，$NPC \subseteq NP-hard$，$NPC=NP \cap NP-hard$
        - NP-hard问题不一定是NP问题，$NP-hard \nsubseteq NP$
        - 如果NPC问题能在多项式时间内解决，那么所有的NP问题都能在多项式时间内解决，$P=NP \Rightarrow P=NP=NPC$

## 常见的多项式时间问题

- 最短路径问题：：给定一个有向图$G = (V, E)$即使是带负权的，我们可以在 $O(|V||E|)$ 的时间内找到从单一源顶点开始的最短路径；这是多项式时间的，因为图中我们的输入规模可以视为 $|V|+|E|$
- 欧拉回路问题：是否存在一条路径，经过图中每条边恰好一次，且最终回到起点。这个问题可以在 $O(|E|)$ 的时间内使用深度优先搜索解决。
- $2-SAT$问题：给定一个合取范式(如果它是由 $2$ 个子句的合取构成的，每个子句是由$2$个变量或者它们的否定构成的析取)，也可以在多项式时间内找到是否存在变量的0，1赋值，使得合取式为真。

!!!Warning "0-1背包问题"
    0-1背包问题的时间复杂度是指数级别的，不是多项式时间的。其背包容量是使用2进制表示的($\log C$),前面讨论的$n$指的是$n$个2进制编码



## 形式语言(formal language)

一个形式语言$L$是一个字符串的集合，$L \subseteq \Sigma^*$，其中$\Sigma$是一个有限的字母表,其上的字符串(string)是字母表上的字符的有限序列,所有这样的字符串构成了$\Sigma^*$。

- {==至多可数的集合上的有限字符串是可数的==}
- {==语言可以做衔接、并、交、补、Kleene 闭包(由集合中的符号生成的所有可能的有限长度的字符串所构成的集合)等运算==}


!!!definition
    === "判定问题"
        给定语言$L$,输入某一个字符串$w$，判定问题是指判断$w$是否属于$L$。如果$w \in L$，则输出YES，否则输出NO。(decision problem)

        $A$ solves problem $L$ ($A$ decides language $L$) if for every $w \in \Sigma^*$

        $A$ accepts $w$ if and only if  $w \in L$
    
    === "搜索问题"
        给定语言$L$,搜索问题是指找到一个$w$，使得$w \in L$。

    === "转换问题"
        给定语言$L_1$和$L_2$，计算某个从$L_1$到$L_2$的函数$f$。


## Karp归约

称一个语言$L_1$可以多项式归约( $Karp$ 归约)到另一个语言$L_2$，如果存在一个多项式时间的计算函数$f$，使得

\[
    w \in L_1 \Leftrightarrow f(w) \in L_2
\]

记作$L_1 \leqslant_p L_2$。此时说明 $L_2$ 至少和 $L_1$ 一样难。

那么对于$NP$和$P$的关系，我们可以得到如下结论：

如果我们找到了一个$NPC$问题，那么所有的$NP$问题都可以归约到这个$NPC$问题，也就是说，如果我们能在多项式时间内解决一个$NPC$问题，那么所有的$NP$问题都可以在多项式时间内解决。此时有

\[
    P=NP \Rightarrow P=NP=NPC
\]

如果我们不能在多项式时间内解决一个$NPC$问题，那么因为$NPC$问题是$NP$问题的子集，所以$P$是不等于$NP$的。

但是很遗憾的是，目前还没有人能够证明$P$是否等于$NP$，也就是说我们还不知道$NPC$问题是否可以在多项式时间内解决。


