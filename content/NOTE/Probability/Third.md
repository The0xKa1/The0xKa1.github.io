---
comments: true
---

# 数字特征

## 数学期望

!!!Definition "数学期望的定义"
    设$X$是一个离散型随机变量，$X$的数学期望（或称为期望值）是$X$所有可能取值的加权平均，记为$E(X)$或$\mu$，即
    
    \[
        E(X)=\sum_{i=1}^{n}x_iP(X=x_i)
    \]
    
    其中，$x_i$是$X$的可能取值，$P(X=x_i)$是$X$取值为$x_i$的概率。

    若$X$是一个连续型随机变量，其概率密度函数为$p(x)$，则$X$的数学期望为

    \[
        E(X)=\int_{-\infty}^{+\infty}xp(x)dx
    \]

    


数学期望的意义在于，当随机变量$X$独立重复地进行大量实验时，$X$的平均值将趋于$E(X)$。

数学期望跟参数有关，有几个参数就跟几个参数有关。

!!!Property "常见分布的数学期望"
    === "二项分布"
        若$X\sim B(n,p)$，则
        
        $$E(X)=np$$
    
    === "泊松分布"
        若$X\sim P(\lambda)$，则
        
        $$E(X)=\lambda$$

    === "几何分布"
        若$X\sim G(p)$，则
        
        $$E(X)=\dfrac{1}{p}$$
    
    === "均匀分布"
        若$X\sim U(a,b)$，则
        
        $$E(X)=\dfrac{a+b}{2}$$

    === "指数分布"
        若$X\sim E(\lambda)$，则
        
        $$E(X)=\dfrac{1}{\lambda}$$

    === "正态分布"
        若$X\sim N(\mu,\sigma^2)$，则
        
        $$E(X)=\mu$$
    
    === "超几何分布"
        若$X\sim H(N,M,n)$，则
        
        $$E(X)=n\dfrac{M}{N}$$


在计算数学期望的时候需要用到级数的知识，需要考虑到函数列是否一致收敛来运用逐项求导或者求积分，级数是否绝对收敛来判断是否可以用级数的重排；

!!!Note
    为了避免同一个随机变量因为排序不同造成的数学期望不同，我们要求

    \[
        \sum_{i=1}^{\infty}x_ip_i
    \]

    是绝对收敛的($\sum_{i=1}^{\infty}\lvert x_ip_i \rvert$收敛)，即该级数的任意一个重排都收敛于同一个值。
    如果是连续型随机变量，则要求
    
    \[
        \int_{-\infty}^{+\infty}\lvert xp(x) \rvert dx
    \] 

    可积。

### 数学期望的性质

- {==有界==}: 
    
\[
    a \leqslant X \leqslant b \Rightarrow a \leqslant E(X) \leqslant b
\]

即数学期望不会超过随机变量的取值范围。

- {==线性运算==}

\[
    E(a+bY)=a+bE(Y)
\]

从求和和积分的性质可以得到。

- {==加法定理==}

由[随机变量加法的分布](http://www.kailqq.cc/NOTE/Probability/second/#_19-etaxi_1xi_2)

假设 \((X, Y) \sim p(x, y)\)，那么 \(Z = X + Y\) 具有密度

\[
p_Z(z) = \int_{-\infty}^{\infty} p(x, z - x) dx
\]

所以

\[
E(X + Y) = \int_{-\infty}^{\infty} z p_Z(z) dz
\]

\begin{align*}
E(X + Y) &= \int_{-\infty}^{\infty} z p_Z(z) dz \\
&= \int_{-\infty}^{\infty} z \int_{-\infty}^{\infty} p(x, z - x) dx dz\\
&= \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} (x + y) p(x, y) dx dy\\
&= \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} x p(x, y) dx dy + \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} y p(x, y) dx dy\\
&= \int_{-\infty}^{\infty} x p_X(x) dx + \int_{-\infty}^{\infty} y p_Y(y) dy\\
&= E X + E Y
\end{align*}

推广：

\[
E(a_1 X_1 + a_2 X_2 + \cdots + a_m X_m) = a_1 E X_1 + a_2 E X_2 + \cdots + a_m E X_m
\]

!!!Example "应用"
    假设 \(X_1, X_2, \dots, X_m\) 是非负、独立同分布的随机变量，求

    \[
    E \frac{X_1 + \cdots + X_k}{X_1 + \cdots + X_m}
    \]


    \[
    E \frac{X_1}{X_1 + \cdots + X_m} = \cdots = E \frac{X_m}{X_1 + \cdots + X_m}
    \]

    存在，有限。另外，

    \begin{align*}
    1 &= E \frac{X_1 + \cdots + X_m}{X_1 + \cdots + X_m}\\
    &= E \frac{X_1}{X_1 + \cdots + X_m} + \cdots + E \frac{X_m}{X_1 + \cdots + X_m}\\
    &= m \cdot E \frac{X_1}{X_1 + \cdots + X_m}\\
    \end{align*}

    所以，

    \[
    E \frac{X_1}{X_1 + \cdots + X_m} = \frac{1}{m}
    \Rightarrow E \frac{X_1 + \cdots + X_k}{X_1 + \cdots + X_m} = \frac{k}{m}
    \]

    **加法定理计算期望**
    
    令 \( N \) 是产品总数，\( M \) 是次品数，现抽取 \( n \) 件产品检查，其中 \( n \leq M \)。  
    令 \( S_n \) 表示 \( n \) 件抽查产品中次品的个数。那么
    
    \[
    P(S_n = k) = \frac{\binom{M}{k} \binom{N - M}{n - k}}{\binom{N}{n}}
    \]

    下面给出 \( X \) 的另一种表示：令 \( \xi_i \) 表示第 \( i \)-次抽检时次品个数，
    
    \[
    X_i = 
    \begin{cases}
    1, & p \\
    0, & 1 - p
    \end{cases}
    \quad i = 1, 2, \dots, n，\operatorname{同分布，但是不独立}
    \]

    那么
    
    \[
    S_n = \sum_{i=1}^n X_i 
    \]

    \[
    E S_n = \sum_{i=1}^n E X_i = n \frac{M}{N}
    \]

    !!!key-point
        $X_i$指第$i$次抽到的是不是次品，这相当于抽奖，无论抽奖顺序是什么，每个人抽到的概率都是一样的，所以$X_i$是同分布的，但是不独立。


如果随机变量$X$和$Y$独立，那么$E(XY)=E(X)E(Y)$，如果$E(XY)=E(X)E(Y)$，并不一定有$X$和$Y$独立。

###  随机变量函数的数学期望

随机变量函数的数学期望可以用以下公式来定义：

$(\Omega,\mathcal{F},P)$是一个概率空间, $X:\Omega \to \mathbf{R}$是一个随机变量，\( g(X) \) 是 \( X \) 的一个实值可测函数，那么 \( g(X) \) 的数学期望 \( E[g(X)] \) 定义为：

=== "离散型随机变量"
     期望 \( E[g(X)] \) 为：
     
    \[
     E[g(X)] = \sum_{x} g(x) P(X = x)
    \]
     
     其中 \( P(X = x) \) 是 \( X \) 取值为 \( x \) 的概率。

=== "连续型随机变量"
     期望 \( E[g(X)] \) 为：
     
    \[
     E[g(X)] = \int_{-\infty}^{\infty} g(x) f_X(x) \, dx
    \]
     
     其中 \( f_X(x) \) 是 \( X \) 的概率密度函数。

     如果$X$有分布函数，那么
     
      
    \[
     E[g(X)] = \int_{-\infty}^{\infty} g(x) f_X(x) \, dx= \int_{-\infty}^{\infty} g(x) dF_X(x)
    \]


## 方差

!!!Definition
    方差是用来衡量随机变量偏离其均值的程度的指标。设 \( X \) 是一个随机变量，其数学期望为 \( E(X) \)，则 \( X \) 的方差记作 \( \operatorname{Var}(X) \) 或 \( \sigma^2 \)，定义如下：

    \[
    \operatorname{Var}(X) = E[(X - E(X))^2]
    \]


方差定义的是随机变量 \( X \) 与其均值 \( E(X) \) 偏差的平方的期望。它反映了 \( X \) 取值的分散程度。方差越大，说明 \( X \) 的取值离均值越远，分散性越大；方差越小，说明 \( X \) 的取值集中在均值附近，分散性较小。

$\sqrt{\operatorname{Var}(X)}$ 称为随机变量 \( X \) 的标准差，记作$\sigma$




!!!property "常见分布的方差"
    === "二项分布"
        若$X\sim B(n,p)$，则
        
        $$\operatorname{Var}(X)=np(1-p)$$
    
    === "泊松分布"
        若$X\sim P(\lambda)$，则
        
        $$\operatorname{Var}(X)=\lambda$$

        对于泊松分布，方差等于数学期望，这是泊松分布的一个特性。

    === "几何分布"
        若$X\sim G(p)$，则
        
        $$\operatorname{Var}(X)=\dfrac{1-p}{p^2}$$
    
    === "均匀分布"
        若$X\sim U(a,b)$，则
        
        $$\operatorname{Var}(X)=\dfrac{(b-a)^2}{12}$$

    === "指数分布"
        若$X\sim E(\lambda)$，则
        
        $$\operatorname{Var}(X)=\dfrac{1}{\lambda^2}$$

    === "正态分布"
        若$X\sim N(\mu,\sigma^2)$，则
        
        $$\operatorname{Var}(X)=\sigma^2$$
    
    === "超几何分布"
        若$X\sim H(N,M,n)$，则
        
        $$\operatorname{Var}(X)=n\dfrac{M}{N}\dfrac{N-M}{N}\dfrac{N-n}{N-1}$$


### 计算公式
可以通过以下公式计算方差：

\[
\operatorname{Var}(X) = E(X^2) - [E(X)]^2
\]

!!!proof
    方差的定义是：
    
    \[
    \operatorname{Var}(X) = E[(X - E(X))^2]
    \]
    
    展开括号，得到：
    
    \[
    \operatorname{Var}(X) = E[X^2 - 2X \cdot E(X) + (E(X))^2]
    \]
    
    利用期望的线性性质，得到：
    
    \[
    \operatorname{Var}(X) = E(X^2) - 2 E(X) \cdot E(X) + (E(X))^2
    \]
    
    由于 \( E(X) \) 是一个常数，所以 \( E(X) \cdot E(X) = [E(X)]^2 \)，因此可以简化为：
    
    \[
    \operatorname{Var}(X) = E(X^2) - [E(X)]^2
    \]


该公式表明，计算方差时可以通过求 \( X \) 的平方的期望 \( E(X^2) \) 减去 \( X \) 的期望的平方 \( [E(X)]^2 \) 来得到。这种形式通常更方便，尤其是在 \( E(X) \) 和 \( E(X^2) \) 容易求得的情况下，可以简化计算。

其中：

- \( E(X^2) \) 是 \( X \) 的平方的期望，即二阶矩。

- \( [E(X)]^2 \) 是 \( X \) 的期望的平方。



### 方差的性质

- {==非负性==}：

方差总是非负的，即 \( \operatorname{Var}(X) \geq 0 \)。



- {==平移不变性==}

若 \( c \) 为常数，则 \( \operatorname{Var}(X + c) = \operatorname{Var}(X) \)。


- {==方差的线性变换==}

对于独立随机变量 \( Y \) ，以及常数 \( a \) 和 \( b \)，有
   
\[
   \operatorname{Var}(a + bY) = b^2 \operatorname{Var}(Y)
\]


- {==方差的加法==}

对于独立随机变量 \( X \) 和 \( Y \)，有

\[
   \operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)+2\operatorname{Cov}(X,Y)
\]

其中，\( \operatorname{Cov}(X,Y) \) 是 \( X \) 和 \( Y \) 的协方差，即

\[
   \operatorname{Cov}(X,Y) = E[(X - E(X))(Y - E(Y))]=E(XY)-E(X)E(Y)
\]

如果$X,Y$相互独立，则$\operatorname{Cov}(X,Y)=0$，所以

\[
   \operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)
\]

可推广到多个独立随机变量的情况。


### 选择平均值的原因

在计算方差时，我们通常使用平均值作为中心点，而不是其他值。这是因为平均值是使方差最小的点。也就是说，对于任何实数 \( c \)，有

\[
   \operatorname{Var'}(X) = E[(X - c)^2] \geqslant E[(X - E(X))^2] = \operatorname{Var}(X)
\]

!!!proof 
    \begin{align*}
     \operatorname{Var}(X)&=E(X-EX)^2\\
        &=E(X-c-(EX-c))^2\\
        &=E(X-c)^2-2E(X-c)(EX-c)+E(EX-c)^2\\
        &=E(X-c)^2-(EX-c)^2 \leqslant E(X-c)^2
    \end{align*}

### 切比雪夫不等式(Chebyschev)


设 \((\Omega, \mathcal{A}, P)\) 是概率空间， \(X : \Omega \rightarrow \mathbb{R}\) 是随机变量，那么对任意 \(\varepsilon > 0\)，

\[
P(|X - EX| > \varepsilon) \leqslant \frac{\operatorname{Var}(X)}{\varepsilon^2}
\]

!!!Note
    切比雪夫不等式给出了随机变量偏离其均值大于某个精度的概率的上界。

仅取 \(X \sim p(x)\) 加以证明。

\[
P(|X - EX| > \varepsilon) = \int_{x: |x - EX| > \varepsilon} p(x) \, dx
\]

\[
\leqslant \int_{x: |x - EX| > \varepsilon} \frac{|x - EX|^2}{\varepsilon^2} p(x) \, dx
\]

\[
\leqslant \frac{1}{\varepsilon^2} \int_{-\infty}^{\infty} |x - EX|^2 p(x) \, dx
\]

\[
= \frac{\operatorname{Var}(X)}{\varepsilon^2}
\]

!!!Summary "推广"
    若 \(f\) 是单调不减严格正函数，那么

    \[
    P(X > \varepsilon) \leqslant \frac{E f(X)}{f(\varepsilon)}
    \]

    事实上，使用了Markov不等式:
    
    \[
    P(X > \varepsilon) \leqslant P(f(X) \geqslant f(\varepsilon)) \leqslant \frac{E f(X)}{f(\varepsilon)}
    \]


## 协方差矩阵

### 均值向量

对于一个随机向量 \( X = (X_1, X_2, \dots, X_n) \)，如果$X_i$的数学期望存在；其均值向量 \( \mu \) 定义为：

\[
\mu = E(X) = (E(X_1), E(X_2), \dots, E(X_n))
\]

### 协方差

假设$X$和$Y$是两个随机变量，且两者的数学期望和方差都存在，那么$X$和$Y$的协方差定义为：

\[
\operatorname{Cov}(X, Y) = E[(X - E(X))(Y - E(Y))]
\]

协方差也可以表示为：

\[
\operatorname{Cov}(X, Y) = E(XY) - E(X)E(Y)
\]

!!!Note "Cauchy-Schwarz不等式"

    对于任意两个随机变量$X$和$Y$，有

    \[
        \operatorname{Cov}(X, Y)^2 \leq \operatorname{Var}(X) \operatorname{Var}(Y)
    \]
    
    \[
        E[(X - E(X))(Y - E(Y))] \leqslant \sqrt{E[(X - E(X))^2]E[(Y - E(Y))^2]}
    \]

    运用任意实数$t$,满足

    \[
        E[(|X|+t|Y|)^2] \geqslant 0
    \]

    展开利用二次函数的性质即可；


协方差矩阵为

\[
\Sigma = \begin{bmatrix}
\operatorname{Var}(X_1) & \operatorname{Cov}(X_1, X_2) & \cdots & \operatorname{Cov}(X_1, X_n) \\
\operatorname{Cov}(X_2, X_1) & \operatorname{Var}(X_2) & \cdots & \operatorname{Cov}(X_2, X_n) \\
\vdots & \vdots & \ddots & \vdots \\
\operatorname{Cov}(X_n, X_1) & \operatorname{Cov}(X_n, X_2) & \cdots & \operatorname{Var}(X_n)
\end{bmatrix}
\]

对于二元随机变量 \( X = (X_1, X_2) \)，协方差矩阵为

\[
\Sigma = \begin{bmatrix}
\operatorname{Var}(X_1) & \operatorname{Cov}(X_1, X_2) \\
\operatorname{Cov}(X_2, X_1) & \operatorname{Var}(X_2)
\end{bmatrix}
\]

!!!key-point
    协方差矩阵是一个非负定矩阵，即对于任意非零列向量 \( a \)，有 \( a^T \Sigma a \geq 0 \)。


如果$X$, $Y$相互独立，此时 $E(XY)=E(X)E(Y)$ 那么$\operatorname{Cov}(X, Y) = 0$，反之，如果$\operatorname{Cov}(X, Y) = 0$，并不一定有$X$和$Y$相互独立，但是可以定义为{==不相关==}。


!!!Example
    二元联合正态分布的协方差为$\rho \sigma_1 \sigma_2$

### 相关系数

!!!Definition
    二元函数的相关系数（Correlation Coefficient）用来衡量两个随机变量 \( X \) 和 \( Y \) 之间的线性关系，其定义基于协方差和标准差，计算公式如下：

    \[
    \rho(X, Y) = \frac{\operatorname{Cov}(X, Y)}{\sigma_X \cdot \sigma_Y}
    \]

    其中：

    - \(\operatorname{Cov}(X, Y)\) 是 \( X \) 和 \( Y \) 的协方差，定义为：
      
    \[
      \operatorname{Cov}(X, Y) = \mathbb{E}[(X - \mathbb{E}[X])(Y - \mathbb{E}[Y])] = \mathbb{E}[XY] - \mathbb{E}[X] \cdot \mathbb{E}[Y]
    \]

    - \(\sigma_X\) 和 \(\sigma_Y\) 分别是 \( X \) 和 \( Y \) 的标准差，定义为：
      
    \[
      \sigma_X = \sqrt{\operatorname{Var}(X)}, \quad \sigma_Y = \sqrt{\operatorname{Var}(Y)}
    \]
      
      其中方差为：
     
    \[
      \operatorname{Var}(X) = \mathbb{E}[(X - \mathbb{E}[X])^2]
    \]

    1. **取值范围：**
       
    \[
       -1 \leq \rho(X, Y) \leq 1
    \]
       
       - 当 \(\rho(X, Y) = 1\) 时，\( X \) 和 \( Y \) 完全正线性相关。
       - 当 \(\rho(X, Y) = -1\) 时，\( X \) 和 \( Y \) 完全负线性相关。
       - 当 \(\rho(X, Y) = 0\) 时，\( X \) 和 \( Y \) 没有线性关系，但不一定独立。

    2. **无量纲性：**
       \(\rho(X, Y)\) 是一个无量纲量，反映的是两变量线性关系的强弱，与变量的量纲无关。

    3. **对称性：**
    
    \[
       \rho(X, Y) = \rho(Y, X)
    \]

    一般也用$\gamma$来表示相关系数

## 条件期望

对于两个随机变量X，Y，其条件期望定义为：

=== "离散型"
    给定$Y=y_i$,$X$的条件期望定义为

    \[
        E(X|Y=y_i)=\sum_{i=1}^\infty x_i P(X=x_i|Y=y_i)
    \]

    要求该级数绝对收敛

    若给定$X$,$Y$的条件期望也是类似

=== "连续型"
    
    \[
        P(X=x|Y=y)=\dfrac{p(x,y)}{p_Y(y)}
    \]

    所以

    \[
        E(X=x|Y=y)=\int_{-\infty}^{+\infty} x  P(X=x|Y=y) dx
    \]
    
    要求该积分绝对可积

    若给定$X$,$Y$的条件期望也是类似


### 全期望公式

$$
P(X = x_i, Y = y_j) = p_{ij}, \quad i, j = 1, 2, \ldots
$$

每一个 $y_j$，对应一个条件期望 $E(X|Y = y_j)$，即

$$
y_j \rightarrow E(X|Y = y_j)
$$

定义

$$
g(y_j) = E(X|Y = y_j)
$$

即

$$
g(Y) = E(X|Y)
$$

它是 $Y$ 的函数，所以是随机变量。求 $Eg(Y)$；

$$
Eg(Y) = \sum_{j=1}^{\infty} g(y_j) P(Y = y_j)
$$

$$
= \sum_{j=1}^{\infty} \sum_{i=1}^{\infty} x_i P(X = x_i | Y = y_j) P(Y = y_j)
$$

$$
= \sum_{i=1}^{\infty} x_i \sum_{j=1}^{\infty} P(X = x_i | Y = y_j) P(Y = y_j)
$$

$$
= \sum_{i=1}^{\infty} x_i P(X = x_i)
$$

$$
= E X
$$

!!!key-point
    $E(E(X|Y))=EX$,$E(E(Y|X))=EY$
    这个结论对于离散，随机，连续变量都成立



### 矩

- **k 阶矩，k 阶中心矩**:
  
  假设 \((\Omega, \mathcal{A}, P)\) 概率空间，\(X: \Omega \to \mathbb{R}\) 随机变量  
  如果 \(E|X|^k < \infty, k \geqslant 1\)，那么称

\[
  E X^k, \quad k \text{ 阶矩 } k \geq 1
\]

\[
  E(X - E X)^k, \quad k \text{ 阶中心矩 } k \geq 1
\]


!!!Example
    === "正态分布"
        \( X \sim N(0, \sigma^2) \)，那么

        \[
        E|X|^k < \infty, \quad k \geq 1
        \]

        并且

        \[
        EX^{2k} = (2k - 1)!! \sigma^{2k}, \quad EX^{2k + 1} = 0, \quad k \geq 1
        \]

        \[
        EX^{2k} = \int_{-\infty}^{\infty} x^{2k} \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}} \, dx
        \]

        \[
        = -\int_{-\infty}^{\infty} x^{2k - 1} \frac{1}{\sqrt{2\pi}} d e^{-\frac{x^2}{2}}
        \]

        \[
        = -x^{2k-1} \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}} \bigg|_{-\infty}^{\infty} + (2k - 1) \int_{-\infty}^{\infty} x^{2k - 2} \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}} \, dx
        \]

        \[
        = (2k - 1) E X^{2k - 2}
        \]

        \[
        EX^{2k} = (2k - 1) E X^{2k - 2} = \cdots = (2k - 1)(2k - 3) \cdots 1 = (2k - 1)!!
        \]
    
    === "泊松分布"
        \( X \sim \mathcal{P}(\lambda) \)，那么

        \[
        E|X|^k < \infty, \quad k \geq 1
        \]

        并且

        \[
        E X (X - 1) \cdots (X - (k - 1)) = \lambda^k, \quad k \geq 1
        \]

        \[
        \downarrow
        \]

        \[
        E X^2 = E X (X - 1) + E X
        \]

        \[
        E X^3 = E X (X - 1)(X - 2) + 3 E X (X - 1) + E X
        \]

        \[
        E X^4 = E X (X - 1)(X - 2)(X - 3) + 6 E X (X - 1)(X - 2) + 7 E X (X - 1) + E X
        \]

        \[
        E X^k = E X (X - 1) \cdots (X - (k - 1)) + \cdots
        \]

!!!Warining
    一般来说，随机变量任意K阶矩都相等，并不能保证随机变量的分布相同。但是正态分布和泊松分布可以由k阶矩来确定。

!!!section "定理"
    假设 \(X, Y\) 是两个随机变量，并且对任意 \(k \geq 1\),

    \[
    E X^k = E Y^k = m_k < \infty
    \]

    如果下列三个条件之一成立：

    (i)

    \[
    \sum_{k=1}^{\infty} \frac{m_{2k} t^{2k}}{(2k)!} < \infty, \quad \text{对某些 } t > 0
    \]

    (ii)

    \[
    \sum_{k=1}^{\infty} m_{2k}^{-1/2k} = \infty
    \]

    (iii)

    \[
    \limsup_{k \to \infty} |m_k|^{1/k} < \infty
    \]

    那么

    \[
    X \overset{d}{\equiv} Y
    \]


## 特征函数


\((\Omega, A, P), X : \Omega \to \mathbb{R}, X \sim F_X(x)\). 定义

\[
\varphi(t) = E e^{itX}, \quad t \in \mathbb{R}
\]

其中

\[
E e^{itX} = E \cos tX + iE \sin tX
\]

一定存在有限。

\[\varphi(t) : \mathbb{R} \to \mathbb{C}\]

{==实变量复值函数==}

目的：利用复分析研究随机变量的分布性质。

意义：对概率论的发展起着重要作用。


!!!Property "常见分布的特征函数"

    === "退化分布"
        若$X$是一个常数$c$，那么
        
        \[
        \varphi(t) = e^{ict}
        \]
    
    === "两点分布"
        若$X$是一个两点分布，$P(X = 1) = p, \quad P(X = 0) = 1 - p$，那么
        
        \[
        \varphi(t) = pe^{it} + 1 - p
        \]
    
    === "n-Bernoulli 分布"
        若$X \sim B(n, p)$，那么
        
        \[
        \varphi(t) = (1 - p + pe^{it})^n
        \]

    === "Poisson 分布"
        若$X \sim P(\lambda)$，那么
        
        \[
        \varphi(t) = e^{\lambda (e^{it} - 1)}
        \] 
    
    === "均匀分布"
        若$X \sim U(a, b)$，那么
        
        \[
        \varphi(t) = \frac{e^{itb} - e^{ita}}{it(b-a)}
        \]
    

    === "指数分布"
        若$X \sim E(\lambda)$，那么
        
        \[
        \varphi(t) = \frac{\lambda}{\lambda - it}
        \]
    
    === "标准正态分布"
        若$X \sim N(0, 1)$，那么
        
        \[
        \varphi(t) = e^{-\frac{t^2}{2}}
        \]

        普通的正态分布

        \[
            e^{it\mu-\frac{\sigma^2t^2}{2}}
        \]

### 特征函数的分析性质

1. \( \varphi(0) = 1 \)

2. \( |\varphi(t)| \leqslant 1 = \varphi(0) \) {==模长有界==}

3. \( \varphi(-t) = \overline{\varphi(t)} \) {==共轭对称==}

4. \( \varphi(t) \) 在 \( \mathbb{R} \) 上一致连续。

5. Bochner 非负定性

对于任何实数 \( t_1, t_2, \ldots, t_n \)，任何复数 \( a_1, a_2, \ldots, a_n \)

\[
\sum_{k,l=1}^{n} a_k \bar{a_l} \varphi(t_k - t_l) \geqslant 0
\]

6. 可微性


假设 \( E|X| < \infty, \quad EX = \mu \)，那么

\[
\varphi(t) \text{ 可微}
\]

并且

\[
\varphi'(0) = i\mu
\]

事实上，

\[
\varphi(t) = \int_{-\infty}^{\infty} e^{itx} dF(x).
\]

因为

\[
\int_{-\infty}^{\infty} |x| dF(x) < \infty,
\]

$e^{itx}$求导之后被一个可积函数控制，

所以

\[
\varphi'(t) = \int_{-\infty}^{\infty} ix e^{itx} dF(x)
\]

\[
= i \int_{-\infty}^{\infty} x e^{itx} dF(x)
\]

类似地，如果 \( E|X|^k < \infty \)，那么

\[
\varphi^{(k)}(t) = i^k \int_{-\infty}^{\infty} x^k e^{itx} dF(x)
\]

特别，如果 \( E|X| < \infty \)，那么 \( \varphi(t) \) 在 0 处可以进行 \( k \) 次展开：

\[
\varphi(t) = \varphi(0) + \varphi'(0)t + \frac{\varphi''(0)}{2!} t^2 + \cdots + \frac{\varphi^{(k)}(0)}{k!} t^k + o(t^k)
\]

\[
= 1 + iEXt - \frac{EX^2}{2} t^2 + \cdots + \frac{i^k EX^k}{k!} t^k + o(t^k), \quad t \to 0
\]


### 特征函数的运算性质

- 令 \( X \) 的特征函数为 \( \varphi_X(t) \)，那么

\[
E[e^{it(aX+c)}] = e^{itc} \varphi_X(at)
\]

如果 \( Y \sim N(\mu, \sigma^2) \)，那么可写成

\[
Y = \sigma X + \mu, \quad X \sim N(0, 1)
\]

因此，

\[
\varphi_Y(t) = e^{i\mu t - \frac{\sigma^2 t^2}{2}}
\]

- 令 \( X \) 和 \( Y \) 为两个随机变量，那么

\[
    Z = X + Y
\]


\[
\varphi_Z(t) = \varphi_X(t) \varphi_Y(t)
\]

在{==X,Y相互独立==}的情况下，这个公式成立。


推广：
 
如果 \( X_1, X_2, \ldots, X_n \) 相互独立，那么

\[
\varphi_{X_1 + X_2 + \cdots + X_n}(t) = \varphi_{X_1}(t) \varphi_{X_2}(t) \cdots \varphi_{X_n}(t)
\]

!!!eg
    $S_n \sim B(n,p)$，那么$S_n =\sum_{i=1}^n X_i$，其中$X_i$是独立同分布的两点分布随机变量，那么

    \[
    \varphi_{S_n}(t) = \varphi_{X_1}(t) \varphi_{X_2}(t) \cdots \varphi_{X_n}(t) = (1-p+pe^{it})^n
    \]

!!!Warning
    注意计算特征函数的时候不要直接把求期望放到指数上,即

    \[
        Ee^{itX} \neq e^{itEX}
    \]

    是不对的

### 唯一性问题

分布函数和特征函数相互唯一确定吗?

假设 $X$ 和 $Y$ 的分布函数相同，那么它们的特征函数相同是显然的；

但是，特征函数相同，$X$ 和 $Y$ 的分布函数是否相同呢？

即

\[
\varphi_X(t) = \varphi_Y(t), \quad \forall t \in \mathbb{R}
\]

是否能推出

\[
F_X(x) = F_Y(x), \quad \forall x \in \mathbb{R}
\]

!!!section "唯一性定理"
    \[
    \varphi_X(t) \equiv \varphi_Y(t)
    \]

    那么
    
    \[
    X \overset{d}{=} Y, \quad F_X(x) \equiv F_Y(x)
    \]

    实际上，

    \[
    F_X(x_2) - F_X(x_1) = \lim_{T \to \infty} \frac{1}{2\pi} \int_{-T}^{T} \frac{e^{-itx_2} - e^{-itx_1}}{it} \cdot \varphi_X(t) dt
    \]


    有推论:

    如果 \( X \) 的特征函数 \( \varphi(t) \) 绝对可积，即

    \[
    \int_{-\infty}^{\infty} |\varphi(t)| dt
    \]

    那么 \( X \) 具有密度函数 \( p(x) \)，并且

    \[
    p(x) = \frac{1}{2\pi} \int_{-\infty}^{\infty} e^{-itx} \varphi(t) dt
    \]



如果是离散型，那么
假设 $\varphi(t)$ 是一个特征函数，如果

$$
\varphi(t) = \sum_{k=-\infty}^{\infty} a_k e^{ikt}
$$

并且

$$
a_k \geqslant 0, \quad \sum_{k=-\infty}^{\infty} a_k = 1
$$

那么

$$
P(X = k) = a_k, \quad k = \ldots, -2, -1, 0, 1, 2, \ldots,
$$

注意，某些 $a_k$ 可能为 0。



!!!Example
    假设 \((X, Y)\) 是二元联合正态随机变量

    \[
    (X, Y) \sim N(\mu_1, \sigma_1^2; \mu_2, \sigma_2^2; \rho)
    \]

    求：\(\phi(t_1, t_2) = ?\)

    为简单起见，假设 \(\mu_1 = 0, \sigma_1^2 = 1; \mu_2 = 0, \sigma_2^2 = 1\)，即

    \[
    (X, Y) \sim N(0, 1; 0, 1; \rho)
    \]

    令

    \[
    \Sigma = \begin{pmatrix} 1 & \rho \\ \rho & 1 \end{pmatrix}
    \]

    作线性变换：

    \[
    \begin{pmatrix} U \\ V \end{pmatrix} = \Sigma^{-1/2} \begin{pmatrix} X \\ Y \end{pmatrix}
    \]

    \[
    = \begin{pmatrix} 1 & \rho \\ \rho & 1 \end{pmatrix}^{-1/2} \begin{pmatrix} X \\ Y \end{pmatrix}
    \]

    这样，\((U, V) \sim N(0, 1; 0, 1; 0)\)，即 \(U, V\) 相互独立。所以，

    \[
    \phi_{U,V}(t_1, t_2) = e^{-\frac{1}{2}(t_1^2 + t_2^2)}
    \]

    \[
    = e^{-\frac{1}{2}(t_1, t_2) \cdot (t_1, t_2)'}
    \]

    \[
    \begin{align*}
    \phi_{X,Y}(t_1, t_2) &= E e^{i(t_1, t_2)(X, Y)'} \\
    &= E e^{i(t_1, t_2) \Sigma^{1/2} (U, V)'} \\
    &= e^{-\frac{1}{2} (t_1, t_2) \Sigma (t_1, t_2)'}
    \end{align*}
    \]
    
    这里最后一个等号是运用了 $\phi_{U,V}$特征函数的变量替换和转置的性质；

    这种变换的方式很好用，可以把标准联合正态分布的相关系数变为0；
    
    !!!info  "多元随机向量的特征函数"
        
        设$\mathbf{X}$是一个多元随机向量,$\mathbf{t}=(t_1,t_2,\ldots,t_n) \in \mathbb{R}^n$,定义

        \[
        \varphi_{\mathbf{X}}(\mathbf{t}) = Ee^{i\mathbf{t}\cdot\mathbf{X}}
        \]

        即两者做内积的期望;


## 常见分布

至今为止,概率论的数字特征部分已经结束,开始概率极限理论的学习之前,在此总结一下苏老师课上提到过的各种分布的表达,密度函数(或概率),期望,方差,特征函数;

=== "退化分布"
     退化分布,为离散型随机变量,取某个值的概率为1,其余取值的概率为0;

     $$
     P(X=a)=1
     $$
     

     期望为$E(X)=a$,方差为$Var(X)=0$,特征函数为$e^{ita}$;

=== "两点分布"
    即 **伯努利分布** ，Bernoulli distribution,离散型

    $$
    \left[
    \begin{matrix}
    1&0\\
    p&1-p
    \end{matrix}
    \right],p\in (0,1)
    $$

    可以记为$X\sim B(1,p)$;

    期望为$E(X)=p$,方差为$Var(X)=p(1-p)$,特征函数为$pe^{it}+1-p$;

=== "二项分布"
    即 binomial distribution，离散型


    $$
    P(\xi=k)=\begin{pmatrix}
        n\\k
    \end{pmatrix}
    p^k(1-p)^{n-k},p\in (0,1),k=0,1,\cdots,n
    $$

    记为 $\xi\sim B(n,p)$

    期望为$E(X)=np$,方差为$Var(X)=np(1-p)$,特征函数为$(pe^{it}+1-p)^n$;

=== "泊松分布"
    即 Poisson distribution，离散型
   
    $$
    P(\xi=k)=\frac{\lambda^k}{k!}e^{-\lambda}
    ,\lambda>0,k\in \mathbb N
    $$

    记为 $\xi\sim\mathcal{P}(\lambda)$
    
    期望和方差均为$\lambda$,特征函数为$e^{\lambda(e^{it}-1)}$,使用凑成泰勒展开推导;

=== "几何分布"
    即 geometry distribution,一般用于解决第一次成功的问题,离散型

    $$
    P(\xi=k)=p(1-p)^{k-1},p\in (0,1),k\in \mathbb{N}_+
    $$

    可以记为$X\sim G(p)$;(Geometric distribution)

    期望为$E(X)=\frac{1}{p}$,方差为$Var(X)=\frac{1-p}{p^2}$,特征函数为$\frac{pe^{it}}{1-(1-p)e^{it}}$;推导过程是等比数列求和.

=== "超几何分布"
    即 hypergeometry distribution，一般用于解决次品抽样问题,离散型

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

    可以记为$X\sim H(N,M,n)$;(Hypergeometry distribution)

    期望为$E(X)=\frac{nM}{N}$,方差为$Var(X)=\frac{nM}{N}(1-\frac{M}{N})(\frac{N-n}{N-1})$,特征函数似乎没见过;

=== "均匀分布"
    即 uniform distribution,连续型,有密度函数

    $$
    f(x)=\begin{cases}
    \frac{1}{b-a},&a<x<b\\
    0,&x\leqslant a \text{ or } x\geqslant b
    \end{cases}
    $$

    记为$X\sim U(a,b)$;

    数学期望为$E(X)=\frac{a+b}{2}$,方差为$Var(X)=\frac{(b-a)^2}{12}$,特征函数为$\frac{e^{itb}-e^{ita}}{it(b-a)}$;三者推导都是无情积分;

=== "指数分布"
    即 exponential distribution,连续型

    $$
    f(x)=\begin{cases}
    \lambda e^{-\lambda x},&x\geqslant 0\\
    0,&x<0
    \end{cases}
    $$

    记为$X\sim E(\lambda)$;

    数学期望为$E(X)=\frac{1}{\lambda}$,方差为$Var(X)=\frac{1}{\lambda^2}$,特征函数为$\frac{\lambda}{\lambda-it}$;

=== "正态分布"
    即 normal distribution,连续型,有密度函数

    $$
    f(x)=\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(x-\mu)^2}{2\sigma^2}}
    $$

    记为$X\sim N(\mu,\sigma^2)$;

    数学期望为$E(X)=\mu$,方差为$Var(X)=\sigma^2$,特征函数为$e^{i\mu t-\frac{1}{2}\sigma^2 t^2}$;
    特别地，$X\sim N(0,1)$称为标准正态分布;其特征函数为$e^{-\frac{1}{2}t^2}$;


=== "卡方分布"
     若$\xi_1,\xi_2,\cdots,\xi_n$独立同分布于标准正态分布$N(0,1)$,则称$\xi_1^2+\xi_2^2+\cdots+\xi_n^2$服从卡方分布,为连续型

     有密度函数

    $$
     f(x)=\frac{1}{2^{\frac{v}{2}}\Gamma(\frac{v}{2})}x^{\frac{v}{2}-1}e^{-\frac{x}{2}}
    $$

     记为$\chi^2 \sim \chi^2(v)$;
     
    $v$ 为自由度,指的是自由变量的个数($n-r$),$r$ 为约束条件的个数;


    期望为$E(\chi^2)=v$,方差为$Var(\chi^2)=2v$,特征函数为$(1-2it)^{-\frac{v}{2}}$;

    记忆较为繁琐,可以只记住伽马分布即可;


=== "Gamma分布"
    即 Gamma distribution,连续型,有密度函数

    $$
    f(x)=\frac{\lambda^\alpha}{\Gamma(\alpha)}x^{\alpha-1}e^{-\lambda x}
    $$

    记为$X\sim \Gamma(\alpha,\lambda)$;

    期望为$E(X)=\frac{\alpha}{\lambda}$,方差为$Var(X)=\frac{\alpha}{\lambda^2}$;

    特征函数为$(1-\dfrac{it}{\lambda})^{-\alpha}$;

    可以看到令$\lambda=\dfrac{1}{2},\alpha=\dfrac{v}{2}$时,$\Gamma$分布即为$\chi^2$分布;
