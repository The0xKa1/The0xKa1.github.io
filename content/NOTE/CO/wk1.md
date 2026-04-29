## 计算机系统结构的八大伟大定律


- **Moore's Law** The integrate circuit resource double every 18-24 months.

- Lower-level details are hidden to higher levels

- Make the common cases fast

- Performance via Parallelism

- Performance via Pipelining

- Performance via Prediction

- Hierarchy of memory

- Dependability via redundancy


## 常见名词和计算

CPU时钟周期 ：一个是时钟脉冲所需要的时间，也叫节拍脉冲或T周期，它是CPU中最小的时间单位
主频(CPU时钟频率)：1秒中的时钟脉冲数，即时钟周期的倒数


CPI：执行一条指令所需要的时钟周期数 = 总时钟周期数/IC，一般与编译器有关；

IC：总指令数

CPU执行时间：运行一个程序所花费的时间 = CPU时钟周期数/主频 = (指令条数*CPI)/主频




$$
\begin{align*} 
CPU\ Time &= CPU\ Clock\ Cycles \times Clock\ Cycle\ Time \\
&=\dfrac{ CPU\ Clock\ Cycles}{Clock\ Rates}
\end{align*}
$$ 

$$
\begin{align*}
Clock\ Cycles &= Instruction\ Count \times Cycles\ per\ Instruction(CPI)\\
CPU\ Time & = Instruction\ Count \times CPI\times CPI\ Cycle\ Time\\
& = \dfrac{Instruction\ Count \times CPI}{Clock\ Rate}
\end{align*}
$$


影响CPU time 的因素有很多

$$CPU\ Time = \dfrac{Instructions}{Program}\times \dfrac{Clock\ Cycles}{Instruction}\times \dfrac{Seconds}{Clock Cycle}$$


值得注意的是，若给出测试程序包含多条指令，则CPI就是这几条指令的数学期望

!!!Example

    |指令类型|所占比例|CPI|
    |----|---|--|
    |A| 50%| 2|
    |B |20%| 3|
    |C |10%| 4|
    |D |20% |5|

    \[
    CPI = 2  \times 0.5 + 3 \times 0.2 + 4 \times 0.1 + 5 \times 0.2 = 3
    \]

MIPS：每秒执行多少百万条指令 = 指令条数/(执行时间x106) = 主频/CPI

ISA:指令集合架构(Instruction Set Architecture)

定义了计算机硬件与软件之间的接口。它具体包括：

- 支持的指令类型（数据处理、控制、输入/输出等）
- 数据类型（整数、浮点数、字符等）
- 寄存器设计（寄存器数量和类型）
- 地址模式（如何计算指令操作数的地址）

**RISC**

RISC（Reduced Instruction Set Computing）是一种指令集设计理念

- 指令数量较少，且所有指令都在单个时钟周期内执行。
- 每条指令长度相同，通常为固定大小。
- 使用大量的寄存器以减少内存访问。
- 简化的寻址模式，提高了执行效率。
- 硬件设计更简单，易于流水线操作，提高了性能。
  
**MISC**

MISC（Minimal Instruction Set Computing）是一种极简指令集设计

- 指令集非常小，通常只有几条基本指令。
- 每条指令可能需要多个周期才能执行。
- 多数指令依赖于程序的所有操作通过少量基本指令组合完成。
- 硬件实现简单，小型设备或特定应用中常见。

**CISC**

CISC（Complex Instruction Set Computing）是另一种指令集设计理念

- 包含大量指令，且每条指令可以执行复杂的操作。
- 指令长度不固定，许多指令可以通过一条指令进行多步操作。
- 支持更多的寻址模式和数据类型。
- 可以减少程序的大小，因为许多操作可以通过单条指令完成。


