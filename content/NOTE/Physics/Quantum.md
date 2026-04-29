# 量子力学
>普物的最后一舞，加油！💪

## The nature of light(光的本质)

!!!definition "黑体辐射"
    
    黑体辐射是指一种理想化的物体（称为黑体）在热平衡状态下发出的电磁辐射。黑体能够吸收所有入射的电磁辐射，而不反射或透射任何辐射

    **普朗克辐射定律**

    \[
         R(\lambda, T) = \frac{2\pi hc^2}{\lambda^5} \frac{1}{e^{\frac{hc}{\lambda kT}} - 1} 
    \]

    \( h = 6.63 \times 10^{-34} \, \text{J} \cdot \text{s} \)

    常见的的表达有普朗克常数$h$ 和 约化普朗克常数$\hbar = \frac{h}{2\pi}$


### 光子的性质

光具有波粒二象性，光子具有能量和动量。

- 波： $\bold{E}=E_m \cos(kx-\omega t)$,或者$\bold{E}=E_e e^{i(kx-\omega t)}$
    - $k$ 波数，$k = \frac{2\pi}{\lambda}$
    - $\omega$ 角频率，$\omega = \frac{2\pi}{T}$
    - $T$ 周期，$T = \frac{1}{f}$
    - $f$ 频率，$f = \frac{\omega}{2\pi}$


- 粒子： $E=h\nu=h\dfrac{\omega}{2\pi}=\hbar\omega$,同时能量和动量满足关系$E=mc^2=pc$
    
    - 动量$p=\dfrac{E}{c}=\dfrac{h\nu}{c}=\dfrac{h \nu}{\nu \lambda}=\dfrac{h}{\lambda}=\dfrac{h}{\frac{2\pi}{k}}=\dfrac{h}{2\pi}k=\hbar k$
    

!!!quote "光电效应"

    光电效应是指当光照射到某种材料（通常是金属）表面时，会导致材料表面释放出电子的现象。这一效应是由爱因斯坦在1905年解释的，他提出光子具有粒子性质，并且每个光子的能量与其频率成正比。光电效应的关键特征包括：

    1. **阈值频率**：只有当入射光的频率高于某个特定值（阈值频率）时，才会发生光电效应。这是因为光子的能量必须大于材料中电子的逸出功（即将电子从材料中释放所需的最小能量）。

    2. **光子能量与电子动能**：入射光子的能量一部分用于克服材料的逸出功，剩余的能量转化为电子的动能。公式为：
       
    \[
       E_{\text{光子}} = h\nu = W + \frac{1}{2}mv^2
    \]
       
       其中，\( h \) 是普朗克常数，\( \nu \) 是光的频率，\( W \) 是逸出功，\( m \) 是电子的质量，\( v \) 是电子的速度。

    3. **光强度与电子数量**：增加入射光的强度（即光子数量）会增加释放的电子数量，但不会影响电子的最大动能。

    光电效应的发现和解释为量子力学的发展奠定了基础，并且为光的粒子性提供了重要的证据。


## Matter Wave(物质波)
> 🐅:神人德布罗意

物质波是德布罗意在1924年提出的一个概念，他认为任何物质都具有波动性，但是在提出这一概念之前，他并没有系统的学过物理；


对于宏观世界速度为$v$,质量为$m$的粒子

- 动量$p=mv$
- 动能$E_k=\frac{1}{2}mv^2$

其波性质为

- $E = h\nu=\hbar\omega$
- $p = h/\lambda=\hbar k$

其波长为

- $\lambda = \dfrac{h}{p}=\dfrac{h}{mv}=\dfrac{h}{\sqrt{2mE_k}}$

其满足这样一个波函数

\[
\Psi=\psi(x,t)=Ae^{i(kx-\omega t)}=Ae^{\frac{i}{\hbar}(px-Et)}
\]

### 波函数的物理解释
物质波是一种概率波

The product $\Psi^*\Psi$ gives the probability that the particle in question will be found between positions $x$ and $x+dx$. 

即

波函数的平方模 $\Psi^*\Psi$ 表示粒子在位置 $x$ 到 $x+dx$ 之间被找到的概率。
公式为：

\[
\text{Probability} = \Psi^*\Psi \, dx
\]

其中，$\Psi^*$ 是波函数的复共轭，$dx$ 是位置的微小变化量。


将几率密度定义为

\[
P(x) = \Psi^*\Psi
\]

若要求粒子在$x_1$到$x_2$之间被找到的概率，则

\[
P(x_1,x_2) = \int_{x_1}^{x_2} P(x) \, dx
\]

同时其满足归一化

\[
\int_{-\infty}^{+\infty} \Psi^*\Psi \, dx = 1
\]

对于自由粒子而言

\[
P(x) = \left[ \psi_0 e^{i(kx - \omega t)} \right] \left[ \psi_0^* e^{-i(kx - \omega t)} \right] = |\psi_0|^2
\]

是一个很小的常量

### 算符定义

#### 期望算符

一个粒子的期望位置

\[
\bar{x} = \frac{\int_{-\infty}^{+\infty} x \Psi^* \Psi \, dx}{\int_{-\infty}^{+\infty} \Psi^* \Psi \, dx} = \frac{\int_{-\infty}^{+\infty} \Psi^* x \Psi \, dx}{\int_{-\infty}^{+\infty} \Psi^* \Psi \, dx} = \int_{-\infty}^{+\infty} \Psi^* x \Psi \, dx = \langle \psi | x | \psi \rangle = \langle |x|\rangle,
\]

两个角代表被$\Psi^*$ 和 $\Psi$ 夹住做积分

如果求其它量例如势能的期望值也是类似的,例如$\langle \psi |U(x)|\psi \rangle$


#### 动量算符(momentum operator)

对于$\Psi = \psi_0 e^{i(kx-\omega t)}$

对 $x$ 求导数

\[
\frac{\partial \Psi}{\partial x} = ik\psi_0 e^{i(kx-\omega t)}
\]

\[
-i\hbar \frac{\partial \Psi}{\partial x} = (-i\hbar) ik \psi_0 e^{i(kx-\omega t)} = \hbar k \psi_0 e^{i(kx-\omega t)}
\]

而$\hbar k$ 就是动量$p$

所以

\[
-i\hbar \frac{\partial \Psi}{\partial x} = p \Psi
\]


{== 动量算符为 $ p= -i\hbar \frac{\partial}{\partial x}$==}

用动量算符求动量

\[
\begin{align*}
\therefore \bar{p} &= \int_{-\infty}^{+\infty} \Psi^* \left( -i\hbar \frac{\partial}{\partial x} \right) \Psi \, dx \\
&= \int_{-\infty}^{+\infty} \Psi^* \left( -i\hbar \frac{\partial}{\partial x} \right) \psi_0 e^{i(kx-\omega t)} \, dx \\
&= \int_{-\infty}^{+\infty} \Psi^* (-i\hbar) ik \psi_0 e^{i(kx-\omega t)} \, dx \\
&= \hbar k \int_{-\infty}^{+\infty} \Psi^* \psi_0 e^{i(kx-\omega t)} \, dx \\
&= \hbar k \int_{-\infty}^{+\infty} \Psi^* \Psi \, dx \\
&= \hbar k
\end{align*}
\]


#### 能量算符(Energy operator)

\[
\frac{\partial \Psi}{\partial t} = -i\omega \psi_0 e^{i(kx-\omega t)}
\]

\[
i\hbar \frac{\partial \Psi}{\partial t} = (i\hbar)(-i\omega)\psi_0 e^{i(kx-\omega t)} = \hbar \omega \psi_0 e^{i(kx-\omega t)} = E\Psi
\]

{== 能量算符为 $E = i\hbar \frac{\partial}{\partial t}$ ==}

用能量算符求能量

\[
\begin{align*}
\therefore \bar{E} &= \int_{-\infty}^{+\infty} \Psi^* \left( i\hbar \frac{\partial}{\partial t} \right) \Psi \, dx \\
&= \int_{-\infty}^{+\infty} \Psi^* \left( i\hbar \frac{\partial}{\partial t} \right) \psi_0 e^{i(kx-\omega t)} \, dx \\
&= \int_{-\infty}^{+\infty} \Psi^* (i\hbar)(-i\omega) \psi_0 e^{i(kx-\omega t)} \, dx \\
&= \hbar \omega \int_{-\infty}^{+\infty} \Psi^* \psi_0 e^{i(kx-\omega t)} \, dx \\
&= \hbar \omega \int_{-\infty}^{+\infty} \Psi^* \Psi \, dx \\
&= \hbar \omega
\end{align*}
\]

### 薛定谔方程

对于一个粒子的总能量，有势能和动能

\[
E = U + \frac{p^2}{2m}
\]

两边同时乘以波函数$\Psi$

\[
E\Psi = U\Psi + \frac{p^2}{2m}\Psi
\]


将$E$ 和 $p$ 用算符表示

\[
E\Psi = \frac{p^2}{2m} \Psi + U\Psi
\]

\[
i\hbar \frac{\partial}{\partial t} \Psi = \frac{1}{2m} (-i\hbar \frac{\partial}{\partial x})(-i\hbar \frac{\partial}{\partial x}) \Psi + U\Psi
\]

\[
i\hbar \frac{\partial}{\partial t} \Psi = -\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2} \Psi + U\Psi
\]

称其为一维含时薛定谔方程

简写为

\[
i\hbar \frac{\partial}{\partial t} \Psi = \hat{H} \Psi
\]

其中$\hat{H}$ 为哈密顿算符,也是能量算符

- 一维 $\hat{H} = -\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2} + U(x,t)$
- 三维 $\hat{H} = -\frac{\hbar^2}{2m} \nabla^2 + U(x,y,z,t)$

#### 定态薛定谔方程

如果说势能$U$ 不随时间变化，则波函数可以写成

\[
\Psi(x,t) = \psi(x) e^{-i\omega t} = \psi  e^{-i\omega t}
\]

\[
i\hbar \frac{\partial}{\partial t} \Psi = -\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2} \Psi + U\Psi
\]

\[
i\hbar \frac{\partial}{\partial t} (\psi e^{-i\omega t}) = -\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2} (\psi e^{-i\omega t}) + U\psi e^{-i\omega t}
\]

\[
(-i\omega) i\hbar \psi e^{-i\omega t} = -\frac{\hbar^2}{2m} \frac{d^2 \psi}{dx^2} e^{-i\omega t} + U\psi e^{-i\omega t}
\]

含$t$的项消去，得到

\[
\hbar \omega \psi = -\frac{\hbar^2}{2m} \frac{d^2 \psi}{dx^2} + U\psi
\]

再运用$E = \hbar \omega$ 

\[
E\psi(x) = -\frac{\hbar^2}{2m} \frac{d^2 \psi(x)}{dx^2} + U\psi(x)
\]

称其为一维定态薛定谔方程

可以化为

\[
    \frac{d^2 \psi(x)}{dx^2} + \frac{2m}{\hbar^2}(E - U)\psi(x) = 0
\]






!!!info "其它定义"
    虎哥只提了一下，那我也只记一下

    - 势垒隧道（barrier tunneling）

    势垒隧道是指在量子力学中，粒子能够穿过势垒（势能）的量子效应。势垒隧道效应是量子力学中的一个基本现象，它描述了粒子在势垒（通常是势能）的阻挡下仍然能够穿透的现象。

    - 测不准原理（Uncertainty principle）

    测不准原理是指在量子力学中，粒子的位置和动量不能同时被精确测量。这意味着，如果我们试图精确测量粒子的位置，那么它的动量就会变得不确定，反之亦然。

    \[
        \Delta x \Delta p \geq \frac{\hbar}{2}
    \]

    同样能量和时间也有这样的关系

    \[
        \Delta E \Delta t \geq \frac{\hbar}{2}
    \]



