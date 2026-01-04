---
comments: true
---

# Arithmetic and Logic Instructions

## ADDITION, SUBTRACTION AND COMPARISON

大多数微处理器中的算术指令包括加法、减法和比较。

### ADD

ADD 指令在微处理器中有多种形式：

- **带进位加法（ADC）：** 这是一种次级加法指令，会在加法操作中包含进位标志位（Carry Flag）。

- **不支持的加法类型：** 处理器不允许内存到内存的加法或涉及段寄存器的加法。（段寄存器只能被移动、压栈或弹栈。）
- **递增（INC）：** INC 指令是一种特殊的加法操作，用于将一个值增加 1。

#### Register Addition

当算术和逻辑指令（如 ADD）执行时，会影响部分标志寄存器位，包括符号标志（sign）、零标志（zero）、进位标志（carry）、辅助进位标志（auxiliary carry）、奇偶标志（parity）以及溢出标志（overflow）。而中断标志（interrupt）和陷阱标志（trap）不受影响。

#### Immediate Addition

立即加法用于将一个常数（立即数）直接加到目标操作数上。

#### Memory-to-Register Addition

在此操作中，数据从内存中读取并加到寄存器（如 AL）中。例如，一个程序可以将位于连续内存地址（如 NUMB 和 NUMB+1）中的两个字节分别加到 AL 寄存器里，具体如下所示。

```asm
MOV DI , OFFSET NUMB
MOV AL , 0
ADD AL , [DI]
ADD AL , [DI+1]
```


#### Array Addition

内存数组是有序的数据序列。假设有一个包含 10 个字节的数据数组（ARRAY），元素编号从 0 到 9。
下面的例子展示了如何将数组中第 3、5 和 7 个元素的内容相加。

```asm
MOV SI , 3
MOV AL , 0
ADD AL , ARRAY[SI]
ADD AL , ARRAY[SI+2]
ADD AL , ARRAY[SI+4]
```

#### Increment addition



INC 指令用于将任意寄存器或内存单元（除了段寄存器）加 1，并且它不会改变 CF（进位标志位）的状态。例如：

```asm
MOV AX,0FFFFh
ADD AX,1    ; 05 01 00
            ; CF = 1
MOV AX,0FFFFh
INC AX      ; 40（操作码）
            ; CF = 0
```
对于间接内存递增操作，必须通过 BYTE PTR、WORD PTR 或 DWORD PTR 等前缀来声明数据的大小。
因为汇编器无法分辨 INC [DI] 所要操作的数据是字节、字、还是双字。

<div align="center">
<img src="../img/chap5/inc.png" alt="INC 指令" width="500">
</div>

#### Addition with carry

ADC（带进位加法）指令会将进位标志（C）中的位加到操作数的数据上。

- 主要用于在 80386 到 Core2 处理器中处理大于 16 位或 32 位的加法运算的软件中
- 与 ADD 指令类似，ADC 在加法之后会影响标志位的状态
- 图 5-1 展示了进位标志的位置和作用，便于理解其功能
- 在 8086 到 80286 架构中，因为只能直接加 8 位或 16 位数，如果没有加上进位标志位，无法方便地实现大数加法

<div align="center">
<img src="../img/chap5/adc.png" alt="ADC 指令" width="500">
</div>

使用ADC指令，将大数分散到四个寄存器中存，实现大数的加法。


!!!Example
    例如，使用 ADC 指令来计算两个长度为多个双字（dword）的长整数之和。
    
    ```asm
    .data
    int1 DD 1,0,0,0,0,0,0,1
    int2 DD 1,0,0,0,0,0,0,1
    .code
    MOV EDI,OFFSET int1
    MOV ESI,OFFSET int2
    MOV ECX,8          ; ECX = 8，表示有8个双字需要相加
    CLC                ; 先清除进位标志
    loop: MOV EAX, [ESI]
    ADC [EDI], EAX    ; 将EAX和[EDI]相加并加上上一次的进位
    LEA ESI, [ESI+4]  ; 指向下一个源操作数
    LEA EDI, [EDI+4]  ; 指向下一个目的操作数
    DEC ECX           ; 循环计数减一
    JNZ loop           ; 如果ECX > 0，则继续循环
    ```

#### ADCX and ADOX

ADD 和 ADC 指令常用于加速大整数的算术运算，其典型代码序列如下：

```asm
add
adc
adc
...
```

这些指令会形成依赖链，从而导致处理器无法并行执行算术运算。


为了解决这一问题，Intel 引入了第二条进位链（carry chain），这使得可以同时进行两条独立的进位链运算。

针对 ADC 指令，新增了两个变体：`ADCX`和`ADOX`。


两种新的 ADC 变体互不影响，因为它们各自有独立的进位标志。

- `ADCX` 使用 CF（进位标志），并且不会改变其他标志位。
- `ADOX` 使用 OF（溢出标志），并且不会改变其他标志位。



<div align="center">
    <img src="../img/chap5/adcx_adox.png" alt="ADCX和ADOX并行进位链示例" width="550">
</div>


!!!info
    ADCX、ADOX 和 MULX 指令在大整数乘法中具有重要意义。大整数运算在密码学（如RSA公钥算法）和高性能计算等领域有着广泛的应用。

    <div align="center">
        <img src="../img/chap5/info1.png" alt="MULX 指令" width="550">
    </div>


#### Exchange and Add

XADD (exchange and add)  指令最早出现在 80486 处理器中，并一直延续到 Core2 架构。

- XADD des, src 的操作过程如下：
   - 首先交换目标操作数（des）与源操作数（src）
    des <-> src
   - 然后将两者的和存入目标操作数（des）
    des <- src + des

- <span style="color: red;">这是少数会修改源操作数的指令之一。</span>

<div align="center">
    <img src="../img/chap5/xadd.png" alt="XADD 指令" width="550">
</div>


```asm
MOV AX, 1000H
MOV BX, 2000H ； AX = 1000H, BX = 2000H
XADD AX, BX ； AX = 3000H, BX = 1000H
```

目标操作数可以是寄存器或内存位置；源操作数是寄存器。

在多处理器系统中，XADD 可以与 LOCK 前缀结合使用，使多个处理器能够安全地执行同一个循环（DO 循环）。

- `int atomic_xadd (atomic_t *v, int inc)`
   - XADD 会将给定的增量“inc”加到“\*v”上，并且原子性地返回“\*v”之前的值。
   - XADD 在原子变量“\*v”上执行交换并加的操作。
   - 当有多个 CPU 同时在线时，XADD 会加上锁（LOCK），以保证操作的原子性。

- XADD 可用于实现共享计数器和各种数据结构。

- XADD 可能适用于乐观锁[^1]机制，通常应用于高并发场景。

- 下例使用乐观锁来使多个线程安全地更新共享版本号。

```asm
.data
version DD 0 ; shared version number initialized to 0
 
.code
    MOV ECX, version ; load the current value of version
    ...... ; working optimistically
    MOV EAX, 1 ; EAX = 1
    XADD version, EAX ; version <-> EAX, version = version+1 
    CMP EAX, ECX ; check if the value was modified by 
    ; another thread
    JNE retry ; if version was updated then rollback
    ......
retry: ...... ; handle the conflict
```



[^1]: 乐观锁（Optimistic Locking）是一种并发控制机制，它假设多个线程在访问共享资源时不会发生冲突，因此不需要加锁。当线程需要更新共享资源时，它首先读取资源，然后进行修改，最后再写回资源。如果在写回过程中发现资源已经被其他线程修改，则线程需要重新读取资源，并再次尝试修改。


### SUB

SUB（减法）有多种形式，广泛存在于指令集中：

- SUB 支持任意寻址方式，可用于 8、16 或 32 位数据的运算。
- 还有一种特殊的减法形式——DEC（递减），用于寄存器或内存位置的数值减 1。
- 当需要对超过 16 位或 32 位宽度的数进行减法时，会用到带借位减法指令 SBB（Subtract with Borrow）。


#### Register Subtraction

- 每次执行减法操作后，微处理器都会根据结果修改标志寄存器（Flags Register）的内容。
- 这种标志寄存器的改变在绝大多数算术和逻辑运算后都会发生。


#### Immediate Subtraction

- 微处理器还允许立即数参与运算，可以直接对寄存器或内存的常数数据进行减法。

#### Decrement Subtraction

- DEC 指令会把某个寄存器或内存单元的值减 1。
- DEC 会影响除 CF（进位标志）以外的所有标志位。


!!!warning
    如 CMP 指令会根据执行结果更新所有标志位，但 INC（加一）和 DEC（减一）只会写入除 CF 之外的其他标志位。

    如果 JCC（条件跳转指令）直接使用 INC/DEC 操作后的标志位，有可能因为依赖于 INC/DEC 非预期更新的标志位而导致错误。例如：

    ```asm
    CMP EAX , EBX
    ...
    DEC ECX
    JBE LABEL
    ```

    - CMP EAX, EBX：比较 EAX 和 EBX 的值。这会设置 CPU 的 EFLAGS 寄存器（包括零标志位 ZF 和进位标志位 CF）。

    - DEC ECX：将 ECX 寄存器减 1。DEC 指令也会修改标志位（如 ZF, SF, OF），但它不修改 CF。这就会影响到最后的判断

    - JBE LABEL：跳转指令（Jump if Below or Equal）。它的触发条件是 (CF == 1) OR (ZF == 1)。
    

    故编译器通常不会使用 INC/DEC 指令来更新循环计数，也不会在条件跳转（JCC）中重用 INC/DEC 产生的标志位（FLAGS）。


#### Subtraction with borrow

- SBB（带借位减法）指令的功能类似于普通的减法，不同之处在于：它还会将进位标志（C，Carry Flag，实际为借位）中保存的借位值参与运算，从结果中再减去一次借位。、

- SBB 最常见的用途是在 8086~80286 微处理器上进行超过 16 位的数据减法，或者在 80386~Core2 之后用于超过 32 位的数据减法。

- 进行宽位数减法时，需要像宽位加法传播进位那样，通过多条 SBB 指令传播借位。

<div align="center">
    <img src="../img/chap5/sbb.png" alt="SBB 指令" width="550">
</div>


### Camparison

比较指令（CMP）实际上是一次只影响标志位的减法操作。

- 目标操作数不会被改变。
- 常用于判断寄存器或内存单元中的内容是否等于另一个值。
- CMP 指令通常后接条件跳转（JCC）指令，通过检查标志位的状态实现条件分支。

<div align="center">
    <img src="../img/chap5/cmp.png" alt="CMP 指令" width="550">
</div>

#### Comapre and Exchange
>(80486–Core2 Processors Only)


CMPXCHG 会将目标操作数与累加器（隐含操作数，通常为 AL/AX/EAX）进行比较，

例如：`CMPXCHG des, src（AL/AX/EAX 隐含）`。

- 如果 des == 累加器，则将 src 的值写入 des，同时 ZF = 1；
- 如果 des ≠ 累加器，则将 des 的值写入累加器，同时 ZF = 0；
- EFLAGS 中的零标志位（ZF）会相应地被设置。
    - 该指令仅在 80486 至 Core2 指令集中提供
    - 可用于 8 位、16 位或 32 位数据


例如, `CMPXCHG CX,DX (AX)`:

- if CX == AX, CX = DX, ZF =1
- if CX <> AX, AX = CX, ZF =0

>如果目标操作数与 AL、AX 或 EAX 寄存器中的值相等，则零标志位（ZF）被置为 1；否则，ZF 被清零。

那么上面的例子可能有以下几种情况

- Case 1: 
    - before execution: 
        - (CX)=00FFH, (DX)=00EFH, (AX)=00FFH;
    - after execution:
        - (CX)=00EFH, (DX)=00EFH, (AX)=00FFH, ZF=1; 

- Case 2: 
    - before execution:
        - (CX)=00FFH, (DX)=00EFH, (AX)=00EEH ; 
    - after execution:
        - (CX)=00FFH, (DX)=00EFH, (AX)=00FFH, ZF=0;

!!!info
    int atomic_cmpxchg (atomic_t *v, int new, int old):
    
    - 此函数对原子变量“v”执行一次原子性比较交换操作，使用提供的 old 和 new 值。
    - 它返回该原子变量 v 在操作前的旧值。
    
    与 `CMPXCHG` 的参数对应为
    
    | C 语言参数       | 汇编操作数类型             | 作用                                                 |
    |:---------------|:--------------------------|:------------------------------------------------------|
    | `int old`      | 累加器 (EAX / RAX)        | 预期的旧值。指令会将内存中的值与它进行比较。           |
    | `atomic_t *v`  | 目标操作数 (Destination)  | 内存地址。指向你想要更新的那个共享变量。              |
    | `int new`      | 源操作数 (Source)         | 待写入的新值。如果比较成功，就将此值写入内存。        |

运用CMPXCHG可以实现无锁编程。

<div align="center">
    <img src="../img/chap5/cmpxchg.png" alt="CMPXCHG 指令" width="550">
</div>

顺序栈在存在竞争条件的并发系统中无法正常工作。自旋锁和读写锁可以帮助实现锁的持有者之间的转移，但这样做是耗费资源的。

<div align="center">
    <img src="../img/chap5/cmpxchg2.png" alt="CMPXCHG 指令" width="550">
</div>

<div align="center">
    <img src="../img/chap5/cmpxchg3.png" alt="CMPXCHG 指令" width="550">
</div>


#### CMPXCHG8B/CMPXCHG16B


- CMPXCHG8B 指令用于比较并交换8个字节的数据。
- 语法：`CMPXCHG8B [mem64-operand]`
    - ECX:EBX：新的64位值（隐式操作数）
    - EDX:EAX：旧的64位值（隐式操作数）
    - 如果操作数（内存中的64位值）与EDX:EAX相等，
        - 则操作数=[ECX:EBX]，ZF=1
    - 否则，将操作数（内存）中的64位值加载到EDX:EAX，ZF=0
    - 零标志（ZF）指示比较后值是否相等。

例如：

- 如果内存[memory]中的64位值等于EDX:EAX，就用ECX:EBX的值替换它。
- 否则，将内存[memory]中的值加载到EDX:EAX。
- CMPXCHG8B 通常结合LOCK前缀在多处理器环境下使用，以确保操作的原子性。



```asm
MOV EAX, [mem]      ; 新值的低32位装入EAX
MOV EDX, [mem+4]    ; 新值的高32位装入EDX
MOV EBX, new_low    ; 替换值的低32位
MOV ECX, new_high   ; 替换值的高32位
LOCK CMPXCHG8B QWORD PTR [mem]
JZ SUCCESS          ; 如果ZF=1，跳转到SUCCESS
```


- CMPXCHG16B 将 RDX:RAX 中的128位值与内存中的128位（目标操作数）进行比较。
    - 如果相等，则将RCX:RBX中的128位新值写入目标操作数。
    - 否则，将目标操作数的128位值加载至RDX:RAX。
- 注意：CMPXCHG16B要求目标（内存）操作数必须16字节对齐。


## MULTIPLICATION AND DIVISION

乘法和除法可以作用于Byte、Word、Doubleword操作数，

- 可以是无符号整数（MUL）或有符号数（IMUL）
- 对于 MUL 指令，被乘数始终隐式存储在 AL/AX/EAX 寄存器中
- 例如：`MUL CL ; 此时 AX = AL*CL`
- 乘积始终是双倍宽度的product。
    - 两个8位数相乘产生16位结果；两个16位数相乘产生32位结果；
    - 两个32位数相乘产生64位结果
    - 在 Pentium 4 的 64 位模式下，两个64位数相乘会得到128位的乘积

### 8/16/32/64-Bit Multiplication

- 在8位乘法中，被乘数总是隐式地位于 AL 寄存器中，无论有符号还是无符号运算
- 乘数可以是任意8位寄存器或内存单元
- 如果使用内存操作数，需要使用限定符指明操作数大小，例如 `MUL BYTE PTR [BX]`
- 立即数乘法不被允许（例如 `MUL 12H`），除非使用 IMUL 的两操作数或三操作数格式

- 运算完成后，乘积会被存放在 AX 中，即双倍宽度的product

<div align="center">
    <img src="../img/chap5/mul8b.png" alt="8-Bit Multiplication" width="550">
</div>

#### 16-Bit Multiplication

- 字（Word）乘法和字节（Byte）乘法非常相似。
- 此时被乘数存储在AX寄存器中，而不是AL。
- 32位积结果存放在DX–AX寄存器对中：
    - DX包含积的高16位；
    - AX包含积的低16位。
- 与8位乘法一样，乘数可由程序员自由选择。

#### 32-Bit Multiplication

- 从80386及更高版本的处理器开始，允许32位乘法，因为这些处理器拥有32位寄存器。
    - 可以使用`IMUL`和`MUL`指令进行有符号或无符号乘法运算。
- EAX中的值与指令指定的操作数相乘。
- 64位的乘积会存放在`EDX–EAX`寄存器对中，其中EAX包含积的低32位。

#### 64-Bit Multiplication

- 在Pentium 4处理器中，64位乘法的结果以128位形式保存在`RDX:RAX`寄存器对中。
- 尽管这种大规模乘法比较少见，Pentium 4和Core2都可以对有符号和无符号数据进行此操作。

!!!Summary
    | 操作数大小 | 被乘数隐式存储在 | 乘积存储在 |
    |:----------|:-----------------|:------------|
    | 8-Bit | AL | AX |
    | 16-Bit | AX | DX:AX |
    | 32-Bit | EAX | EDX:EAX |
    | 64-Bit | RAX | RDX:RAX |

### IMUL--Signed Multiplication


IMUL 指令有三种形式：

- 单操作数形式：这种形式与 MUL 指令相同，即只写一个操作数，被乘数隐含指定，结果为双倍宽度，存放在默认寄存器中。
- 双操作数形式：目的操作数为寄存器，源操作数可以是立即数、寄存器或内存单元。计算出的中间乘积（即输入操作数宽度的两倍）会被截断，仅存入目的操作数中。
  例如：
    - IMUL ECX, [EAX+4] ；ECX = ECX * [EAX+4]
    - IMUL ECX, 16 ；ECX = ECX * 16
- 三操作数形式：第一个源操作数与第二个源操作数相乘，截断后的结果被存入目的寄存器中。
  例如：
    - IMUL ECX, [EAX+4], 5 ；ECX = [EAX+4] * 5

!!!info "Difference between MUL and IMUL"
    The MUL instruction fills the upper part with zero-extension, while the IMUL
    instruction fills the upper part with sign extension, e.g.,

    ```asm
    MOV AL, 48
    MOV BL, 2
    MUL BL 
    ; AX = 0060h (00000000 01100000)zero-extension
    MOV AL, 48
    MOV BL, -2
    IMUL BL 
    ; AX = FFA0h (11111111 10100000)sign extension
    ```

### Flags Affected by Mul

MUL 指令影响的标志位

- 当乘积可以完全容纳在乘积的低位寄存器中时，MUL 指令会清除 OF（溢出标志）和 CF（进位标志）；否则，OF 和 CF 会被置位。例如：

<div align="center">
    <img src="../img/chap5/mulflags.png" alt="MUL 指令影响的标志位" width="550">
</div>

> CF 和 OF 标志用于指示乘积高位部分是否包含有效数字。


### Flags Affected by IMUL

当中间乘积的有符号整数值与经过操作数长度截断并符号扩展后的结果不同时，CF 和 OF 标志会被置位；否则，CF 和 OF 标志会被清零。

<div align="center">
    <img src="../img/chap5/imulflag.png" alt="IMUL 指令影响的标志位" width="550">
</div>

对于两操作数和三操作数形式，由于存在截断，应该检查 CF 或 OF 标志，以确保没有重要位被丢失。

!!!Note
    简单来说，如果操作数长度截断的值与乘出来的值是相等的，那么CF和OF=0；否则，CF和OF=1。

### Division

除法操作可在8位、16位或32位数据上进行，具体取决于微处理器的类型。

- 可执行无符号除法（DIV）或有符号除法（IDIV）。
- 被除数始终为双倍宽度（例如，用32位数据进行除法时，被除数占用64位），通过操作数进行除法。
- 没有任何微处理器支持带立即数的除法指令。
- 在64位模式下，如Pentium 4和Core2，可以实现用128位的数据去除以64位的数据。

- 执行除法时，可能会出现两种错误：
    - 尝试除以0（divide by zero）
    - 除法溢出：当用较小的数去除一个很大的数时发生（divide overflow）
- 无论哪种错误，微处理器都会生成一个除法错误中断。
- 在大多数系统中，出现除法错误中断时，系统会在屏幕上显示错误信息。


#### 8 bit division

使用 AX 寄存器存储被除数，将其除以任意 8 位寄存器或内存单元中的内容，即用 AX 除以 r/m8，运算结果如下存放：

AL := Quotient，AH := Remainder。

!!!info "高位存余"
    这种做法可以适应带余除法,可以回看[计算机组成中所介绍的硬件除法](../CO/wk2/#division)

    <div align="center">
        <img src="../img/chap5/divrem.png" alt="8-Bit Division" width="500">
    </div>

也就是说，除法操作后，商被放入 AL，余数为整数并存放在 AH 中。

<div align="center">
    <img src="../img/chap5/div8b.png" alt="8-Bit Division" width="500">
</div>

商（Quotient）可以为正也可以为负；余数（Remainder）总是与被除数（dividend）同号。这种舍入方式被称为“向零舍入”（round-toward-zero）。



例如，`IDIV BL`:

- 当 AX=10H（+16），BL=0FDH（-3）时
    - 结果：商为 -5（AL），余数为 1（AH）
- 当 AX=0FFF0H（-16），BL=03H（+3）时
    - 结果：商为 -5（AL），余数为 -1（AH）

- 在 8 位除法中，数据通常为 8 位宽。
- 被除数需要转换为 AX 中的 16 位宽数字；对于有符号数和无符号数，这一转换方式有所不同。

下面的例子演示了如何用无符号字节内存单元 NUMB 的内容除以无符号字节内存单元 NUMB1 的内容（即 NUMB  $\div$  NUMB1）。


<div align="center">
    <img src="../img/chap5/div8b2.png" alt="8-Bit Division" width="500">
</div>


注意，NUMB 的内容会被零扩展为一个 16 位的无符号数作为被除数。

#### 16 Bit Division

16 位除法与 8 位除法类似。不同之处在于，被除数不是 AX（16 位），而是使用 DX–AX 组合成一个 32 位的被除数。  

<div align="center">
    <img src="../img/chap5/div16b.png" alt="16-Bit Division" width="500">
</div>

在 80386 及以上处理器中，通常用 MOVZX 指令将被除数进行零扩展以获得更高位数的操作。

#### 32 Bit Division


80386 到 Pentium 4 支持对有符号或无符号数进行 32 位除法运算。

- 64 位的被除数由 EDX–EAX 组合而成，并由指令指定的操作数进行除法。
- 商（32 位）保存在 EAX 中，
- 余数（32 位）保存在 EDX 中。

<div align="center">
    <img src="../img/chap5/div32b.png" alt="32-Bit Division" width="500">
</div>

#### 64 Bit Division

Pentium 4 在 64 位模式下可以对有符号或无符号数执行 64 位除法运算。

- 64 位除法时，被除数保存在 RDX:RAX 寄存器对中（高位为 RDX，低位为 RAX）。
- 除法操作后，商保存在 RAX 寄存器中，余数保存在 RDX 寄存器中。


!!!summary
    | 操作数大小 | 被除数隐式存储在 | 商存储在 | 余数存储在 |
    |:----------|:-----------------|:------------|:------------|
    | 8-Bit | AL | AL | AH |
    | 16-Bit | DX:AX | AX | DX |
    | 32-Bit | EDX:EAX | EAX | EDX |
    | 64-Bit | RDX:RAX | RAX | RDX |


### Signed Extension

有三类用于符号扩展的指令：

- CBW/CWDE/CDQE 用于将 AL、AX 或 EAX 中的有符号字节、字或双字转换为 AX、EAX 或 RAX 中的有符号字、双字或四字（例如，AX → EAX）。

<div align="center">
    <img src="../img/chap5/signed.png" alt="Signed Extension" width="500">
</div>

- CWD/CDQ/CQO 指令分别将 AX/EAX/RAX寄存器的符号位复制到 DX、EDX 或 RDX 寄存器的所有位中。


!!!summary
    记忆方式，如果最后一个是E，说明没有跨寄存器，没有E的有CBW，这个很简单，因为从Byte到Word肯定不用跨寄存器，至于CWD（word to double word），CDQ(double word to qword),CQO(qword to Qctword)，都是跨寄存器的了.

MOVSX/MOVSXD (Move sign extended)指令通过符号扩展，将源操作数（寄存器或内存中的值）复制到目标操作数（寄存器）中。

- MOVSX 用于将字节或字转换为有符号的双字或四字。
- MOVSXD 用于将双字转换为四字。

<div align="center">
    <img src="../img/chap5/movsx.png" alt="MOVSX" width="500">
</div>


MOVZX (Move zero extended)指令则是将源操作数（寄存器或内存中的值，作为第二操作数）复制到目标寄存器（第一个操作数）中，并进行零扩展以适应目标寄存器的位数。

<div align="center">
    <img src="../img/chap5/movzx.png" alt="MOVZX" width="500">
</div>


### The Remainder


在除法运算后，处理余数有几种可能的方式：

- 舍弃余数，仅保留商的整数部分（例如，13/2=6）。
- 对商进行四舍五入：若为无符号除法，需要将余数与除数的一半进行比较，以判断商是否需要进一（例如，13/2 = 7）。
- 转换为带小数的余数：余数也可以转换为小数形式的结果（例如，13/2 = 6.5）。


<div align="center">
    <img src="../img/chap5/remainder1.png" alt="The Remainder" width="500">
</div>

上面展示了一个将 AX 除以 BL 并对无符号结果进行四舍五入的程序（即 AX ÷ BL）。该程序在比较前会将余数乘以2，再与 BL 比较，以决定商是否需要进一。这里通过 INC 指令对 AL 的内容进行加1实现四舍五入。

<div align="center">
    <img src="../img/chap5/remainder2.png" alt="The Remainder" width="500">
</div>


上面展示了如何将 13 除以 2。8 位的商被保存在内存位置 ANSQ 中，随后清空了 AL。接着，再次将 AX 的内容除以 2，以生成带小数的余数。


第一次除法后，AH=1，AL=6，将AL清空之后，AX的值为(0x0100),即256，所以第二次除法后，AX=(0x0080),AL的值为128=80H。如果将二进制小数点放在 AL 最左侧的比特位之前，那么 AL 中的小数余数为 0.5₁₀（即二进制的 0.10000000）。该余数随后被保存在内存单元 ANSR 中。


## BCD and ASCII Arithmetic


微处理器允许对 BCD（二进制编码的十进制数）和 ASCII（美国信息交换标准代码）数据进行算术运算。

- 这些指令在 64 位模式下无效，如果在 64 位模式下使用，会产生非法操作码（#UD）异常。


### BCD Arithmetic

BCD 操作常见于诸如销售终端（如收银机）等系统，这类场合通常不需要复杂的运算。

- 针对 BCD 数据，有两种算术操作方式：加法和减法。
- DAA（Decimal Adjust After Addition）指令用于 BCD 加法之后，
- DAS（Decimal Adjust After Subtraction）指令用于 BCD 减法之后。
- 这两条指令都会对加法或减法的结果进行修正，使其变为正确的 BCD 数值格式。
- 这些指令均使用 AX 寄存器作为源和目标寄存器。

#### DAA Instruction

- DAA 用于调整两个packed BCD value相加后的结果，生成一个正确的packed BCD 结果。
    - DAA 指令只应在紧接着 ADD 或 ADC 指令（用于将两个 2 位的packed BCD 值以二进制方式相加，结果存入 AL 寄存器）之后使用。
    - DAA 将自动修正 AL 寄存器中的内容，使其成为正确的 2 位packed BCD 结果。

- 如果发生十进制进位，对应的 CF（进位标志）和 AF（辅助进位标志）会被设置。
    - 辅助进位（AF）用于保存加法操作后的半字节进位。

!!!Note
    具体来说，其调整过程为：

    - 第一步：调整低 4 位 (Low Nibble)
        - 触发条件：如果 AL 的低 4 位大于 9，或者辅助进位标志 AF = 1。
        - 动作：将 AL 加上 06H，并将 AF 设置为 1。

    - 第二步：调整高 4 位 (High Nibble)    
        - 触发条件：如果在第一步调整后，AL 的高 4 位大于 9，或者进位标志 CF = 1。
        - 动作：将 AL 加上 60H，并将 CF 设置为 1。


!!!Note
    **示例 1：计算 BCD 35 + 48**

    ```asm
    MOV AL, 35H         ; AL = 0x35 (十进制 35)
    ADD AL, 48H         ; AL = 0x7D, AF = 0
    DAA                 ; 0xD 大于 9，调整低4位，加上06H，变为0x83，CF=0，不用调整
    ```

    **示例 2：计算 BCD 69 + 29**

    ```asm
    MOV AL, 69H         ; AL = 0x69 (十进制 69)
    ADD AL, 29H         ; AL = 0x92, AF = 1
    DAA                 ; 2<9但是AF=1，调整低4位，加上06H，变为0x98，CF=0，不用调整
    ```

    **示例 3：计算 BCD 35 + 65**

    ```asm
    MOV AL, 35H         ; AL = 0x35 (十进制 35)
    ADD AL, 65H         ; AL = 0x9A, AF = 0
    DAA                 ; A>9，调整低4位，加上06H，变为0xA0，CF=0，调整高4位，加上60H，变为0x00，CF=1，所以最终结果为0x00，CF=1
    ```

    **示例 4：计算 BCD 90 + 70**

    ```asm
    MOV AL, 90H         ; AL = 0x90 (十进制 90)
    ADD AL, 70H         ; AL = 0x100, AF=0，CF=1(无符号溢出)
    DAA                 ; 低4位为0，A>9不成立，接下来看高四位，CF=1，加60H，变为0x60，CF=1，所以最终结果为0x60，CF=1
    ```

<div align="center">
    <img src="../img/chap5/daa.png" alt="DAA" width="500">
</div>


#### DAS Instruction

* **DAS** 用于调整两个 packed BCD value 相减后的结果，生成一个正确的 packed BCD 结果。
* DAS 指令只应在紧接着 **SUB** 或 **SBB** 指令之后使用。
* DAS 将自动修正 AL 寄存器中的内容，使其成为正确的 2 位 packed BCD 结果。
* 如果发生十进制借位，对应的 **CF**（进位标志，在减法中表示借位）和 **AF**（辅助进位标志）会被设置。
* 辅助进位（AF）用于保存减法操作后低半字节向高半字节的借位情况。



!!!Note
    具体来说，其调整过程为：

    - **第一步：调整低 4 位 (Low Nibble)**
        - **触发条件**：如果 AL 的低 4 位大于 9，或者辅助进位标志 **AF = 1**。
        - **动作**：将 AL 减去 **06H**，并将 AF 设置为 1。

    - **第二步：调整高 4 位 (High Nibble)**
        - **触发条件**：如果在第一步调整后，AL 的高 4 位大于 9，或者进位标志 **CF = 1**。
        - **动作**：将 AL 减去 **60H**，并将 CF 设置为 1。



**示例 ：计算 BCD 95 - 48 (期望结果：47)**

```asm
MOV AL, 95H         ; AL = 0x95 (十进制 95)
SUB AL, 48H         ; AL = 0x4D, AF = 1 (5不够减8，产生借位)
DAS                 ; 0xD大于9且AF=1，调整低4位，减06H，变为0x47。
                    ; 高4位4<9且CF=0，不用调整。最终结果 AL=47H
```


### ASCII Arithmetic

ASCII 算术指令专用于操作编码数字（即 0–9 表示为 30H 到 39H）。

- ASCII 算术常用的四条指令为：
    - AAA（加法后 ASCII 调整，ASCII Adjust after Addition）
    - AAS（减法后 ASCII 调整，ASCII Adjust after Subtraction）
    - AAM（乘法后 ASCII 调整，ASCII Adjust after Multiplication）
    - AAD（除法前 ASCII 调整，ASCII Adjust before Division）
- 这些指令均使用寄存器 AX 作为操作数的来源及结果保存寄存器。


#### AAA Instruction

AAA 指令用于在使用 ADD 指令对两个未压缩（unpacked）BCD 数字相加后进行调整。

- AAA 指令隐式地使用 AL 寄存器作为源和目标操作数。
- AAA 指令会将 AL 中的结果调整为合法的未压缩 BCD 值。
- AAA 指令在处理 ASCII 数字加法时，无需额外屏蔽高 4 位 ‘3’，可直接获得正确的结果。


!!!Note
    与DAS关注整个AL不同，AAA 指令主要检查 AL 寄存器的低 4 位以及辅助进位标志（AF）。其调整逻辑如下：
    
    - 触发条件:如果 AL 的低 4 位（低半字节）大于 9，或者 AF = 1。
    - 动作：AL 加上 06H。AH 加上 01H（产生向高位的进位）。设置 AF = 1 且 CF = 1。最后将 AL 的高 4 位清零（只保留低 4 位的有效 BCD 码）。
    - 不满足条件时：如果低 4 位 $\le 9$ 且 AF = 0，则只需将 AL 的高 4 位清零，且 AF 和 CF 清零。

    <div align="center">
        <img src="../img/chap5/aaa.png" alt="AAA" width="500">
    </div>



#### AAS Instruction (ASCII Adjust AL after Subtraction)

AAS 指令用于在使用 SUB 或 SBB 指令对两个未压缩（unpacked）BCD 数字相减后进行调整。

* AAS 指令隐式地使用 AL 寄存器作为源和目标操作数。
* AAS 会将 AL 中的结果调整为合法的未压缩 BCD 值（0-9 之间）。
* 与 AAA 类似，它常用于处理 ASCII 码减法后的结果修正。

!!!Note
    **其调整逻辑如下：**
    
    * **触发条件**：如果 AL 的低 4 位大于 9，或者辅助进位标志 AF = 1。
    * **动作**：AL 减去 06H。 AH 减去 01H（产生向高位的借位）。 设置 AF = 1 且 CF = 1。 最后将 AL 的高 4 位清零。
    * **不满足条件时**：如果低 4 位  且 AF = 0，则只需将 AL 的高 4 位清零，且 AF 和 CF 清零。

```
MOV AH, 01H         ; 高位为 1
MOV AL, 38H         ; AL = '8' (ASCII 38H)
SUB AL, 39H         ; AL = 0xFF, AF = 1 (二进制减法产生借位)
AAS                 ; 触发条件：AF=1
                    ; 动作：AL = 0xFF - 6 = 0xF9
                    ;      AH = 01H - 1 = 00H
                    ;      CF = 1, AF = 1
                    ;      AL 高 4 位清零 -> AL = 09H
; 最终结果：AH = 00H, AL = 09H, CF = 1。表示结果为 9，且向更高位借位 1。
```


#### AAM Instruction (ASCII Adjust AX after Multiply)
> 转成10进制
AAM 指令用于在使用 MUL 指令对两个未压缩 BCD 数字进行乘法运算后进行调整。

* AAM 指令隐式地使用 AX 寄存器。
* 与加减法指令不同，AAM 必须在 MUL 指令 **之后** 执行。
* 它将二进制乘积转换成两个未压缩的 BCD 数字，分别存放在 AH（十位）和 AL（个位）中。

!!!Note
    **其调整逻辑如下：**

    * **动作**：将 AL 的内容除以 10（即 0AH）。
    * **结果分配**：商（Quotient）存入 AH。 余数（Remainder）存入 AL。
    * **标志位**：根据 AL 的结果更新偏置标志（SF）、零标志（ZF）和奇偶标志（PF）。


```asm
MOV AL, 07H         ; 未压缩 BCD 7
MOV BL, 09H         ; 未压缩 BCD 9
MUL BL              ; AL = 7 * 9 = 63 (二进制为 3FH)
AAM                 ; 动作：AL(63) / 10
                    ; 商 = 6 (存入 AH)
                    ; 余数 = 3 (存入 AL)
; 最终结果：AH = 06H, AL = 03H。即十进制 63。
```

#### AAD Instruction (ASCII Adjust AX before Division)
>从10进制转成除法前的值

AAD 指令用于在使用 DIV 指令对两个未压缩 BCD 数字进行除法运算 **之前** 进行调整。

* AAD 指令是唯一一个在运算 **之前** 使用的调整指令。
* 它将 AH 和 AL 中的两个未压缩 BCD 数字合并为一个二进制数存入 AL，以便后续执行正常的二进制除法。

!!!Note
    **其调整逻辑如下：**

    * **动作**：将 AH 的值乘以 10（0AH），然后加上 AL 的值。
    * **结果分配**：将最终的求和结果存入 AL。 将 AH 清零（00H）。
    * **标志位**：根据 AL 的结果更新 SF、ZF 和 PF 标志。


```asm
MOV AH, 02H         ; 十位为 2
MOV AL, 05H         ; 个位为 5 (AX = 0205H，代表 25)
MOV BL, 05H         ; 除数为 5
AAD                 ; 动作：AL = (AH * 10) + AL = (2 * 10) + 5 = 25 (19H)
                    ;      AH = 00H
DIV BL              ; 执行 25 / 5
                    ; AL = 商 (05H)
                    ; AH = 余数 (00H)
; 最终结果：AL = 05H。计算正确。
```


!!!Summary
    | 指令 | 调整时机 | 核心逻辑简述 | 目标格式 |
    | --- | --- | --- | --- |
    | **AAA** | 加法后 | 低位 >9 或 AF=1 则 AL+6, AH+1 | Unpacked BCD |
    | **AAS** | 减法后 | 低位 >9 或 AF=1 则 AL-6, AH-1 | Unpacked BCD |
    | **AAM** | **乘法后** | **AX / 10**  AH=商, AL=余 | Unpacked BCD |
    | **AAD** | **除法前** | **(AH * 10) + AL**  AL, AH=0 | Binary |

## Basic Logic Instructions

简单的有

- AND： AND A,B; A=A&B
- OR： OR A,B; A=A|B
- XOR： XOR A,B; A=A^B

### TEST and Bit Test Instructions

TEST 指令执行按位与（AND）操作，  

- 只影响标志寄存器（flag register）的状态，用于反映测试结果；  
- 功能上类似于 CMP（比较）指令，也是不保存结果，只修改标志位；  
- 通常后面会跟 JZ（零则跳转）或 JNZ（非零跳转）等条件跳转指令；  
- 目的操作数通常用来与立即数进行测试。  


CMP 和 TEST 是常用的比较指令，通常用于条件判断，例如：

<div align="center">
    <img src="../img/chap5/eg1.png" alt="TEST" width="500">
</div>

TEST same,same 用于判断带符号数是否大于零，例如：

<div align="center">
    <img src="../img/chap5/eg2.png" alt="TEST" width="500">
</div>

TEST EAX,EAX 几乎与 CMP EAX, 0 相同，只是更短。

<div align="center">
    <img src="../img/chap5/eg3.png" alt="TEST" width="500">
</div>


80386 到 Pentium 4 增加了四条额外的测试指令，用于测试单个位。

它们的主要功能是检查操作数中特定位（Bit）的状态，并将其反映在 **进位标志位 CF** 中。

它们的区别在于：在测试完该位后，是否对其进行后续操作（如置 1、清 0 或翻转）。

这四条指令都遵循相同的基本逻辑 **首先将指定位置的位值复制到 CF 标志位**，然后根据指令类型决定是否修改原位。

| 指令 | 全称 | 功能描述 | 对原位的影响 |
| --- | --- | --- | --- |
| BT | Bit Test | 测试指定位，将其值存入 **CF**。 | **无影响**（只读） |
| BTS | Bit Test and Set | 测试并将位值存入 **CF**，随后将该位置 **1**。 | **置 1** |
| BTR | Bit Test and Reset | 测试并将位值存入 **CF**，随后将该位置 **0**。 | **清 0** |
| BTC | Bit Test and Complement | 测试并将位值存入 **CF**，随后将该位**翻转**。 | **取反** (0$\to\to$0) |


!!!Example
    假设初始状态下：`EAX = 0000 1000H` (二进制第 12 位为 1，其余为 0)。

    **示例 1：BT (仅测试)**

    ```asm
    BT EAX, 12      ; 测试第 12 位
    ; 结果：CF = 1，EAX 保持 0000 1000H 不变。

    ```

    **示例 2：BTS (测试并置位)**

    ```asm
    BTS EAX, 4       ; 测试第 4 位并置 1
    ; 结果：
    ; 1. 第 4 位原值为 0，所以 CF = 0。
    ; 2. 随后第 4 位置 1，EAX 变为 0000 1010H。

    ```

    **示例 3：BTR (测试并复位)**

    ```asm
    BTR EAX, 12      ; 测试第 12 位并清 0
    ; 结果：
    ; 1. 第 12 位原值为 1，所以 CF = 1。
    ; 2. 随后第 12 位清 0，EAX 变为 0000 0000H。

    ```

    **示例 4：BTC (测试并翻转)**

    ```asm
    BTC EAX, 12      ; 测试第 12 位并取反
    ; 结果：
    ; 1. 第 12 位原值为 1，所以 CF = 1。
    ; 2. 随后第 12 位翻转，EAX 变为 0000 0000H。
    ; 如果再执行一次该指令，EAX 会变回 0000 1000H，CF = 0。
    ```

### NOT and NEG

NOT 和 NEG 指令可以使用除段寄存器寻址外的任何寻址方式。

- NOT 指令会翻转一个字节、字、或双字的所有位。
- NEG 指令对一个数取二进制补码（求相反数）。
- NOT 是逻辑操作，而 NEG 被视为算术操作。
- NOT 指令不会影响任何标志位，但 NEG 指令会影响标志位，具体如下：
    - 如果操作数为 0，则 CF = 0，否则 CF = 1。
    - OF、SF、ZF、AF 和 PF 标志位根据结果设置。


<div align="center">
    <img src="../img/chap5/neg.png" alt="NOT" width="500">
</div>


传统的 `signum` 函数需要两次 `if-else` 判断（判断是否大于 0 或小于 0），这会导致 CPU 的分支预测失败风险。优化后的代码仅用了三条指令：`cwd`、`neg`、`adc`。


* `cwd`：将 `ax` 的符号位扩展到 `dx`。
* 如果 `ax > 0`，则 `dx = 0`。
* 如果 `ax < 0`，则 `dx = -1` (即 `0xFFFF`)。
* 如果 `ax = 0`，则 `dx = 0`。


* `NEG` 指令执行取反码操作，其副作用是：**只要操作数不是 0，就会将进位标志位 CF 设置为 1**；如果操作数是 0，则 CF = 0。

* `adc dx, dx`：带进位的加法，执行 `dx = dx + dx + CF`。

### Shift

在寄存器或内存位置中，将数字向左或向右移动或移位，
例如，SHL AX, 4。
此外，还可用于实现简单的算术运算，如通过左移（SHL）实现乘以2的n次方，
通过右移（SHR）实现除以2的n次方。
微处理器指令集包含四种不同的移位指令：其中两种是逻辑移位，两种是算术移位。

`SHL/SAL/SHR/SAR REG/MEM, Count`

<div align="center">
    <img src="../img/chap5/shift.png" alt="SHIFT" width="500">
</div>


- SHL: Shift Left Logical
- SAL: Shift Arithmetic Left
- SHR: Shift Right Logical，右移高位补0
- SAR: Shift Arithmetic Right，右移高位补符号位

注意移出来的会在CF中buffer一位。计数操作数可以是立即数，也可以是 CL 寄存器。


!!!info "SAR rounding for negative"
    对于负数，IDIV（有符号除法）得到的商是朝零取整，而SAR（算术右移）则是朝负无穷取整，这会导致两者结果不一致。例如：

    <div align="center">
        <img src="../img/chap5/sar.png" alt="SAR" width="500">
    </div>


80386及以上的处理器包含了两种双精度移位指令：SHLD（逻辑左移）和SHRD（逻辑右移），本质上属于跨寄存器移位操作。

- 每条指令包含三个操作数（SHLD/SHRD D, S, Count），而不是两个。
- 例如，指令 `SHLD reg1, reg2, imm8` 会先将 reg1 和 reg2 级联为一个更大的数，然后整体向左移动 imm8 位。
- 这两条指令既可以用于两组 16、32 或 64 位的寄存器
- 也可以用于一个 16、32 或 64 位的内存地址和一个寄存器之间的移位操作。
- reg2的值将会保留不变


<div align="center">
    <img src="../img/chap5/shlrd.png" alt="SHLD" width="500">
</div>

<div align="center">
    <img src="../img/chap5/shlrd1.png" alt="SHLD" width="500">
</div>

>可以理解为使用源寄存器来指定目的寄存器在移位时要进来的bit是什么

### Rotate



通过循环移位，可以在寄存器或内存位置中移动二进制数据，即将信息从一端移到另一端，或通过进位标志（CF）参与移位。

`ROL/ROR/RCL/RCR REG/MEM, Count`

- 这类指令可选择向左或向右循环移位。
- 其中，循环左移（ROL）和循环右移（ROR）不会将CF标志参与到旋转中。
- 通过进位循环左移（RCL）和通过进位循环右移（RCR）则会将CF标志移入最高位或最低位。


<div align="center">
    <img src="../img/chap5/rotate.png" alt="ROTATE" width="500">
</div>

当CF不参与循环移位的时候，同样作为一个buffer位。


循环移位的计数值可以是立即数，也可以存放在CL寄存器中。
    - 如果使用CL寄存器作为移位计数，CL本身的值不会发生改变。



### Bit Scan Instructions

遍历一个数，查找其中的1位（bit）。

- 通过移位操作实现
- 该指令可用于80386至Pentium 4处理器
    - BSF（位扫描正向）：从最低有效位（右侧）向左扫描源操作数，查找第一个为1的bit。
    - BSR（位扫描反向）：从最高有效位（左侧）向右扫描源操作数，查找第一个为1的bit。
- 指令格式：BSF/BSR REG, REG/MEM
    - 如果未找到1位，则零标志（ZF）被置位（ZF = 1）
    - 如果找到1位，则零标志被清零（ZF = 0），且该1位所在的位置编号被写入目标操作数中


!!!Example
    For example, let EAX = 60000000H = 0110  0000 0000 0000 0000 0000 0000 0000B
    ```asm
    MOV EAX, 60000000H
    ; EAX = 60000000H = 0110 0000 0000 0000 0000 0000 0000B
    ```
    ```asm
    BSF EBX,EAX
    ; EBX = 29 (bit 29 is 1)
    ; ZF = 0
    ```
    ```asm
    BSR EBX,EAX
    ; EBX = 30 (bit 30 is 1)
    ; ZF = 0
    ```

    从0开始还是从31开始的区别.

BSF 和 BSR 指令的扩展指令：

- `TZCNT`（trailing zero count，尾部零计数）：统计操作数末尾连续零的位数。
- `LZCNT`（leading zero count，前导零计数）：统计操作数前端（高位）连续零的位数。

TZCNT/LZCNT 与 BSF/BSR 的主要区别如下：

- 如果源操作数为 0（即没有1位），BSF/BSR 的目标操作数内容未定义，而 TZCNT/LZCNT 则返回操作数的位宽作为结果。
- 当源操作数为 0 时，BSF/BSR 仅影响 ZF 标志；而 TZCNT/LZCNT 会同时设置 ZF 和 CF（ZF = 1，CF = 1），否则都清零。

例如，假设 EAX = 60000000H = 0110 0000 0000 0000 0000 0000 0000 0000B:

- LZCNT EBX,EAX
    - EBX = 1（1 个前导零）
    - ZF = 0, CF = 0
- BSR EBX,EAX
    - EBX = 30（第 30 位为 1）
    - ZF = 0

## String Comparisons

### SCAS

SCAS（Scan String）指令用于将内存操作数指定的字节、字、双字或四字与 AL、AX 或 EAX 中的值进行比较，并根据比较结果设置 EFLAGS 标志位。

- 内存操作数的地址由 ES:EDI（或 ES:DI，依当前操作数地址大小而定）确定。
- 需要比较的操作数位于 AL、AX 或 EAX 寄存器中（隐含操作数）。
- 操作数的大小可以通过以下指令选择：
    - SCASB（字节比较）
    - SCASW（字比较）
    - SCASD（双字比较）
- SCAS 指令使用方向标志（D）来决定 DI/EDI 是自动递增还是自动递减。
- SCAS 可以与条件重复前缀一起使用：
    - REPE（当相等时重复，Repeat while Equal）
    - REPNE（当不相等时重复，Repeat while Not Equal）
  

假设有一段长度为 100 字节、起始地址为 BLOCK 的内存区域，需要检测这一区域中是否存在值为 00H 的位置。以下程序演示如何使用 SCASB 指令在该内存区域中查找 00H。

<div align="center">
    <img src="../img/chap5/scas.png" alt="SCAS" width="500">
</div>

SCASB 指令结束后：

- 如果 ZF = 1，则说明某个位置包含 00H。
- 如果 CX = 0 且 ZF = 0，则说明所有数据都不等于 00H。

### CMPS

CMPS（Compare String）指令总是以字节（CMPSB）、字（CMPSW）或双字（CMPSD）为单位，对两段内存数据进行比较。

- 比较的数据分别位于由 SI/ESI 指向的数据段（DS）内存位置，以及由 DI/EDI 指向的附加段（ES）内存位置。
- CMPS 指令执行完后会自动递增或递减 SI/ESI 和 DI/EDI 寄存器。
- 通常与 REPE（当相等时重复）或 REPNE（当不相等时重复）前缀结合使用。
- 其中 REPE 也称为 REPZ（零时重复），REPNE 也称为 REPNZ（非零时重复）。



下面的例子通过比较两段内存，查找它们是否有匹配的部分。

<div align="center">
    <img src="../img/chap5/cmps.png" alt="CMPS" width="500">
</div>


CMPSB 指令配合 REPE 前缀使用时，会在比较结果相等的情况下持续比较两个字符串。

- 当 CX 寄存器变为 0 或出现不相等的情况时，CMPSB 指令停止执行。
- 在 CMPSB 指令结束后：
    - 如果 CX = 0 且 ZF = 1，说明两个字符串完全相同。
    - 如果 CX ≠ 0 或 CX=0 但 ZF = 0，说明字符串不完全相同。