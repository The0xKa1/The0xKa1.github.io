---
comments: true
---

# Chapter 3: Addressing Modes

!!!quote "Operation Mode"
    - Address Size: 地址线的长度，决定了寻址范围
    - Operand Size: 操作数的大小


有三种运行模式，每种模式下地址长度和操作数长度有如下默认值：

- 16位模式（实模式、vm86、保护模式）：默认地址和操作数长度为16位
- 32位保护模式：默认地址和操作数长度为32位
- 64位模式：默认地址长度为64位，默认操作数长度为32位

例如：`MOV EAX, [RBX]`

- 操作数长度为32位，因为目标寄存器`EAX`是32位寄存器，因此从内存中读取32位数据存入`EAX`。
- 地址长度为64位，因为寻址用的`RBX`是64位寄存器。在64位模式下，默认使用64位地址，因此用`RBX`的64位值作为内存地址。

!!!Definition
    寻址方式（Addressing modes）是指定操作数地址的一种技术。

    寻址方式的分类：

    - 数据寻址方式（Data-Addressing Modes）
        这种方式与数据传送操作相关。数据要么从内存传送到寄存器，要么在寄存器之间转移，例如：MOV AX, DX。

    - 堆栈寻址方式（Stack Memory-Addressing Modes）
        这种方式涉及堆栈寄存器操作，例如：PUSH AX。

    - 程序寻址方式（Program Memory-Addressing Modes）
        这类寻址方式用于分支类指令，如JMP或CALL等。

## Data-Addressing Modes

`MOV` 指令是一种常用且灵活的指令。它为解释数据寻址方式提供了基础。

<div align=center> <img src="../img/chap3/mov.png" width = 80%/> </div>   

- 在 `MOV` 指令中，源操作数位于右侧，目的操作数位于左侧，紧跟在操作码（`MOV`）后面。
- 操作码（`opcode`，操作码）用于告诉微处理器执行哪种操作。


在汇编语言程序中，每一条语句一般由四个部分（字段）组成：

- 最左边的字段称为 **标签（label）**。
    - 用于为该语句或内存地址提供一个符号名称。
    - 所有标签必须以字母或以下特殊字符之一开头：@、$、-、?。例如：begin、data$、here@ 等。
  - 标签的长度可以是1到35个字符不等。
  - 标签在程序中用于标识某个存储数据的内存位置等用途。

- 标签右侧的字段是 **操作码（opcode）**字段。
    - 这个字段专门用于存放指令本身，也就是操作码。
    - 例如，数据传送指令中的 MOV 就是操作码的一个例子。

- 操作码字段右侧是 **操作数（operand）**字段。
    - 该字段包含操作码所需的信息。
    - 例如指令 MOV AL, BL，其中操作码为 MOV，操作数为 AL 和 BL。

- 最后一个字段是 **注释（comment）**字段。
    - 该字段包含对该指令的注释说明。
    - 注释总是以分号（;）开头。

有三种基本类型的操作数：立即数（immediate）、寄存器（register）和内存（memory）。

- 立即数操作数是作为指令一部分进行编码的常量值。只有源操作数（Source operands）可以指定立即数。
- 寄存器操作数位于通用寄存器或SIMD寄存器中。
- 内存操作数用于指定内存中的某个地址。

下图展示了使用 MOV 指令时所有可用的数据寻址方式的变体。


<div align=center> <img src="../img/chap3/mov_modes.png" width = 80%/> </div>   


这些数据寻址方式在所有英特尔微处理器中都存在，但 **比例变址寻址方式（scaled-index-addressing mode）**仅存在于80386到Core2系列。

RIP相对寻址方式未被包含在图中，它只在 Pentium 4 及 Core2 的 64 位模式下可用。

### Register Addressing

这种寻址方式是数据寻址中最常用、也最容易掌握的方式。只要熟悉寄存器命名即可，非常直接。

- 微处理器支持的 8 位寄存器有：`AH`, `AL`, `BH`, `BL`, `CH`, `CL`, `DH`, `DL`
- 16 位寄存器有：`AX`, `BX`, `CX`, `DX`, `SP`, `BP`, `SI`, `DI`
- 80386 及以上的 32 位寄存器有：`EAX`, `EBX`, `ECX`, `EDX`, `ESP`, `EBP`, `EDI`, `ESI`
- 64 位模式下的寄存器有：`RAX`, `RBX`, `RCX`, `RDX`, `RSP`, `RBP`, `RDI`, `RSI` 以及 `R8`~`R15`

!!! warning "操作数宽度需一致"
    指令中各寄存器操作数的位宽必须一致，不允许混用不同宽度的寄存器。例如不能将 8 位、16 位、32 位及 64 位寄存器混用。

    错误示例（操作数类型不匹配）：
    ```
    MOV EAX, BX   ; 错误！操作数宽度不一致
    ```
    这类写法会导致编译错误。


<div align=center> <img src="../img/chap3/reg_addr.png" width = 80%/> </div>   

> The effect of executing the `MOV BX, CX` instruction at the point just before the `BX` register changes. Note that only the rightmost 16 bits of register `EBX` change.

- 源寄存器（`CX`）的内容不会改变。
- 目标寄存器（`BX`）的内容会被修改，即 `BX` 接收 `CX` 的值。
- 除 CMP 和 TEST 外，大多数指令都会改变目标寄存器或目标内存单元的内容。
- 需要注意的是，`MOV BX, CX` 只影响 `EBX` 的低 16 位（BX 部分），不会改变 EBX 的高 16 位。

### Immediate Addressing


在汇编语言中，“立即数（immediate）”指的是紧跟在机器指令（操作码）之后、作为指令一部分直接编码的数据。

- 立即数是常量（constant data），与寄存器或内存中的变量数据（variable data）相对。
- 立即数寻址方式可以操作一个字节（byte）或一个字（word，也即16位，或更高位数）。

<div align=center> <img src="../img/chap3/imm_addr.png" width = 80%/> </div>   

图中展示了指令 `MOV EAX, 13456H` 的执行过程：指令将立即数 `13456H`（十六进制数）直接加载到寄存器 `EAX` 中。

与寄存器间传送类似，源数据（立即数）会覆盖目标寄存器的原数据。

!!!info "立即数的写法与表示"
    - 在某些汇编器（assembler）中，立即数前可以加前缀 `#` 来标识，例如：
        ```asm
        MOV AX, #3456H     ; 仅作为部分汇编器的写法
        ```
    - 但大多数现代汇编器（如 MASM）直接写成：
        ```asm
        MOV AX, 3456H
        ```
    我们采用不带 `#` 的写法。

    - 十六进制立即数以字母 `H` 结尾。例如：
        ```asm
        MOV AX, 1F2AH      ; 加载十六进制 1F2A 到 AX
        ```
    - 注意：在 MASM 里，所有十六进制数字必须以数字（0-9）开头，否则会被识别为标签名。如果十六进制数以字母开头，需要补零。例如：
        ```asm
        MOV AX, F2H        ; 这会被解释为标签 F2H
        MOV AX, 0F2H       ; 正确，明确是十六进制
        ```

    - 十进制数字可以直接写，无需附加符号：
        ```asm
        MOV AL, 100        ; 加载十进制100进AL
        ```

    - 二进制数字后加字母 `B` 来表示（部分汇编器用 `Y` 结尾）：
        ```asm
        MOV BL, 11001010B  ; 加载二进制11001010
        ```

    - 立即数也可以用 ASCII 字符表示，用英文单引号 `'...'` 包裹。例如：
        ```asm
        MOV DL, 'A'        ; 加载字符A的ASCII值到 DL
        ```
    > 注意，必须使用英文单引号 `'`，不要混用中文引号或其他字符。


<div align=center> <img src="../img/chap3/imm_exp.png" width = 80%/> </div>   

!!!warning 
    ASCII 字符会以反序（如 BA）进行存储，因此在使用成对字符作为字（word）时要注意顺序

    这是因为字符没有权重A先出现，所以先把A放到低地址，然后是B


## Memory Addressing
>也是data addressing modes

除了通过寄存器或指令直接操作操作数外，操作数也可以存储在任意内存位置。当操作数位于内存中时，"寻址方式"（addressing mode）用于确定如何结合寄存器和/或指令内的常量，计算出该操作数在内存中的有效地址effective address, EA）。  
> call back:一般来说，有效地址是相对于段基址（segment base address）的偏移（offset）。

有效地址可以灵活组合以下4类参数：

1. 基址寄存器(Base Register)
- 变址寄存器(Index Register)
- 比例因子(Scale)（部分平台，如x86支持变址乘比例因子）
- 指令中提供的偏移量(Displacement)

这种灵活性产生了多种常见的寻址方式：

- 直接寻址 (Direct Data Addressing, Disp)
    - 例如：`MOV AX, [1234H]`        （直接使用指令内的偏移）
- 寄存器间接寻址 (Register Indirect, Base)
    - 例如：`MOV AX, [BX]`           （基址寄存器存放有效地址）
- 基址+变址寻址 (Base-Plus-Index, Base + Index)
    - 例如：`MOV AX, [BX+SI]`
- 寄存器相对寻址 (Register Relative, Base/Index + Disp)
    - 例如：`MOV AX, [BX+10H]` or `MOV AX, [SI+8]`
- 基址相对+变址寻址 (Base Relative-Plus-Index, Base + Index + Disp)
    - 例如：`MOV AX, [BX+SI+4]`
- 比例索引寻址 (Scaled-Index, Base + Scale×Index + Disp)（常用于32位/64位平台）
    - 例如：`MOV EAX, [EBX + ESI*4 + 8]`


### Direct Data Addressing 

<div align="center">
<span style="color:blue; font-size:1.2em;">
Effective Address = Base + (Scale × Index) + 
</span>
<span style="color:#b22222; font-size:1.2em; font-weight:bold;">
Disp
</span>
</div>



直接数据寻址有两种基本形式：

1. 直接寻址（Direct Addressing）  
   适用于在MOV指令中，在 `AL`（8位）、`AX`（16位）、或者`EAX`（32位）与内存位置间传输数据。(三个要素，MOV，A类寄存器，只用偏移量)，指令长度为3字节。
- 带偏移寻址（Displacement Addressing）  
   几乎适用于所有指令，用于在有效地址中增加额外的偏移量。(除了Direct Addressing 之外的 Direct Data Addressing)，指令长度为4字节。


假设需要从数据段（data segment）内存位置 DATA（偏移量1234H）加载AL寄存器：

```asm
MOV AL, [1234H]    ; 1234H是实际的16进制偏移
MOV AL, DATA       ; DATA是内存标签（符号地址）
```
> 说明：DATA 是符号标签（label），1234H 是实际的16进制物理偏移


<div align=center> <img src="../img/chap3/mov_al_1234h.png" width = 80%/> </div>   

>  `MOV AL, [1234H]` 指令在 DS=1000H 时的操作

- 线性地址 = 段基址（1000H）× 16 + 偏移（1234H）  
  $1000_H \ll 4 + 1234_H = 10000_H + 1234_H = 11234_H$

- 指令实现：将 11234H 内存单元的数据复制到 AL  
- 线性地址由偏移（1234H）加上数据段基址（1000H×10H）获得（实模式下）


以下均是 Direct addressed instructions

<div align=center> <img src="../img/chap3/direct_addr.png" width = 80%/> </div>   


与直接寻址相比，带偏移寻址（Displacement Addressing）的区别在于指令长度为4字节，而直接寻址为3字节。

下图是常见的一些带偏移寻址的指令

<div align=center> <img src="../img/chap3/disp_addr.png" width = 80%/> </div>   

- 直接寻址：
```asm
MOV AL, [1234H]    ; 机器码：A0 34 12
```
- 带偏移寻址：
```asm
MOV CL, [1234H]    ; 机器码：8A 0E 34 12
```

在80386到奔腾4等处理器中，若使用32位寄存器和32位偏移量，该类指令(displacement addressing)的长度可达7字节。  
带偏移寻址比直接寻址更加灵活，大多数指令都支持这种寻址方式。


!!!question
    判断以下指令是直接寻址还是带偏移寻址：

    ```asm
    MOV EAX, [3000H] ; a1 00 30 00 00 满足，是Direct Addressing
    MOV EBX, [3000H] ; 8b 1d 00 30 00 00 不是A类寄存器
    ADD EAX, [3000H] ; 03 05 00 30 00 00 不是MOV指令
    ADD EBX, [3000H] ; 03 1d 00 30 00 00 不是MOV指令，也不是A类寄存器
    ```

!!!info "Why Direct Addressing"
    兼容性与编码效率  
       
    - “直接寻址（Direct Addressing）”模式起源于8086/8088处理器。在早期，代码字节数（代码密度）和指令执行速度极为关键。
    - 编码优化：对 AL/AX/EAX 累加器进行 MOV AL/AX/EAX, [address] 是非常常见的操作。因此，Intel 专门为这种操作设计了更短且更快的指令编码。

    累加器（AX/EAX）的特殊地位  
       
    - 在 x86 架构中，AL/AX/EAX 寄存器被设计为“累加器”。有许多指令就是专门针对累加器做了优化，例如：
    - IN/OUT 输入输出指令
    - MUL/DIV 乘法/除法指令
    - 字符串操作指令（如 LODS、STOS）都隐式使用累加器

    因此，为最关键的寄存器及其最常用操作（和内存之间交换数据）提供一个“加速通道”是合理的。

    编译器使用直接数据寻址模式来访问那些在编译时就能确定的静态地址（如全局变量）。例如：
    
    <div style="display: flex; gap: 20px; margin: 20px 0;">
    <div style="flex: 1; padding-right: 10px; border-right: 1px solid #ddd;">
    <strong>C 语言</strong>
    ```c
    int var;
    void f(int x) {
    var = x; 
    }
    ```
    </div>
    <div style="flex: 1; padding-left: 10px;">
    <strong>汇编代码</strong><br>
    <small>x86-64 gcc 12.2, option: -O2 -m32</small>
    ```asm
    f:
    mov eax, [esp+4] ; eax is x
    mov var, eax ; store x to var
    ret
    ```
    </div>
    </div>

### Register Indirect Addressing

<div align="center">
<span style="color:blue; font-size:1.2em;">
Effective Address = <span style="font-weight:bold; color:#b22222;">Base</span> + (Scale × Index) + Disp
</span>
</div>

关于寄存器间接寻址（Indirect Addressing）：

- 在 8086 到 80286 处理器中，间接寻址只允许使用 BX、BP、SI 和 DI 这四个寄存器，例如：  

```asm
MOV AX, [BX]
```

- 从 80386 开始，可以使用任意扩展寄存器作为地址寄存器，例如：  

```asm
MOV AX, [EDX]
```

- 在 64 位模式下，段寄存器不再参与地址计算。


<div align=center> <img src="../img/chap3/reg_in_addr.png" width = 80%/> </div>   

当 BX = 1000H 且 DS = 0100H 时，MOV AX, [BX] 指令的执行过程。请注意，此时 AX 寄存器已经从内存中获取相应的数据。

以下是常见的一些寄存器间接寻址的指令

<div align=center> <img src="../img/chap3/reg_in_addr_instr.png" width = 80%/> </div>   

注意，string operation之外的memory-to-memory transfer都是非法的。所以上表的`MOV [DI] [BX]`

默认情况下，数据段（data segment）用于寄存器间接寻址或任何使用 BX、DI 或 SI 作为地址寄存器的寻址方式。

- 如果 BP 寄存器用于寻址，则默认使用堆栈段（stack segment）。
- 这四个基址和变址寄存器的上述设置被视为默认值。
- 对于 80386 及以上处理器：
    - EBP 寄存器默认在堆栈段中寻址内存。
    - EAX、EBX、ECX、EDX、EDI 和 ESI 默认在数据段中寻址内存。
- 在实模式（real mode）下，使用 32 位寄存器间接寻址时，寄存器内容不能超过 $0000FFFF_H$
- 在保护模式（protected mode）下，32 位寄存器用于间接寻址时可使用任意值，只要不越界访问段范围（由访问权限字节限制）。
- 在 64 位模式下，段寄存器不再参与地址计算；寄存器中存放的就是实际的线性内存地址。


#### Size Directives

通常，指令本身能推断出对内存访问的数据大小。例如：

- `MOV [DI], AL` 是一个字节（byte）操作，因为 AL 寄存器为 8 位。
- `MOV [DI], 10H` 则不明确是字节还是字(word)操作——因为立即数本身没有指定大小。

在某些间接寻址场景下，必须显式指定数据大小。这时要使用 size directive（大小前缀），如 `BYTE PTR`、`WORD PTR`、`DWORD PTR` 或 `QWORD PTR`。这些前缀指明被指针或寄存器寻址的内存数据大小。例如：

- `MOV BYTE PTR [DI], 10H`  
  明确表示 [DI] 地址处是 1 字节空间。
- `MOV DWORD PTR [DI], 10H`  
  明确表示 [DI] 地址处是 4 字节（双字，doubleword）空间。

这些大小指令（例如 BYTE PTR、WORD PTR）主要用于通过寄存器间接寻址并赋立即数给内存时，或指令本身从语法无法推断出操作数大小时。

对于 SIMD 指令，还使用 `OWORD PTR`，代表 128 位（16 字节）宽度的数据操作。


> **Example: How do size directives influence instruction encoding?**
>
> **In 64-bit mode:**
>
> | Instruction                | Machine Code           | Note                                    |
> |----------------------------|------------------------|------------------------------------------|
> | `MOV [RAX], 5`             | *Error*                | ambiguous operand size for `MOV`         |
> | `MOV BYTE PTR [RAX], 5`    | `C6 00 05`             | opcode + operand                         |
> | `MOV WORD PTR [RAX], 5`    | `66 C7 00 05 00`       | operand prefix + opcode + operand        |
> | `MOV DWORD PTR [RAX], 5`   | `C7 00 05 00 00 00`    | opcode + operand                         |
> | `MOV QWORD PTR [RAX], 5`   | `48 C7 00 05 00 00 00` | prefix for x86-64 + opcode + operand     |


寄存器间接寻址通常允许程序引用存放在内存中的表格数据。

<div align=center> <img src="../img/chap3/reg_in_addr_table.png" width = 80%/> </div>   

- 上图展示了一个表格，以及用 BX 寄存器顺序访问表格中每个位置的方法。
- 为了完成这个任务，首先用 MOV 立即数指令将表格的起始地址加载到 BX 寄存器中。
- 初始化表格起始地址后，使用寄存器间接寻址方式即可顺序存储这 50 个样本数据。

### Base-Plus-Index Addressing

<div align="center">
<span style="color:blue; font-size:1.2em;">
Effective Address = <span style="font-weight:bold; color:#b22222;">Base</span> + (Scale × <span style="font-weight:bold; color:#b22222;">Index</span>) + Disp
</span>
</div>


- 在 8086 到 80286 处理器中，这种寻址方式使用一个Base register(BP 或 BX)和一个Index register(DI 或 SI)来间接访问内存，例如：`MOV DX, [BX + DI]`。

- 在 80386 及以上处理器中，允许任意两个 32 位寄存器组合（**但 ESP 不能作为index寄存器**），例如：`MOV DL, [EAX+EBX]`。

<div align=center> <img src="../img/chap3/base_plus_index_addr.png" width = 80%/> </div>   

An example showing how the base-plus-index addressing mode functions 
for the `MOV DX, [BX + DI]` instruction. Notice that memory address `02010H` is accessed because DS=`0100H`, BX=`1000H` and DI=`0010H`.

下图展示了一些常见的基址加变址寻址的指令

<div align=center> <img src="../img/chap3/bpi_addr.png" width = 80%/> </div>   


基址加变址寻址方式的一个主要用途是访问内存数组中的各个元素。
- 要实现这一点，可以将数组的起始地址加载到 BX 寄存器（基址寄存器）中，并将要访问的元素序号加载到 DI 寄存器（变址寄存器）中。
- 下图展示了如何利用 BX 和 DI 访问数据数组中的某个元素。

<div align=center> <img src="../img/chap3/bpi_addr_exp.png" width = 80%/> </div>   

此处，通过 BX（ARRAY）和 DI（元素索引）访问数组中的某一元素。

!!!info
    The compiler uses base-plus-index addressing mode to access an one-dimensional array.
    <div style="display: flex; gap: 20px; margin: 20px 0;">
    <div style="flex: 1; padding-right: 10px; border-right: 1px solid #ddd;">
    <strong>C code</strong>
    ```c
    int foo(char *buf, int index) {
        return buf[index];
    }
    ```
    </div>
    <div style="flex: 1; padding-left: 10px;">
    <strong>汇编</strong><br>
    <small>x86-64 gcc 12.2, option: -O2 -m32</small>
    ```asm
    foo:
        mov eax, [esp+4]    ; eax ← buf
        mov edx, [esp+8]    ; edx ← index
        movsx eax, BYTE PTR [edx+eax] ; eax ← buf[index]
        ret
    ```
    </div>
    </div>

### Register Relative Addressing

<div align="center">
<span style="color:blue; font-size:1.2em;">
Effective Address = <span style="font-weight:bold; color:#b22222;">Base</span> + (Scale × <span style="font-weight:bold; color:#b22222;">Index</span>) + <span style="font-weight:bold; color:#b22222;">Disp</span>
</span>
</div>

>Base/Index + Disp


- 在 8086~80286 处理器中，寄存器相对寻址是把一个“偏移量”（displacement，立即数）加到一个基址寄存器（BX 或 BP）或变址寄存器（SI 或 DI）上，得到有效地址。例如:
  
  ```asm
  MOV AX, [DI+100H]
  ```

- 在 80386 及以上处理器中，偏移量可以是 32 位，地址寄存器可以是任意 32 位通用寄存器（但 ESP 不能作变址寄存器）。例如：

  ```asm
  MOV DL, [EAX+10H]
  ```

这种寻址方式本质上与“基址变址寻址”和“带偏移寻址”类似。它是通过“基址/变址寄存器 + 偏移量”组合出一个存储单元的地址。

- 如下图所示，MOV AX, [BX+1000H] 指令的执行过程：将 BX 的内容与偏移量 1000H 相加，计算出内存地址，再访问对应内存单元。
- 说明：实模式（real mode）下的一个段最多 64K 字节。

<div align=center> <img src="../img/chap3/reg_rel_addr.png" width = 80%/> </div>   

下图是常见的一些寄存器相对寻址的指令

<div align=center> <img src="../img/chap3/reg_rel_addr_instr.png" width = 80%/> </div>   

!!!info
    编译器在访问结构体时，使用寄存器相对寻址方式：
    
    - 基址寄存器中保存结构体的起始地址，
    - 偏移量为结构体成员的偏移地址。

    <div style="display: flex; gap: 20px; margin: 20px 0;">
    <div style="flex: 1; padding-right: 10px; border-right: 1px solid #ddd;">
    <strong>C 代码</strong>
    ```c
    struct foo {
        int a;
        int b;
    };
    int bar(struct foo *foobar) {
        return foobar->b;
    }
    ```
    </div>
    <div style="flex: 1; padding-left: 10px;">
    <strong>汇编</strong><br>
    <small>x86-64 gcc 12.2, option: -O2 -m32</small>
    ```asm
    bar:
        mov eax, [esp+4]    ; eax ← foobar
        mov eax, [eax+4]    ; eax ← foobar->b
        ret
    ```
    </div>
    </div>


### Base Relative Plus Index Addressing


<div align="center">
<span style="color:blue; font-size:1.2em;">
Effective Address = <span style="font-weight:bold; color:#b22222;">Base</span> + (Scale × <span style="font-weight:bold; color:#b22222;">Index</span>) + <span style="font-weight:bold; color:#b22222;">Disp</span>
</span>
</div>

> Base + Index + Disp


- 此寻址方式与Base+Index寻址类似，
    - 不同之处在于它还增加了一个位移量（displacement）
    - 使用一个Base寄存器和一个Index寄存器共同生成内存地址
- 这种寻址方式通常用于访问二维数组等内存数据结构。
- 这是最不常用的寻址方式之一。
- 下图展示了在微处理器执行指令 `MOV AX, [BX + SI + 100H]` 时，数据是如何被引用的。
    - 其中的 100H 位移会加到 BX 和 SI 上，形成数据段内的偏移地址

>由于这种寻址方式较为复杂，实际编程中很少使用。

<div align=center> <img src="../img/chap3/base_rel_plus_index_addr.png" width = 80%/> </div>   


!!!info
    The compiler uses base relative-plus-index addressing mode to access structure within an array, for example:
    <div style="display: flex; gap: 20px; margin: 20px 0;">
    <div style="flex: 1; padding-right: 10px; border-right: 1px solid #ddd;">
    <strong>C code</strong>
    ```c
    struct foo {
        int a;
        int b;
        int c;
        int d;
    };
    int query(struct foo foos[], int i) {
        struct foo x = foos[i];
        return x.d;
    }
    ```
    </div>
    <div style="flex: 1; padding-left: 10px;">
    <strong>汇编</strong><br>
    <small>x86-64 clang trunk, option: -O2 -m32</small>
    ```asm
    query:
        mov eax, [esp+4]    ; eax ← foos
        mov ecx, [esp+8]    ; ecx ← i
        shl ecx, 4          ; i * 16
        mov eax, [eax+ecx+12] ; eax+ecx+12=foos[i].d
        ret
    ```
    </div>
    </div>

    这里i×16是因为一个`foo`结构体里面有4个`int`，所以是16字节。要访问数组里第i个元素，需要偏移i*16字节。在最后+12则是要访问`d`需要跨过前面`a`,`b`,`c`三个`int`。

### Scaled Index Addressing

<div align="center">
<span style="color:blue; font-size:1.2em;">
Effective Address = <span style="font-weight:bold; color:#b22222;">Base</span> + (<span style="font-weight:bold; color:#b22222;">Scale</span> × <span style="font-weight:bold; color:#b22222;">Index</span>) + <span style="font-weight:bold; color:#b22222;">Disp</span>
</span>
</div>


仅在 80386 到 Core2 微处理器中独有的寻址方式。

- 使用两个 32 位寄存器（基址寄存器和变址寄存器）来访问内存。
- 第二个寄存器（变址寄存器）会乘以一个缩放因子（scaling factor）。
- 缩放因子可以是 1x、2x、4x、8x。
- 缩放因子为 1x 时可省略不写，例如：`MOV AL, [EBX + ECX]`此时退化成Base+Index寻址。
- 位移（Displacement）是可选的，主要看Scale。

以下是常见的一些缩放索引寻址的指令

<div align=center> <img src="../img/chap3/scaled_index_addr_instr.png" width = 80%/> </div>   


!!!info
    可以将i的值通过配合scale来节省一条单独的指令。

    <div style="display: flex; gap: 20px; margin: 20px 0;">
    <div style="flex: 1; padding-right: 10px; border-right: 1px solid #ddd;">
    <strong>C code</strong>
    ```c
    struct foo {
        int a;
        int b;
    };
    int query(struct foo foos[], int i) {
        struct foo x = foos[i];
        return x.b;
    }
    ```
    </div>
    <div style="flex: 1; padding-right: 10px; border-right: 1px solid #ddd;">
    <strong>汇编</strong><br>
    <small>x86-64 clang trunk, option: -O2 -m32</small>
    ```asm  
    query:
    mov eax, [esp + 4] ; eax ← foos
    mov edx, [esp + 8] ; edx ← i
    mov eax, [eax + edx*8 + 4]
    ; eax+edx*8+4 = foos[i].b
    ret
    ```
    </div>
    </div>

    这里edx*8是因为一个`foo`结构体里面有2个`int`，所以是8字节。要访问数组里第i个元素，需要偏移i*8字节。在最后+4则是要访问`b`需要跨过前面`a`一个`int`。


## RIP Relative Addressing

传统x86只在控制转移指令中支持IP（指令指针）相对寻址。

- 而在64位模式下，支持以64位指令指针（RIP）为基准的数据寻址，可以在flat内存模型下定位线性地址。
- RIP相对寻址的写法和寄存器相对寻址类似，采用 [Base + Displacement]的语法，不过Base是RIP，而不是通用寄存器。
- RIP相对寻址使用一个有符号32位位移（displacement），将其符号扩展后加到64位的RIP上，从而计算下一条指令的有效地址。
- 采用RIP相对寻址使得位置无关代码（Position-Independent Code, PIC）更加简洁和紧凑，只要所有代码和数据都能由32位偏移访问即可。


!!!Example
    ```c
    int var;
    void f(int x) {
        var = x; 
    }
    ```
    ```asm
    f:
        mov var[rip], edi    ; var = x, 参数 x 存放在 edi 寄存器中
        ret
    ```

    `var[rip]`表示以当前指令位置为基准，偏移多少字节去找变量`var`



## Canonical Addressing and Canonical Form

- 在 x86-64 系统中，线性地址（虚拟地址）在逻辑上是 64 位长。设计 x86-64 架构时，AMD 认为完整的 64 位地址空间过于庞大且实现成本很高。
- 因此，AMD 只定义了 48 位（4 级分页）或 57 位（5 级分页）的有效地址空间，并且这些地址必须遵守特定的规范地址规则。例如：
    - 48 位: `7C00 1810 2000` → 64 位: `0000 7C00 1810 2000`
    - 48 位: `8010 BC00 1000` → 64 位: `FFFF 8010 BC00 1000`

- 在 64 位模式下，如果一个地址的第 63 位到最高有效位全为 0 或全为 1，则认为该地址为规范地址（canonical form）。
- 对于 48 位线性地址，规范地址要求 63~48 位要么全为 0，要么全为 1（具体取决于第 47 位是 0 还是 1）：
    - 规范地址: `FFFF 8010 BC00 1000`， `0000 7C80 B810 2040`
    - 非规范地址: `1122 3344 5566 7788`， `3375 DA44 B566 7788`

- 如果内存地址不是规范形式（non-canonical），就会产生通用保护异常（#GP），例如：`MOV RAX, [1122334455667788H]`。
- 通过检查地址的规范形式，架构防止软件利用指针高位的未用部分做其他用途。

- 遵循规范地址格式的软件能在未来支持更大虚拟地址空间的长模式实现上无须修改即可运行。


!!!Summary
    8086-80286：

    - Base: BX/BP
    - Index: SI/DI
    - Disp: 8位或16位

    80386及以上：

    - Base：任意32位寄存器
    - Index：任意32位寄存器（除了ESP不能做变址寄存器）
    - Disp：8位/16位/32位

    当存在Index时，可使用比例因子（scale factor），其取值为1、2、4、8。
    
    **当使用BP/EBP或ESP寄存器作为基址时，默认的段寄存器是SS；其他情况默认使用DS段寄存器。注意ESP不能作为index寄存器**


## Program Memory Addressing Modes


用于JMP（跳转）和CALL（调用）指令。

- 目标操作数（目标地址）指定要跳转到的指令的地址。
- 跳转偏移有两种类型：
    - 相对偏移(relative offset)（依赖于当前的IP/EIP:
    相对偏移一般在汇编代码中以标签方式指定（如 JMP start），但在机器码层面，它会被编码为一个有符号位移量，相对于当前指令指针IP/EIP的值。`Target address offset = Current IP/EIP + Relative offset`
    - 绝对偏移(absolute offset):绝对偏移通常间接地存储在通用寄存器或某个存储单元中（如 JMP AX）。绝对偏移指的是从代码段基址起的偏移量。`Target address offset = Value specified in the encoding`

<div align=center> <img src="../img/chap3/jump_offset.png" width = 80%/> </div>   


- 跳转类型有四种（Four different types of jumps）：

    - **短跳转（short jump）**：一种近跳（near jump），跳转范围被限定在当前 EIP 值的 `-128` 到 `+127` 之间。
    
    - **近跳转（near jump）**：跳转到当前代码段（由 `CS` 寄存器指向）内部的指令，又称为段内跳转（intrasegment jump）。
    
    - **远跳转（far jump）**：跳转到与当前代码段不同但特权级相同的另一个段中的指令，又称段间跳转（intersegment jump）。

    - **任务切换（task switch）**：仅在保护模式下，将控制权转移到另一个任务（task）的指令中。

!!!Note
    relative是指相对于指令指针IP。

    - `JMP` 指令本身为 1 字节长度，但其后可以跟随 1 字节或 2 字节的位移，该位移的数值会加到指令指针IP上。
    - 1 字节位移用于短跳转（short jump），2 字节位移用于近跳转（near jump）和调用（call）指令。这两种跳转都属于段内跳转（intrasegment jumps）。

    <div align=center> <img src="../img/chap3/jump_offset_exp.png" width = 80%/> </div>   

### Direct Program Memory Addressing

采用Direct Program Memory Addressing的指令，会在操作码opcode中存储一个绝对的远地址，例如：`JMP 1234:5678`。

- 这类指令通常被称为"远跳转（far jump）"，因为它可以跳转到任意内存地址以执行下一条指令。
    - 在实模式下，可以跳转到前1MB（1兆字节）范围内的任意位置。
    - 在保护模式下（80386到Core2系列处理器），远跳转可以跳转到4GB（4G字节）地址空间内的任意位置。

- 微处理器常用该寻址形式来进行操作模式切换（operating modes control transfers）。

<div align=center> <img src="../img/chap3/dir_prog_mem_addr.png" width = 80%/> </div>   

- 用于直接程序寻址的典型指令是段间调用（intersegment 或 far CALL）指令。

- 在实际编程时，通常使用内存地址的名称（即标签，label）来表示被调用或跳转的位置，而不是直接使用具体的数值地址。

- 我们可以使用 `FAR PTR` 关键字实现远跳转，例如：`JMP FAR PTR START`



### Indirect Program Memory Addressing

微处理器支持多种程序间接寻址（indirect program memory addressing）的形式。

- 在8086到80286处理器中，这种寻址方式可以使用16位寄存器（AX, BX, CX, DX, SP, BP, DI或SI），
  或者使用任意相对寄存器（[BP]、[BX]、[DI]、[SI]），加上一个位移量。例如：`JMP NEAR PTR [DI+2]`。
- 在80386及以后的处理器中，可以使用扩展寄存器（如EAX）存储要跳转或调用（CALL）的地址或间接地址，例如：`JMP EAX`。

- 如果一个相对寄存器中存储了跳转地址，就称为间接跳转（indirect jump）。
- 例如，`JMP NEAR PTR [BX]`表示跳转到数据段（data segment）中，偏移地址由BX寄存器指定的内存位置。
    - 在这个偏移地址存储着一个16位数值，这个数值被作为段内跳转（intrasegment jump）的偏移地址。
    - 这种跳转有时被称为“间接-间接跳转”或“双重间接跳转”（indirect-indirect 或 double-indirect jump）。



!!!Summary
    以上的诸多概念并不是互斥的，而是根据不同的维度进行分类
    
    - 距离维度（跳转范围）：Short / Near / Far / Task Switch）
    - 计算维度（偏移量类型）：地址怎么算出来的？（Relative / Absolute）
    - 获取维度（寻址方式）：地址存在哪里？（Direct / Indirect）


    | 跳转类型 (Jump Type)       | 偏移计算 (Offset)    | 寻址方式 (Addressing)                   | 说明 |
    |---------------------------|---------------------|-----------------------------------------|------|
    | Short Jump                | Relative            | 立即数嵌入指令 (机器码层面)             | 只能跳 ±127 字节，依赖当前 IP。 |
    | Near Jump (常见)          | Relative            | 立即数嵌入指令 (机器码层面)             | 代码写作 JMP Label，机器码是位移量，依赖 IP。 |
    | Near Jump (间接)          | Absolute            | Indirect (寄存器/内存)                  | 代码写作 JMP AX 或 JMP [BX]。不依赖 IP，直接修改 IP。 |
    | Far Jump (直接)           | Absolute            | Direct Program Memory Addressing        | 代码写作 JMP 1234:5678。直接给出新的 CS 和 IP。 |
    | Far Jump (间接)           | Absolute            | Indirect (内存)                         | 代码写作 JMP FAR PTR [BX]。从内存读出新的 CS 和 IP。 |
    | Task Switch               | N/A                 | 通常通过 Far Jump 触发                  | 在保护模式下，跳到 TSS 描述符或其他任务门。 |


## STACK MEMORY ADDRESSING MODES


PUSH/POP 指令是用于在栈内存中保存和恢复数据的基本指令。

- PUSH 和 POP 指令共有六种常见用法：
    1. register: *寄存器寻址*可以将任意 16 位寄存器的内容压入或弹出栈。
    - memory: *内存寻址*,支持将 16 位或 32 位内存地址指定的数据压入栈，也可将栈顶数据弹出到指定内存位置。
    - immediate: *立即数寻址*,允许将常数值直接压入栈（仅 PUSH 不可 POP）。
    - segment register: *段寄存器寻址*,可将任意段寄存器内容压入栈，或从栈顶弹出数据到段寄存器。但注意，CS 只能通过 PUSH 保存，不能通过 POP 恢复。
    - flags: *标志寄存器寻址*,可以用 PUSHF/POPF 指令将标志寄存器内容压入或弹出。
    - all registers: *所有寄存器*,PUSHA/POPA 可以一次性保存或恢复所有通用寄存器。

- 在 80286 到 Core2 等处理器上，PUSH 和 POP 支持立即数操作，并提供了同时操作所有通用寄存器的 PUSHA/POPA 指令。


**PUSH/POP 的栈操作机制：**

- 数据通过 PUSH 指令压入栈顶，通过 POP 指令从栈顶弹出。
- 维护栈空间主要依赖于两个寄存器：
    - 栈段寄存器（SS）
    - 栈指针（SP 或 ESP）
- 每当一个字（word，16 位）压入栈时：
    - 高 8 位存放于 [SP - 1] 地址
    - 低 8 位存放于 [SP - 2] 地址
    - SP 寄存器自动减少 2，为下一个数据腾出空间。
- SP（或 ESP）始终指向当前栈段中的栈顶位置。

- 在保护模式（Protected Mode）下，SS 寄存器保存的是指向栈段基址描述符的选择子（selector）。

- 从栈中弹出数据时：
    - POP 从 SP 当前指向的内存地址弹出低 8 位，再弹出高 8 位
    - 完成后 SP 增加 2，指向新的栈顶

<div align=center> <img src="../img/chap3/push_pop_stack.png" width = 80%/> </div>   

栈是从高地址向低地址生长的；

在上图中，要将`1234H`push到栈，首先`12H`会被push到栈，然后`34H`会被push到栈。此时栈顶指向`34H`,POP时，先弹出`34H`，然后弹出`12H`.栈顶指针恢复.


### Initializing the stack


汇编语言中的堆栈段（stack segment）初始化

```asm
STACK_SEG SEGMENT STACK
DW 100H DUP(?)
STACK_SEG ENDS
```

- 第一条语句标识堆栈段的开始
- 最后一条语句标识堆栈段的结束

- 汇编器和连接器会自动把正确的堆栈段（stack segment）地址加载到 SS 寄存器，并把堆栈段的长度（也就是堆栈的顶部地址）加载到 SP 寄存器。

- 如果未指定堆栈段，在链接程序时会出现警告。
- 堆栈内存区位于程序段前缀（PSP）当中，PSP 会被附加到每个程序文件的起始位置。如果你为堆栈分配了超过所需的内存，可能会覆盖（抹掉）PSP 中的信息，而这些信息对于你的程序甚至整个计算机的正常运行是非常关键的。此类错误通常会导致程序崩溃。

- 在初始化堆栈区域时，需要同时加载堆栈段寄存器（SS） 和 堆栈指针寄存器（SP）。

!!!info
    x86 实模式编程中，如果想利用完整的 64KB 段空间作为堆栈，会故意将 SP 初始化为 0000。

    这是因为 PUSH 指令的执行顺序是：先减后存。

    - 初始状态：SP = 0000。

    - 执行 PUSH：

    - 第一步：SP = SP - 1。因为是 16 位循环计数，0000 - 1 会变成 FFFF。

    - 第二步：将数据存入 SS:FFFF。然后继续SP-1，继续存完数据。

    - 结果：数据被存放在了段的最高地址（最顶部）。

<div align=center> <img src="../img/chap3/push_cx_stack.png" width = 80%/> </div>   


> PUSH CX 指令展示了栈段的循环特性。


### Push

PUSH 指令的作用是将数据压入栈中：

- 在 8086 到 80286 处理器中，每次 PUSH 传送 2 字节，不能只传送 1 字节。
- 在 80386 及更高版本的处理器中，可以传送 2、4 或 8 字节。

**PUSHA（push all）指令**

- PUSHA 指令会把内部通用寄存器（除了段寄存器）的内容全部依次压入栈中。
- 压栈顺序是：AX、CX、DX、BX、SP（原始值）、BP、SI、DI。
- 被压入栈中的 SP 值是压栈操作开始前的 SP 原始值。

**PUSHAD（push all double）指令**

- PUSHAD 是 80386 到 Pentium 4 处理器中用于压入 32 位寄存器组的指令。
- PUSHA 和 PUSHAD 共享同一个操作码（0x60）：
    - 操作数大小为 16 位时执行 PUSHA
    - 操作数大小为 32 位时执行 PUSHAD
    - 早期 8086/8088 处理器不支持该指令
    - 64 位模式下的 Pentium 4 处理器也不支持

**PUSHF（push flags）指令**

- PUSHF 指令会将标志寄存器的内容压入栈中。


<div align=center> <img src="../img/chap3/PUSHA.png" width = 80%/> </div>   

- PUSHA 指令会将所有 16 位通用寄存器压入栈中（共 8 个寄存器，需要 16 字节的栈空间）。
- 所有寄存器压栈后，SP 寄存器的值会减少 16。
- 当需要保存 80286 及以上处理器的全部寄存器时，PUSHA 很有用。
- PUSHAD 指令会在 80386 至 Core2 处理器上将全部 32 位寄存器压入栈中（需 32 字节栈空间）。


### POP

POP 指令与 PUSH 相反，用于将数据从栈中弹出，并存入目标位置。

- **POP**：将栈顶数据移出，并放入指定的 16 位通用寄存器、段寄存器，或 16 位内存单元（不能直接将立即数 POP 出）。
- **POPA（pop all）**：顺序从栈中弹出 16 字节数据，依次存入 DI、SI、BP、SP（会被丢弃）、BX、DX、CX 和 AX（顺序为 DI→SI→BP→SP→BX→DX→CX→AX）。
- **POPAD（pop all double）**：在 80386 到 Pentium 4 处理器上，将 32 位寄存器组从栈顶依次弹出。
    - POPA 和 POPAD 都使用相同的操作码（0x61）：
        - 操作数为 16 位时执行 POPA
        - 操作数为 32 位时执行 POPAD
    - 8086/8088 不支持此指令，Pentium 4 的 64 位模式下也不支持。
- **POPF（pop flags）**：将栈顶 16 位数据弹出，并写入标志寄存器。