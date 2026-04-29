---
comments: true
---

# 随机变量与随机向量

## 随机变量

### 随机变量的概念

!!! info "随机变量"
    定义概率空间 $(\Omega, \mathcal{F}, P)$ 上的单值实函数 $\xi(\omega)$，即

    $$
    \xi: \Omega\to \mathbb R
    $$

    还要求 $\xi(\omega)$ 的任意取值组合对应的样本点集合构成的事件在事件域 $\mathcal{F}$ 中，这样就可以称 $\xi(\omega)$ 为 **随机变量 (random variable)**

    即将$\xi$看成一个函数，我们希望它的值域集合$A(\in R)$也满足事件的运算，所以要求它是博雷尔集,落在博雷尔域$\mathcal{B}$中，即从事件域$\mathcal{F}$到事件域的映射，由于原$\Omega$中的样本点映射到了$\mathbb R$中，所以映射之后的事件域称为波列尔域$\mathcal{B}$


### 离散型随机变量

离散型随机变量：随机变量 $\xi$ 可取的值至多可列个。

!!! info "分布列 (distribution sequence)"
    $$
    \left[
    \begin{matrix}
    x_1&x_2&\cdots&x_n&\cdots\\
    p(x_1)&p(x_2)&\cdots&p(x_n)&\cdots
    \end{matrix}
    \right]
    $$

第一行是 $\xi$ 可能取的值，第二行是 $\xi$ 取这些值的概率。

!!! abstract "分布列的性质"
    - 正性，即

    $$
    p(x_i)>0,i=1,2\cdots
    $$

    - 规范性，即

    $$
    \sum_{i=1}^\infty p(x_i)=1
    $$

!!! example "Examples"
    对一些常见离散型随机变量举例如下：

    === "退化分布"
        即 degenerate distribution

        $$
        \left[
        \begin{matrix}
        c\\
        1
        \end{matrix}
        \right]
        $$

        即样本空间的所有点都映射到一个确定的实数上，概率为1

    === "两点分布"
        即 **伯努利分布** ，Bernoulli distribution

        $$
        \left[
        \begin{matrix}
        1&0\\
        p&1-p
        \end{matrix}
        \right],p\in (0,1)
        $$

    === "二项分布"
        即 binomial distribution

        $$
        P(\xi=k)=\begin{pmatrix}
            n\\k
        \end{pmatrix}
        p^k(1-p)^{n-k},p\in (0,1),k=0,1,\cdots,n
        $$

        记为 $\xi\sim B(n,p)$

    === "泊松分布"
        即 Poisson distribution
       
        $$
        P(\xi=k)=\frac{\lambda^k}{k!}e^{-\lambda}
        ,\lambda>0,k\in \mathbb N
        $$

        记为 $\xi\sim\mathcal{P}(\lambda)$
        
        对于二项分布，当 $n\to\infty,np=\lambda$ 时，二项分布趋近于泊松分布。
        
        \begin{align*}
        \lim_{n\to\infty}\begin{pmatrix}
            n\\k
        \end{pmatrix}p^k(1-p)^{n-k}&=\frac{1}{k!}n(n-1)\cdots(n-k+1)\frac{1}{n^k}(np)^k(1-\frac{np}{n})^{n-k}\\
        &=\frac{\lambda^k}{k!}(1-\frac{1}{n})\cdots(1-\frac{k-1}{n})e^{-\lambda}\\
        &=\frac{\lambda^k}{k!}e^{-\lambda}\\
        \end{align*}
        
        !!!Note
            其中 $\lambda=np$ 是泊松分布的参数，也是它的数学期望；
            因为
            
            \begin{align*}
                E_{\xi\sim P(\lambda)}(\xi)&=\sum_{k=0}^\infty k\frac{\lambda^k}{k!}e^{-\lambda}\\
                &=\lambda\sum_{k=1}^\infty\frac{\lambda^{k-1}}{(k-1)!}e^{-\lambda}\\
                &=\lambda e^{\lambda}e^{-\lambda}\\
                &=\lambda
            \end{align*}

    === "几何分布"
        即 geometry distribution,一般用于解决第一次成功的问题

        $$
        P(\xi=k)=p(1-p)^{k-1},p\in (0,1),k\in \mathbb{N}_+
        $$

    === "超几何分布"
        即 hypergeometry distribution，一般用于解决次品抽样问题 

        $$
        P(\xi=k)=\frac{\displaystyle
        \begin{pmatrix}
            M\\k
        \end{pmatrix}
        \begin{pmatrix}
            N-M\\n-k
        \end{pmatrix}
            }{\displaystyle
        \begin{pmatrix}
            N\\n
        \end{pmatrix}}
        ,n\leqslant N,M\leqslant N,k=0,1,\cdots, \min\{n,M\}
        $$

## 分布函数与连续型随机变量

离散型随机变量是用分布列来描述的，而对于某些情况，例如随机变量可以在某一个区间内取任意值，这个时候就不存在分布列，需要引入新的描述方法来描述概率分布，并且我们希望这个描述方法能够对一切的随机变量都适用。

!!!Definition "分布函数"
    设 $\xi$ 是一个随机变量，对任意实数 $x$，定义函数 $F(x)$ 为

    $$
    F(x)=P(\xi \leqslant x)
    $$

    这个函数称为 $\xi$ 的 **分布函数 (distribution function)**
    对于给定的随机变量 $\xi$，其分布函数是唯一的，它是实变量 $x$ 的函数，且满足：
    !!!Property "性质"
        - 有界性：作为事件的概率自然有 $0\leqslant F(x)\leqslant 1$
        - 单调不减性：$x_1<x_2\Rightarrow F(x_1)\leqslant F(x_2)$
       
        - 作为一个有界的单调不减函数 $F(-\infty)=0$, $F(+\infty)=1$
        - 右连续性：$\lim_{x\to x_0+0}F(x)=F(x_0)$，左极限存在$\lim_{x\to x_0-0}F(x)=F(x_0)$
        - 在有些教材中  
        
        $$F(x)=P(\xi < x)$$
        
        此时 $F(x)$要求左连续,右极限存在
    
    ???Note 各种随机变量的分布函数
        - 对于离散型随机变量，其分布函数是阶梯函数
        - 对于连续型随机变量，其分布函数是连续函数，采用密度函数积分来计算
        - 只要函数值大于0，且整个定义域积分为1，就可以叫做密度函数
        

### 正态分布

!!!Definition
    若随机变量 $\xi$ 的分布函数为

    $$
    F(x)=\frac{1}{\sqrt{2\pi}\sigma}\int_{-\infty}^x e^{-\frac{(t-\mu)^2}{2\sigma^2}}dt
    $$

    其中 $\mu$ 和 $\sigma$ 是常数，且 $\sigma>0$，则称 $\xi$ 服从参数为 $\mu$ 和 $\sigma$ 的 **正态分布 (normal distribution)**，记为 $\xi\sim N(\mu,\sigma^2)$

    正态分布的密度函数为

    $$
    f(x)=\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(x-\mu)^2}{2\sigma^2}}
    $$

    正态分布是最重要的分布之一，它的密度函数是一个钟形曲线，且具有以下性质：
    !!!Property
        - 期望值：$E(\xi)=\mu$
        - 方差：$D(\xi)=\sigma^2$
        - 正态分布的密度函数是关于 $\mu$ 对称的，即 $f(x)=f(2\mu-x)$
    
    !!!section "标准正态分布"
        若 $\xi\sim N(0,1)$，则称 $\xi$ 服从 **标准正态分布 (standard normal distribution)**，记为 $\xi\sim N(0,1)$

        此时 $\mu=0$，$\sigma=1$，其密度函数为

        $$
        f(x)=\frac{1}{\sqrt{2\pi}}e^{-\frac{x^2}{2}}
        $$

        如果$x$不是标准正态分布，则可以通过

        \[
            \eta = \dfrac{x - \mu}{ \sigma} 
        \]

        将其变为 $\eta$ ,标准分布


虽然标准正态分布的显式分布函数求不出来，但是可以通过查表得到其值

!!!Note "3 $\sigma$ 原则"
    \[
    0.6827 \quad 0.9545 \quad 0.9973
    \]




### 离散型随机向量



给定概率空间 \((\Omega, A, P)\)，\((X, Y)\) 是 2-随机向量。

假设 \(X\) 取值为 \(x_1, x_2, \dots\)，\(Y\) 取值为 \(y_1, y_2, \dots\)。那么称 \((X, Y)\) 为离散型随机向量。

记

\[
p_{ij} = P(X = x_i, Y = y_j), \quad i, j = 1, 2, \dots
\]

满足

\[
p_{ij} \geq 0, \quad \sum_{i,j} p_{ij} = 1
\]

称

\[
\left( (x_i, y_j), p_{ij} \right)_{i,j=1}^{\infty}
\]

为随机向量 \((X, Y)\) 的联合分布。




对于任意 Borel 集合 \( A, B \),

\[
P(X \in A, Y \in B) = \sum_{i: x_i \in A, j: y_j \in B} p_{ij}
\]

特别地，

\[
P(X \leq x, Y \leq y) = \sum_{i: x_i \leq x, j: y_j \leq y} p_{ij}
\]

#### 边际分布

\( X, Y \) 的分布可以由 \( p_{ij} \) 计算得到

\[
X \sim \begin{pmatrix} x_1 & x_2 & \dots & x_i & \dots \\ p_1. & p_2. & \dots & p_i. & \dots \end{pmatrix}
\]

其中

\[
p_{i.} = \sum_{j=1}^{\infty} p_{ij}, \quad p_{i.} \geq 0, \quad \sum_{i=1}^{\infty} p_{i.} = 1
\]

类似地，

\[
Y \sim \begin{pmatrix} y_1 & y_2 & \dots & y_j & \dots \\ p_{.1} & p_{.2} & \dots & p_{.j} & \dots \end{pmatrix}
\]

其中

\[
p_{.j} = \sum_{i=1}^{\infty} p_{ij}, \quad p_{.j} \geq 0, \quad \sum_{j=1}^{\infty} p_{.j} = 1
\]


!!!Warning
    边际分布由联合分布唯一确定，但是反过来不一定成立。因为加起来等于一个值并不能确定分开的每一个值



### 条件概率与条件分布

对于固定的 \( x_i, y_j \)，我们得到

\[
P(Y = y_j | X = x_i) = \frac{P(X = x_i, Y = y_j)}{P(X = x_i)} = \frac{p_{ij}}{p_i}
\]

如果 \( x_i, y_j \) 变化，那么我们可以得到条件分布：

给定 \( X = x_i \) 的条件下，\( Y \) 可取值 \( y_1, y_2, \dots, y_j, \dots \) 时，概率分别为

\[
P(Y = y_j | X = x_i) = \frac{p_{ij}}{p_i}
\]

#### 条件分布列

\[
Y | (X = x_i) \sim \begin{pmatrix} y_1 & y_2 & \dots & y_j & \dots \\ \frac{p_{i1}}{p_i} & \frac{p_{i2}}{p_i} & \dots & \frac{p_{ij}}{p_i} & \dots \end{pmatrix}
\]

同理也可以得到 $X|Y$ 的条件分布

!!!Note
    方便起见，这里把 $P_{i.}$ 记为 $P_i$

### 连续性随机向量



给定概率空间 \((\Omega, A, P)\)，\((X, Y)\) 是其上的随机向量。如果存在 \(p(x, y)\) 使得

\[ 
p(x, y) \geq 0, \quad \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} p(x, y) dx dy = 1 
\]

并且对任意 Borel 集 \(A, B \subset \mathbb{R}\),

\[ 
P(X \in A, Y \in B) = \int_A \int_B p(u, v) du dv 
\]

那么称 \((X, Y)\) 是连续型随机向量，具有密度函数 \(p(x, y)\)。

特别，对任意 \(x, y \in \mathbb{R}\)

\[ 
P(X \leq x, Y \leq y) = \int_{-\infty}^x \int_{-\infty}^y p(u, v) du dv 
\]

#### 连续型的边际分布

显然，如果 \((X, Y)\) 是连续型随机向量，那么 \(X, Y\) 都是连续型随机变量。并且，

\[ 
X \sim p_X(x), \quad Y \sim p_Y(y) 
\]

其中

\[ 
p_X(x) = \int_{-\infty}^{\infty} p(x, y) dy, \quad p_Y(y) = \int_{-\infty}^{\infty} p(x, y) dx 
\]

同样，联合分布惟一决定边际分布，边际分布不能决定联合分布。

#### 连续型的条件分布

与离散型的类似；连续型的条件分布的密度函数就是在原来的基础上分母变为对应确定变量的边际函数某点的值；更详细地说:


假设 \((X, Y)\) 是连续型随机向量，具有联合密度函数 \(p(x, y)\)，下面讨论条件分布

给定 \(X = x\)，求 \(Y\) 的分布？

即 \(P(Y \leq y | X = x)\)

注意 \(P(X = x) = 0\)，我们采用

\[ 
P(Y \leq y | X = x) = \lim_{\varepsilon \to 0} P(Y \leq y | x - \varepsilon < X \leq x + \varepsilon) 
\]

\[
P(Y \leq y | X = x) = \lim_{\varepsilon \to 0} \frac{P(Y \leq y, x - \varepsilon < X \leq x + \varepsilon)}{P(x - \varepsilon < X \leq x + \varepsilon)}
\]

\[
= \lim_{\varepsilon \to 0} \frac{\int_{x-\varepsilon}^{x+\varepsilon} \int_{-\infty}^{y} p(u, v) \, dv \, du / (2 \varepsilon)}{\int_{x-\varepsilon}^{x+\varepsilon} p_X(u) \, du / (2\varepsilon)}
\]

\[
= \frac{\int_{-\infty}^{y} p(x, v) \, dv}{p_X(x)}
\]

给定 \(X = x\) 下，\(Y\) 具有密度函数

\[
p_{Y|X}(y|x) = \frac{p(x, y)}{p_X(x)}
\]

!!!key-point
    推导过程中上下同时除以 $2\varepsilon$ 是为了使用拉格朗日中值定理
    即

    \[
        F(x+\varepsilon)-F(x-\varepsilon) = F'(\xi)2\varepsilon
    \]



!!!example "联合正态分布"
    如果随机向量 \((X, Y)\) 具有密度函数：\(\forall x, y \in \mathbb{R}\)

    \[
    p(x, y) = \frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}} e^{-\frac{1}{2(1-\rho^2)}\left(\frac{(x-\mu_1)^2}{\sigma_1^2} - \frac{2\rho(x-\mu_1)(y-\mu_2)}{\sigma_1\sigma_2} + \frac{(y-\mu_2)^2}{\sigma_2^2}\right)}
    \]

    那么称 \((X, Y)\) 服从二维联合正态分布，\(\mu_1, \mu_2, \sigma_1^2, \sigma_2^2, \rho\) 为参数。简记

    \[
    (X, Y) \sim \mathcal{N}(\mu_1, \sigma_1^2, \mu_2, \sigma_2^2; \rho)
    \]

    验证 \(p(x, y)\) 确实是密度函数

    \[
    \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} \frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}} e^{-\frac{1}{2(1-\rho^2)}\left[\frac{x^2}{\sigma_1^2} - \frac{2\rho xy}{\sigma_1\sigma_2} + \frac{y^2}{\sigma_2^2}\right]} dxdy = 1
    \]

    经过变换：\(u = \frac{x-\mu_1}{\sigma_1}, v = \frac{y-\mu_2}{\sigma_2}\)，等价于

    \[
    \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} \frac{1}{2\pi\sqrt{1-\rho^2}} e^{-\frac{1}{2(1-\rho^2)}[u^2 - 2\rho uv + v^2]} dudv = 1
    \]

    左边进行配方，得

    \[
    = \int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi}} e^{-v^2/2} \left( \int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi(1-\rho^2)}} e^{-\frac{1}{2(1-\rho^2)}(u-\rho v)^2} du \right) dv
    \]

    \[
    = \int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi}} e^{-v^2/2} dv = 1
    \]
    
    !!!idea 
        这里利用了标准正态分布的性质，即

        \[
        \int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi}} e^{-v^2/2} dv = 1
        \]


    !!!property "联合正态分布的边际分布"
        $p_X(x)$ 和 $p_Y(y)$ 都是正态分布

        假设 \((X, Y) \sim \mathcal{N}(\mu_1, \sigma_1^2, \mu_2, \sigma_2^2; \rho)\)，求 \(X, Y\) 的边际分布？

        \[ 
        X \sim p_X(x) 
        \]

        \[
        p_X(x) = \int_{-\infty}^{\infty} p(x, y) \, dy
        \]

        \[
        = \int_{-\infty}^{\infty} \frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}} e^{-\frac{1}{2(1-\rho^2)}\left[\frac{(x-\mu_1)^2}{\sigma_1^2} - \frac{2\rho(x-\mu_1)(y-\mu_2)}{\sigma_1\sigma_2} + \frac{(y-\mu_2)^2}{\sigma_2^2}\right]} \, dy
        \]

        进行配方，得

        令 \(z = y - \mu_2\)，则

        \[
        p_X(x) = \int_{-\infty}^{\infty} \frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}} e^{-\frac{1}{2(1-\rho^2)}\left[\frac{(x-\mu_1)^2}{\sigma_1^2} - \frac{2\rho(x-\mu_1)z}{\sigma_1\sigma_2} + \frac{z^2}{\sigma_2^2}\right]} \, dz
        \]

        将指数部分进行配方，得

        \[
        -\frac{1}{2(1-\rho^2)}\left[\frac{(x-\mu_1)^2}{\sigma_1^2} - \frac{2\rho(x-\mu_1)z}{\sigma_1\sigma_2} + \frac{z^2}{\sigma_2^2}\right] = -\frac{(x-\mu_1)^2}{2\sigma_1^2} - \frac{z^2 - 2\rho(x-\mu_1)z\sigma_2/\sigma_1 + \rho^2(x-\mu_1)^2\sigma_2^2/\sigma_1^2}{2\sigma_2^2(1-\rho^2)}
        \]

        \[
        = -\frac{(x-\mu_1)^2}{2\sigma_1^2} - \frac{(z - \rho(x-\mu_1)\sigma_2/\sigma_1)^2}{2\sigma_2^2(1-\rho^2)}
        \]

        因此，

        \[
        p_X(x) = \frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}} e^{-\frac{(x-\mu_1)^2}{2\sigma_1^2}} \int_{-\infty}^{\infty} e^{-\frac{(z - \rho(x-\mu_1)\sigma_2/\sigma_1)^2}{2\sigma_2^2(1-\rho^2)}} \, dz
        \]

        由于

        \[
        \int_{-\infty}^{\infty} e^{-\frac{(z - \rho(x-\mu_1)\sigma_2/\sigma_1)^2}{2\sigma_2^2(1-\rho^2)}} \, dz = \sqrt{2\pi\sigma_2^2(1-\rho^2)}
        \]

        所以

        \[
        p_X(x) = \frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}} e^{-\frac{(x-\mu_1)^2}{2\sigma_1^2}} \cdot \sqrt{2\pi\sigma_2^2(1-\rho^2)}
        \]

        \[
        = \frac{1}{\sqrt{2\pi}\sigma_1} e^{-\frac{(x-\mu_1)^2}{2\sigma_1^2}}
        \]

        因此，

        \[
        X \sim \mathcal{N}(\mu_1, \sigma_1^2)
        \]

    当 $\rho = 0$ 时，$X, Y$ 独立



对于一般的随机向量，有可能其既没有分布列，也没有密度函数，此时主要用其分布函数来描述。
    

### 独立性

对于联合分布，如果 $p(x,y)=p_X(x)p_Y(y)$，则称 $X$ 和 $Y$ 独立。

或者 $F(x,y)=F_X(x)F_Y(y)$

或者对于任意波雷尔集$A,B$

\[
    P( X \in A,Y \in B)=P(X \in A)P(Y \in B)
\]

一般最后一个是很好用的，可以用来证明$f(X),g(Y)$是独立的，(运用原像集也是博雷尔集的性质)


### 二元分布函数的性质

!!!property "二元分布函数的性质"
    - \(F(-\infty, y) = 0\), \(F(x, -\infty) = 0\), \(F(\infty, \infty) = 1\)
    - \(F(x, y)\) 关于 \(x\) 和 \(y\) 非减
    - \(F(x, y)\) 关于 \(x\) 和 \(y\) 右连续，左极限存在

    \[
        P(a < X \leqslant b, c < Y \leqslant d) = F(a,c)+F(b,d)-F(a,d)-F(b,c)
    \]

    可以从积分区域的角度理解


$F_X(x) = F(x, \infty)$

$F_Y(y) = F(\infty, y)$


### 条件分布

假设 \((X, Y)\) 具有分布函数 \(F(x, y)\)，那么给定 \(X = x\)，\(Y\) 的条件分布函数为

\[
P(Y \leqslant y | X = x) = \lim_{\varepsilon \to 0} P(Y \leqslant y | x - \varepsilon < X \leqslant x + \varepsilon)
\]

\[
= \lim_{\varepsilon \to 0} \frac{F(x + \varepsilon, y) - F(x - \varepsilon, y)}{F_X(x + \varepsilon) - F_X(x - \varepsilon)}
\]

类似地，

\[
P(X \leqslant x | Y = y) = \lim_{\varepsilon \to 0} P(X \leqslant x | y - \varepsilon < Y \leqslant y + \varepsilon)
\]

\[
= \lim_{\varepsilon \to 0} \frac{F(x, y + \varepsilon) - F(x, y - \varepsilon)}{F_Y(y + \varepsilon) - F_Y(y - \varepsilon)}
\]


### 多维随机向量

- 多维随机向量

假设 \((\Omega, \mathcal{A}, P)\) 是给定的概率空间，

\[
\mathbf{X} = (X_1, X_2, \cdots, X_m) : \Omega \mapsto \mathbb{R}^m
\]

如果对任意 Borel 集 \(B \subset \mathbb{R}^m\),

\[
\{\omega : \mathbf{X}(\omega) \in B\} \in \mathcal{A}
\]

!!!Note
    这里指的是经过随机向量的映射后仍属于博雷尔集的样本点的集合仍在事件域中

那么称 \(\mathbf{X}\) 为 \(m\)-维随机向量

- \(m\)-元联合分布函数

假设 \(\mathbf{X} = (X_1, X_2, \cdots, X_m)\) 是 \(m\)-维随机向量，其联合分布函数为

\[
F_{\mathbf{X}}(\mathbf{x}) = P(X_1 \leq x_1, \cdots, X_m \leq x_m)
\]

其中 \(\mathbf{x} = (x_1, \cdots, x_m)\).

- 边际分布

\(X_i\) 的边际分布为

\[
F_{X_i}(x_i) = P(X_i \leq x_i)
\]

- 独立随机变量

假设 \(\mathbf{X} = (X_1, X_2, \cdots, X_m)\) 是 \(m\)-维随机向量，其联合分布函数为 \(F_{\mathbf{X}}(x)\)，边际分布为 \(F_{X_i}(x_i), i = 1, \cdots, m\)。如果

\[
F_{\mathbf{X}}(\mathbf{x}) = \prod_{i=1}^{m} F_{X_i}(x_i), \quad \forall \mathbf{x} = (x_1, \cdots, x_m)
\]

那么称 \(X_1, X_2, \cdots, X_m\) 相互独立。

- 注：如果 \(X_1, X_2, \cdots, X_m\) 相互独立，那么

1. \((X_{i_1}, X_{i_2}, \cdots, X_{i_k}), k \leq m\) 相互独立
2. \(f_1(X_1), f_2(X_2), \cdots, f_m(X_m)\) 相互独立
3. \(f(X_{i_1}, X_{i_2}, \cdots, X_{i_k}), g(X_{j_1}, X_{j_2}, \cdots, X_{j_l})\) 分别是 \(k\) 元和 \(l\) 元 Borel 可测函数，且 \(A \cap B = \emptyset\)。如果 \(A, B \subset \{1, 2, \cdots, m\}, |A| = k, |B| = l\)，并且 \(A \cap B = \emptyset\)，那么 \(f(X_i, i \in A)\) 和 \(g(X_i, i \in B)\) 相互独立。


### 随机变量的映射

对于常见的函数$f$,$Y=f(X)$,如果$X$是随机变量，我们为了要求$Y$是随机变量，需要满足$f$是Borel可测函数，即对于任意Borel集$B$，$f^{-1}(B)$也是Borel集,对于一维的情况，主要有以下两种方法来计算Y的分布

!!!section "计算Y的分布"
    === "离散型随机变量"
        此时$Y$也是离散型随机变量;根据 $X$ 的取值，可以得到 $Y$ 的取值，然后根据 $X$ 的分布列，可以得到 $Y$ 的分布列,
        
        $$P(Y=y_i)=P(X=x_i,j\dots,k),f(X=x_i,j\dots,k)=y_i$$

    
    === "连续型随机变量"
        此时$Y$不一定是连续型随机变量，没有统一的计算公式，但是 **一般可以先求出$Y$的分布函数，然后求导得到密度函数**



### 随机向量的映射

(连续型)随机向量的映射有时候不仅仅是对于一个结果函数的映射，也有对于一个向量的映射，我们依次考虑

!!!Section "求像的分布"

    === "映射到单元" 
    假设 $(\xi_1,\xi_2,\ldots,\xi_i)$是连续型随机向量，具有联合密度函数$p(x_1,x_2,\ldots,x_i)$，变换如下：

    \[
       \eta = f(\xi_1,\xi_2,\ldots,\xi_i)
    \]

    那么$\eta$的分布函数可以由以下公式得到

    \begin{align*}
       F_{\eta}(y) = P(\eta \leq y) &= P(f(\xi_1,\xi_2,\ldots,\xi_i) \leq y)\\
                   &= \int \cdots \int_{f(\xi_1,\xi_2,\ldots,\xi_i) \leq y} p(x_1,x_2,\ldots,x_i)dx_1dx_2\ldots dx_i
    \end{align*}
    
    !!!Example "值得注意的例子"
        ===  "$\eta=\xi_1+\xi_2$"
            如果$\xi_1,\xi_2$是连续型随机变量，那么$\eta=\xi_1+\xi_2$的分布函数为

            \[
            F_{\eta}(y) = \int_{-\infty}^{\infty} dx_1\int_{-\infty}^{y-x_1} p(x_1,x_2)dx_2
            \]

            $x_2=z-x_1$，则

            \[
            F_{\eta}(y) = \int_{-\infty}^{\infty} dx_1\int_{-\infty}^{y} p(x_1,z-x_1)dz
            \]

            再交换次序(此时积分区域为矩形，所以我们才可以可以交换次序)

            \[
            F_{\eta}(y) = \int_{-\infty}^{y} dz\int_{-\infty}^{\infty} p(x_1,z-x_1)dx_1
            \]

            所以我们得到密度函数

            \[
            p_{\eta}(y) = \int_{-\infty}^{\infty} p(x_1,y-x_1)dx_1
            \]

            若$\xi_1,\xi_2$相互独立，那么

            \[
            p_{\eta}(y) = \int_{-\infty}^{\infty} p_{\xi_1}(x_1)p_{\xi_2}(y-x_1)dx_1
            \]

            积分区域画图看

        === "$\eta=\xi_1\xi_2$"
            \[
            F_Z(z) = \int_{(x, y) : xy \leq z} p(x, y) \, dx \, dy
            \]

            \[
            = \int_{-\infty}^0 \int_{z/x}^{\infty} p(x, y) \, dy \, dx + \int_0^{\infty} \int_{-\infty}^{z/x} p(x, y) \, dy \, dx
            \]

            \[
            = -\int_{\infty}^z \int_{-\infty}^0 \frac{1}{x} p\left(x, \frac{u}{x}\right) \, dx \, du + \int_0^{\infty} \int_0^z \frac{1}{x} p\left(x, \frac{u}{x}\right) \, dx \, du
            \]


            \[
            p_Z(z) = -\int_{-\infty}^0 \frac{1}{x} p\left(x, \frac{z}{x}\right) \, dx + \int_0^{\infty} \frac{1}{x} p\left(x, \frac{z}{x}\right) \, dx
            \]

            \[
            = \int_{-\infty}^{\infty} \frac{1}{|x|} p\left(x, \frac{z}{x}\right) \, dx
            \]

            推导过程中不管$z$是正还是负，积分区域总能这样划分

        
        === "$\eta=\dfrac{\xi_1}{\xi_2}$"
            \[
            F_{\eta}(y) = P \left( \frac{\xi_1}{\xi_2} \leq y \right) = \iint_{x_1 / x_2 \leq y} p(x_1, x_2) \, dx_1 \, dx_2
            \]

            \[
            = \int_{-\infty}^0 \int_{y x_2}^{\infty} p(x_1, x_2) \, dx_1 \, dx_2 + \int_0^{\infty} \int_{-\infty}^{y x_2} p(x_1, x_2) \, dx_1 \, dx_2
            \]

            令 \( x_1 = z x_2 \)，并交换积分次序，得

            \[
            F_{\eta}(y) = \int_{-\infty}^y \int_{-\infty}^{\infty} p(z x_2, x_2) x_2 \, dx_2 \, dz = \int_{-\infty}^y p_{\eta}(z) \, dz
            \]

            这说明若 \( (\xi_1, \xi_2) \) 是连续型随机向量，则 \( \eta = \frac{\xi_1}{\xi_2} \) 是连续型随机变量，其密度函数为

            \[
            p_{\eta}(z) = \int_{-\infty}^{\infty} p(z x, x) |x| \, dx.
            \]

            推导过程中不管$y$是正还是负，积分区域总能这样划分

        === "次序统计量的分布"
            设 \( \xi_1, \xi_2, \dots, \xi_n \) 独立同分布，分布函数都为 \( F(x) \)。把 \( \xi_1, \xi_2, \dots, \xi_n \) 每取一组值 \( \xi_1(\omega), \xi_2(\omega), \dots, \xi_n(\omega) (\omega \in \Omega) \) 都按大小次序排列，所得随机变量 \( \xi_{(1)}, \xi_{(2)}, \dots, \xi_{(n)} \) 称为 **次序统计量**  (order statistics)，它们满足 \( \xi_{(1)} \leq \xi_{(2)} \leq \dots \leq \xi_{(n)} \)。按定义，\( \xi_{(1)} = \min(\xi_1, \xi_2, \dots, \xi_n) \)，\( \xi_{(n)} = \max(\xi_1, \xi_2, \dots, \xi_n) \)。

            现在来求 \( \xi_{(1)}, \xi_{(n)} \) 及 \( (\xi_{(1)}, \xi_{(n)}) \) 的分布，这在数理统计中是有用的。

            ???Property "极值随机变量"
                $\xi_{(1)}$是最小值，$\xi_{(n)}$是最大值,$\xi_{(k)}$是第k小值

            1. **\( \xi_{(n)} \) 的分布函数**

                \[
                  P(\xi_{(n)} \leq x) = P(\xi_1 \leq x, \xi_2 \leq x, \dots, \xi_n \leq x)
                \]

                \[
                  = P(\xi_1 \leq x) P(\xi_2 \leq x) \cdots P(\xi_n \leq x)
                \]

                \[
                  = [F(x)]^n.
                \]

            2. **\( \xi_{(1)} \) 的分布函数**

                先考虑 \( \{\xi_{(1)} \leq x\} \) 的逆事件 \( \{\xi_{(1)} > x\} \)，

                \[
                  P(\xi_{(1)} > x) = P(\xi_1 > x, \xi_2 > x, \dots, \xi_n > x)
                \]

                \[
                  = P(\xi_1 > x) P(\xi_2 > x) \cdots P(\xi_n > x)
                \]

                \[
                  = [1 - F(x)]^n.
                \]

                故

                \[
                  P(\xi_{(1)} \leq x) = 1 - [1 - F(x)]^n.
                \]


            3. **\( (\xi_{(1)}, \xi_{(n)}) \) 的联合分布函数**

                \[
                  F(x, y) = P(\xi_{(1)} \leq x, \xi_{(n)} \leq y)
                \]

                \[
                  = P(\xi_{(n)} \leq y) - P(\xi_{(1)} > x, \xi_{(n)} \leq y)
                \]

                \[
                  = [F(y)]^n - P \left( \bigcap_{i=1}^n (x < \xi_i \leq y) \right).
                \]

                因此当 \( x < y \) 时，

                \[
                  F(x, y) = [F(y)]^n - [F(y) - F(x)]^n.
                \]

                  当 \( x \geq y \) 时，

                \[
                  F(x, y) = [F(y)]^n.
                \]

                  如果 \( \xi_1, \dots, \xi_n \) 是连续型随机变量，有密度 \( p(x) = F'(x) \)，则上面各随机变量（向量）也是连续型的，可将各分布函数求导以得到密度函数。
            
            4.第k小值的密度函数
            
            \[
                p_{\xi_{(k)}}(x) = \frac{n!}{(k-1)!(n-k)!} [F(x)]^{k-1} [1-F(x)]^{n-k} f(x)
            \]
    
            其中$f(x)$是密度函数

            在前面有$k-1$个小于$x$的值,再挑一个在$x$领域的值，有$n-k$个大于$x$的值，让领域缩小，除以该领域就得到密度函数

            \[
                \lim_{\varepsilon \to 0} \frac{P(x \leqslant \xi_{(k)} \leqslant x + \varepsilon)}{\varepsilon} = p_{\xi_{(k)}}(x)
            \]

            如果是多个就多个小领域，然后除以小领域的长度
    
    !!!warning
        这种从负无穷积分到正无穷的写法只是形式上的，实际上我们要根据具体密度函数的取值来进一步判断积分区域


#### 多个值函数
我们仅考虑连续型随机向量的变换。

假设 \((X, Y)\) 为连续型随机向量，具有联合密度函数 \(p(X, Y)(x, y)\)。变换如下：

\[
\begin{cases}
U = f_1(X, Y) \\
V = f_2(X, Y)
\end{cases}
\]

求 \((U, V)\) 的分布？

- 基本方法

\[
\begin{align*}
P(U \leqslant u, V \leqslant v) &= P(f_1(X, Y) \leqslant u, f_2(X, Y) \leqslant v) \\
&= P((X, Y) \in \{(x, y) : f_1(x, y) \leqslant u, f_2(x, y) \leqslant v\}) \\
&= \int_{(x,y): f_1(x,y) \leqslant u, f_2(x,y) \leqslant v} p(x, y) \, dx \, dy
\end{align*}
\]

如果$f_1$和$f_2$可逆，那么

\[
\begin{cases}
X = f_1^{-1}(U, V) \\
Y = f_2^{-1}(U, V)
\end{cases}
\]

取Jacobian行列式

\[
J = \left| \begin{array}{cc} \frac{\partial f_1^{-1}(u, v)}{\partial u} & \frac{\partial f_1^{-1}(u, v)}{\partial v} \\ \frac{\partial f_2^{-1}(u, v)}{\partial u} & \frac{\partial f_2^{-1}(u, v)}{\partial v} \end{array} \right|
\]

那么

\[
    P(U \leqslant u', V \leqslant v') = \int_{(u,v): u \leqslant u', v \leqslant v'} p(f_1^{-1}(u,v), f_2^{-1}(u,v)) |J| \, du \, dv
\]

即

\[
    p(u, v) = p(f_1^{-1}(u,v), f_2^{-1}(u,v)) |J|
\]

!!!Key-Point
    $x,y$分别用$u,v$表示，再乘以雅克比行列式,可以推广到$n$维随机向量的情况：

    设 \((\xi_1, \ldots, \xi_n)\) 的密度函数为 \(p(x_1, \ldots, x_n)\). 现在有 \(m\) 个函数: \(\eta_1 = f_1(\xi_1, \ldots, \xi_n), \ldots, \eta_m = f_m(\xi_1, \ldots, \xi_n)\), 则 \((\eta_1, \ldots, \eta_m)\) 也是随机变量. 除了各边际分布外，还要求其联合分布. 例如 (2.67) 式，其联合分布函数为

    \[
    G(y_1, \ldots, y_m) = P(\eta_1 \leq y_1, \ldots, \eta_m \leq y_m) = \int \cdots \int p(x_1, \ldots, x_n) dx_1 \cdots dx_n, \tag{2.72}
    \]

    这里 \(D\) 是 \(n\) 维区域: \(\{(x_1, \ldots, x_n): f_1(x_1, \ldots, x_n) \leq y_1, \ldots, f_m(x_1, \ldots, x_n) \leq y_m\}\).

    如果 \(m = n, f_j, j = 1, \ldots, n\) 有唯一的反函数组: \(x_i = x_i(y_1, \ldots, y_n), i = 1, \ldots, n\), 且

    \[
    J = \frac{\partial(x_1, \ldots, x_n)}{\partial(y_1, \ldots, y_n)} \neq 0,
    \]

    则 \((\eta_1, \ldots, \eta_n)\) 是连续型随机变量. 当 \((y_1, \ldots, y_n) \in (f_1, \ldots, f_n)\) 的值域时，其密度为

    \[
    q(y_1, \ldots, y_n) = p(x_1(y_1, \ldots, y_n), \ldots, x_n(y_1, \ldots, y_n)) |J|, \tag{2.73}
    \]

    其他情况, \(q(y_1, \ldots, y_n) = 0\).




!!!Example
    !!!Property
        实际上，对于联合正态分布，我们可以设

        \[
            \boldsymbol{X} =(x,y), \boldsymbol{\mu} =(\mu_1,\mu_2)
        \]

        \[
        \Sigma = \begin{pmatrix} \sigma_1^2 & \rho\sigma_1\sigma_2 \\ \rho\sigma_1\sigma_2 & \sigma_2^2 \end{pmatrix}
        \]
        
        \[
            \Sigma^{-1} =A \begin{pmatrix} \dfrac{1}{\sigma_1^2} & -\dfrac{\rho}{\sigma_1\sigma_2} \\ -\dfrac{\rho}{\sigma_1\sigma_2} & \dfrac{1}{\sigma_2^2} \end{pmatrix}
        \]

        其中A为\(\dfrac{1}{1-\rho^2}\)的一个数乘矩阵

        那么联合正态分布的密度函数为

        \[
        p(X, Y)(x, y) = \frac{1}{2\pi |\Sigma|^{\frac{1}{2}}} e^{-\frac{1}{2} (\mathbf{x} - \boldsymbol{\mu})^{\mathrm{T}} \Sigma^{-1} (\mathbf{x} - \boldsymbol{\mu})}
        \]

    
    设 

    \[
    \begin{pmatrix}
    U \\
    V
    \end{pmatrix}
    =
    \begin{pmatrix}
    a & b \\
    c & d
    \end{pmatrix}
    \cdot
    \begin{pmatrix}
    X \\
    Y
    \end{pmatrix}
    = A \cdot \begin{pmatrix}
    X \\
    Y
    \end{pmatrix}
    \]
    

    设

    \[
        \mathbf{x} = \begin{pmatrix}
        x \\
        y
        \end{pmatrix}
    \]

    \[
        \mathbf{u} = \begin{pmatrix}
        u \\
        v
        \end{pmatrix}
    \]

    那么

    \[
        \mathbf{u} = A \mathbf{x}
    \]

    取逆变换

    \[
        \mathbf{x} = A^{-1} \mathbf{u}
    \]

    
    \begin{align*}
    p(U,V)(u,v) &= p(X,Y)(A^{-1} \mathbf{u}) |J|\\
                &=  \frac{1}{2\pi |\Sigma|^{\frac{1}{2}}} e^{-\frac{1}{2} (A^{-1} \mathbf{u} - \boldsymbol{\mu})^{\mathrm{T}} \Sigma^{-1} (A^{-1} \mathbf{u} - \boldsymbol{\mu})} |A^{-1}|\\
                &= \frac{1}{2\pi |A \Sigma A^{\mathrm{T}}|^{\frac{1}{2}}} e^{-\frac{1}{2} ( \mathbf{u} - A\boldsymbol{\mu})^{\mathrm{T}} (A \Sigma A^{\mathrm{T}})^{-1} (\mathbf{u} - A\boldsymbol{\mu})}\\
    \end{align*}

    故

    \[
        (U,V) \sim \mathcal{N}(A\boldsymbol{\mu}, A \Sigma A^{\mathrm{T}})
    \]
    
    !!!key-point
        即$(U,V)$的协方差矩阵为$A \Sigma A^{\mathrm{T}}$, 均值为$A\boldsymbol{\mu}$;
        总结而言，对于$(X,Y)$的联合正态分布做线性变换，新的随机向量仍然是联合正态分布，且均值也做了相应的线性变换，协方差矩阵做了相应的 **变换** ，但是转置在后面。

    
    如果做极坐标变换

    \[
        \begin{cases}
        x = \rho \cos \theta \\
        y = \rho \sin \theta
        \end{cases}
    \]

    **联合密度函数**：

    \[
       p(\rho, \theta) = \frac{1}{2\pi} e^{-\frac{1}{2}((\rho \cos \theta)^2 + (\rho \sin \theta)^2)} \rho
    \]
    
       可以简化为：
    
    \[
       p(\rho, \theta) = \frac{1}{2\pi} \rho e^{-\frac{\rho^2}{2}}
    \]

    **边际分布**：

       - 对于 \(\rho\)：
    
        \[
           \rho \sim p_\rho(\rho) = \rho e^{-\frac{\rho^2}{2}}, \quad \rho > 0
        \]
    
       - 对于 \(\theta\)：
    
        \[
            \theta \sim p_\theta(\theta) = \frac{1}{2\pi}, \quad 0 < \theta < 2\pi
        \]

    **独立性**：
       \(\rho\) 和 \(\theta\) 是独立的随机变量。

    称 \(\rho\) 为 Rayleigh 分布，\(\theta\) 为均匀分布。    

!!!eg
    $\xi, \eta $相互独立，都服从参数为 1 的指数分布，求 $\alpha = \xi + \eta$ 与 $\beta = \dfrac{\xi}{\eta}$ 的联合密度；并分别求出 $\alpha$与 $\beta$ 的密度。

    $(\xi, \eta)$ 的联合密度为：当 $x > 0$ 且 $y > 0$ 时，

    $$
    p(x, y) = e^{-(x+y)}, \quad x > 0, y > 0.
    $$

    其他情况为 0。

    函数组为：

    $$
    \begin{cases}
    u = x + y \\
    v = x / y
    \end{cases}
    $$

    计算雅可比行列式：

    $$
    J^{-1} = \frac{\partial(u, v)}{\partial(x, y)} = \begin{vmatrix}
    1 & 1 \\
    \frac{1}{y} & -\frac{x}{y^2}
    \end{vmatrix} = 1 \cdot \left(-\frac{x}{y^2}\right) - 1 \cdot \frac{1}{y} = -\frac{(1+v)^2}{u}.
    $$

    故

    $$
    |J| = \dfrac{u}{(1 + v)^2}.
    $$

    $(\alpha, \beta)$ 的联合密度为：

    $$
    q(u, v) = \begin{cases}
    \dfrac{ue^{-u}}{(1 + v)^2}, & u > 0, v > 0, \\
    0, & \text{其他}.
    \end{cases}
    $$

    $\alpha = \xi + \eta$ 与 $\beta = \dfrac{\xi}{\eta}$ 各自的密度为 $q(u, v)$ 的边际密度。不难看出：

    $$
    p_{\alpha}(u) = \begin{cases}
    ue^{-u}, & u > 0, \\
    0, & u \leqslant 0.
    \end{cases}
    $$

    和

    $$
    p_{\beta}(v) = \begin{cases}
    \dfrac{1}{1 + v^2}, & v > 0, \\
    0, & v \leqslant 0.
    \end{cases}
    $$

    并且 $\alpha,\beta$ 相互独立。

    本例中，自然也可以用单元的方法计算 $\xi + \eta$ 各自的分布，但这里的方法显然更便捷,更方便。
    
    !!!key-point
        这是一个富有有趣性的例子，它告诉我们：

        - 要判断随机变量的几个函数是否独立，可用随机变量变换求得它们的联合分布，再用独立性的各种必要条件来判断；

        - 要求随机变量的一个函数的分布，有时可作适当补充，先求它们的联合分布，而后要求的函数的分布则作为求其边际分布。

        所以对于我们前面讨论的单元函数，也可以将其补全为多元，再计算边际分布，例如对于$\alpha = \xi + \eta$，我们可以将其补全为$(\alpha,\beta) = (\xi + \eta, \eta)$，再计算$(\alpha,\beta)$的联合分布，最后求出$\alpha$的边际分布，这与我们前面的结果是一样的







    