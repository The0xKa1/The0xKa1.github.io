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