# Instructions: Language of the Computer 

!!!quote "Thanks"
    本节笔记中使用到的RISC-V指令表格样式来自[**@TonyCrane**:fontawesome-brands-github:](https://github.com/TonyCrane/note/) 

## Introduction

- Language of  the machine
    - Instructions(指令)
    - Instruction set(指令集)
  
- Computer Designer  goals
    - Find a language that makes it easy to build hardware and compiler.(简单易用)
    - Maximize performance(同样的资源性能更好)
    - Minimize cost & energy (同样的性能成本更低)
    - Clarity of its application  (易用)
    - Simplicity:  reduce design time (便于设计)

**Our chosen instruction set: RISC V**

???eg "各种指令集的区别"
     <div align=center><img src="../pc/16.png" width="60%"></div>


**Von Neumann’ Computer**

如今的计算机是基于两个核心原理构建的：存储程序概念。
这两个原理分别是：

- 指令被表示为数字；
- 程序可以像数字一样存储在内存中，以便读取或写入。

四个设计理念：

1. Simplicity favors regularity 指令集的设计应该尽可能简单，规则。
2. Smaller is faster 尽可能减少指令集的大小，以便提高速度。
3. Good design demands good compromises 设计指令集时，需要权衡各种因素。
4. Make the common case fast 优化常见情况的执行速度。


当设计ISA时，需要**硬件简单--让芯片只实现基本的原语并能快速运行**，**指令要规整**

## Instruction characteristics

指令集的基本结构

operator+operands
<div align=center><img src="../pc/17.png" width="60%"></div>


!!!Note
    不同的操作系统，字的长度不同，比如32位系统，字长为32位(4 Byte)，64位系统，字长为64位(8 Byte)。


边界对齐送地址，最后两位是00


## RISC-V 指令集


|寄存器|ABI 名称|用途描述|saver|
|:--:|:--:|:--|:--:|
|x0|zero|硬件 0||
|x1|ra|返回地址（return address）|caller|
|x2|sp|栈指针（stack pointer）|callee|
|x3|gp|全局指针（global pointer）||
|x4|tp|线程指针（thread pointer）||
|x5|t0|临时变量/备用链接寄存器（alternate link reg）|caller|
|x6-7|t1-2|临时变量|caller|
|x8|s0/fp|需要保存的寄存器/帧指针（frame pointer）|callee|
|x9|s1|需要保存的寄存器|callee|
|x10-11|a0-1|函数参数/返回值|caller|
|x12-17|a2-7|函数参数|caller|
|x18-27|s2-11|需要保存的寄存器|callee|
|x28-31|t3-6|临时变量|caller|


!!!note "saver"
    在riscv代码中,当进行函数调用时,需要考虑caller save和callee save;

    所谓caller save,就是指在函数调用时,调用者需要保存自己的寄存器,一般是参数还有返回值;

    所谓callee save,就是指在函数调用时,被调用者需要保存某些重要寄存器里面的值,比如`x8-11`这些寄存器;

    caller需要保证调用子函数时,x1,x5,x6-7,a0-7寄存器可以被子函数使用;

    callee需要保证调用结束后,x8-11寄存器里面的值不会改变;

    保存的方法是使用堆栈

    ```assembly
    addi sp, sp, -8
    sw x1, 4(sp)
    sw x2, 0(sp) #push
    ...
    ...
    lw x2, 0(sp)
    lw x1, 4(sp) #pop
    ```
    <figure markdown="span">
    ![Image title](./pc/push.png){ width="400" }
    <figcaption>示意图</figcaption>
    </figure>


    `sp`始终指向栈顶
!!! Section "RISC-V 指令集的类型"
    === "R-type"
        R-type指令是指令集中的一种类型，它们的操作码字段是固定的，而剩余的字段则根据指令的具体功能而变化。R-type指令通常用于执行算术运算和逻辑运算等操作;R-type指令的格式如下所示：
        <table class="riscv-table">
        <tr>
             <td class="riscv-table-numnodel">31</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">25</td>
             <td class="riscv-table-numnodel">24</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">20</td>
             <td class="riscv-table-numnodel">19</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">15</td>
             <td class="riscv-table-numnodel">14</td>
             <td class="riscv-table-numnode" colspan="1"></td>
             <td class="riscv-table-numnoder">12</td>
             <td class="riscv-table-numnodel">11</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">7</td>
             <td class="riscv-table-numnodel">6</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">0</td>
        </tr>
        <tr>
             <td colspan="7" class="riscv-table-node">funct7</td>
             <td colspan="5" class="riscv-table-node">rs2</td>
             <td colspan="5" class="riscv-table-node">rs1</td>
             <td colspan="3" class="riscv-table-node">funct3</td>
             <td colspan="5" class="riscv-table-node">rd</td>
             <td colspan="7" class="riscv-table-node">opcode</td>
        </tr>
        </table>
        
        `rd = rs1 op rs2`,有时候`rs1`,`rs2`,又称为`rs`,`rt`

        ???abstract "R-type指令"
            | Instruction | Name                  | Meaning                                                                                           |
            |-------------|-----------------------|---------------------------------------------------------------------------------------------------|
            | ADD         | Addition              | Adds two values and stores the result in the destination register.                                |
            | SUB         | Subtraction           | Subtracts the second value from the first and stores the result in the destination register.      |
            | SLT         | Set Less Than         | Sets the destination register to 1 if the first value is less than the second (signed), otherwise sets to 0. |
            | SLTU        | Set Less Than Unsigned| Sets the destination register to 1 if the first value is less than the second (unsigned), otherwise sets to 0. |
            | AND         | Logical AND           | Performs a bitwise AND operation between two values and stores the result in the destination register. |
            | OR          | Logical OR            | Performs a bitwise OR operation between two values and stores the result in the destination register. |
            | XOR         | Logical XOR           | Performs a bitwise XOR (exclusive OR) operation between two values and stores the result.         |
            | SLL         | Shift Left Logical    | Shifts the bits of the first value to the left by the number of positions specified by the second value, filling with zeros. |
            | SRL         | Shift Right Logical   | Shifts the bits of the first value to the right by the number of positions specified, filling with zeros. |
            | SRA         | Shift Right Arithmetic| Shifts the bits of the first value to the right by the number of positions specified, maintaining the sign bit. |

        !!!info "常见的R-type指令"
            === "ADD"
                <table class="riscv-table">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">000</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                  </table>
                
                - 使用格式 `ADD rd,rs1,rs2`  `rd = rs1 + rs2`
                - 溢出将会被忽略

            === "SUB"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0100000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">000</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                </table>

                - 使用格式 `SUB rd,rs1,rs2`  `rd = rs1 - rs2`
                - 溢出将会被忽略

            === "SLT"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">010</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                  </table>

                - 使用格式 `SLT rd,rs1,rs2`  `rd = ($signed(rs1) < $signed(rs2)) ? 1 : 0`
                - 有符号数的比较
            

            === "SLTU"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">25</td>
                    <td class="riscv-table-numnodel">24</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="7" class="riscv-table-node-little">0000000</td>
                    <td colspan="5" class="riscv-table-node-little">rs2</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">011</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0110011</td>
                </tr>
                </table>

                - 使用格式 `SLTU rd,rs1,rs2`  `rd = (rs1 < rs2) ? 1 : 0`
                - 进行无符号数的比较

            === "AND"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">111</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                  </table> 

                - 使用格式 `AND rd,rs1,rs2`  `rd = rs1 & rs2`
                - 按位的与操作


            === "OR"    
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">110</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                  </table>

                - 使用格式 `OR rd,rs1,rs2`  `rd = rs1 | rs2`
                - 执行按位或操作
            
            === "XOR"
                 <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">100</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                  </table>
                
                - 使用格式 `XOR rd,rs1,rs2`  `rd = rs1 ^ rs2`
                - 执行按位异或操作

            === "SLL"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">001</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                </table>

                - 使用格式 `SLL rd,rs1,rs2`  `rd = rs1 << rs2[4:0]`
                - 逻辑左移
                - 取`rs2`的低五位进行运算

            === "SRL"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">101</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                  </table>

                - 指令格式: `srl rd,rs1,rs2`,`rd=rs1>>rs2[4:0]`
                - 取 `rs2` 的低5位

            === "SRA"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0100000</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">101</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0110011</td>
                  </tr>
                  </table> 

                - 指令格式`sra rd,rs1,rs2`;`rd = $signed(rs1) >>> rs2[4:0]`
                - 算数右移，高位补符号位(为什么没有算数左移,因为没意义) 
                 

                 
                  
                
        

    === "I-type"
        使用寄存器和立即数进行数字逻辑运算，以及 load 类指令等的指令格式如下：
        <table class="riscv-table">
        <tr>
             <td class="riscv-table-numnodel">31</td>
             <td class="riscv-table-numnode" colspan="10"></td>
             <td class="riscv-table-numnoder">20</td>
             <td class="riscv-table-numnodel">19</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">15</td>
             <td class="riscv-table-numnodel">14</td>
             <td class="riscv-table-numnode" colspan="1"></td>
             <td class="riscv-table-numnoder">12</td>
             <td class="riscv-table-numnodel">11</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">7</td>
             <td class="riscv-table-numnodel">6</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">0</td>
        </tr>
        <tr>
             <td colspan="12" class="riscv-table-node">imm[11:0]</td>
             <td colspan="5" class="riscv-table-node">rs1</td>
             <td colspan="3" class="riscv-table-node">funct3</td>
             <td colspan="5" class="riscv-table-node">rd</td>
             <td colspan="7" class="riscv-table-node">opcode</td>
        </tr>
        </table> 

        立即数为 
        ```Verilog
         imm={{20{inst[31]}}, inst[31:20]}
        ``` 
        即将立即数的最高位符号位进行扩展到32位


        !!!info "常见的I-type指令"
            === "ADDI"
                  <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="10"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">000</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                  </table>

                  - 指令格式：`addi rd, rs1, imm`  `rd = rs1 + imm`
                  - `imm`  范围为12位有符号数字-2048~2047


            === "SLTI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="10"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">010</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                </table>

                - 使用格式 `slti rd,rs1,imm`  `rd = ($signed(rs1) < $signed(imm)) ? 1 : 0`
                - 有符号数的比较
            
            === "SLTIU"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="10"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">011</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                  </table> 

                - 使用格式 `sltiu rd,rs1,imm`  `rd = (rs1 < imm) ? 1 : 0`
                - 进行无符号数的比较,`rs1`和`imm`都是无符号数

            ===  "ANDI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="10"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">111</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0010011</td>
                </tr>
                </table>
                
                - 使用格式 `andi rd,rs1,imm`  `rd = rs1 & imm`
                - `imm`范围在-2048~2047，位数不够时会扩展符号位

            === "ORI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="10"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">110</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                  </table> 

                - 使用格式 `ori rd,rs1,imm`  `rd = rs1 | imm`
                - `imm`范围在-2048~2047，位数不够时会扩展符号位

            === "XORI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="10"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">100</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                  </table>

                - 使用格式 `xori rd,rs1,imm`  `rd = rs1 ^ imm`
                - `imm`范围在-2048~2047，位数不够时会扩展符号位
                - 需要注意的是`xori rd,rs1,-1`等价于与全1异或:`rd=~rs1`
            
            === "SLLI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">shamt</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">001</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                  </table>
                
                - 使用格式 `slli rd,rs1,shamt`  `rd = rs1 << shamt`
                - 逻辑左移
                - `shmat`在原来`rs2`的位置上,为五位立即数；此时空出来相当于原来的`func7`

            === "SRLI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0000000</td>
                      <td colspan="5" class="riscv-table-node-little">shamt</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">101</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                  </table>
                
                - 使用格式 `srli rd,rs1,shamt`  `rd = rs1 >> shamt`
                - 逻辑右移
                - `shmat`在原来`rs2`的位置上,为五位立即数；此时空出来相当于原来的`func7`

            === "SRAI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">0100000</td>
                      <td colspan="5" class="riscv-table-node-little">shamt</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">101</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0010011</td>
                  </tr>
                  </table>
                
                - 使用格式 `srai rd,rs1,shamt`  `rd = $signed(rs1) >>> shamt`
                - 算数右移，高位补符号位
            
            === "JALR"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="10"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">000</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">1100111</td>
                </tr>
                </table>

                - 使用格式 `jalr rd,rs1,imm`  `rd = pc+4; pc = (rs1 + imm) & ~1`,即最低位为0
                - 可以实现任意位置的跳转

            === "LB"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="10"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">000</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0000011</td>
                </tr>
                </table> 

                - 使用格式 `lb rd,imm(rs1)`  `rd = {{24M[rs1+imm][7]},M[rs1 + imm][7:0]}`
                - 从内存的`rs1+imm`地址处读取一个字节的数据，符号扩展到32位，存到`rd`中

            === "lh"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="10"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">001</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0000011</td>
                </tr>
                </table>

                - 使用格式 `lh rd,imm(rs1)`  `rd = {{16M[rs1+imm][15]},M[rs1 + imm][15:0]}`

                - 从内存的`rs1+imm`地址处读取一个半字的数据，存到`rd`的低16位，符号扩展到32位

            === "LW"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="10"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">010</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0000011</td>
                </tr>
                </table>  

                - 使用格式 `lw rd,imm(rs1)`  `rd = M[rs1 + imm]`
                - 从内存的`rs1+imm`地址处读取一个字的数据，存到`rd`中

            === "LBU"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="10"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">100</td>
                      <td colspan="5" class="riscv-table-node-little">rd</td>
                      <td colspan="7" class="riscv-table-node-little">0000011</td>
                  </tr>
                  </table>

                - 使用格式 `lbu rd,imm(rs1)`  `rd = M[rs1 + imm][7:0]
                - 从内存的`rs1+imm`地址处读取一个字节的数据，零扩展到32位，存到`rd`中(高位全0)  

            === "LHU"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="10"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="12" class="riscv-table-node-little">imm[11:0]</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">101</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0000011</td>
                </tr>
                </table>      

                - 使用格式 `lhu rd,imm(rs1)`  `rd = M[rs1 + imm][15:0]`
                - 从内存的`rs1+imm`地址处读取一个半字的数据，零扩展到32位，存到`rd`中(高位全0)

            === "ecall"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="10"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="12" class="riscv-table-node-little">000000000000</td>
                      <td colspan="5" class="riscv-table-node-little">00000</td>
                      <td colspan="3" class="riscv-table-node-little">000</td>
                      <td colspan="5" class="riscv-table-node-little">00000</td>
                      <td colspan="7" class="riscv-table-node-little">1110011</td>
                  </tr>
                  </table> 
                - 使用格式 `ecall`  `系统调用`

            === "ebreak"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="10"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="12" class="riscv-table-node-little">000000000001</td>
                    <td colspan="5" class="riscv-table-node-little">00000</td>
                    <td colspan="3" class="riscv-table-node-little">000</td>
                    <td colspan="5" class="riscv-table-node-little">00000</td>
                    <td colspan="7" class="riscv-table-node-little">1110011</td>
                </tr>
                </table> 
                - 使用格式`ebreak` ,将控制流转到调试环境


                  

     

    === "S-type"
        store 类指令，将寄存器中的数据存储到内存中，存储的大小由`func3`决定,没有`rd`寄存器
        <table class="riscv-table">
        <tr>
             <td class="riscv-table-numnodel">31</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">25</td>
             <td class="riscv-table-numnodel">24</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">20</td>
             <td class="riscv-table-numnodel">19</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">15</td>
             <td class="riscv-table-numnodel">14</td>
             <td class="riscv-table-numnode" colspan="1"></td>
             <td class="riscv-table-numnoder">12</td>
             <td class="riscv-table-numnodel">11</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">7</td>
             <td class="riscv-table-numnodel">6</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">0</td>
        </tr>
        <tr>
             <td colspan="7" class="riscv-table-node">imm[11:5]</td>
             <td colspan="5" class="riscv-table-node">rs2</td>
             <td colspan="5" class="riscv-table-node">rs1</td>
             <td colspan="3" class="riscv-table-node">funct3</td>
             <td colspan="5" class="riscv-table-node">imm[4:0]</td>
             <td colspan="7" class="riscv-table-node">opcode</td>
        </tr>
        </table>
        立即数为
        ```Verilog
        imm = {{20{inst[31]}}, inst[31:25], inst[11:7]}
        ```
        将`rd`的5位和`func7`的7位一共12位组合成一个立即数

        !!!info "常用的S-type指令"
            === "SB"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">25</td>
                    <td class="riscv-table-numnodel">24</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="7" class="riscv-table-node-little">imm[11:5]</td>
                    <td colspan="5" class="riscv-table-node-little">rs2</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">000</td>
                    <td colspan="5" class="riscv-table-node-little">imm[4:0]</td>
                    <td colspan="7" class="riscv-table-node-little">0100011</td>
                </tr>
                </table>

                - 使用格式 `sb rs2,imm(rs1)`  `M[rs1 + imm] = rs2[7:0]`
                - 将`rs2`的低8位存到内存的`rs1+imm`地址处

            === "SH"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">25</td>
                    <td class="riscv-table-numnodel">24</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="7" class="riscv-table-node-little">imm[11:5]</td>
                    <td colspan="5" class="riscv-table-node-little">rs2</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">001</td>
                    <td colspan="5" class="riscv-table-node-little">imm[4:0]</td>
                    <td colspan="7" class="riscv-table-node-little">0100011</td>
                </tr>
                  </table> 
                - 使用格式 `sh rs2,imm(rs1)`  `M[rs1 + imm] = rs2[15:0]`
                - 将`rs2`的低16位存到内存的`rs1+imm`地址处

            === "SW"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">25</td>
                    <td class="riscv-table-numnodel">24</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="7" class="riscv-table-node-little">imm[11:5]</td>
                    <td colspan="5" class="riscv-table-node-little">rs2</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">010</td>
                    <td colspan="5" class="riscv-table-node-little">imm[4:0]</td>
                    <td colspan="7" class="riscv-table-node-little">0100011</td>
                </tr>
                </table>

                - 使用格式 `sw rs2,imm(rs1)`  `M[rs1 + imm] = rs2`
                - 将`rs2`存到内存的`rs1+imm`地址处
 

                


    === "B-type"
          在RISC-V指令集中，B型（B-type）指令用于条件分支，根据比较结果决定是否跳转到指定的偏移地址。B型指令通常包含两个寄存器进行比较以及一个立即数偏移量（表示跳转的距离）。
        <table class="riscv-table">
        <tr>
             <td class="riscv-table-numnodel">31</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">25</td>
             <td class="riscv-table-numnodel">24</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">20</td>
             <td class="riscv-table-numnodel">19</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">15</td>
             <td class="riscv-table-numnodel">14</td>
             <td class="riscv-table-numnode" colspan="1"></td>
             <td class="riscv-table-numnoder">12</td>
             <td class="riscv-table-numnodel">11</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">7</td>
             <td class="riscv-table-numnodel">6</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">0</td>
        </tr>
        <tr>
             <td colspan="7" class="riscv-table-node">imm[12,10:5]</td>
             <td colspan="5" class="riscv-table-node">rs2</td>
             <td colspan="5" class="riscv-table-node">rs1</td>
             <td colspan="3" class="riscv-table-node">funct3</td>
             <td colspan="5" class="riscv-table-node">imm[4:1,11]</td>
             <td colspan="7" class="riscv-table-node">opcode</td>
        </tr>
        </table>

        立即数为
        ```Verilog
        imm={{19{inst[31]}}, inst[31], inst[7], inst[30:25], inst[11:8], 1'b0}
        ```
        最低位为0，不存；扩展到imm[12]位；将13位拼接完后，剩下高19位用`inst[31]`符号位填充,此时imm[11]可以不是符号位；imm[12]是符号位

        !!!info "常用的B-type指令"
            === "BEQ"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">imm[12,10:5]</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">000</td>
                      <td colspan="5" class="riscv-table-node-little">imm[4:1,11]</td>
                      <td colspan="7" class="riscv-table-node-little">1100011</td>
                  </tr>
                  </table>

                - 使用格式:`beq rs1,rs2,imm`  `if(rs1 == rs2) pc = pc + imm`
                - 可以跳转到$\pm 2^{12}Byte$的位置,即$\pm 4KiB$

            === "BNE"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">25</td>
                    <td class="riscv-table-numnodel">24</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">20</td>
                    <td class="riscv-table-numnodel">19</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">15</td>
                    <td class="riscv-table-numnodel">14</td>
                    <td class="riscv-table-numnode" colspan="1"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="7" class="riscv-table-node-little">imm[12,10:5]</td>
                    <td colspan="5" class="riscv-table-node-little">rs2</td>
                    <td colspan="5" class="riscv-table-node-little">rs1</td>
                    <td colspan="3" class="riscv-table-node-little">001</td>
                    <td colspan="5" class="riscv-table-node-little">imm[4:1,11]</td>
                    <td colspan="7" class="riscv-table-node-little">1100011</td>
                </tr>
                </table>

                - 使用格式:`bne rs1,rs2,imm`  `if(rs1 != rs2) pc = pc + imm`
                - 可以跳转到$\pm 2^{12}Byte$的位置,即$\pm 4KiB$

            === "BLT"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                  <tr>
                      <td class="riscv-table-numnodel">31</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">25</td>
                      <td class="riscv-table-numnodel">24</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">20</td>
                      <td class="riscv-table-numnodel">19</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">15</td>
                      <td class="riscv-table-numnodel">14</td>
                      <td class="riscv-table-numnode" colspan="1"></td>
                      <td class="riscv-table-numnoder">12</td>
                      <td class="riscv-table-numnodel">11</td>
                      <td class="riscv-table-numnode" colspan="3"></td>
                      <td class="riscv-table-numnoder">7</td>
                      <td class="riscv-table-numnodel">6</td>
                      <td class="riscv-table-numnode" colspan="5"></td>
                      <td class="riscv-table-numnoder">0</td>
                  </tr>
                  <tr>
                      <td colspan="7" class="riscv-table-node-little">imm[12,10:5]</td>
                      <td colspan="5" class="riscv-table-node-little">rs2</td>
                      <td colspan="5" class="riscv-table-node-little">rs1</td>
                      <td colspan="3" class="riscv-table-node-little">100</td>
                      <td colspan="5" class="riscv-table-node-little">imm[4:1,11]</td>
                      <td colspan="7" class="riscv-table-node-little">1100011</td>
                  </tr>
                  </table>  

                  - 使用格式:`blt rs1,rs2,imm`  `if($signed(rs1) < $signed(rs2)) pc = pc + imm`
                  - 有符号数           

            === "BGE"
                 <table class="riscv-table" style="margin-bottom: 0.6em">
                 <tr>
                     <td class="riscv-table-numnodel">31</td>
                     <td class="riscv-table-numnode" colspan="5"></td>
                     <td class="riscv-table-numnoder">25</td>
                     <td class="riscv-table-numnodel">24</td>
                     <td class="riscv-table-numnode" colspan="3"></td>
                     <td class="riscv-table-numnoder">20</td>
                     <td class="riscv-table-numnodel">19</td>
                     <td class="riscv-table-numnode" colspan="3"></td>
                     <td class="riscv-table-numnoder">15</td>
                     <td class="riscv-table-numnodel">14</td>
                     <td class="riscv-table-numnode" colspan="1"></td>
                     <td class="riscv-table-numnoder">12</td>
                     <td class="riscv-table-numnodel">11</td>
                     <td class="riscv-table-numnode" colspan="3"></td>
                     <td class="riscv-table-numnoder">7</td>
                     <td class="riscv-table-numnodel">6</td>
                     <td class="riscv-table-numnode" colspan="5"></td>
                     <td class="riscv-table-numnoder">0</td>
                 </tr>
                 <tr>
                     <td colspan="7" class="riscv-table-node-little">imm[12,10:5]</td>
                     <td colspan="5" class="riscv-table-node-little">rs2</td>
                     <td colspan="5" class="riscv-table-node-little">rs1</td>
                     <td colspan="3" class="riscv-table-node-little">101</td>
                     <td colspan="5" class="riscv-table-node-little">imm[4:1,11]</td>
                     <td colspan="7" class="riscv-table-node-little">1100011</td>
                 </tr>
                 </table> 

                  - 使用格式:`bge rs1,rs2,imm`  `if($signed(rs1) >= $signed(rs2)) pc = pc + imm`
                  - 有符号数
                    
            === "BLTU" 
                  <table class="riscv-table" style="margin-bottom: 0.6em">
                   <tr>
                       <td class="riscv-table-numnodel">31</td>
                       <td class="riscv-table-numnode" colspan="5"></td>
                       <td class="riscv-table-numnoder">25</td>
                       <td class="riscv-table-numnodel">24</td>
                       <td class="riscv-table-numnode" colspan="3"></td>
                       <td class="riscv-table-numnoder">20</td>
                       <td class="riscv-table-numnodel">19</td>
                       <td class="riscv-table-numnode" colspan="3"></td>
                       <td class="riscv-table-numnoder">15</td>
                       <td class="riscv-table-numnodel">14</td>
                       <td class="riscv-table-numnode" colspan="1"></td>
                       <td class="riscv-table-numnoder">12</td>
                       <td class="riscv-table-numnodel">11</td>
                       <td class="riscv-table-numnode" colspan="3"></td>
                       <td class="riscv-table-numnoder">7</td>
                       <td class="riscv-table-numnodel">6</td>
                       <td class="riscv-table-numnode" colspan="5"></td>
                       <td class="riscv-table-numnoder">0</td>
                   </tr>
                   <tr>
                       <td colspan="7" class="riscv-table-node-little">imm[12,10:5]</td>
                       <td colspan="5" class="riscv-table-node-little">rs2</td>
                       <td colspan="5" class="riscv-table-node-little">rs1</td>
                       <td colspan="3" class="riscv-table-node-little">110</td>
                       <td colspan="5" class="riscv-table-node-little">imm[4:1,11]</td>
                       <td colspan="7" class="riscv-table-node-little">1100011</td>
                   </tr>
                   </table>

                   - 使用格式:`bltu rs1,rs2,imm`  `if(rs1 < rs2) pc = pc + imm`
                   - 无符号数比较

            === "BGEU"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                 <tr>
                     <td class="riscv-table-numnodel">31</td>
                     <td class="riscv-table-numnode" colspan="5"></td>
                     <td class="riscv-table-numnoder">25</td>
                     <td class="riscv-table-numnodel">24</td>
                     <td class="riscv-table-numnode" colspan="3"></td>
                     <td class="riscv-table-numnoder">20</td>
                     <td class="riscv-table-numnodel">19</td>
                     <td class="riscv-table-numnode" colspan="3"></td>
                     <td class="riscv-table-numnoder">15</td>
                     <td class="riscv-table-numnodel">14</td>
                     <td class="riscv-table-numnode" colspan="1"></td>
                     <td class="riscv-table-numnoder">12</td>
                     <td class="riscv-table-numnodel">11</td>
                     <td class="riscv-table-numnode" colspan="3"></td>
                     <td class="riscv-table-numnoder">7</td>
                     <td class="riscv-table-numnodel">6</td>
                     <td class="riscv-table-numnode" colspan="5"></td>
                     <td class="riscv-table-numnoder">0</td>
                 </tr>
                 <tr>
                     <td colspan="7" class="riscv-table-node-little">imm[12,10:5]</td>
                     <td colspan="5" class="riscv-table-node-little">rs2</td>
                     <td colspan="5" class="riscv-table-node-little">rs1</td>
                     <td colspan="3" class="riscv-table-node-little">111</td>
                     <td colspan="5" class="riscv-table-node-little">imm[4:1,11]</td>
                     <td colspan="7" class="riscv-table-node-little">1100011</td>
                 </tr>
                 </table>
                 
                 - 使用格式:`bgeu rs1,rs2,imm`  `if(rs1 >= rs2) pc = pc + imm`
                 - 无符号数比较

    === "U-type"
        <table class="riscv-table">
        <tr>
             <td class="riscv-table-numnodel">31</td>
             <td class="riscv-table-numnode" colspan="18"></td>
             <td class="riscv-table-numnoder">12</td>
             <td class="riscv-table-numnodel">11</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">7</td>
             <td class="riscv-table-numnodel">6</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">0</td>
        </tr>
        <tr>
             <td colspan="20" class="riscv-table-node">imm[31:12]</td>
             <td colspan="5" class="riscv-table-node">rd</td>
             <td colspan="7" class="riscv-table-node">opcode</td>
        </tr>
        </table>

        没有源操作数，只有目的操作数，立即数为
        ```Verilog
        imm={inst[31:12], 12'b0}
        ``` 

        !!!info "U-type指令"
            === "LUI"
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="18"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="20" class="riscv-table-node-little">imm[31:12]</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0110111</td>
                </tr>
                </table>

                - 使用格式 `lui rd,imm`  `rd = imm << 12`
                - 将`imm`位存入`rd`高20位
                - `imm`不能超过20位

            === "AUIPC"    
                <table class="riscv-table" style="margin-bottom: 0.6em">
                <tr>
                    <td class="riscv-table-numnodel">31</td>
                    <td class="riscv-table-numnode" colspan="18"></td>
                    <td class="riscv-table-numnoder">12</td>
                    <td class="riscv-table-numnodel">11</td>
                    <td class="riscv-table-numnode" colspan="3"></td>
                    <td class="riscv-table-numnoder">7</td>
                    <td class="riscv-table-numnodel">6</td>
                    <td class="riscv-table-numnode" colspan="5"></td>
                    <td class="riscv-table-numnoder">0</td>
                </tr>
                <tr>
                    <td colspan="20" class="riscv-table-node-little">imm[31:12]</td>
                    <td colspan="5" class="riscv-table-node-little">rd</td>
                    <td colspan="7" class="riscv-table-node-little">0010111</td>
                </tr>
                </table>

                - 使用格式 `auipc rd,imm`  `rd = pc + imm << 12`
                - aupic意思是add upper immediate to pc，将imm 加载到高 20 位，然后加上 pc 值
                - `imm`不能超过20位

    === "J-type" 
        <table class="riscv-table">
        <tr>
             <td class="riscv-table-numnodel">31</td>
             <td class="riscv-table-numnode" colspan="18"></td>
             <td class="riscv-table-numnoder">12</td>
             <td class="riscv-table-numnodel">11</td>
             <td class="riscv-table-numnode" colspan="3"></td>
             <td class="riscv-table-numnoder">7</td>
             <td class="riscv-table-numnodel">6</td>
             <td class="riscv-table-numnode" colspan="5"></td>
             <td class="riscv-table-numnoder">0</td>
        </tr>
        <tr>
             <td colspan="20" class="riscv-table-node">imm[20,10:1,11,19:12]</td>
             <td colspan="5" class="riscv-table-node">rd</td>
             <td colspan="7" class="riscv-table-node">opcode</td>
        </tr>
        </table>

        立即数为
        ```Verilog
        imm={{11{inst[31]}}, inst[31], inst[19:12], inst[20], inst[30:21], 1'b0}
        ```
        `imm`最低位0不存，此时`imm[20]`是符号位，`imm`相当于21位有符号数
        ,跳转范围是$\pm 2^{20}$

        !!!info "JAL指令"
            <table class="riscv-table" style="margin-bottom: 0.6em">
            <tr>
                <td class="riscv-table-numnodel">31</td>
                <td class="riscv-table-numnode" colspan="18"></td>
                <td class="riscv-table-numnoder">12</td>
                <td class="riscv-table-numnodel">11</td>
                <td class="riscv-table-numnode" colspan="3"></td>
                <td class="riscv-table-numnoder">7</td>
                <td class="riscv-table-numnodel">6</td>
                <td class="riscv-table-numnode" colspan="5"></td>
                <td class="riscv-table-numnoder">0</td>
            </tr>
            <tr>
                <td colspan="20" class="riscv-table-node-little">imm[20,10:1,11,19:12]</td>
                <td colspan="5" class="riscv-table-node-little">rd</td>
                <td colspan="7" class="riscv-table-node-little">1101111</td>
            </tr>
            </table>
 
           
            - 使用格式 `jal rd,imm`  `rd = pc + 4; pc = pc + imm`
            - 将`pc+4`存入`rd`，然后跳转到`pc+imm`处
            - Jal指令的跳转范围是$\pm 2^{20}Byte$，即$\pm 1MiB$
