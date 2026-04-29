# 讲义-特征值专题

>参考书目：《线性代数:未竟之美》

>本讲义用于竺可桢学院线性代数线上辅学课程，奈何本人水平有限，有些地方在课程中可能表述不清晰，还请多多包涵。

## 引入

!!!quote
    线性代数的一大目标是:我们希望找到出发空间和到达空间合适的基使得线性映射在这两组基下的表示更简单(尽可能多的零,尽量向对角矩阵靠近).我们将眼光放在线性变换，即出发空间和到达空间相同的线性映射，并且我们关注 **出发空间与到达空间取同一组基的时候，如何取基，可以把同一个线性映射的矩阵尽可能表示得简单** ；

!!!Summary "基的转换<->矩阵的转换"
    从矩阵在不同基下的的表示出发

    假设我们有一个在 $n$ 维线性空间 $\mathbf{V}$ 上线性变换 $\sigma$ ,其在基 $\mathbf{B}=\{\varepsilon_1,\varepsilon_2,\ldots,\varepsilon_n\}$ ($\mathbf{B}$ 的每个列向量是都是一个基)下的矩阵为 $A$,即

    \[
        \sigma (\varepsilon_1,\varepsilon_2,\ldots,\varepsilon_n) = (\varepsilon_1,\varepsilon_2,\ldots,\varepsilon_n)A
    \] 

    假设我们很幸运,找到了另外一组基 $\mathbf{B'}=\{\varepsilon_1',\varepsilon_2',\ldots,\varepsilon_n'\}$,并且已知这个线性映射在这组基下的矩阵很漂亮,是对角的$\Lambda$,即

    \[
        \sigma (\varepsilon_1',\varepsilon_2',\ldots,\varepsilon_n') = (\varepsilon_1',\varepsilon_2',\ldots,\varepsilon_n') \Lambda
    \] 

    如果又恰好知道两组基之间的过渡矩阵

    \[
    \{\varepsilon_1',\varepsilon_2',\ldots,\varepsilon_n'\} = \{ \varepsilon_1,\varepsilon_2,\ldots,\varepsilon_n \} P
    \]

    那么我们可以推导出
    
    \[
         A P = P \Lambda \tag{1}
    \]

    \[
        P^{-1} A P = \Lambda
    \]

    $P$为什么一定可逆？(基之间的互相表示)
     
    继续由上面的式子(1)，我们展开,$p_i$为矩阵$P$的第$i$个列向量

    \[
        A P = A ( p_1, p_2,\ldots,p_n ) = ( p_1, p_2,\ldots,p_n )\begin{pmatrix}
                    \lambda_1 & 0 & 0 & \cdots & 0 \\
                    0 & \lambda_2 & 0 & \cdots & 0 \\
                    0 & 0 & \lambda_3 & \cdots & 0 \\
                    \vdots & \vdots & \vdots & \ddots & \vdots \\
                    0 & 0 & 0 & \cdots & \lambda_n
                    \end{pmatrix}
    \]

    展开对应相等

    \[
        Ap_i = \lambda_i p_i
    \]

    !!!key-point
        这一过程给我们的启发是，如果我们知道$A$可以达到的对角化的矩阵是怎么样的,那么可以逆推出变换矩阵,从而找出这组基是怎么样的;上面的$\lambda_i$,与$p_i$就是我们今天要讨论的特征值与特征向量，如何寻找它们就是我们今天的重点；


## 特征值与特征向量

### 定义

!!!Definition
    设$\sigma$是线性空间$V(\mathbf{F})$上的一个线性变换，如果存在数$\lambda\in\mathbf{F}$和非零向量$\xi\in V$使得$\sigma(\xi)=\lambda\xi$，则称数$\lambda$为$\sigma$的一个特征值，并称非零向量$\xi$为$\sigma$属于其特征值$\lambda$的特征向量
    
    同构地，对于矩阵而言，有:

    设矩阵$A\in \mathbf{M}_n(\mathbf{F})$，如果存在数$\lambda\in\mathbf{F}$和非零向量$X\in\mathbf{F}^n$使得$AX=\lambda X$，则称数$\lambda$为$A$的一个特征值，称非零向量$X$为$A$属于其特征值$\lambda$的特征向量.


!!!property
    设 $\sigma$ 是 $V(\mathbf{F})$ 上的线性变换，$I$ 为恒等映射，则下述条件等价：

    1. $\lambda \in \mathbf{F}$ 是 $\sigma$ 的特征值；
    2. $\sigma - \lambda I$ 不是单射 $\Leftrightarrow$ $A-\lambda E$ 列不满秩；
    3. $\sigma - \lambda I$ 不是满射 $\Leftrightarrow$ $A-\lambda E$ 行不满秩；
    4. $\sigma - \lambda I$ 不可逆  $\Leftrightarrow$   $A-\lambda E$ 不可逆({==行列式为0==})

对于第二第三条的矩阵版本有疑问的同学可以回顾 **LALU** 相抵标准型一节给出的定理:

线性映射是单射当且仅当其矩阵表示为列满秩矩阵,线性映射是满射当且仅当其矩阵表示为行满秩矩阵.

### 特征多项式

由上述性质，$\lambda\in\mathbf{F}$是$\sigma$的特征值等价于$|\lambda E-A|=0$，故我们可以通过$|\lambda E-A|=0$求解特征值，其中$A$为$\sigma$在某组基下的矩阵，$E$为单位矩阵. 对于特征向量的求解，求出$(\lambda E-A)X=0$的非零解就是特征向量在基$\alpha_1,\ldots,\alpha_n$下的坐标，如果是矩阵的特征向量，那么$X$就是解.

上述求解特征向量的方法需要我们求解$f(\lambda)=|\lambda E-A|$的根，我们将$f(\lambda)$称为{==特征多项式==}；

!!!Example
    设$A=\begin{pmatrix}
         1 & -1 & 0 \\ 2 & 0 & 1 \\ 1 & a & 0
     \end{pmatrix}$，且存在非零向量$\alpha$使得$A\alpha=2\alpha$，求$a$.
    
    ???answer
        由题意知2是矩阵$A$的特征值，因此我们有
       
        \[|2E-A|=\begin{vmatrix}
               1 & 1 & 0 \\ -2 & 2 & -1 \\ -1 & -a & 2
           \end{vmatrix}=9-a=0
        \]

        因此$a=9$.



特征多项式可以写为以下的形式

对于$n$级矩阵$A=(a_{ij})$，记

\[f(\lambda)=|\lambda E-A|=a_0\lambda^n+a_1\lambda^{n-1}+\cdots+a_{n-1}\lambda+a_n\]
    
则$a_0=1$，$a_1=-\mathbf{tr}(A)$ ，$a_n=(-1)^n|A|$ ，且$a_k$等于所有$k$级主子式之和乘以$(-1)^k$.

由韦达定理

???Note "一元n次韦达定理"
    设方程 \( a_0 x^n + a_{1} x^{n-1} + \cdots + a_{n-1} x + a_n = 0 \) 有根 \( x_1, x_2, \ldots, x_n \). 那么:

    - 各根之和:
    
    \[
    x_1 + x_2 + \cdots + x_n = \sum_{i=1}^{n} x_i = -\frac{a_{1}}{a_0}
    \]

    - 各根之积:

    \[
    x_1 x_2 \cdots x_n = \prod_{i=1}^{n} x_i = (-1)^n \frac{a_n}{a_0}
    \]


- $\displaystyle\sum_{i=1}^{n}\lambda_i=\sum_{i=1}^{n}a_{ii}$；

-  $\displaystyle\prod_{i=1}^{n}\lambda_i=|A|$. 

#### 相似与特征多项式

!!!question 
    - 相似矩阵有相同的特征多项式?（从而有相同的迹，行列式，特征值;），即$A\sim B$有$|\lambda E-A|=|\lambda E-B|$吗？反过来呢？
    
    ???Answer
        设$B=P^{-1}AP$，则$|\lambda E-B|=|\lambda E-P^{-1}AP|=|P^{-1}(\lambda E-A)P|=|P^{-1}||\lambda E-A||P|=|\lambda E-A|$. 因此$A\sim B$有$|\lambda E-A|=|\lambda E-B|$.

        我们知道特征多项式相同则特征值相同，迹等于所有特征值之和，行列式等于所有特征值之积，因此相似矩阵有相同的迹，行列式，特征值.

    - 如果是，那么同一特征值的特征向量之间有什么关系？

    ???Answer
        设$P^{-1}AP=B$，则$A,B$分别属于同一特征值$\lambda$的特征向量$X$和$Y$满足$Y=P^{-1}X$.

        由$AX=\lambda_0 X$以及$A=PBP^{-1}$，我们有$PBP^{-1}X=\lambda_0 X$，即$BP^{-1}X=\lambda_0 P^{-1}X$，因此$P^{-1}X$是$B$属于$\lambda_0$的特征向量，即$P^{-1}X$是$B$的特征向量，即$Y=P^{-1}X$.

        回忆{==基的选择导致同一向量在不同基下的坐标表示==},实际上这个问题就是该定理的推论;

        ???info "同一向量在不同基下的坐标表示"
            设线性空间$V$的两组基为$B_1$和$B_2$，且基$B_1$到$B_2$的变换矩阵（过渡矩阵）为$A$，如果$\xi \in V(\mathbf{F})$在$B_1$和$B_2$下的坐标分别为$X$和$Y$，则$Y=A^{-1}X$.

            \[\xi=(\alpha_1,\ldots,\alpha_n)X=(\beta_1,\ldots,\beta_n)Y.\]

            将过渡矩阵的条件$B_2=B_1A$，即$(\beta_1,\ldots,\beta_n)=(\alpha_1,\ldots,\alpha_n)A$代入上式可得：
            
            \[\xi=(\alpha_1,\ldots,\alpha_n)X=(\alpha_1,\ldots,\alpha_n)AY.\]
            
            又由于$\xi$在线性无关向量组$\alpha_1,\ldots,\alpha_n$下的坐标唯一，故我们有$X=AY$，即$Y=A^{-1}X$.


!!!Example
    回答以下两个问题：

    1. 设 $A,B$ 均为 $n$ 阶矩阵，证明：$\lambda\neq 0$ 是 $AB$ 的特征值，则 $\lambda$ 也是 $BA$ 的特征值；
       
    2. 设 $A\in \mathbf{M}_{m\times n}(\mathbf{C}),\enspace B\in \mathbf{M}_{n\times m}(\mathbf{C})$，证明：
       
    \[
       \begin{pmatrix}
           AB & O \\ B & O
       \end{pmatrix} \sim \begin{pmatrix}
           O & O \\ B & BA
       \end{pmatrix}
    \]
    
       并由此推出 $AB$ 和 $BA$ 非零特征值相同，且 $m=n$ 时有 $|\lambda E-AB|=|\lambda E-BA|$.

    ???Proof
        1. 设 $X$ 是 $AB$ 属于 $\lambda$ 的特征向量，则 $ABX=\lambda X$，因此 $B(ABX)=B(\lambda X)$，即 $(BA)(BX)=\lambda(BX)$，因此 $BX$ 是 $BA$ 属于 $\lambda$ 的特征向量，故 $\lambda$ 也是 $BA$ 的特征值。

         实际上这里还有一点需要说明，就是 $BX\neq 0$，否则它将不能作为特征向量。事实上证明是简单的，假设 $BX=0$，则 $ABX=0$，由于 $\lambda\neq 0$，因此必然有 $X=0$，但这与 $X$ 是 $AB$ 属于 $\lambda$ 的特征向量矛盾，因此 $BX\neq 0$。

        2. 根据分块矩阵初等变换的性质，我们可以通过不断尝试选取到 $P=\begin{pmatrix}
             E_m & A \\ O & E_n
           \end{pmatrix}$，其逆矩阵为 $P^{-1}=\begin{pmatrix}
             E_m & -A \\ O & E_n
         \end{pmatrix}$，我们发现恰有
         
        \[
            \begin{pmatrix}
                E_m & -A \\ O & E_n
            \end{pmatrix} \begin{pmatrix}
                AB & O \\ B & O
            \end{pmatrix} \begin{pmatrix}
                E_m & A \\ O & E_n
            \end{pmatrix} = \begin{pmatrix}
                O & O \\ B & BA
            \end{pmatrix}.
        \]
         
         因此 $\begin{pmatrix}
             AB & O \\ B & O
         \end{pmatrix}$ 与 $\begin{pmatrix}
             O & O \\ B & BA
         \end{pmatrix}$ 相似，因此它们的特征多项式相同，即
         
        \[
         \begin{vmatrix}
             \lambda E_m-AB & O \\ -B & \lambda E_n
         \end{vmatrix} = \begin{vmatrix}
             \lambda E_m & O \\ -B & \lambda E_n-BA
         \end{vmatrix}.
        \]
         
         根据行列式的计算性质 $\begin{vmatrix}
             A & O \\ C & B
         \end{vmatrix} = |A||B|$，我们有
         
        \[
         |\lambda E_m-AB||\lambda E_n| = |\lambda E_m||\lambda E_n-BA|,
        \]
         
        即 $\lambda^n|\lambda E_m-AB| = \lambda^m|\lambda E_n-BA|$，因此 $AB$ 和 $BA$ 非零特征值相同，且 $m=n$ 时有 $|\lambda E-AB|=|\lambda E-BA|$.


对于可逆矩阵$P$,我们知道了$A$与$B=P^{-1}AP$有相同的特征值，如果$P$不可逆，两个矩阵又有什么关系呢？

我们有以下结论

!!!Property
    设$A,B$分别为数域$\mathbf{F}$上$n$阶、$m$阶方阵，$A,B$有$r$个两两不等的公共特征值，则矩阵方程$AX-XB=O$有秩为$r$的矩阵解. 反之，若数域为复数域，矩阵方程$AX-XB=O$有秩为$r$的矩阵解，则$A,B$至少有$r$个公共的特征值（计重数）.

    证明见 《LALU》.P465

!!!Example
     设$m$阶矩阵$A$与$n$阶矩阵$B$无公共复特征值，$C$为$m\times n$矩阵，则矩阵方程$AX-XB=C$存在唯一解.
    
    ???Answer
        设$V$是所有$m\times n$矩阵构成的线性空间，定义$V$上的线性变换$\sigma(X)=AX-XB,\enspace X\in V$. 由于$A$和$B$无公共复特征值，所以$\sigma(X)=AX-XB=O$只有零解，即$\sigma$为$V$上单射，可知$\sigma$是满射且是同构映射. 于是，对任意的$C\in V$，都存在唯一的$X_0\in V$使得$\sigma(X_0)=C$，即矩阵方程$AX-XB=C$存在唯一解$X_0$.
           
### 特征值的性质与结论

-   设$\lambda$是线性空间$V(\mathbf{F})$上的线性变换$\sigma$的特征值，$\xi$是$\sigma$属于$\lambda$的特征向量，则
    
    - $k\lambda$是$k\sigma$的特征值，$\lambda^m$是$\sigma^m$的特征值，且$\xi$仍是相应特征向量；

    - 若$f(x)=a_nx^n+a_{n-1}x^{n-1}+\cdots+a_1x+a_0$是$\mathbf{F}$上的多项式，则$f(\sigma)(\xi)=f(\lambda)\xi$；

- 设$\lambda$是$n$阶矩阵$A$的特征值，$A$可逆，则$\lambda^{-1}$是$A^{-1}$的特征值，$|A|\lambda^{-1}$是$A$的伴随矩阵$A^*$的特征值，且特征向量不变.

- 设$A$为$n$阶矩阵，则$A$与$A^\mathrm{T}$有相同的特征值（含重数）.


- $A$可逆/$A$不可逆/$E+A$可逆/$4E+A$不可逆；

- $|E-A^2|=0$；

- $A^2=E$（对合）/$A^2=A$（幂等）/$A^k=0$（幂零）；

- $A=\lambda_0E+B$（$\lambda_0$为常数，且已知$B$的$n$个特征值为$\lambda_1,\lambda_2,\ldots,\lambda_n$）；

- $A$为对角块矩阵，即$A=\mathbf{diag}(A_1,A_2,\ldots,A_m)$.


???Proof
    1 
    **由于**$\sigma(\xi) = \lambda\xi$，则$(k\sigma)(\xi) = k\lambda\xi$，即$k\lambda$是$k\sigma$的特征值，$\xi$仍是相应特征向量。

    而$\sigma^m(\xi) = \sigma^{m-1}(\sigma(\xi)) = \sigma^{m-1}(\lambda\xi) = \lambda\sigma^{m-1}(\xi) = \cdots = \lambda^m\xi$，即$\lambda^m$是$\sigma^m$的特征值，$\xi$仍是相应特征向量。

    2 
    **利用前述$\sigma^m$的相关性质，我们有**  
       $$ f(\sigma)(\xi) = (a_n\sigma^n + a_{n-1}\sigma^{n-1} + \cdots + a_1\sigma + a_0I)(\xi) $$  
       $$ = a_n\sigma^n(\xi) + a_{n-1}\sigma^{n-1}(\xi) + \cdots + a_1\sigma(\xi) + a_0I(\xi) $$  
       $$ = a_n\lambda^n\xi + a_{n-1}\lambda^{n-1}\xi + \cdots + a_1\lambda\xi + a_0\xi $$  
       $$ = f(\lambda)\xi. $$

    3 
    **设$\xi$是$A$的特征值，即$A\xi = \lambda\xi$，则$\xi = A^{-1}A\xi = A^{-1}\lambda\xi$，即$A^{-1}\xi = \lambda^{-1}\xi$，因此$\lambda^{-1}$是$A^{-1}$的特征值，$\xi$仍是相应特征向量。**

       又由于$A$可逆时$A^* = |A|A^{-1}$，根据前面关于$k\sigma$和$A^{-1}$特征值的讨论可知，$|A|\lambda^{-1}$是$A$的伴随矩阵$A^*$的特征值，$\xi$仍是相应特征向量。

    4
     **我们用特征多项式证明**。实际情况是，$A^\mathrm{T}$的特征多项式为$|\lambda E - A^\mathrm{T}| = |(\lambda E - A)^\mathrm{T}| = |\lambda E - A|$（回忆转置不改变行列式），实际上与$A$的特征多项式完全一致，因此$A^\mathrm{T}$与$A$有相同的特征值（含重数）。

    5
     **$A$可逆时有** $|A| = \lambda_1 \cdots \lambda_n \neq 0$，因此$A$的特征值都不为0。 同理，$A$不可逆同理表明存在特征值等于0，$E+A$可逆表明$-1$不是$A$的特征值，$4E+A$不可逆表明$-4$是$A$的特征值。

    6
     **$|E - A^2| = |E - A||E + A| = 0$**，因此$\pm 1$都是$A$的特征值。

    7
     **我们首先考虑对合矩阵，接下来的同理可以得到类似结论**。由于$A^2 = E$，设$AX = \lambda X$，则$A^2 X = \lambda^2 X = X$，因此$\lambda^2 = 1$，即$\lambda = \pm 1$，因此$1$或$-1$是$A$的特征值。

     **注**：本题解决过程中告诉我们一个解题技巧，如果看到$A$的多项式$f(A) = O$这种形式的表达式，事实上$A$的特征值只能是$f(\lambda) = 0$的根，如上题中$f(A) = A^2 - E$，则$f(\lambda) = \lambda^2 - 1$，因此$A$的特征值只能是$\pm 1$。

     同理，我们可以知道幂等矩阵的特征值只能是0和1，幂零矩阵的特征值只能是0（这是一个重要的幂零矩阵等价条件，未来我们会再次遇到）。

    8
     **设** $BX = \lambda_i X_i\ (X_i \neq 0,\enspace i = 1,\ldots,n)$，则  
       $$ AX_i = \lambda_0 X_i + BX_i = \lambda_0 X_i + \lambda_i X_i = (\lambda_0 + \lambda_i) X_i $$  
       因此$\lambda_0 + \lambda_i \ (i = 1,\ldots,n)$都是$A$的特征值。

    9
     **证明**：
       
    \[ |\lambda E - A| = \begin{vmatrix}
           \lambda E_1 - A_1 & 0 & \cdots & 0 \\
           0 & \lambda E_2 - A_2 & \cdots & 0 \\
           \vdots & \vdots & \ddots & \vdots \\
           0 & 0 & \cdots & \lambda E_m - A_m
       \end{vmatrix} = \prod_{i=1}^{m} |\lambda E_i - A_i| = 0 
    \]

    因此，$A_i,\enspace i = 1,\ldots,m$的特征值都是$A$的特征值。


!!!Example
    - 设$\alpha=(1,0,-1)^\mathrm{T}$，且$A=\alpha\alpha^\mathrm{T}$，求$|6E-A^n|$；

    - 设$A$为三阶矩阵，其特征值为$1,-2,-1$，求$|A|$，$A^*+3E$的特征值，$(A^{-1})^2+2E$的特征值以及$|A^2-A+E|$；

    - 设$A$为三阶矩阵，$A^2-A-2E=O$，$|A|=2$，求$|A^*+3E|$；

    - 设$A$为三阶矩阵，其特征值为$-1,-1,5$，求$A_{11}+A_{22}+A_{33}$；
    
    ???Answer
        - 事实上$A=\alpha\alpha^\mathrm{T}=\begin{pmatrix}
                      1 & 0 & -1 \\ 0 & 0 & 0 \\ -1 & 0 & 1
                  \end{pmatrix}$，由$|\lambda E-A|=0$解得$A$的特征值为$\lambda_1=\lambda_2=0,\lambda_3=2$，而根据$A^n$的特征值性质可知，$6E-A^n$的特征值为$6-\lambda_1^n,6-\lambda_2^n,6-\lambda_3^n$，即$6,6,6-2^n$，因此$|6E-A^n|=6^2(6-2^n)=36(6-2^n)$.

        - 由于$A$的特征值为$1,-2,-1$，因此$|A|=1\times(-2)\times(-1)=2$，而$A^*$的特征值为$|A|\lambda^{-1}$，因此$A^*$的特征值为$2,-1,-2$，故$A^*+3E$的特征值为$A^*$的特征值加3（即为$5,2,1$，又根据$A^{-1}$和$A^2$特征值的性质可知，$(A^{-1})^2+2E$的特征值为$1^2+2,(-1/2)^2+2,(-1)^2+2$，即为$3,9/4,3$，而$A^2-A+E$的特征值根据$f(\sigma)$特征值性质的讨论可知为$1^2-1+1,(-2)^2-(-2)+1,(-1)^2-(-1)+1$，即为$1,7,3$，因此$|A^2-A+E|=1\times 7\times 3=21$.

        - 设$AX=\lambda X(X\neq 0)$，则$(A^2-A-2E)X=(\lambda^2-\lambda-2)X=O$，因此$\lambda=-1$或$\lambda=2$，根据对合矩阵的讨论可知，$A$的特征值恰为-1和2. 又$|A|=2$，且$A$为3阶矩阵，因此$A$的3个特征值必为-1，-1，2.

        又$A^*$的特征值为$|A|\lambda^{-1}$，因此$A^*$的特征值为$1,-2,-2$，$A^*+3E$的特征值为$A^*$的特征值加3，即$\lambda_1=\lambda_2=1,\lambda_3=4$，故$|A^*+3E|=\lambda_1\lambda_2\lambda_3=4$.

        - 由题意知$|A|=5$，故$A^*$的特征值为$|A|\lambda^{-1}$即为$\mu_1=\mu_2=-5,\mu_3=1$，而$A_{11}+A_{22}+A_{33}$就是$A^*$的迹（即矩阵对角线元素之和），因此$A_{11}+A_{22}+A_{33}=\mu_1+\mu_2+\mu_3=-9$.


### 特征向量与特征子空间的性质

- $\sigma$的不同特征值对应的特征向量线性无关；

- $\sigma$的不同特征值对应的特征子空间的和为直和；

- $\sigma$最多有$\dim V$个不同的特征值.

有以下推论

???Proof 
    - **设** $\lambda_1, \ldots, \lambda_m$ 是 $\sigma$ 的互异特征值，$\xi_1, \ldots, \xi_m$ 是相应的特征向量。反证法，我们假设 $\xi_1, \ldots, \xi_m$ 线性相关，由线性相关性引理可知，存在 $k$ 是使得  
    
    \[ \xi_k \in \mathbf{spa}(\xi_1, \ldots, \xi_{k-1}) \]  
    
      成立的最小整数，则存在 $c_1, \ldots, c_{k-1}$ 使得  
    
      $$ \xi_k = c_1\xi_1 + \cdots + c_{k-1}\xi_{k-1}. $$  
    
      将 $\sigma$ 作用到上式两边，我们有  
    
      $$ \lambda_k \xi_k = c_1 \lambda_1 \xi_1 + \cdots + c_{k-1} \lambda_{k-1} \xi_{k-1}. $$  
    
      将上式两边乘以 $\lambda_k$，然后减去上式，我们有  
    
      $$ 0 = c_1 (\lambda_k - \lambda_1)\xi_1 + \cdots + c_{k-1} (\lambda_k - \lambda_{k-1})\xi_{k-1}. $$  
    
      由于我们选取的 $k$ 是满足 $\xi_k \in \mathbf{spa}(\xi_1, \ldots, \xi_{k-1})$ 的最小整数，因此 $\xi_1, \ldots, \xi_{k-1}$ 线性无关，故 $c_1 = \cdots = c_{k-1} = 0$，因此 $\xi_k = 0$，这与 $\xi_k$ 是特征向量矛盾，因此 $\xi_1, \ldots, \xi_m$ 线性无关。

    - **回忆直和的证明方法**，我们选取合适等价命题进行证明。假设  
     
      $$ \xi_1 + \cdots + \xi_m = 0, $$  
     
      其中 $\xi_i \in V_{\lambda_i}$，由于 $\sigma$ 的不同特征值对应的特征向量线性无关，因此 $\xi_1, \ldots, \xi_m$ 不可能是特征向量，否则可知它们线性相关，故必有 $\xi_1 = \cdots = \xi_m = 0$，这表明 $\sigma$ 的不同特征值对应的特征子空间的和为直和。

    - **设** $\lambda_1, \ldots, \lambda_m$ 是 $\sigma$ 的互异特征值，$\xi_1, \ldots, \xi_m$ 是相应的特征向量。前面已经证明了 $\xi_1, \ldots, \xi_m$ 线性无关，因此 $\dim V \geqslant m$，得证。


- 若$\lambda_1,\ldots,\lambda_m$是线性映射$\sigma$互异的特征值，则$V_{\lambda_i}\cap\sum\limits_{j\neq i}V_{\lambda_j}=\{0\}
              \enspace(i=1,\ldots,m)$，则一个特征向量不能属于多个特征值. 


- $\sigma$的不同特征值$\lambda_1,\ldots,\lambda_m$对应的特征子空间$V_{\lambda_1},\ldots,V_{\lambda_m}$的基向量合在一起构成的向量组线性无关，且是$V_{\lambda_1}+V_{\lambda_2}+\cdots+V_{\lambda_m}$的基.


!!!definition
    - 代数重数:某一特征值$\lambda$的代数重数指重根的个数；
    - 几何重数:某一特征值的几何重数指特征向量生成线性空间的维数

{==若$\lambda$是$\sigma$的特征值，则$\lambda$的代数重数大于等于几何重数==}


我们思考，如果所有的特征子空间已经是全空间$V$,那么是否所有向量都是特征向量呢?下面的例子告诉我们不是这样的,事实上，只有当特征值唯一的时候，这个结论才正确:

!!!Example "2013-2014期末"
    设 $V(\mathbf{F})$ 是 $n$ 维线性空间，$\sigma \in \mathcal{L}(V)$，证明：

    1. 若 $\alpha, \beta$ 是 $\sigma$ 的属于不同特征值的特征向量，则 $c_1c_2 \neq 0$ 时，$c_1 \alpha + c_2 \beta$ 不是 $\sigma$ 的特征向量；
    2. $V$ 中的每一非零向量都是 $\sigma$ 的特征向量 $\iff \sigma = c_0 I_V$，其中 $c_0 \in \mathbf{F}$ 是一个常数，$I_V$ 是恒等变换。

    ???Proof
        1. 设 $\sigma(\alpha) = \lambda_1 \alpha, \sigma(\beta) = \lambda_2 \beta$，其中 $\lambda_1 \neq \lambda_2$，并假设 $c_1 \alpha + c_2 \beta$ 是 $\sigma$ 的特征向量，即存在 $\lambda_0 \in \mathbf{F}$ 使得  
           $$ \sigma(c_1 \alpha + c_2 \beta) = \lambda_0 (c_1 \alpha + c_2 \beta). $$  
           展开括号，我们有  
           $$ c_1 \sigma(\alpha) + c_2 \sigma(\beta) = c_1 \lambda_0 \alpha + c_2 \lambda_0 \beta. $$  
           即  
           $$ c_1 \lambda_1 \alpha + c_2 \lambda_2 \beta = c_1 \lambda_0 \alpha + c_2 \lambda_0 \beta, $$  
           即  
           $$ (\lambda_1 - \lambda_0) c_1 \alpha + (\lambda_2 - \lambda_0) c_2 \beta = 0. $$  
           由于 $\alpha, \beta$ 线性无关，因此  
           $$ c_1 (\lambda_1 - \lambda_0) = c_2 (\lambda_2 - \lambda_0) = 0. $$  
           当 $c_1 c_2 \neq 0$ 时，我们有 $\lambda_1 = \lambda_0 = \lambda_2$，这与 $\lambda_1 \neq \lambda_2$ 矛盾，因此 $c_1 \alpha + c_2 \beta$ 不是 $\sigma$ 的特征向量。

        2. 右推左显然，我们只考虑左推右的证明。由上一小问结论可知，若 $V$ 中的每一非零向量都是 $\sigma$ 的特征向量，$\sigma$ 不可能有不同的特征值（因为有不同的特征值就有不同特征值对应的特征向量，但它们的线性组合一定仍在 $V$ 中，这与从第一问中得到的结论，即它不是 $\sigma$ 的特征向量矛盾）。设 $c_0$ 是 $\sigma$ 的唯一的特征值，则对于任意 $\alpha \in V$，我们有 $\sigma(\alpha) = c_0 \alpha$，即 $\sigma$ 在任意元素上的像都已经唯一确定，则显然在 $V$ 的一组基上的像也唯一确定，由线性映射唯一确定的定理可知这样的线性映射是唯一的，$\sigma = c_0 I_V$ 符合要求，因此它就是我们要找的线性映射。

!!!Example 
    设 $A$ 是数域 $\mathbf{F}$ 上一个 $n$ 阶方阵，$E$ 是 $n$ 阶单位矩阵，$\alpha_1 \in \mathbf{F}^n$ 是 $A$ 的属于特征值 $\lambda$ 的一个特征向量，向量组 $\alpha_1, \alpha_2, \ldots, \alpha_s$ 按如下方式产生：  
    
    \[(A - \lambda E) \alpha_{i+1} = \alpha_i, \quad i = 1, 2, \ldots, s-1.\]  
    
    证明向量组 $\{\alpha_1, \alpha_2, \ldots, \alpha_s\}$ 线性无关。

    ???Proof
        由于 $\alpha_1$ 是 $A$ 属于特征值 $\lambda$ 的特征向量，故有 $(A - \lambda E) \alpha_1 = 0$。

        设  
        $$ \sum_{i=1}^{s} k_i \alpha_i = 0, $$  
        两边同时左乘 $(A - \lambda E)$ 可得  
        $$ (A - \lambda E) \sum_{i=1}^{s} k_i \alpha_i = \sum_{i=1}^{s} k_i (A - \lambda E) \alpha_i = k_1 (A - \lambda E) \alpha_1 + \sum_{i=1}^{s-1} k_{i+1} \alpha_i = \sum_{i=1}^{s-1} k_{i+1} \alpha_i = 0. $$

        以此类推，在等式两边不断左乘 $(A - \lambda E)$ 可得：对于 $\forall r \in \{1, \cdots, s-1\}$ 都有  
        $$ \sum_{i=1}^{s-r} k_{i+r} \alpha_i = 0. $$

        令 $r = s-1$ 得到 $k_s \alpha_1 = 0, \quad k_s = 0$。再依次代回不难得到 $k_i = 0, \quad \forall i \in \{1, \cdots, s\}$，从而向量组 $\alpha_1, \cdots, \alpha_s$ 线性无关。


## 可对角化的条件

!!!Definition "可对角化"
    设$\sigma\in\mathcal{L}(V)$，如果存在$V$的一组基使得$\sigma$在这组基下的矩阵是对角矩阵，则称$\sigma$可对角化.

  设$V$是数域$\mathbf{F}$上的$n$维线性空间，$\sigma$是$V$上的线性变换，$\lambda_1,\lambda_2,\ldots,\lambda_s\in\mathbf{F}$是$\sigma$的所有互异特征值，则以下条件等价：

1. $\sigma$ 可对角化；
2. $\sigma$ 有 $n$ 个线性无关的特征向量，它们构成 $V$ 的一组基；
3. $V$ 有在 $\sigma$ 下不变的一维子空间 $U_1, \ldots, U_n$，使得 $V = U_1 \oplus \cdots \oplus U_n$；
4. $V = V_{\lambda_1} \oplus V_{\lambda_2} \oplus \cdots \oplus V_{\lambda_s}$；
5. $n = \dim V_{\lambda_1} + \dim V_{\lambda_2} + \cdots + \dim V_{\lambda_s}$；
6. $\sigma$ 每个特征值的代数重数等于几何重数。

有推论

若 $n$ 阶矩阵 $A$ 有 $n$ 个不同的特征值，则 $A$ 可对角化. 反之，$A$ 可对角化不一定有 $n$ 个特征值.

!!!Key-point
    总结而言，只要特征子空间可以张成整个空间，那么这个线性变换就是可对角化的。


### 对角化的基本步骤

1. 先任意写出 $\sigma$ 在一组基 $\mathbf{B}$ 下的矩阵 $A$，当然为了计算方便一般选取自然基；
2. 利用特征多项式 $f(\lambda) = |\lambda E − A| = 0$ 求出 $A$ 的所有不同特征值；
3. 解线性方程组 $AX = \lambda X$（实际上就是方程组 $(\lambda E − A)X = 0$，其中 $\lambda$ 是上一步求
出的特征值）求出 $A$ 在不同特征值下的线性无关特征向量；
4. 第三步中求得的所有向量就是 $\lambda$ 的特征向量在基 $B$ 下的坐标，根据前面的讨论，$\sigma$
的特征向量也就是使得 $\sigma$ 的矩阵表示为对角矩阵的那组基.
5. 当然，如果题目中直接给出求 $P$ 使得 $P^{−1}AP$ 为对角矩阵，那么我们只需进行 2、3
两步，并将 3 中得到的向量按列排列成矩阵 P 即可
6.如果要求$P$是正交矩阵，那么3中求出来的所有向量需要在 **各自的特征子空间中正交化** 。

!!!Example
    求矩阵
    
    \[A=\begin{pmatrix}
            0  & -1 & 1 \\
            -1 & 0  & 1 \\
            1  & 1  & 0
        \end{pmatrix}
    \]
    
    的所有特征值，对应的特征子空间，以及与 $A$ 相似的一个对角矩阵.
    

    ???Answer
        对于求解矩阵的对角化问题，首先求出其特征多项式（具体步骤不展开，实际上就是三阶行列式的计算，可以使用按行（列）展开、公式法或者初等变换化为三角矩阵等方法）$f(\lambda)=|\lambda E-A|=(\lambda-1)^2(\lambda+2)$，令$f(\lambda)=0$，解得特征值为 $\lambda_1=\lambda_2=1,\lambda_3=-2$.

        接下来求解特征向量和特征子空间，即求解$(E-A)x=0$和解$(-2E-A)x=0$，得到特征值1对应的特征子空间为$\mathbf{spa}((-1,1,0)^{\mathrm{T}},(1,0,1)^{\mathrm{T}})$，特征值-2对应的特征子空间为$\mathbf{spa}((-1,-1,1)^{\mathrm{T}})$.

        与$A$相似的对角矩阵实际上就是特征值排列在对角线上的结果，即 $\mathbf{diag}(1,1,-2)$.



!!!Example
    设 $T$ 是次数小于等于 2 的实多项式线性空间 $V$ 上的变换，对任意 $f(x) \in V$，定义
    
    \[T(f(x))=\frac{\mathrm{d}((x-2)f(x))}{\mathrm{d}x}\]
    
    证明 $T$ 是 $V$ 上的线性变换，且$T$可对角化.

    ???Answer
        首先证明这是线性变换. 首先验证线性性，对于任意$f(x),g(x)\in V$，$a,b\in\mathbf{R}$，我们有

        \begin{align*}
            T(af(x)+bg(x)) & =\frac{\mathrm{d}((x-2)(af(x)+bg(x)))}{\mathrm{d}x}                                    \\
                             & =\frac{\mathrm{d}(axf(x)-2af(x)+bxg(x)-2bg(x))}{\mathrm{d}x}                           \\
                             & =a\frac{\mathrm{d}((x-2)f(x))}{\mathrm{d}x}+b\frac{\mathrm{d}((x-2)g(x))}{\mathrm{d}x} \\
                             & =aT(f(x))+bT(g(x)).
        \end{align*}

        然后说明这是$V$上的线性变换，即该映射的到达空间是$V$，即$T(f(x))\in V$， 因为$f(x)$是次数小于等于2的实多项式，设$f(x)=ax^2+bx+c$，则
        
        \begin{align*}
              T(f(x)) & =\frac{\mathrm{d}((x-2)(ax^2+bx+c))}{\mathrm{d}x}          \\
                      & =\frac{\mathrm{d}(ax^3+(b-2a)x^2+(c-2b)x-2c)}{\mathrm{d}x} \\
                      & =3ax^2+2(b-2a)x+(c-2b)\in V.
        \end{align*}
        
        因此$T$是$V$上的线性变换.

        下面我们来判断$T$是否可对角化. 线性变换的可对角化问题第一步要转化为任意一组基下的矩阵，然后判断矩阵是否可对角化，因此我们先任意选取一组基，为方便我们选取自然基$\{1,x,x^2\}$，然后求出$T$在这组基下的矩阵$A=\begin{pmatrix}
               1 & -2 & 0 \\ 0 & 2 & -4 \\ 0 & 0 & 3
        \end{pmatrix}$，然后求出其特征多项式$f(\lambda)=|\lambda E-A|=(\lambda-1)(\lambda-2)(\lambda-3)$，令$f(\lambda)=0$，解得特征值为 $\lambda_1=1,\lambda_2=2,\lambda_3=3$. 即该3阶矩阵有3个不同的特征值，因此可知$A$可对角化，即$T$可对角化.
           


### 经典问题

!!!question "可对角化求矩阵幂"
     已知$A=\begin{pmatrix}
            0 & \dfrac{1}{2}  & \dfrac{1}{2} \\[2ex]
            1 & -\dfrac{1}{2} & \dfrac{1}{2} \\[2ex]
            1 & -\dfrac{1}{2} & \dfrac{1}{2}
        \end{pmatrix}$，求$A^n$.
    
    ???Answer
        首先求出$A$的特征多项式$f(\lambda)=|\lambda E-A|=\lambda(\lambda-1)(\lambda+1)$，令$f(\lambda)=0$，解得特征值为 $\lambda_1=0,\lambda_2=1,\lambda_3=-1$.

        接下来求解特征向量和特征子空间，实际上就是求解$(0E-A)x=0,(-E-A)x=0,(E-A)x=0$，得到特征向量为
       
        \[\eta_1=\begin{pmatrix}
               1 \\ 1 \\ -1
           \end{pmatrix},\enspace \eta_2=\begin{pmatrix}
               1 \\ 1 \\ 1
           \end{pmatrix},\enspace \eta_3=\begin{pmatrix}
               1 \\ -1 \\ -1
           \end{pmatrix}.\]
       
        所以记$P=(\eta_1,\eta_2,\eta_3)$，则$A=P\mathbf{diag}(0,1,-1)P^{-1}$，因此
       
        \[
            A^n=P\mathbf{diag}(0^n,1^n,(-1)^n)P^{-1}
        \]
       
        进一步计算得到
       
        \[A^n=\frac{1}{2}\begin{pmatrix}
               1+(-1)^n     & (-1)^{n+1} & 1 \\
               1+(-1)^{n+1} & (-1)^n     & 1 \\
               1+(-1)^{n+1} & (-1)^n     & 1
           \end{pmatrix}.\]

!!!question "秩1矩阵可对角化条件"
    设$\alpha$和$\beta$是$\mathbf{R}^n\enspace (n>1)$中两个列向量，$A=\alpha\beta^\mathrm{T}\neq O$.
    
    - 求$A$的特征值；

    - 证明：$\alpha^\mathrm{T}\beta=0\iff A$不可对角化.

    ???Answer

        - 我们知道，$r(A)\leqslant\min{\{r(\alpha),r(\beta)\}}=1$，并且$A\neq O$因此$r(A)>0$，故$A$的秩为1. 而$n>1$，因此$A$一定不可逆，故0一定是$A$的特征值，且对应的特征子空间维数为$AX=0$的解空间维数，即为$n-1$.

        由此我们知道$A$最多有两个特征值，因为0的代数重数（即作为$n$次特征多项式的零点次数）必然大于等于其几何重数$n-1$，当期代数重数为$n-1$时可能还有一个一重特征值. 我们利用特征值之和等于$A$的迹来找出可能的第二个特征值. 我们设$\alpha=(a_1,a_2,\ldots,a_n)^\mathrm{T},\beta=(b_1,b_2,\ldots,b_n)^\mathrm{T}$，则$A=\alpha\beta^\mathrm{T}=\begin{pmatrix}
                a_1b_1 & a_1b_2 & \cdots & a_1b_n \\
                a_2b_1 & a_2b_2 & \cdots & a_2b_n \\
                \vdots & \vdots & \ddots & \vdots \\
                a_nb_1 & a_nb_2 & \cdots & a_nb_n
            \end{pmatrix}$，
        因此$A$的迹为$\sum\limits_{i=1}^na_ib_i=\alpha^\mathrm{T}\beta=\sum\limits_{i=1}^n\lambda_i$，其中$\lambda_i$为$A$的特征值. 若$\alpha^\mathrm{T}\beta\neq 0$，则$\lambda_i=0,\enspace i=1,\ldots,n-1$，$\lambda_n=\alpha^\mathrm{T}\beta$. 若$\alpha^\mathrm{T}\beta=0$，则$A$的所有特征值均为0.

        - 由上一小问可知，若$\alpha^\mathrm{T}\beta=0$即$A$的全部特征值为0，因此只有一个$n-1$维的特征子空间，故特征子空间直和不等于$V$，故不可对角化.

        反之，若$A$不可对角化，我们用反证法. 假设$\alpha^\mathrm{T}\beta\neq 0$，则$A$有两个特征值，一个为0，一个为$\alpha^\mathrm{T}\beta$，因此$A$有两个特征子空间，一个是0对应的$n-1$维特征子空间，一个是$\alpha^\mathrm{T}\beta$对应的一维特征子空间，因此$V$可分解为两个特征子空间的直和，与$A$不可对角化矛盾，因此$\alpha^\mathrm{T}\beta=0$.


!!!question "幂零矩阵不可对角化"
    设$A$为$n$阶非零矩阵，且$A^m=O\enspace(m\in\mathbf{N}_+,\enspace m>1)$. 证明：$A$不可对角化；

    ???Answer
        设$\lambda$是$A$的特征值，由题意$\lambda^m=0$，即$\lambda=0$，因此$A$的所有特征值都为0. 但$r(A)>0$（因为$A$不是零矩阵），因此0对应的特征子空间维数为$n-r(A)<n$，因此$A$不可对角化.


!!!question "给出矩阵方程问对角化"
    - 设$A$为$n$阶矩阵，且$A^2=2A$. 证明：$A$可对角化，并求出与之相似的对角矩阵（注：本题结论可推广到任意的$A^2=kA$）；

    - 设$A$为二阶矩阵，非零向量$\alpha$不是$A$的特征向量，且$A^2\alpha-3A\alpha+2\alpha=0$. 证明：$\alpha$和$A\alpha$线性无关且$A$可对角化并求与$A$相似的对角矩阵.
    
    ???Answer
        1.
        由题意$A^2-2A=O$，因此$A$的特征值就是方程$\lambda^2-2\lambda=0$的解，即$\lambda_1=0,\lambda_2=2$.

        接下来我们需要说明0和2对应的特征子空间维数之和为$n$，即$\dim V_0+\dim V_2=n$，其中$V_0$和$V_2$分别为0和2对应的特征子空间. 事实上，由$A^2=2A$可知$A(A-2E)=O$，由知$r(A)+r(A-2E)\leqslant n$，又根据秩不等式$r(A)+r(B)\geqslant r(A+B)$，因此$r(A)+r(A-2E)=r(A)+r(2E-A)\geqslant r(A+(2E-A))=r(2E)=n$. 综上可知，$r(A)+r(A-2E)=n$.

        实际上，$V_0$就是$AX=0$的解空间，$V_2$就是$(A-2E)X=0$的解空间，因此$\dim V_0=n-r(A),\dim V_2=n-r(A-2E)$，因此由$r(A)+r(A-2E)=n$可知$\dim V_0+\dim V_2=2n-n=n$，即0和2对应的特征子空间维数之和为$n$，因此$A$可对角化.

        由于可对角化矩阵代数重数等于几何重数，因此特征值0对应的代数重数为$n-r(A)$，特征值2对应的代数重数为$r(A)$，因此我们可以得到与$A$相似的对角矩阵为$\mathbf{diag}(0,\ldots,0,2,\ldots,2)$，其中0的个数为$n-r(A)$，2的个数为$r(A)$.

        2.
        反证法，假设$\alpha$和$A\alpha$线性相关，则存在不全为零的常数$k_1,k_2$使得$k_1\alpha+k_2A\alpha=0$. 显然$k_2\neq 0$，因为假设$k_2=0$，则$k_1\alpha=0$，由于$\alpha\neq 0$，故$k_1=0$，这与$k_1,k_2$不全为0矛盾. 因此我们有$A\alpha=-\dfrac{k_1}{k_2}\alpha$，即$\alpha$是$A$的特征向量，这与题设矛盾，因此$\alpha$和$A\alpha$线性无关.

        由题意，$A^2\alpha-3A\alpha+2\alpha=0$，即$(A^2-3A+2E)\alpha=0$，又$\alpha\neq 0$，因此$A^2-3A+2E$不可逆，从而$|A^2-3A+2E|=|E-A||2E-A|=0$，故$|E-A|=0$或$|2E-A|=0$.

        若$|E-A|\neq 0$，则$E-A$可逆，因此$(A^2-3A+2E)\alpha=(E-A)((2E-A)\alpha)=0$可知$(2E-A)\alpha=0$，即$A\alpha=2\alpha$，故$\alpha$为$A$的特征向量，这与条件矛盾，因此$|E-A|=0$. 同理，$|2E-A|=0$，因此$A$有两个特征值1和2，又$A$是2阶矩阵，因此由\autoref{cor:可对角化必要条件} 可知$A$一定可对角化，且对角矩阵为$\begin{pmatrix}
                      1 & 0 \\
                      0 & 2
                  \end{pmatrix}$.



!!!question "若当矩阵不可对角化"
     证明$r$阶上三角矩阵$(r>1)$
    
    \[J_0=\begin{pmatrix}
            \lambda_0 & 1         &        &           \\
                      & \lambda_0 & \ddots &           \\
                      &           & \ddots & 1         \\
                      &           &        & \lambda_0
        \end{pmatrix}\]
    
    不与对角阵相似.

    ???Answer
        首先求出特征多项式为$f(\lambda)=|\lambda E-J_0|=(\lambda-\lambda_0)^r$，因此$J_0$只有一个特征值$\lambda_0$，且代数重数为$r$.

        接下来求几何重数，即$J_0X=\lambda_0X$的解空间维数，即$(\lambda_0 E-J_0)X=O$的解空间维数，事实上由于$r(\lambda_0 E-J_0)=r-1$，因此解空间维数为$r-(r-1)=1$，即几何重数为$1<r$，因此不可对角化



!!!question "AB=BA"

    设 \( A, B \in M_n(\mathbf{F}) \), \( AB = BA \), 证明：

    1. 若 \( X \) 是矩阵 \( A \) 属于特征值 \( \lambda_0 \) 的特征向量，则 \( BX \in V_{\lambda_0} \).
    2. \( A \) 和 \( B \) 至少有一个共同的特征向量.
    3. \( A \) 有 \( n \) 个不同的特征值则
      1. \( AB = BA \) 当且仅当 \( A \) 的特征向量也是 \( B \) 的特征向量.
      2. 存在次数小于等于 \( n-1 \) 的多项式 \( f(x) \) 使得 \( B = f(A) \).
    4. 若 \( A, B \) 均可对角化，则对角化的过渡矩阵可以相同（同时对角化）.
    5. \( A, B \) 可以同时上三角化，即存在可逆矩阵 \( P \) 使得 \( P^{-1}AP \) 和 \( P^{-1}BP \) 都是上三角矩阵.

    设 \( n \) 阶方阵 \( A \) 和 \( B \) 都可对角化，并且它们有相同的特征子空间（但不一定有相同的特征值），证明 \( AB = BA \).




## 习题

- 设$A$为n阶复方阵,$P$为可逆矩阵。证明$tr(A)=tr(P^{-1}AP)$

- 已知$A$为3阶矩阵，特征值为1，2，3;求$|A^2+4A+E|$


- 证明:若$A^2-(\lambda_1+\lambda_2)A+\lambda_1 \lambda_2 E = O,\lambda_1 \neq \lambda_2$,则$A$可对角化(Hint:矩阵方程可对角化条件),并判断以下说法说法哪一个正确

     - $A$的特征值兼有一定兼有$\lambda_1$和$\lambda_2$
     - $A$可对角化，但其特征值不一定同时有$\lambda_1$和$\lambda_2$,可能为$\lambda_1$和$\lambda_1$,$\lambda_2$和$\lambda_2$,或者$\lambda_1$和$\lambda_2$

- 证明秩为1的向量可以写为$\alpha^\mathrm{T}\beta$,(回忆相抵标准型~)

- 设 $\alpha$ 为 $n$ 维实向量且 $\alpha^\mathrm{T} \alpha =1$,求矩阵$I-\alpha \alpha^\mathrm{T}$的特征值(Hint: 特征多项式展开)

- $A,B$都是$n$阶矩阵，证明$AB+B$与$BA+B$有相同的特征值.(Hint:证明相似)

- 判断并证明：$n$阶方阵$A$满足$A^2-5A+5E_n=0$，则对于所有的有理数$r$,有$A+rE_n$可逆



- 记 

\[
    X = \left\{ \begin{pmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{pmatrix} \in M_{3 \times 3}(\mathbb{R}) \ \middle| \ \sum_{j=1}^{3} a_{1j} = \sum_{j=1}^{3} a_{2j} = \sum_{j=1}^{3} a_{3j} = \sum_{i=1}^{3} a_{ij} \right\}.
\]

证明：

1. $X$ 是 $M_{3 \times 3}(\mathbb{R})$ 的一个子空间，并求该子空间的维数；
2. 对任意可逆矩阵 $A \in X$，$(1, 1, 1)^\mathrm{T}$ 是 $A$ 和 $A^{-1}$ 的特征向量；
3. 对任意可逆矩阵 $A \in X$，$A^{-1} \in X$。




    

    
