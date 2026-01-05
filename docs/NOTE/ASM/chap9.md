---
comments: true
---

# 8086/8088 Hardware Specifications

## PIN-OUTS AND THE PIN FUNCTIONS

## PIN OUT

8086 和 8088 都是采用 40 引脚双列直插封装（DIP）的微处理器。它们的主要区别在于数据总线的宽度：8086 拥有 16 位数据总线（引脚 AD0–AD15），而 8088 拥有 8 位数据总线（引脚 AD0–AD7）。由于数据总线更宽，8086 在一次传输中可以处理 16 位数据，因此在数据传输效率上高于 8088。图 9-1 展示了这两款处理器的具体引脚分布。

<div align="center">
    <img src="../img/chap9/pinout.png" alt="8086_8088_pin_out" width="500">
</div>

最小/最大模式的操作

8086 处理器有两种主要的工作模式：**最小模式（Minimum Mode** 和 **最大模式（Maximum Mode）**。

- **最小模式**：适用于单处理器系统。这种模式结构简单、成本较低。8086 内部会自动产生大多数内存和 I/O 所需的控制信号，无需额外的外部逻辑电路，适合中小型系统。

- **最大模式**：适用于需要多个处理器协作的系统，比如需要扩展使用协处理器（如 8087 浮点协处理器）。在该模式下，部分控制信号（如内存和总线的仲裁信号）由外部的总线控制器（通常是 8288 芯片）生成，这样可以与其他处理器或专用硬件配合完成更复杂的任务。

最小模式简单适合基础应用，最大模式支持更复杂和可扩展的多处理器系统。
8086 在最大模式和最小模式下有一些关键引脚，下面解释它们的作用：

- VCC（+5V 电源）：为芯片提供工作电压。
- GND（地）：电路的参考地。
- MN/MX（最小/最大模式选择）：这个引脚用来选择 8086 工作在“最小模式”还是“最大模式”。
    - 当 MN/MX 为高电平（HIGH），处理器工作于“最小模式”，适合单处理器系统，控制信号主要由 8086 内部产生。
    - 当 MN/MX 为低电平（LOW），处理器工作于“最大模式”，适合多处理器或需扩展协处理器的系统，此时部分控制信号需要外部芯片如 8288 协助生成。

<div align="center">
    <img src="../img/chap9/pin_out.png" alt="8086_8088_pin_out_max_min" width="500">
</div>

### Minimum Mode Configuration

在最小模式下，8086 会自行生成所有必要的控制信号（如读/写、内存/IO 等），因此不需要额外的外部总线控制逻辑来产生这些信号。典型的外围芯片包括：

- 8282 锁存器（latch）：用于锁存地址总线的低8位（A0-A7），保证地址在总线切换过程中保持稳定。
- 8286 三态缓冲器（3-state buffer）：用于数据总线的输入输出隔离，实现数据的有序流动和总线争用管理。
- 74138 解码器（decoder）：通常用于片选和地址译码，辅助 CPU 管理多片内存或 I/O 设备。

这些芯片配合 8086，可以实现完整的单处理器系统的最小硬件搭建。

<div align="center">
    <img src="../img/chap9/min_mode.png" alt="8086_8088_minimum_mode_configuration" width="500">
</div>



### Maximum Mode Configuration

在最大模式下，8086 会提供所有必要的控制信号，但部分关键的系统和总线控制信号（如内存/IO 读写允许、总线请求/授权等）需要外部总线控制器（如 **8288 bus controller**）来辅助生成和管理。如下是最大模式下的关键外围芯片：

- 8282 锁存器（latch）：和最小模式一样，锁存地址总线的低 8 位，确保地址稳定。
- 8286 三态缓冲器（3-state buffer）：用于数据总线的隔离，实现数据输入输出的管理。
- 8288 总线控制器（bus controller）：专为最大模式而设计，根据8086发出的状态信号（S0、S1、S2等），产生所有系统需要的总线控制信号（如内存/IO 读写允许、总线请求/授权等），实现复杂系统中多处理器或协处理器的总线协调。

下图为最大模式下的典型系统连接：

<div align="center">
    <img src="../img/chap9/max_mode.png" alt="8086_8088_maximum_mode_configuration" width="500">
</div>

### PIN FUNCTIONS

| 引脚           | 功能简介                                                         | 详细说明 |
|----------------|------------------------------------------------------------------|----------|
| AD15-AD0（地址/数据多路复用引脚） | 既作地址线，也作数据线（时分复用）          | 当 ALE（地址锁存允许）为高时传送地址/端口号，ALE为低时传送数据。 |
| ALE（地址锁存允许） | 指示 AD 总线当前为地址信息                    | ALE 有效时应由外部电路锁存地址，ALE 信号总由 8086 主动驱动。 |
| IO/$\overline{M}$（8088）/ M/$\overline{IO}$（8086） | 区分访问目标是内存还是 I/O 端口           | 保持响应阶段为高阻态。 |
| BHE（总线高八位使能）      | 控制高 8 位数据线（D15-D8）在数据操作时使能 | 支持16位/8位和非对齐字节存取，上半字节数据线路可选择性使能。 |
| $\overline{RD}$（读控制信号）          | 表示内存或 I/O 读操作                      | 逻辑 0 时进行读操作，保持响应期悬空为高阻态避免设备冲突。 |
| $\overline{WR}$（写控制信号）          | 表示向内存或 I/O 写数据                     | 逻辑 0 时进行写操作，数据总线有效，保持响应期间为高阻态。 |
| INTR（中断请求输入）      | 外部设备请求中断                            | 高电平且 IF 标志为 1 时响应，指令完成后进入中断周期。 |
| NMI（不可屏蔽中断输入）    | 高优先级中断，在紧急情况下使用            | 不受 IF 标志控制，有效立即跳转到向量2对应的中断程序。 |
| $\overline{INTA}$（中断响应输出，最小模式）| 响应INTR中断，通知中断控制器               | 授权中断控制器将中断类型码送上数据总线。|
| $\overline{LOCK}$（总线锁定输出，最大模式）| 锁定外部总线，防止总线冲突                 | 执行带 LOCK 前缀指令时有效，保证原子性，多处理器同步用。 |

## DRAM Organization

<div align="center">
    <img src="../img/chap9/dram.png" alt="dram_organization" width="500">
</div>


1. CPU 与内存控制器（Memory Controller）  
    - CPU 通过内存控制器访问内存。现代系统常采用“内存通道（Channel）”的概念，支持多通道并行访问以提高带宽。
    - 图中有两个通道（Channel 0 和 Channel 1），分别连接到多个内存条。

- 通道（Channel）与 DIMM  
    - 每个通道可连接多个 DIMM（Dual Inline Memory Module，双列直插内存模块，即通常所说的“内存条”）。
    - 每个 Channel 在图中都连接了 DIMM0 和 DIMM1，共四根 DIMM。

- Rank（排）与 Bank（片选组）
    - 每个 DIMM 内部又分为若干 Rank（排），每个 Rank 实质上是一组并行工作的存储芯片，可以一起被选中。
    - Rank 的数量取决于内存规格和容量，例如单面/双面内存条。
    - 每个 Rank 又包含多个 Bank（片选组），独立寻址，可以并行访问，提高了内存并发性能。

- Chip（芯片）与 Bank/Row/Column（行/列）
    - Rank 由若干颗存储芯片Chip组成，每颗芯片内部划分为 Bank。
    - 每个 Bank 由二维的存储单元阵列构成，通过行地址（Row）和列地址（Column）定位具体的数据单元。
    - 实际内存访问时，首先选中通道和 DIMM，再选 Rank，之后定位到特定的 Bank，最后通过行列定位到存储单元。


### Memory Banks

x86 处理器采用内存“Bank（存储体）”的概念，以便支持按字节访问和非对齐地址的数据访问。这里的“Bank”指的是宽度为 8 位的数据存储单元。具体来说：

- 8088 的数据总线宽度为 8 位，因此其 1MB 的内存空间可以看作是一个完整的 8 位 bank，数据按字节传输。
- 8086 的数据总线宽度为 16 位，其 1MB 地址空间被分为两个独立的 8 位 bank，每个 bank 大小为 512KB。高低 8 位的数据可以分别独立存取，这样既能提高访问速度，又能支持非对齐的字节访问。

<div align="center">
    <img src="../img/chap9/bank.png" alt="bank" width="500">
</div>

8086 采用$\overline{BHE}$和$\overline{BLE}/A0$作为存储体（bank）选择信号：

- $\overline{BHE}$（Bank High Enable）为低电平时，高/奇数存储体（D15-D8）被使能；
- $\overline{BLE}/A0$（Bank Low Enable，对应地址线 A0）为低电平时，低/偶数存储体（D7-D0）被使能。

这使得 8086 能灵活支持 8 位/16 位及非对齐字节的存取。例如：

- 访问偶地址字节（A0=0）：只使能低字节存储体（BLE=0，BHE=1）。
- 访问奇地址字节（A0=1）：只使能高字节存储体（BLE=1，BHE=0）。
- 访问偶地址的 16 位字（A0=0，BHE=0，BLE=0）：高低存储体均使能，一次访问 16 位数据。

| BHE | BLE/A0 | 功能描述                   |
|-----|--------|----------------------------|
| 0   | 0      | 16 位数据传输，两存储体启用 |
| 0   | 1      | 仅高字节（奇存储体）启用    |
| 1   | 0      | 仅低字节（偶存储体）启用    |
| 1   | 1      | 无存储体被使能              |

地址线 A1-A19用于指定内存地址，通过 BHE 和 BLE/A0 输出信号选择数据读写的具体存储体，实现高效、灵活的字节与半字访问。


#### Even-address byte access

<div align="center">
    <img src="../img/chap9/even_addr.png" alt="even_address_byte_access" width="500">
</div>


#### Odd-address byte access

<div align="center">
    <img src="../img/chap9/odd_addr.png" alt="odd_address_byte_access" width="500">
</div>

#### aligned 16-bit word access

<div align="center">
    <img src="../img/chap9/align_addr.png" alt="aligned_16_bit_word_access" width="500">
</div>

#### unaligned 16-bit word access

<div align="center">
    <img src="../img/chap9/unaligned_addr.png" alt="unaligned_16_bit_word_access" width="500">
</div>

对于未对齐的内存访问，需要两个总线周期：

- 第一个周期：数据传输使用 D8-D15
- 第二个周期：数据传输使用 D0-D7


!!!Summary
    保持内存访问对齐在 x86 机器上依然很重要。

    - x86 的内存和 I/O 空间是以存储体（bank）方式排列的。通过存储体选择信号（BHE 和 BLE/A0）来访问字节数据。
    - 在内存和 I/O 写操作中，通常需要分别给高位和低位写独立的写选通(strobes)信号。

    | 芯片型号 | 核心功能                | 记忆技巧 (Mnemonic)                                      |
    |---------|------------------------|---------------------------------------------------------|
    | 8288    | Bus Controller (总线控制器)    | 数字 8 长得像字母 B。8 = Bus Controller。它是“大管家”，负责发号施令。 |
    | 8282    | Address Latch (地址锁存器)    | 数字 2 像字母 Z。Latch 的作用是 freeZe (冻结/锁住) 地址。       |
    | 8286    | Data Transceiver (数据收发器) | 数字 6 读音像 Six → Switch。它的作用是 Switch (切换) 数据流向(进或出)。 |
    | 8284| Clock Generator (时钟发生器) | 数字 4 读音像 Four → Frequency。它的作用是 Frequency (频率) 分频。 |

