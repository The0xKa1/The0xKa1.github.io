# 处理器

这一章节主要讨论了单周期和流水线CPU的原理和设计,在实验课上,我们也会使用Verilog来实现这两种CPU.

而CPU的工作流程可以分为以下几个步骤:

1. **取指令 (Instruction Fetch)**: 从内存中取出当前指令，并将其存储在指令寄存器中。
2. **指令译码 (Instruction Decode)**: 解析指令，确定操作码和操作数，并读取必要的寄存器值。
3. **执行 (Execution)**: 根据指令类型执行相应的操作，例如算术运算、逻辑运算或内存访问。
4. **访存 (Memory Access)**: 如果指令需要访问内存（例如加载或存储指令），则进行相应的内存读写操作。
5. **写回 (Write Back)**: 将执行结果写回到目标寄存器中，以便后续指令使用。

这些步骤在单周期CPU中是顺序执行的，而在流水线CPU中则是并行执行的，以提高处理器的效率。

## 单周期CPU

SCPU的理论实际上做过一遍实验就很清楚了,考察的点也只是对于Datapath的理解还有不同指令对应的control signal的设置.

在这里贴上笔者这一部分的实验报告

<div class="card file-block" markdown="1">
<div class="file-icon"><img src="/pdf.svg" style="height: 3em;"></div>
<div class="file-body">
<div class="file-title">SCPU实验报告</div>
<div class="file-meta"></div>
</div>
<a class="down-button" target="_blank" href="./SCPU.pdf"  markdown="1">:fontawesome-solid-download: 查看</a>
</div>

