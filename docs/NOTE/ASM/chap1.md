---
comments: true
---

# Introduction to the Microprocessor

**对应考纲模块：** 数据格式、微处理器结构基础

---

### MASM Data types

<div align=center> <img src="../img/chap1/masm_data_types.png" width = 80%/> </div>   

### A. IEEE 754 浮点数标准

[此事在计算机组成亦有记载](../CO/wk2.md)

**格式结构（32位 float）：**

- **Sign (S)：** 1 bit （0=正，1=负）
- **Exponent (E)：** 8 bits（Bias = 127）
- **Fraction/Mantissa (F)：** 23 bits（隐含一个前导 1）

**公式：**  
$V = (-1)^S \times (1.F) \times 2^{(E - 127)}$


<div align=center> <img src="../img/chap1/frac.png" width = 80%/> </div>   

**特殊值：**

| 数值           | Exp         | Frac        | 说明             |
|----------------|-------------|-------------|------------------|
| 0              | 0           | 0           | 零               |
| Infinity ($\infty$) | 全 1(255)   | 0           | 正/负无穷大      |
| NaN            | 全 1(255)   | ≠ 0         | 非数（Not a Number）|


**Subnormal Numbers**

当exponent为0且fraction不为0时，表示subnormal numbers。此时exponent的值为-126。

\[
subnormal = (-1) \times sign \times fraction \times 2^{1-bias}, e.g., 0.11 \times 2^{-126}
\]


!!!info "Underflow"
    下溢（Underflow）是指结果太小，小到无法用正常数表示的时候。
    主要有两种处理方式：

    – 突然下溢（Abrupt underflow）直接将小到无法表示的数设为零，这会导致精度突然损失。
    – 渐进下溢（Gradual underflow）通过使用非规格化数（subnormal numbers），让极小的数以更柔和的方式丢失精度，从而减缓精度损失。
    
    非规格化数可以在各种数值计算场景（如数值积分、复数除法）中有效消除下溢带来的影响，因此下溢不再令人担忧。

---

### B. 内存数据存放：小端字节序（Little-endian）

- **考纲对应：** 数据在内存中的存放规律：小端字节序  

**定义：**  
低字节（LSB）存放在低地址，高字节（MSB）存放在高地址。Intel x86 系列全部使用 Little-endian。

<div align=center> <img src="../img/chap1/end.png" width = 80%/> </div>   

给出一个 32 位数 `12345678H`，问在内存中如何排列？

假设起始地址为 1000H：

| 地址   | 内容    |
|--------|---------|
| 1000H  | 78 (LSB)|
| 1001H  | 56      |
| 1002H  | 34      |
| 1003H  | 12 (MSB)|

!!!Note 
    需要注意的是，若是存放ASCII码，例如ABCD,则是先来的先放，因为此时没有most significant bit和least significant bit之分。

    | 地址   | 内容     |
    |--------|---------|
    | 1000H  | 65      |
    | 1001H  | 66      |
    | 1002H  | 67      |
    | 1003H  | 68      |


---

### C. 整数的表示（Signed Integers & 2's Complement）

- **考纲对应：** 进制转换、补码 

**补码（2's Complement）计算：**

- **正数：** 同原码
- **负数：** 取反（1's complement）+ 1
- 例：8-bit 下 $-128$ 的表示是 `1000 0000`（特殊情况，没有对应的正数可以直接取反得到它）

**范围：** 8-bit Signed: $-128$ 到 $+127$

---

### D. BCD 编码（Binary Coded Decimal）

- **考纲对应：** 编码格式：BCD  

- **Packed BCD（压缩 BCD）：** 一个字节存两个十进制位  
  例：$12_{10}$ → 0001 0010 (1 Byte)

- **Unpacked BCD（非压缩 BCD）：** 一个字节存一个十进制位（高4位通常为0）  
  例：$12_{10}$ → `0000 0001`, `0000 0010` (2 Bytes)


---

## 处理器发展史与概念

虽然是历史背景，但主要为了引出**模式切换**和**寻址能力**的演变。

### A. 关键处理器节点

- **8086**
  - 16-bit 寄存器  
  - 20-bit 地址线 → 1MB 寻址空间（$2^{20}$）
  - 引入 Segmentation (分段)：Segment:Offset
- **80286**  
  - 引入 Protected Mode（保护模式）
  - 24-bit 地址线 → 16MB 物理内存
- **80386**  
  - 第一款 32-bit 处理器
  - 引入 Paging（分页）管理
  - 4GB 寻址空间
- **Pentium**  
  - Superscalar（超标量）：两条流水线 (u, v)
  - 分支预测（Branch Prediction）
- **Core i7 / Intel 64**  
  - 64-bit 模式，向后兼容 32-bit (Compatibility mode)

---

### B. 性能技术术语（Understanding Terminology）

这些词汇可能出现在单选题或名词解释中。

- **Pipelining（流水线）**：将指令执行分为多个阶段并行处理（386/486）
- **Cache（缓存）**：486 引入 L1 Cache
- **SIMD（单指令多数据）**：MMX, SSE, AVX 指令集
- **Out-of-order Execution（乱序执行）**：提高流水线利用率
- **Hyper-Threading（超线程）**：一个物理核模拟两个逻辑核

---
