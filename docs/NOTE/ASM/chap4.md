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


## LOAD EFFECTIVE ADDRESS

Load-effective address 指令集旨在支持高级语言（如 C）。主要有两类 load-effective address 指令：

- LEA：加载有效地址（offset）。
- LDS、LES、LFS、LGS 和 LSS：加载远指针（segment selector and offset）。


### LEA

将 16 位或 32 位寄存器加载为操作数指定数据的偏移地址。

- 通过对比 LEA 和 MOV，可以发现：
    - LEA BX,[DI] 会将 [DI]（即 DI 的内容）指定的偏移地址加载到 BX 寄存器中；
    - MOV BX,[DI] 则会将 [DI] 所指定内存地址中的数据加载到 BX 寄存器中。
- SEG 和 OFFSET 伪指令分别返回某一内存位置的段地址和偏移地址。

>如果操作数是位移量（displacement），OFFSET 伪指令的作用与 LEA 指令相同。

<div align="center">
<img src="../img/chap4/lea_exp1.png" width="500">
</div>

将 SI 加载为 DATA1 的地址，将 DI 加载为 DATA2 的地址。然后交换这两个内存位置中的内容。


OFFSET 比 LEA 指令更高效

- 在 80486 微处理器中，MOV BX,OFFSET LIST 只需一个时钟周期， 而 LEA BX,LIST 需要两个时钟周期
- MOV BX,OFFSET LIST 实际上会被汇编为立即数传送指令（如 MOV BX, 0x9），因此更高效。

如果 OFFSET 能完成同样的功能，为什么还需要 LEA 指令？

- OFFSET 只能用于简单操作数（如 LIST），不能用于类似 [DI]、LIST [SI] 这样的操作数。
例如，LEA BX, [DI] 相当于 MOV BX, DI
- LEA SI, [BX+DI]：该指令将 BX 和 DI 相加，并将结果存入 SI 寄存器中。该结果是一个模 64K 的和。


### LDS, LES, LFS, LGS, and LSS

LEA 指令将任意 16 位寄存器加载为偏移地址，偏移地址由所选定的寻址方式决定。

LDS 和 LES 指令用于从内存中加载远地址

- 从内存中获取偏移地址，并加载到 16 位或 32 位寄存器中；
- 随后再从内存中获取段地址或段选择子，分别加载到 DS 或 ES 中。


<div align="center">
<img src="../img/chap4/lds_exp.png" width="500">
</div>


当 DS=1000H 且 DI=1000H 时，LDS BX,[DI] 指令会从地址 11000H 和 11001H 加载数据到 BX 寄存器，并从地址 11002H 和 11003H 加载数据到 DS 寄存器。上图展示了该指令在 DS 即将变为 3000H、BX 即将变为 127AH 之前的状态。

!!!warning
    注意，LEA加载地址时不会访问内存，而LDS会访问内存，将偏移量从内存读出加载到目的寄存器，将段选择子从内存读出加载到段寄存器。


指令可以使用任何内存寻址方式访问包含段地址和偏移地址的 32 位或 48 位内存区域。  

- 32 位远指针：16 位段地址 + 16 位偏移地址  
- 48 位远指针：16 位选择子 + 32 位偏移地址  

在 80386 及以上处理器中，LFS、LGS 和 LSS 指令被加入指令集。这些指令可以将任何 16 位或 32 位通用寄存器加载为偏移地址，同时将 DS、ES、FS、GS 或 SS 段寄存器加载为段地址或段选择子。

LDS、LES、LFS、LGS 和 LSS 指令从内存中获取一个新的远地址。

- 首先是偏移地址，然后是段地址或段选择子。

<div align="center">
<img src="../img/chap4/lea_instr.png" width="500">
</div>


汇编程序可以将远地址存储在内存中。在这些加载指令中，最有用的是 LSS 指令。以下程序展示了如何利用 LSS 指令同时加载 SS 和 SP，从而重新激活旧的堆栈区。

```asm
CLI                       ; 禁止中断，避免切换堆栈过程中被中断打断
MOV AX , SP               ; 备份当前堆栈指针（SP）到AX
MOV WORD PTR SADDR , AX   ; 将当前SP值存储到内存SADDR处
MOV AX , SS               ; 备份当前堆栈段（SS）到AX
MOV WORD PTR SADDR+2 , AX ; 将当前SS值存储到SADDR+2处（即SADDR: 低2字节保存SP，高2字节保存SS）
MOV AX,DS                 ; 取得数据段寄存器DS的值
MOV SS,AX                 ; 用DS的值设置SS，这样可以切换到以DS为段的堆栈（注意，此处DS与SS暂时相同）
MOV AX,OFFSET STOP        ; 取得标号STOP的偏移，准备设置SP
MOV SP,AX                 ; SP设置为STOP的偏移地址，堆栈移动到新位置
STI                       ; 允许中断
...                       ; 其他操作
MOV AX,AX                 ; 占位（无实际作用）
MOV AX,AX                 ; 同上
LSS SP,SADDR              ; 一条指令同时恢复原来的SS和SP，SADDR保存了原SS和SP的值，实现堆栈区的恢复
```

CLI（清除中断标志，禁止中断）和 STI（设置中断标志，允许中断）指令必须包含在内，以实现在切换堆栈时关闭中断的功能。


## STRING DATA TRANSFERS

五种字符串数据传送指令：

- LODS, STOS, MOVS, INS, OUTS

两种字符串比较指令：

- SCAS, CMPS

>每条指令的前2-3个字母都体现了该指令的操作含义。其中所有指令中的“S”代表“String”（字符串）。

每条指令都可以实现以字节、字（word）或双字（doubleword）为单位的数据传送或比较操作，并且隐式地使用 DI、SI 或二者寄存器来进行内存寻址。字符串指令执行效率高，因为它们能够自动重复并且自动修改数组下标（指针）。


!!!example "string comparison"
    ```asm
    REPE CMPSB    ; 当且仅当 ZF=1（前一次比较结果相等）时，重复执行CMPSB，ECX=0或发现不相等为止
    ```

    这条简短的指令涉及到很多细节，首先REPE是重复前缀，repeat when equal，同时使用了EDI和ESI作为源寄存器和目的寄存器，还有DF标志位来控制方向，ECX 寄存器来设置比较次数，以及zero flag来控制是否继续比较。

### DI and SI

- DI/EDI 通常与附加段 ES 一起使用，且段寄存器不可更改，**字符串指令的目的操作数必须使用ES段，不可更改**
- SI/ESI 通常与数据段 DS 一起使用，且段寄存器可更改，虽然SI默认使用DS段，但可通过段超越前缀显式指定其他段寄存器（如CS、ES、FS等）：

在 32 位模式下，EDI 和 ESI 寄存器取代了 DI 和 SI 的作用，这使得字符串操作可以访问整个 4GB 受保护模式下的所有内存空间。




### The Direction Flag, DF

<div align="center">
<img src="../img/chap4/df.png" width="500">
</div>

- DF=0，自动递增指针
- DF=1，自动递减指针


方向标志位（D 位，位于标志寄存器中）用于选择在字符串操作中 DI 和 SI 寄存器是自动递增还是自动递减。

- 该标志仅被字符串指令使用。
- CLD 指令用于清除 D 标志位（DF=0），STD 指令用于设置 D 标志位（DF=1）。
- 执行 CLD 指令时，选择自动递增模式；
- 执行 STD 指令时，选择自动递减模式。


### REP prefix

一条字符串基本指令只能处理一个内存值或一对内存值。如果添加重复前缀（REP），指令会重复执行，使用 CX 或 ECX 作为计数器。

- 重复前缀允许通过一条指令处理整个数组。
- 通常使用以下几种重复前缀：


| 前缀            | 含义                                                         |
|-----------------|--------------------------------------------------------------|
| REP             | 当 ECX > 0 时重复执行指令                                     |
| REPZ, REPE      | 当零标志（ZF）为1 且 ECX > 0 时重复执行指令                  |
| REPNZ, REPNE    | 当零标志（ZF）为0 且 ECX > 0 时重复执行指令                  |

> - **REP**：仅依赖于计数器 ECX，常用于无条件重复。
> - **REPZ/REPE**（Repeat while Equal）：通常配合 CMPS/SCAS，表示前一次结果为相等时继续，ZF=1。
> - **REPNZ/REPNE**（Repeat while Not Equal）：通常配合 CMPS/SCAS，表示前一次结果不等时继续，ZF=0。


!!!Example "copy a string"
    在下面的例子中，MOVSB 指令将 10 个字节从 string1 拷贝到 string2。
    当重复执行 MOVSB 指令时，ESI 和 EDI 会被自动递增。这个行为由方向标志（Direction Flag, DF）控制。

    ```asm
    cld                     ; clear direction flag（方向标志为0，自动递增）
    mov esi, OFFSET string1 ; ESI 指向源字符串
    mov edi, OFFSET string2 ; EDI 指向目标字符串
    mov ecx, 10             ; 计数器设置为10
    rep movsb               ; 连续移动10个字节
    ```

    <div align="center">
    <img src="../img/chap4/rep_exp.png" width="500">
    </div>



### Suffix

- B：字节（byte）
- W：字（word）
- D：双字（doubleword）
- 例如： 
    - MOVSB，按字节进行的 MOVS 操作
    - LODSW，按字进行的 LODS 操作

### LODS

>这是唯一一条不需要REP前缀的字符串指令

LODS 使用隐含操作数（AL、AX、EAX），这些寄存器不会在指令或操作码中显式地提及。

- LODS 指令将字节、字或双字从源地址（DS:SI 或 ESI）传送到 AL、AX 或 EAX。
- 指令后缀表示操作的数据大小：
    - LODSB：SI/ESI 增减 ±1
    - LODSW：SI/ESI 增减 ±2
    - LODSD：SI/ESI 增减 ±4


<div align="center">
<img src="../img/chap4/lodsw_exp.png" width="500">
</div>


如果 DS=1000H，SI=1000H，方向标志 D=0 时，LODSW 指令的操作过程如下：此时 AX 已经从内存中装载了数据，但 SI 尚未自增 2。

### STOS

STOSB、STOSW 和 STOSD 分别将 AL、AX 或 EAX 的值存储到目的地址 ES:DI（或 EDI）中。

- STOSB：对 ES:DI/EDI 增加或减少 ±1
- STOSW：对 ES:DI/EDI 增加或减少 ±2
- STOSD：对 ES:DI/EDI 增加或减少 ±4

STOS 使用隐含操作数（AL、AX、EAX），这些寄存器在指令参数或操作码中不会被显式写出。

*除了 LODS 之外，任何字符串数据传送指令都可以加上 REP 前缀，以避免寄存器中的数据被改写*。

- 如果 CX 的值减到 0，指令就会结束，程序继续执行后续内容。
- 如果将 CX 设为 100 并执行 REP STOSB 指令，微处理器会自动重复执行 STOSB 100 次。

*REP 前缀与 STOS 连用时，可以让 STOS 指令非常方便地将某个值批量填充到字符串或数组中的所有元素*。

- 例如，下面的代码可以把 string1 中的每个字节都赋值为 0FFh。

```asm
.DATA
Count   = 100
string1 BYTE Count DUP(?)

.CODE
    mov al, 0FFh           ; 要存储的值
    mov edi, OFFSET string1 ; 目标地址（ES:DI/EDI）
    mov ecx, Count         ; 字符数量
    cld                    ; 方向标志 = 正向
    rep stosb              ; 用 AL 填充整个 string1
```


### MOVS


- MOVS 指令用于将一个字节、字或双字从 DS:SI 传送到 ES:DI，并根据数据大小自动更新 SI 和 DI 的值。
- 后缀（B、W 或 D）指示操作数据的位宽：
    - MOVSB：DS:SI 和 ES:DI 都增加或减少 ±1
    - MOVSW：DS:SI 和 ES:DI 都增加或减少 ±2
    - MOVSD：DS:SI 和 ES:DI 都增加或减少 ±4
- MOVS 常用于在内存之间批量传输数据块。

<span style="color:red;">8086 到 Pentium 4 微处理器中，MOVS 是唯一允许内存对内存直接传送的指令。</span>


!!!Example "transferring two blocks of doubleword memory"
    ```c
    void TransferBlocks (int blockSize, int* blockA, int* blockB)
    {
    for (int a = 0; a < blockSize; a++)
    {
    *blockB = *blockA++;
    blockB++;
    }
    }
    ```

    ```asm
    ; 保存寄存器
    push    es
    push    edi
    push    esi
    push    ds
    pop     es              ; 将 DS 的值复制到 ES

    mov     esi, blockA     ; 源地址 blockA -> ESI
    mov     edi, blockB     ; 目标地址 blockB -> EDI
    mov     ecx, blockSize  ; 传送的 doubleword 数量

    rep     movsd           ; 批量传送 doubleword 数据

    pop     esi
    pop     edi
    pop     es              ; 恢复寄存器
    ```
### INS

<div align="center">
<img src="../img/chap4/INS.png" width="500">
</div>

将一个字节、字或双字的数据从 I/O 设备传送到额外段（ES）所指定的内存位置中。INS 指令使用 DX 或 EDX 作为源操作数用于指定 I/O 地址或端口。目的操作数是 ES:DI 或 ES:EDI 所指向的内存位置。

- 适用于将外部 I/O 设备的数据块直接输入到内存中。
- 一个典型应用就是将数据从磁盘驱动器转移到内存。
    - 在计算机系统中，磁盘驱动器通常被视为 I/O 设备进行接口连接。

- INS 指令有两种形式：显式操作数和无操作数形式。
- 显式操作数形式允许明确指定源和目的操作数，例如 INS WORD PTR [DI], DX。
- 源操作数必须是 DX，目标操作数应为 ES:DI 或 ES:EDI。
- 无操作数形式则为字节、字和双字版本提供简写方式。
- 无操作数形式有三种基本指令：
    - INSB：从 8 位 I/O 设备输入数据，并存储到由 DI 索引的内存。
    - INSW：输入 16 位 I/O 数据，存储到字大小的内存位置。
    - INSD：输入 32 位 I/O 数据，存储到双字大小的内存。
- 这些指令可以通过 REP 前缀重复执行，这样就可以将整个数据块从 I/O 设备输入到内存中。

<div align="center">
<img src="../img/chap4/INS_exp.png" width="500">
</div>

该指令序列从 I/O 端口 03ACH 的设备输入 50 个字节的数据，并将这些数据存储到附加段（ES）中的内存数组 LISTS。

这里设置DF=0,用来设置读了一个之后DI是增还是减。

### OUTS
从数据段内存地址到 I/O 设备中。

- 源操作数是由 DS:SI 或 DS:ESI 指定的内存地址。
- 目标操作数（I/O 地址或 I/O 端口）与 INS 指令一样，包含在 DX 寄存器中。
- 在 Pentium 4 和 Core2 的 64 位模式下，不支持 64 位输出，但 RSI 中的地址宽度为 64 位。


OUTS 指令同样允许两种形式：显式操作数形式和无操作数形式。

- 显式操作数形式，允许明确指定源和目的操作数，例如 OUTS DX, WORD PTR [SI]。
- 源操作数应该为 DS:SI 或 DS:ESI，目标操作数是 DX。

- 无操作数形式提供了 OUTS 指令的字节、字和双字的简写形式。
    - OUTSB 指令将 SI 索引的一个字节大小的内存数据输出到 8 位 I/O 设备。
    - OUTSW 指令输出一个字（16 位）的内存数据到 16 位 I/O 设备。
    - OUTSD 指令输出一个双字（32 位）的内存数据到 32 位 I/O 设备。

<div align="center">
<img src="../img/chap4/OUTS_exp.png" width="500">
</div>

该指令序列演示了一段简短的指令流程，将数据段内存数组（ARRAY）中的数据传送到 I/O 地址为 3ACH 的 I/O 设备。

## MISCELLANEOUS DATA TRANSFER INSTRUCTIONS

在程序中使用的数据传送指令，包含：XCHG、LAHF、SAHF、XLAT、IN、OUT、BSWAP、MOVSX、MOVZX 和 CMO。


### XCHG
>exchange

交换寄存器与另一个寄存器或内存单元的内容。

- 不能交换段寄存器，也不能进行内存到内存的数据交换。
- 这是一种少见的具有两个输出的指令。
- 可交换字节、字或双字，并且可以使用除立即寻址以外的所有寻址方式。
- 使用16位AX寄存器与另一个16位寄存器进行交换时，XCHG指令最高效，该指令只占用1字节的存储空间。

<div align="center">
<img src="../img/chap4/XCHG.png" width="500">
</div>

当使用内存寻址方式和汇编器时，哪个操作数是内存操作数并不重要。例如，XCHG AL,[DI] 与 XCHG [DI],AL 是等效的。XCHG 指令常用于实现进程同步中的信号量。（相当于操作系统中提到的swap）

!!!example "acquire the spinlock"
    ```asm
    ; acquire the spinlock
    ; lock variable. 1 = locked, 0 = unlocked.
    locked  dd  0

    ; Set the EAX register to 1.
    spin_lock:
        mov     eax, 1
    ; Atomically swap the EAX with the lock.
        lock xchg eax, [locked]
    ; Test EAX with itself.
        test    eax, eax
    ; If EAX is 0, we just obtain and lock it.
    ; Otherwise, repeatedly request the lock.
        jnz     spin_lock
        ret

    ; release the spinlock
    ; Set the EAX register to 0.
    spin_unlock:
        mov     eax, 0
    ; Atomically swap the EAX register with the lock variable.
        lock xchg eax, [locked]
        ret
    ```

    获取锁的时候，如果交换之后EAX还是1，说明别的进程已经把【locked】置为1了，获取锁失败


### LAHF and SAHF

LAHF指令将EFLAGS寄存器的低8位传送到AH寄存器。
- AH := EFLAGS (SF:ZF:0:AF:0:PF:1:CF)
    - 即将符号标志（SF）、零标志（ZF）、辅助进位标志（AF）、奇偶标志（PF）和进位标志（CF）保存到AH寄存器对应位中。
    - EFLAGS的保留位1、3、5会分别被设置为1、0、0

>如果CPUID.80000001H:ECX寄存器的LAHF_SAHF（第0位）为1，则LAHF指令可在64位模式下使用。

SAHF指令会把AH寄存器中对应位（位7、6、4、2、0）的值，传送到EFLAGS寄存器的SF、ZF、AF、PF和CF标志位中。

- SAHF指令会忽略AH的1、3、5位，并且在EFLAGS寄存器中将这三个位置为1、0、0。

>如果CPUID.80000001H:ECX寄存器的LAHF_SAHF（第0位）为1，则SAHF指令可在64位模式下使用。


### XLAT

XLAT（表查找转换）指令使用隐式操作数（AL 和 BX）：

- 将 AL 寄存器中的无符号整数作为偏移量，加到 BX 指定的表地址上，并把该位置上的内容（[BX+AL]）复制到 AL 寄存器中。
- XLAT 的效果类似于 MOV AL, [seg:BX + AL]。
- 其中 seg:[BX] 是表的基地址，默认段寄存器为 DS，也可以使用段前缀修改。
- 注意，[seg:BX + AL] 这种内存操作数在其他指令中并不合法，只有 XLAT 指令才可以使用。

XLAT 常用来实现数据的格式转换。例如，将菜单中食品的索引号转换为对应价格：

- 首先，为存放价格的表预留 256 字节空间；
- 然后，将该表的地址加载到 DS:BX 中，把食品的索引号放入 AL；
- 接着，XLAT 会根据索引，把对应的价格查出来存入 AL。

<span style="color:red;">XLAT 会写入 AL，但不会改变 EAX[31:8] 这部分内容。</span>


<div align="center">
<img src="../img/chap4/XLAT.png" width="500">
</div>


假设7段数码管显示的数据查找表存储在内存地址TABLE处，XLAT指令可以利用该查找表，将AL中的BCD数字转换为对应的7段显示编码，并存回AL中。

<div align="center">
<img src="../img/chap4/XLAT_exp.png" width="500">
</div>

TABLE = 1000H，DS = 1000H，且 AL 的初值为 05H（BCD），则上述示例程序的运行过程如下：经过查表转换后，AL 变为 6DH。


### Input and Output Ports

诸如屏幕、显示器、键盘、鼠标、硬盘和网络等外部设备，通过输入端口和输出端口与数据总线相连。
每个输入或输出端口都具有唯一的地址，这类似于内存中的每个字节单元都有唯一的地址。


<div align="center">
<img src="../img/chap4/output.png" width="500">
</div>

一个输出端口包含一个比较器，用于将固定地址与地址总线上的值进行比较。当地址与端口地址相等且控制总线上有写信号时，锁存器会从数据总线存储该值。


<div align="center">
<img src="../img/chap4/input.png" width="500">
</div>

外部设备的每个输入信号都通过三态缓冲器送到数据总线。当地址总线上的地址与输入端口的固定地址相等，并且控制总线有读信号时，三态缓冲器被使能。


### IN & OUT


IN 和 OUT 指令用于执行输入/输出（I/O）操作。 

- AL、AX 或 EAX 寄存器的内容，仅在 I/O 设备与微处理器之间传递。
- IN 指令将外部 I/O 设备的数据读入 AL、AX 或 EAX，例如 IN AL, 19H
- OUT 指令将 AL、AX 或 EAX 的数据输出到外部 I/O 设备，例如 OUT 32H, AX
- 只有 80386 及以上处理器包含 EAX 寄存器

指令通常存储在 ROM（只读存储器）中。

- 存储在 ROM 中的定端口（fixed-port）指令，由于 ROM 的只读属性，其端口号是永久固定的
- 存储在 RAM 中的定端口地址可以被更改，但这种做法并不符合良好的编程习惯。I/O 操作期间，端口地址会出现在地址总线上。

I/O 端口寻址有两种形式：

- 固定端口寻址（fixed-port addressing）：允许使用 8 位 I/O 端口地址（如 IN AL, 12H 或 OUT 25H, AX）在 AL、AX 或 EAX 和端口之间传输数据
   - 端口号是紧跟在指令操作码后的一个字节立即数（00h 到 FFh）

- 可变端口寻址（variable-port addressing）：允许在 AL、AX 或 EAX 与 16 位端口地址之间传递数据（如 IN AL, DX 或 OUT DX, AX）
   - I/O 端口号存储在 DX 寄存器中（0000h 到 FFFFh），并且可在程序执行过程中动态改变


<div align="center">
<img src="../img/chap4/OUT_exp.png" width="500">
</div>


该图展示了指令 OUT 19H,AX 的执行过程，即将 AX 的内容输出到 I/O 端口 19H。OUT 指令中使用的源寄存器决定了端口的数据宽度


<div align="center">
<img src="../img/chap4/IN_OUT.png" width="500">
<center> IN and OUT instructions</center>
</div>



!!!Example
    下面的例子展示了一个让电脑扬声器发出“咔哒”声的程序。
    - 在 DOS 下，扬声器通过访问 I/O 端口 61H 控制。如果该端口的最低两位被设置为 1（11），然后再清零为 0（00），扬声器就会发出咔哒声。


    ```asm
    .MODEL TINY               ; 选择 TINY 模型
    .CODE                     ; 开始代码段
    .STARTUP                 
        IN   AL, 61H         ; 从端口 61H 读入 AL
        OR   AL, 3           ; 令最低两位变为 1，开启扬声器
        OUT  61H, AL         ; 写回到端口 61H
        MOV  CX, 8000H       ; 延时（循环次数可以调整）32768次，但是实际上很短很短
    L1:
        LOOP L1              ; 循环造成一定延时
        IN   AL, 61H         ; 重新从 61H 端口读 AL
        AND  AL, 0FCH        ; 令最低两位清零，关闭扬声器
        OUT  61H, AL         ; 写回端口 61H
    .EXIT
    END
    ```
### MOVSX and MOVZX

MOVZX（移动并零扩展）和 MOVSX（移动并符号扩展）指令出现在 80386 到 Pentium 4 的指令集中。例如：

- 如果将一个 8 位的 8FH 进行零扩展为 16 位数据，则得到 008FH。
- 如果将一个 8 位的 8FH 进行符号扩展为 16 位数据，则得到 FF8FH。


<div align="center">
<img src="../img/chap4/MOVSX_MOVZX.png" width="500">
</div>


<div align="center">
<img src="../img/chap4/MOVSX_MOVZX_inst.png" width="500">
</div>



### BSWAP

BSWAP（字节交换）指令用于反转32位或64位寄存器操作数中的字节顺序。

- BSWAP指令常用于在大端和小端格式之间转换数据。
- 它将任意32位寄存器中的第1个字节与第4个字节交换，第2个字节与第3个字节交换。
- 例如，BSWAP EAX 指令在 EAX=12345678H 时，交换后 EAX=78563412H。

<div align="center">
<img src="../img/chap4/BSWAP.png" width="400">
</div>


不使用 BSWAP 的正确字节交换方法是：

```asm
XCHG AH, AL
ROR EAX, 16 ; rotate right of EAX
XCHG AH, AL
```


在64位操作（处理一个四字节数据）时，位7:0与位63:56交换，位15:8与位55:48交换，位23:16与位47:40交换，位31:24与位39:32交换。在64位模式下，该指令的默认操作数大小为32位。通过使用REX前缀，可以访问更多寄存器（R8-R15）。


|Instruction|OPcode|Description|
|-----------|------|-----------|
|BSWAP reg32|0F C8 + rd|Reverses the byte order of a 32-bit register|
|BSWAP reg64|REX.W + 0F C8 + rd|Reverses the byte order of a 64-bit register|

在“Opcode”列中，+rd 表示操作码字节的低三位用于编码寄存器操作数，而无需使用 modR/M 字节，


<div align="center">
<img src="../img/chap4/BSWAP_inst.png" width="400">
</div>

Opcode（操作码）：0F C8 是基础操作码。
>寄存器 ID (0-7)：RAX=0, RCX=1, RDX=2, RBX=3, RSP=4, RBP=5, RSI=6, RDI=7。

+rd 的含义：这是一种特殊的编码方式。通常 x86 指令需要一个额外的字节（ModR/M）来指定操作数寄存器，但为了节省空间，某些指令允许将寄存器的 ID 直接加到操作码的最后一个字节上。这里真的是加法。



对16位寄存器使用BSWAP指令的结果是未定义的。

- 若要交换16位寄存器的两个字节，应使用XCHG指令。
- 例如，要交换AX寄存器的高低字节，可使用XCHG AL, AH。


### CMOV

每个 CMOVcc 指令在 EFLAGS 寄存器（CF、OF、PF、SF 和 ZF）中的标志位处于特定状态（或条件）时才执行数据移动操作。

- 每条指令都带有一个条件码（cc），用于指示要检测的条件。
   - 只有在条件为真时，才进行数据移动。
   - 如果条件不满足，则不进行移动，程序继续执行 CMOVcc 指令后的下一条指令。
- 例如，CMOVZ 指令只在前一条指令的结果为零时才移动数据。
- 目的操作数只能是16位、32位或64位的寄存器，但源操作数可以是16位、32位或64位的寄存器或内存位置。
- 由于这是新引入的指令，若要在汇编器中使用它，必须在程序中添加 .686 开关。

<div align="center">
<img src="../img/chap4/CMOV.png" width="400">
</div>

CMOV 指令的目的是避免使用分支指令。 当 CPU 遇到分支（例如 JNE）时，会预测分支是否会被执行，并基于该预测开始推测性地执行后续指令。


如果预测错误，会产生性能损失，因为CPU需要丢弃所有已推测执行的工作，然后重新获取并执行正确的路径。

对于条件赋值指令（如 CMOVE eax, edx），CPU 无需猜测将执行哪段代码，因此可以避免因分支预测失败带来的代价。




假设需要根据 `condition`，决定变量 `a` 是被赋值为 `b` 还是 `c`，可用传统的分支实现，也可用无分支的 CMOV 指令：

```c
if (condition) {
    a = b;
} else {
    a = c;
}
```

```asm
cmp   condition, 0
jz    else        ; 若condition为0，跳转到else
mov   a, b        ; if 部分，a = b
jmp   endif
else: mov a, c    ; else 部分，a = c
endif:
```

```asm
cmp    condition, 0
mov    a, c       ; 默认赋值为c（else部分）
cmovnz a, b       ; 若condition非零，则a = b（只在ZF=0时赋值）
```
其中 `cmovnz` 表示“zero flag 不为零，则赋值”。其它条件可参考CMOV家族（如cmovz、cmovg等）。

此外，CMOVcc 指令能够将控制依赖转化为数据依赖，并将多条路径上的指令合并到同一个基本块中。这使得基本块包含了更多指令，从而扩展了指令调度的空间。

## SEGMENT OVERRIDE PREFIX

几乎可以添加到任何寻址模式下的指令中。  

- 允许程序员偏离默认的段进行访问。
- 唯一不能加前缀的指令是使用代码段寄存器进行地址生成的跳转和调用指令。(`JMP label` 和 `CALL label`)
- 通过在指令开头添加一个额外的字节，来选择备用段寄存器。

<div align="center">
<img src="../img/chap4/SEGMENT_OVERRIDE.png" width="400">
</div>


### Directives Vs Instructions

!!!info "ASSEMBLER DETAIL"
    汇编器有两种使用方式：
    
    - 一种是使用特定汇编器独有的“模型”
    - 另一种是使用完整的段定义，这允许对汇编过程进行全面控制，并且对所有汇编器都是通用的
    

汇编语言语句分为两类：伪指令（directives）和指令（instructions）。

- 伪指令：告诉汇编器如何工作，比如生成机器码、分配存储空间等。只在汇编时起作用，本身不会生成任何机器代码。
- 指令：告诉CPU要做什么，会被汇编为机器码，并最终链接到可执行文件中。在程序运行时由CPU执行。

#### Directives in MASM

指示汇编器如何处理操作数或程序的某一部分。有些伪指令会在内存中生成并存储信息，而有些则不会。

例如：

- BYTE PTR 用于指明指针或变址寄存器所引用的数据大小。
- DB（定义字节）指令用于在内存中存储字节数据。


| 英文分类 (Category)        | 中文分类        | 指令/关键字             | 简要说明 |
|---------------------|------------|----------------------|------------------------------------------------------|
| Data Allocation     | 数据定义/分配  | DB, DW, DD, DQ, DT   | 分配并初始化内存数据<br>• `DB`: 8 位字节<br>• `DW`: 16 位字<br>• `DD`: 32 位双字<br>• `DQ`: 64 位四字<br>• `DT`: 80 位十字节 |
| Structure           | 结构体定义      | STRUCT, RECORD        | 定义复杂数据结构<br>• `STRUCT`: 类似 C 语言 struct<br>• `RECORD`: 定义位域(bit fields) |
| Code Labels         | 地址/标签控制    | ALIGN, ORG            | 控制内存对齐和偏移地址<br>• `ALIGN`: 内存对齐（如 4 字节）<br>• `ORG`: 设置当前偏移地址 |
| Segment             | 标准段定义      | SEGMENT, ENDS, ASSUME | 完整段定义方式<br>• `SEGMENT`/`ENDS`: 段开始与结束<br>• `ASSUME`: 关联段寄存器 |
| Simplified Segment  | 简化段定义      | .CODE, .DATA, .STACK, .MODEL, .EXIT | 简化段定义方式<br>• `.MODEL`: 内存模型<br>• `.CODE`/`.DATA`: 快速定义段<br>• `.EXIT`: 程序退出 |
| Procedures          | 过程（函数）     | PROC, ENDP            | 子程序定义<br>• `PROC`: 过程开始<br>• `ENDP`: 过程结束 |
| Macros              | 宏           | MACRO, ENDM           | 宏定义与结束<br>• `MACRO`: 宏定义开始<br>• `ENDM`: 宏定义结束 |
| Miscellaneous       | 杂项/其他       | EQU, INCLUDE          | 杂项辅助指令<br>• `EQU`: 符号常量<br>• `INCLUDE`: 包含其他源文件 |
| Processor           | 处理器指令集     | .386, .486, .586      | 指定可用 CPU 指令集<br>如 `.386` 允许 32 位寄存器（EAX） |

#### Storing Data in Memory


DB（Define Byte）、DW（Define Word）、DD（Define Doubleword）是 MASM 中最常用来定义和存储内存数据的指令。

- 如果系统中有数值协处理器，DQ（Define Quadword）和 DT（Define Ten Bytes）指令也很常见。
- 这些指令会为内存位置分配一个符号名称，并指明其大小。
- DUP 指令可用于将多个初始值设置为同一个值。例如：DB 100 DUP(6) 会分配 100 个字节，每个字节的值均为 6。
- 使用 “？” 作为 DB、DW 或 DD 指令的操作数时，会保留内存空间但不对其进行初始化，汇编器仅为其分配位置，不赋具体值。
- ALIGN 指令用于将下一个数据元素或指令对齐到其参数（必须是 2 的幂，如 1、2、4、8，且不大于段对齐值）的整数倍地址上。


下面是 MASM 中常见的数据定义及对齐示例：

```asm
LIST_SEG  SEGMENT
    DATA1   DB  1,2,3           ; 定义字节
            DB  45H             ; 十六进制字节
    DATA3   DD  300H            ; 定义双字（十六进制数）
            DD  2.123           ; 实数
            DD  3.34E+12        ; 科学计数法实数
    LISTA   DB  ?               ; 只保留 1 字节，未初始化
    LISTB   DB  10 DUP(?)       ; 保留 10 字节，未初始化

    ALIGN   2                   ; 设置字（word）对齐

    LISTC   DW  100H DUP(0)     ; 保留 100H（256）个字，初始化为 0
    LISTD   DD  22 DUP(?)       ; 保留 22 个双字，未初始化
LIST_SEG  ENDS
```

将字（word）大小的数据放在字边界上、双字（doubleword）大小的数据放在双字边界上是非常重要的。否则，微处理器在访问这些数据类型时会花费额外的时间。

!!!question
    Please determine the value in the register AX after the instruction is executed.

    ```asm
    .data
    DB 33H, 34H, 0AH, 06H
    DW 1B7CH, 674CH, 07H, '12', '1'
    .code
    mov ax, @data
    mov ds, ax
    xor si, si
    ```
    
    首先，`@data` 是一个符号，表示数据段的起始地址。
    mov ax, @data 将数据段的起始地址存储到 AX 寄存器中。然后将其设置位数据段的值，接下来xor si, si 将 SI 寄存器清零。

    此时数据段的布局和其存放的值是这样的,详细的解释请参考[这里](./mem_layout.html)

    <div align="center">
    <img src="../img/chap4/mem_layout.png" width="400">
    </div>


    - `mov ax [si]`,从数据段开头读取两个字节到ax中，注意是小端序，ax=`3433H`
    - `mov ax [si+4]`,ax=`1B7CH`
    - `mov ax [si+5]`,ax=`4C1BH`
    - `mov ax [si+8]`,ax=`0007H`
    - `mov ax [si+10]`,ax=`3231H`
    
    
#### Assume EQU and ORG

等值指令（EQU）用于将一个数值、ASCII码或标签等同（赋值）给另一个标签。EQU 主要用于定义常量。
EQU 指令的语法形式为：
 
```asm
常量名 EQU 表达式
```
使用等值指令可以让程序更加清晰、易于调试。例如：

```asm
TEN EQU 10
NINE EQU 9
MOV AL, TEN
ADD AL, NINE
```

- 汇编器只能将标签分配为字节、字（word）或双字（doubleword）的地址。
- 如果需要将一个字节型标签转为字型，则可用 THIS 指令。
- THIS 指令的用法：THIS BYTE、THIS WORD、THIS DWORD 或 THIS QWORD。

ORG（origin，起始地址）语句用于改变数据段或代码段内数据（或代码）的起始偏移地址。

- 有时，需要用 ORG 指令将数据或代码分配到某个绝对偏移地址。
- 例如，Boot Sector 必须分配到 07c00h 这个地址。

ASSUME 指令用于告诉汇编器哪些段寄存器分别对应什么名字（即 code、data、extra 和 stack 段）。

```asm
ASSUME CS:CODE, DS:DATA, SS:STACK, ES:EXTRA
```

<div align="center">
<img src="../img/chap4/AEO.png" width="400">
</div>


对于`DATA1 EQU THIS BYTE`，其值为当前的地址，但将其视为一个 BYTE 类型。
然后`DATA2 DW ？` 定义了一个字，但未初始化。

注意`DATA 1`和`DATA 2`都指向了ORG定义的300H.`DATA1`认为它是字节，`DATA2`认为它是字。


接下来`MOV BL DATA1`将300H处取出一个字节，。`MOV AX, DATA2`将300H处取出一个字，然后存储到AX中。然后`MOV BH, DATA1+1`将301H处取出一个字节存到BH中。

最后BX和AX的内容是相同的。

### PROC and ENDP

PROC 和 ENDP 伪指令用于标记一个过程（即子程序）的开始和结束，且每个过程必须被分配一个名称。书写格式如下：

```asm
name PROC [near/far]
    statements
    ret
name ENDP
```

PROC 指令后通常需要指定 NEAR 或 FAR（仅在 32 位系统有效）。

- NEAR（近）过程指的是与程序在同一个代码段中的过程，通常被认为是局部过程。
- FAR（远）过程可以位于内存系统的任意位置，被认为是全局过程。
- NEAR 类型过程被认为是局部（local），FAR 类型过程为全局（global）。
- 在过程块内部定义的任何标签，都被视为局部（NEAR）或全局（FAR）,即继承。


例如，有一个名为 SumOf 的过程，通过传递寄存器参数，计算三个 32 位整数的和。

```asm
; 定义一个计算三个 32 位整数和的过程 SumOf
SumOf PROC
    add eax, ebx            ; eax = eax + ebx
    add eax, ecx            ; eax = eax + ecx
    ret
SumOf ENDP

.data
theSum   DD ?

.code
main PROC
    mov eax, 10000h         ; 
    mov ebx, 20000h         ; 
    mov ecx, 30000h         ; 
    call SumOf              ; 调用过程，结果存于eax
    mov theSum, eax         ; 保存结果到变量theSum
main ENDP
```

### MACRO and ENDM

MACRO 和 ENDM 伪指令用来定义宏（即一组有名字的汇编语言语句块）。

- 当你调用（使用）一个宏时，宏的代码会被直接插入到调用它的程序位置。
- 这种自动代码插入方式也被称为内联扩展（inline expansion）。

```asm
name MACRO [para1,para2,…]
    statements
ENDM
```


例如，有一个名为 mPutchar 的宏，它接收一个输入，并通过调用 WriteChar 在控制台显示该字符。

<div align="center">
<img src="../img/chap4/m_putchar.png" width="400">
</div>

语句 “mPutchar 'A'” 会调用 mPutchar，并将字母 A 作为参数传递给它。

宏也可以在数据段中使用。例如，可以定义一个用于 GDT 描述符的宏。

```asm
; 定义用于描述符表（如 GDT）初始化的 Descriptor 宏
Descriptor MACRO Base, Limit, Attr
    dw  Limit & 0FFFFh                              ; 段界限的低 2 字节
    dw  Base & 0FFFFh                               ; 段基址的低 2 字节
    db  (Base >> 16) & 0FFh                         ; 段基址的第 3 字节
    dw  ((Limit >> 8) & 0F00h) | (Attr & 0F0FFh)    ; Attr 1 + Limit 2 + Attr 2
    db  (Base >> 24) & 0FFh                         ; 段基址的第 4 字节
ENDM    ; 共8字节

; 示例：GDT 段描述符的定义
GDT SEGMENT
    Null_desc   Descriptor  0, 0, 0
    Normal_desc Descriptor  0, 0ffffh, DA_DRW
    ; ...
GDT ENDS

; 其中 DA_DRW 可在数据段中定义(如 equ 42h)
```

<div align="center">
<img src="../img/chap4/descrip.png" width="400">
</div>

### INCLUDE 

INCLUDE 伪指令用于在汇编时，将另一个源文件（由文件名指定）中的代码插入到当前源文件中。

- 语法: INCLUDE 文件名


<div align="center">
<img src="../img/chap4/include.png" width="500">
</div>

### Memory organization


#### Full-Segment Definitions

完整的段定义能够对汇编语言任务提供更好的控制，尤其推荐用于复杂程序。

- MASM 汇编器提供多种内存模型，从 tiny（微型）到 huge（巨型），这些模型决定了段寄存器的使用方式和指针的默认大小。
- .MODEL 伪指令用于指定代码和数据指针的大小。

| 模型 | 数据段 | 代码段 | 定义说明 |
| :---: | :---: | :---: | :--- |
| **Tiny** | near | near | 仅有单一段，同时包含代码和数据（CS=DS=SS） |
| **Small** | near | near | 一个代码段和一个数据段（DS=SS） |
| **Medium** | near | far | 多个代码段，一个数据段（DS=SS） |
| **Compact** | far | near | 一个代码段，多个数据段 |
| **Large** | far | far | 多个代码段和多个数据段 |
| **Huge** | huge | far | 多个代码段和多个数据段，单个数组可以大于一个段（>64KB） |

```asm
.MODEL tiny
.STACK 100h
.DATA
.CODE
```

完整段定义使用 SEGMENT、ENDS 和 ASSUME 指令来定义段，并告知汇编器和链接器。
```asm
name SEGMENT [readonly] [align] [combine] [use] 
 [‘combine-class’]
  ; statements
name ENDS
```

以下是每个参数的详细解释：

- **name** (段名): 这是你给该段起的标号（Label）。必须与结尾的 `name ENDS` 中的名字一致。
- **[readonly]** (只读属性): 可选。如果指定，表示该段内的内容是只读的。汇编器会检查是否有指令试图修改该段内的内容。
- **[align]** (对齐方式): 指定该段在内存中起始地址的对齐要求。
    - `BYTE`: 任意地址。
    - `WORD`: 偶数地址。
    - `DWORD`: 4 的倍数地址。
    - `PARA` (**默认值**): 16 的倍数地址。
    - `PAGE`: 页边界（通常 256 或 4096）。
- **[combine]** (组合类型): 告诉链接器如何处理不同模块中具有 **相同段名** 的段。
    - `PRIVATE` (**默认值**): 独立段，不合并。
    - `PUBLIC`: 连接所有同名段。
    - `STACK`: 定义堆栈段，连接并初始化 SP。
    - `COMMON`: 重叠段（起始地址相同），长度取最大者。
    - `AT address`: 绝对物理地址。
- **[use]** (位宽属性): 指定段的默认操作数大小和寻址方式大小。
    - `USE16` (**默认值**): 16 位段（实模式）。
    - `USE32`: 32 位段（保护模式）。
- **['combine-class']** (类别): 单引号括起来的字符串（如 `'CODE'`）。链接器会将所有 **类别名相同** 的段在内存中连续存放。 MyCode SEGMENT 'CODE' 和 LibCode SEGMENT 'CODE'，链接器会把它们放在内存中相邻的位置。这有助于操作系统加载程序时设置内存权限（例如将整个代码区域设为只读）



例如
```asm
cseg SEGMENT readonly word use32 'code'
    mov ax, 10
    inc ax
    ret 
cseg ENDS
```


#### Assume

- segment 指令本身并不告知段的用途类型。assume 指令则向汇编器指明各段寄存器所对应的段。
- assume 指令的基本格式如下：
  assume [CS:段名,] [DS:段名,] [ES:段名,]
         [FS:段名,] [GS:段名,] [SS:段名]
- 有效的 assume 指令示例：
   - assume DS:DSEG
   - assume CS:CSEG, DS:DSEG, ES:DSEG, SS:SSEG
   - assume CS:CSEG, DS:NOTHING
- 当汇编器遇到一条指令（如 mov var,0）时，首先会判断 var 所处的段。
- 如果变量 var 没有声明在当前 assume 设定的任何段中，汇编器就会报错，提示无法访问该变量。
- 最理想的做法是在每个过程（procedure）前书写对应的 assume 指令。因为，程序运行中段寄存器指向的段一般只会在进入、退出过程时发生变化。


#### END

END 指令用于告知汇编器模块的结束。

- 通常，每个源代码模块的最后一行都会有一条 END 语句。
- 只有一个模块可以写成带标签的 END 语句。
- END 指令还可以用来指定程序的入口地址。
- 语法：END label
   - 例如：END start
   - 此时，start 标签就是程序的入口点，DOS 会从该地址开始执行程序。


下面是一个 MASM 格式的段定义与数据搬运示例，实现将一个数据段 LISTA 的 100 字节内容批量复制到 LISTB：

```asm
STACK_SEG  SEGMENT  'STACK'
    DW  100H DUP(?)
STACK_SEG  ENDS

DATA_SEG   SEGMENT  'DATA'
LISTA      DB  100 DUP(?)
LISTB      DB  100 DUP(?)
DATA_SEG   ENDS

CODE_SEG   SEGMENT  'CODE'
    ASSUME CS:CODE_SEG, DS:DATA_SEG
    ASSUME SS:STACK_SEG

MAIN PROC FAR
    ; 设置数据段和附加段寄存器
    MOV     AX, DATA_SEG
    MOV     DS, AX
    MOV     ES, AX

    CLD                 ; 清除方向标志，正序复制

    ; SI 指向源，DI 指向目标
    MOV     SI, OFFSET LISTA
    MOV     DI, OFFSET LISTB
    MOV     CX, 100

    REP MOVSB           ; 批量复制 100 字节

    ; 程序结束，返回 DOS
    MOV     AH, 4CH
    INT     21H          ; 当 CPU 执行这条指令时，会查看 AH 寄存器中的值来决定具体做什么。因为 AH 是 4CH，所以操作系统会清理内存、关闭文件，然后结束当前程序。
MAIN ENDP
CODE_SEG   ENDS

    END MAIN
```

- `STACK_SEG` 定义 256 字节堆栈区。
- `DATA_SEG` 定义两个 100 字节数组：LISTA 和 LISTB。
- 入口点是在 `MAIN`，程序将 LISTA 批量搬运至 LISTB。
- `ASSUME` 语句指明各段寄存器含义，便于汇编器处理寻址。

段名 DATA_SEG 可以用来加载段地址


#### Memory Models

内存模型（Memory model）是 MASM 独有的概念。

- .MODEL 伪指令在实模式中包含六种内存模型，分别为 tiny、small、compact、medium、large、huge。
- 在保护模式下，仅支持 flat（平面）一种模型。
- 特殊伪指令 @DATA、@STACK、@CODE 用于标识不同的段。
- MASM 的 x64 下不再使用 .MODEL 伪指令。

尽量选择能够容纳数据和代码的最小内存模型，因为近引用（near reference）比远引用（far reference）执行效率更高。

| 模型 | 数据段 | 代码段 | 定义说明 |
| :---: | :---: | :---: | :--- |
| **Tiny** | near | near | 仅有单一段，同时包含代码和数据（CS=DS=SS） |
| **Small** | near | near | 一个代码段和一个数据段（DS=SS） |
| **Medium** | near | far | 多个代码段，一个数据段（DS=SS） |
| **Compact** | far | near | 一个代码段，多个数据段 |
| **Large** | far | far | 多个代码段和多个数据段 |
| **Huge** | huge | far | 多个代码段和多个数据段，单个数组可以大于一个段（>64KB） |