---
comments: true
---

# Data Movement Instructions

## Mode and Opcode

### Machine Language

- 微处理器使用本地二进制代码作为指令来控制运作。
   - 指令长度从 1 字节到 15 字节不等。
- 机器语言指令有超过 10 万种变体。
   - 没有一份完整的变体列表。
- 机器语言指令的一些位是固定的，剩下的位则根据指令的具体变体而定。

### Operation Mode

- 操作有三种模式，其默认地址和操作数长度如下：
    - 16 位模式（实模式、vm86、保护模式）：默认地址和操作数长度为 16 位
    - 32 位保护模式（保护模式）：默认地址和操作数长度为 32 位
    - 64 位模式：默认地址长度为 64 位，默认操作数长度为 32 位


### Processor Directives

在 MASM 中，处理器指令（Processor directive）是一种伪指令，用于告诉汇编器在汇编过程中应启用哪些指令集、处理器类型以及相应的特性。它决定了以下内容：
    
- 哪些 CPU 指令是有效的
- 默认的操作数和地址长度（16 位 或 32 位）
- 可用的寄存器和寻址方式
- 允许的语法

MASM 中的处理器指令包括：

- 16 位：.8086，.186，.286
- 32 位：.386，.486，.586，.686
- 浮点：.8087，.287，.387
- 特殊用途：.MMX，.XMM

!!!Example
    ```asm
    .286
    .MODEL small
    .CODE
    mov AX, @data
    mov DS, AX
    mov AH, 9
    int 21H
    ```
    .286 告诉汇编器使用 16 位模式。
    .MODEL small 告诉汇编器使用 small 模型。[^1]
    .CODE 告诉汇编器开始代码段。
    mov AX, @data 将 @data 段地址加载到 AX 寄存器。
    mov DS, AX 将 DS 寄存器设置为 AX 寄存器的值。
    mov AH, 9 将 AH 寄存器设置为 9。
    int 21H 调用 DOS 中断 21H。


    ```asm
    .386
    .MODEL flat, stdcall
    .CODE
    mov EAX, [EBX]
    add EAX, ECX
    ret
    ```

    .386 告诉汇编器使用 32 位模式。
    .MODEL flat, stdcall 告诉汇编器使用 flat 模型和 stdcall 调用约定[^2]。
    .CODE 告诉汇编器开始代码段。
    mov EAX, [EBX] 将 EBX 寄存器中的值加载到 EAX 寄存器。
    add EAX, ECX 将 ECX 寄存器中的值加载到 EAX 寄存器。
    ret 返回。

[^1]: Small 模式指代码段和数据段都在 64KB 以内。
[^2]: Flat 模式指代码和数据使用同一个 32 位段，访问 4GB 线性地址空间。


Processor directive的作用：

- 检查指令的合法性，例如，在 .286 模式下，
  ```asm
  MOV AX, BX       // 合法
  MOV EAX, EBX     // 非法（.286 不支持 32 位寄存器）
  ```   
- 根据默认操作数/地址大小，生成正确的指令编码，例如：

<div align="center">
<img src="../img/chap4/proc_dir.png" alt="fig4-1" width="500">
</div>

!!!info 
    <div align="center">
    <img src="../img/chap4/inst_format.png" width="500">
    </div>


    操作数大小前缀 `66H` 用于切换指令的操作数位宽（比如在 32 位模式下使用 16 位操作数，或反之）。  
    地址大小前缀 `67H` 用于切换内存操作数的默认寻址位宽（比如在 32 位模式下使用 16 位地址寻址）。



<div align="center">
<img src="../img/chap4/code_seg.png" width="500">
<center>Code Segment Descriptor</center>
</div>

在代码段描述符中，D/B-bit 和 L-bit 指示操作模式：

- L=0 and D/B =0 表示 16-位指令模式
- L=0 and D/B =1 表示 32-位指令模式
- L=1 表示 64-位指令模式

!!!Note "Instruction Store in Memory"
    指令在内存中以小端序（little-endian）格式存储。指令的第一个字节位于最低的内存地址。
    
    - 由于指令本质上是字节串，因此它们可以从任意内存地址开始存放。
    - 指令的总长度必须小于或等于15字节。如果超过该限制，将会触发通用保护异常（general-protection exception）。

    <div align="center">
    <img src="../img/chap4/inst_store.png" width="500">
    </div>

### Opcode Byte 1

Opcode 字节决定了微处理器要执行的操作（如加法、减法等）。对于大多数指令来说，Opcode 字节长度为1或2字节。下图展示了很多指令的第一个操作码字节的一般结构：

<div align="center">
<img src="../img/chap4/opcode1.png" width="500">
</div>

- 第一字节的前6位为二进制操作码（opcode），
- 剩余2位分别用于表示方向位（D）和数据大小位（W）：
    - 方向位D，用于确定数据流的方向；
    - 数据大小位W，用于指示数据长度（字节或字/双字）。

<div align="center">
<img src="../img/chap4/opcode2.png" width="500">
</div>

- 若D=1, 数据流向寄存器（REG 字段）来自R/M字段；
- 若D=0, 数据流向R/M字段来自寄存器（REG 字段）。  
    - MOV R/M, REG（D=0）表示从寄存器向R/M存储单元移动数据。
    - MOV REG, R/M（D=1）表示从R/M存储单元向寄存器移动数据.
    - 这样表示两条指令只需要修改D位即可

!!!Note 
    记忆方式也很简单，D=1，代表in，从R/M字段到REG字段；D=0，代表out，从REG字段到R/M字段。


- 若W=1，数据大小为字（16位）或双字（32位）。
- 若W=0，数据大小为字节（8位）。
- 在大多数指令中都存在W位，D位则主要出现在MOV及少数其他指令中。

<div align="center">
<img src="../img/chap4/opcode3.png" width="500">
</div>

>W用于在字节和默认数据之间切换，66H和67H用于在默认数据和非默认数据之间切换。

!!!question "Why Direction Bit?"
    既然汇编语法（如 MOV AX, BX）已经区分了源操作数和目标操作数，并且明确了数据流的方向，为什么 MOD-REG-R/M 字节不直接把目标操作数编码到 “REG” 字段，把源操作数编码到 “R/M” 字段呢？

    - 在 MOD-REG-R/M 字节中，如果将目标和源操作数的位置固定下来进行编码，那么在两者都使用寄存器寻址时，这种做法很有效。但一旦涉及到内存寻址，情况就变得复杂。在 ModR/M 字节的设计中，只有 R/M 字段（配合 Mod 位）才有能力描述复杂的内存寻址方式（比如 [BX+SI+DISP] 这种）。REG 字段 只能表示纯寄存器。而内存既可以作为目标，也可以作为源，因此需要一个方向位来区分。

    - 基于一条指令最多只会有一个操作数使用内存寻址这个事实，Intel 设计了方向位（D 位），用来指示数据是流入 R/M（作为目的地），还是流出 R/M（作为源）。这种设计方案更高效也更优雅。

    - 在 RISC 架构（如 RISC-V、ARM）中，由于其并不支持多种复杂的寻址方式，指令格式中的源和目的操作数位置都是固定的。因此，数据流方向其实已经由操作数字段在指令中的位置自然确定了，无需再单独加方向位。

### MOD-REG-R/M Field-Byte 2

<div align="center">
<img src="../img/chap4/mod_field.png" width="500">
</div>

#### MOD Field

MOD 字段用于指定所选指令的寻址方式（MOD，寻址模式）。

- MOD 字段决定了使用哪种类型的寻址方式，以及在该类型下是否包含位移量（displacement）。

- MOD 字段具体定义了寻址方式（MOD），并指定所选类型下是否包含位移。
    - 如果 MOD 字段为 11（二进制），则选择寄存器寻址模式（register addressing mode）.寄存器寻址是指使用 R/M 字段指定的寄存器作为操作数，而不是内存位置。
    - 如果 MOD 字段为 00、01 或 10，则 R/M 字段选择多种数据内存寻址方式。


#### REG/Opcode Field

REG/Opcode 字段既可以指定一个寄存器编号，也可以作为额外的 3 位操作码（opcode）信息。

<div align="center">
<img src="../img/chap4/reg_opcode.png" width="500">
</div>

#### R/M Field

R/M 字段既可以指定一个寄存器作为操作数，也可以结合 MOD 字段共同编码一种寻址模式。
- 当 MOD 字段为 00、01 或 10 时，R/M 字段将有新的含义，用来表示多种不同的寻址方式。

<div align="center">
<img src="../img/chap4/r_m_field.png" width="500">
</div>



该图展示了指令 MOV DL,[DI]（机器码为 8A15H）的编码方式：

该指令共 2 字节，包含 op-code 100010，D=1（数据从 R/M 流向 REG/Opcode），W=0（字节操作），MOD=00（无displacement），REG/Opcode=010（DL），R/M=101（[DI]）。

如果指令变为 8A5501H，指令的第一个字节保持不变，MOD 字段变为 01（表示有 8 位位移），整条指令变为 MOV DL, [DI+1]

<div align="center">
<img src="../img/chap4/r_m_field_2.png" width="500">
</div>

最后在末尾多了一个displacement字段，用于存储位移量。


#### 32-Bit Addressing Modes


当 R/M=100 时，指令中会额外出现一个称为scaled-index byte的字节，用于指示更多种类的缩放索引寻址方式。


<div align="center">
<img src="../img/chap4/scaled_index.png" width="500">
</div>


仅在 80386 到 Core2 微处理器中，MOV 指令的变体就超过了 32,000 种。
下图展示了当 80386 及以上处理器在使用 32 位地址时，R/M 字段取值为 100 时所选择的 scaled-index 字节的格式。

<div align="center">
<img src="../img/chap4/32mc.png" width="500">
</div>

<div align="center">
<img src="../img/chap4/scale.png" width="500">
</div>


最左侧的 2 位用于选择缩放因子（乘数），其取值可以为 1x、2x、4x 或 8x。
缩放索引寻址同样允许对单一寄存器应用缩放因子进行乘法运算。

例如

```asm
 MOV EAX, [EBX+4*ECX] 
```

编码为 8B048BH

- First byte (8BH):100010 11 → D = 1
- Second byte (04H): 00 000 100 → Mod=00，没有disp，REG=000 代表EAX，R/M=010 scaled-index 寻址.
- Third byte (8BH): 10 001 011 → SS=10，表示4倍缩放,Index=001 代表ECX，Base=101 代表EBX

#### 64 Bit Mode

在64位模式下，引入了一个称为REX（寄存器扩展）的前缀，用于扩展操作数大小以及支持R8-R15等新寄存器的使用。

- REX并不是一个唯一的数值，而是一个范围（40h 到 4Fh），位于其他前缀之后、操作码之前。
- REX的作用是修改指令第二字节中的reg和r/m字段。
- 通过REX前缀可以访问R8-R15等扩展寄存器。

REX 前缀包含五个字段。高半字节用于唯一标识 REX 前缀。低半字节被分为四个位（W、R、X 和 B），每个位各占一位。


<div align="center">
<img src="../img/chap4/REX.png" width="500">
</div>


| 位 (Bit) | 字段名称 | 含义 (Meaning) | 关联结构 (Extension Target) | 功能描述 & 通俗解释 |
| :---: | :--- | :--- | :--- | :--- |
| **3** | **REX.W** | **W** idth<br>(操作数宽度) | 操作数大小属性 | **0**: 默认大小（通常 32 位，如 `EAX`）<br>**1**: 强制 **64 位** 大小（如 `RAX`） |
| **2** | **REX.R** | **R** egister<br>(寄存器扩展) | **ModR/M** 字节中的<br>`reg` 字段 | **Reg 字段扩展位 (MSB)**<br>将原有的 3 位 `reg` 扩展为 4 位，允许在通用寄存器位置使用 **R8-R15**。 |
| **1** | **REX.X** | Inde **X** <br>(索引扩展) | **SIB** 字节中的<br>`index` 字段 | **Index 字段扩展位 (MSB)**<br>用于复杂内存寻址（如数组索引）。允许使用 **R8-R15** 作为索引寄存器。 |
| **0** | **REX.B** | **B** ase<br>(基址扩展) | **ModR/M** 字节中的 `r/m`<br>或 **SIB** 字节中的 `base` | **Base/RM 字段扩展位 (MSB)**<br>允许使用 **R8-R15** 作为：<br>1. 寻址的基地址 (Base Address)<br>2. `r/m` 指定的源/目的操作数 |


接下来通过两个指令查看REX的效果:


<div align="center">
<img src="../img/chap4/REX_exp1.png" width="500">
</div>

```asm
MOV R10, R15
```

编码为 4D 89 FA H

- First byte (4DH): 0100 1101 → 0100是REX固定前缀，W=1，R=1，X=0，B=1，表示64位模式，Reg扩展和Base扩展开启
- Second byte (89H): 100010 01 → D = 0 MOD-REG-R/M字段中，REG存放R15，R/M存放R10
- Third byte (FAH): 11 111 010 → R15, R10，MOD字段为11，代表R/M字段此时存放寄存器，REG字段为111，再拼上REX.R=1111，代表R15，R/M拼上REX.B=1111，代表R10



<div align="center">
<img src="../img/chap4/REX_exp2.png" width="500">
</div>

```asm
MOV R10, [R15+4*R11]
```

编码为 4F8B149F H

- First byte (4FH): 0100 1111 → 0100是REX固定前缀，W=1，R=1，X=1，B=1，表示64位模式，Reg,Index,Base扩展全部开启

- Second byte (8BH): 100010 11 → D = 1，代表数据从R/M流向REG，所以REG字段存放R10，R/M字段存放[R15+4*R11]

- Third byte (14H): 00 010 100 → 00 代表无Displacement的内存寻址，010 拼上扩展的REX.R变成1010，代表R10，R/M=100代表Scaled-index寻址

- Fourth byte (9FH): 10 011 111 → SS=10，表示4倍缩放,Index=011 拼上扩展的REX.X变成1011，代表R11作为index，Base=111拼上扩展的REX.B变成1111，代表R15作为base


## Prefixes

指令前缀分为四组，对于每条指令，每一组中最多只能使用一个前缀。

| 组别 (Group) | 类别描述 | 十六进制码 (Hex) | 助记符/描述 (Mnemonic/Description) |
| --- | --- | --- | --- |
| **Group 1** | **锁与重复前缀** | `0xF0` | LOCK (总线锁) |
|  |  | `0xF2` | REPNE / REPNZ (不相等/非零时重复) |
|  |  | `0xF3` | REP or REPE / REPZ (重复 或 相等/为零时重复) |
| **Group 2** | **段覆盖前缀** (Segment override) | `0x2E` | CS segment override (代码段覆盖) |
|  |  | `0x36` | SS segment override (堆栈段覆盖) |
|  |  | `0x3E` | DS segment override (数据段覆盖) |
|  |  | `0x26` | ES segment override (附加段覆盖) |
|  |  | `0x64` | FS segment override (FS段覆盖) |
|  |  | `0x65` | GS segment override (GS段覆盖) |
|  |  | `0x2E` | CS segment override (代码段覆盖) |
| **Group 3** | **操作数大小覆盖** | `0x66` | Operand-size override prefix (操作数宽度翻转，如 16位↔32位) |
| **Group 4** | **地址大小覆盖** | `0x67` | Address-size override prefix (地址宽度翻转，如 16位↔32位) |

### Lock Prefix - Group1

LOCK 前缀用于使某些对内存的“读-改-写”指令以原子方式执行操作。

- 该前缀的目的是在多处理器系统中，使处理器可以独占对共享内存的使用。
- LOCK 前缀只能用于以下对内存操作数进行写操作的指令：BTC、BTR、BTS、ADC、ADD、AND、DEC、INC、NEG、NOT、OR、SBB、SUB、XOR、CMPXCHG、CMPXCHG8B、CMPXCHG16B、XADD 和 XCHG。
- 如果 LOCK 前缀被用于其他指令，则会产生未定义操作码异常（#UD）。

### Segment Override Prefix - Group2

处理器会根据以下规则自动选择默认段寄存器：

- 指令取指：CS
- 局部数据：DS
- 堆栈：SS
- 字符串操作的目的操作数：ES

程序员可以通过段重写前缀（segment-override prefix）来覆盖默认段寄存器，该前缀是加在指令前的一个字节。

例如，在32位模式下：

```asm
MOV EAX, [EBX]         ; 8B 03，默认段为DS
MOV EAX, CS:[EBX]      ; 2E 8B 03，其中2E就是CS段重写前缀
```

### Operand-size Override Prefix - Group3

在64位模式下，指令默认操作数大小为32位。
通过前缀允许同时使用16位、32位和64位数据：

- REX (REX.W) 前缀可指定操作数为64位
- 66H 前缀可指定操作数为16位
- 若同时存在，REX前缀优先级高于66H前缀

<div align="center">
<img src="../img/chap4/operand_size.png" width="500">
</div>

!!!question "How can  instructions share an opcode?"
    <div align="center">
    <img src="../img/chap4/opcode_share.png" width="500">
    </div>
    

    默认的操作数大小由当前的操作模式决定，但操作数大小覆盖前缀（REX 或 66H）可以改变默认的操作数大小。例如，在64位模式下（默认操作数大小为32位）：


    <div align="center">
    <img src="../img/chap4/opcode_shared.png" width="500">
    </div>
    



!!!Summary 
    - 操作码中的 W 位用于区分 8 位操作数和“非 8 位”操作数（即，默认操作数大小）。
    - 操作数大小前缀（66H）可在 16 位和 32 位操作数大小之间切换。
    - 在 64 位模式下，REX.W 位可在 32 位和 64 位操作数大小之间切换。    

    以下流程图说明了在64位模式下，判断操作数大小的过程：
    ```mermaid
    graph TD
    Start("开始: 确定操作数大小") --> Step1{"1. 检查 Opcode W-bit"}
    
    %% 第一层级: Opcode W-bit
    Step1 -- "W=0 (8-bit)" --> Res8["结果: 8-bit 操作数"]
    Step1 -- "W=1 (Full-size)" --> Step2{"2. 检查 REX.W 位<br/>(仅限 64位模式)"}
    
    %% 第二层级: REX.W
    Step2 -- "W=1" --> Res64["结果: 64-bit 操作数"]
    Step2 -- "W=0 (或无 REX)" --> Step3{"3. 检查 0x66 前缀"}
    
    %% 第三层级: 0x66 Prefix
    Step3 -- "存在 (Yes)" --> Res16["结果: 16-bit 操作数"]
    Step3 -- "不存在 (No)" --> Res32["结果: 32-bit 操作数<br/>(默认缺省值)"]

    %% 样式定义
    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Res8 fill:#ff9,stroke:#333
    style Res64 fill:#f96,stroke:#333
    style Res16 fill:#9cf,stroke:#333
    style Res32 fill:#cfc,stroke:#333
    ```


### Address-size Override Prefix - Group4

在 64 位模式下，默认的地址大小是 64 位。虽然可以通过前缀将地址大小覆盖为 32 位，但不支持 16 位地址。 地址大小覆盖前缀（67H）用于选择非默认的地址大小。

<div align="center">
<img src="../img/chap4/address_size.png" width="500">
</div>


!!!question "How to change the address size?"
    内存操作数的默认地址大小由当前的操作模式决定，但可以通过地址大小覆盖前缀（67H）进
    例如：
    
    - 在 64 位模式下，地址默认是 64 位，但可以通过地址大小前缀将其切换为 32 位。

    <div align="center">
    <img src="../img/chap4/address_size_exp1.png" width="500">
    </div>

    - 在 32 位模式下，地址默认是 32 位，但可以通过地址大小前缀将其切换为 16 位。

    <div align="center">
    <img src="../img/chap4/address_size_exp2.png" width="500">
    </div>



!!!example
    Problem: In 32-bit operation mode, which prefix (or prefixes) will be applied to the instruction: MOV AL, [BX] ?
    
    - A. Operand-size prefix only
    - B. Address-size prefix only
    - C. Both operand-size and address-size prefixes
    - D. None

    Answer: B

    解释：在 32 位操作模式下，默认的地址大小是 32 位。可以使用地址大小覆盖前缀（67H）将地址大小更改为 16 位。而可以直接用W=0来将操作数大小更改为 8 位，由Opcode决定。


!!!warning
    对于各种前缀的顺序，传统前缀之间 (如 66H 和 67H)没有顺序要求，谁先谁后都可以。因为在机器码层面，CPU 的指令解码器（Decoder）能够识别出 0x66 和 0x67 都是传统前缀（Legacy Prefixes）。只要它们属于不同的“组”（Group），就可以共存，且顺序互换完全不影响指令执行。

    但是，当涉及 REX 前缀时，顺序就很重要了。REX 前缀必须排在所有传统前缀之后，紧挨着 Opcode。