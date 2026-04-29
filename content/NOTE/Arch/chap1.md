---
comments: true
---

# Fundamentals of computer design

## Introduction

### Classer of computers

- Desktop computers (or personal computers .aka. PC)
      - General-purpose,vatiety of software
      - Emphasize good performance for a single user at relatively low cost
      - Mostly execute third-party software(第三方软件)

- Server Computers
      - Emphasize great performance for a few complex applications
      - Or emphasize reliable performance for many users at once
      - Greater computing power, storage, or network capacity than personal computers

- Embedded computers
      - Largest class and most diverse
      - Hidden as components of systems
      -  Stringent power, cost, and size constraints,performance.

- Personal Mobile Devices
      - Such as smartphones, tablets/ipad, and wearables
      - generally have the same design requirements as PCs

- Supercomputer
      - Computer cluster(集群)
      - High capacity,prformance, and reliability
      - Range to building size(即大型机)


#### Class By Flynn

福林分类法

- SISD: Single Instruction Stream, Single Data Stream
- SIMD: Single Instruction Stream, Multiple Data Stream
- MISD: Multiple Instruction Stream, Single Data Stream
- MIMD: Multiple Instruction Stream, Multiple Data Stream

!!!info "definition"
    - IS: Instruction Stream
    - DS: Data Stream
    - CS: Control Stream
    - CU: Control Unit
    - PU: Processing Unit
    - MM&SM: Memory Module & Storage Module

See as follows:

<div align="center">
    <img src="../img/lec1-1.png" width="70%">
</div>

## Performance

There are a lot of factors that can affect the performance:

- Architecture
- Hardware implementation
- Compiler
- Operating system
- Application

Two major performance metrics:

- Latency: The time it takes to complete a task(Response time)
- Throughput: The rate at which a task can be completed (Bandwidth)

We define the performance as:

\[
    Performance = \frac{1}{Execution}
\]


性能与执行时间成反比


## Quantitative approaches

- Bit
- Nibble: 4 bits
- Byte: 8 bits
- Word: 32 bits on many embedded systems
- Word: 64 bits on most desktop and server systems
- Kibibyte: $2^{10}$ bytes,KB
- Mebibyte: $2^{20}$ bytes,MB
- Gibibyte: $2^{30}$ bytes,GB
- Tebibyte: $2^{40}$ bytes,TB


### CPU Performance

\[
      CPU \ Execution \ Time = \frac{CPU \ Cycles}{Clock \ Rate} = CPU \ Cycles \times Clock \ Period
\]

!!!Eg "CPU time example"
    - **Computer A**: 2GHz clock, 10s CPU time
    - **Designing Computer B**
      - Aim for 6s CPU time
      - Can do faster clock, but causes 1.2 × clock cycles

    To determine how fast Computer B's clock must be:

    \[
    \text{Clock Rate}_B = \frac{\text{Clock Cycles}_B}{\text{CPU Time}_B} = \frac{1.2 \times \text{Clock Cycles}_A}{6s}
    \]

    Calculate Clock Cycles for Computer A:

    \[
    \text{Clock Cycles}_A = \text{CPU Time}_A \times \text{Clock Rate}_A = 10s \times 2GHz = 20 \times 10^9
    \]

    Calculate Clock Rate for Computer B:

    \[
    \text{Clock Rate}_B = \frac{1.2 \times 20 \times 10^9}{6s} = \frac{24 \times 10^9}{6s} = 4GHz
    \]

CPI: Cycles Per Instruction is the average number of clock cycles per instruction.

\[
    CPI = \frac{CPU \ Cycles}{Instruction \ Count}
\]

some CPU time could also be written as:

\[
    CPU \ Time = \frac{Instruction \ Count \times CPI}{Clock \ Rate}
\]

The Big Picture:

\[
    CPU \ Time = \frac{Instructions}{Program} \times \frac{Clock \ cycles}{Instruction} \times \frac{Seconds}{Clock \ cycle}
\]

Performance depence on:

- Algorithm：affects IC,CPI
- Programming language: affects IC,CPI
- Compiler: affects CPI,IC
- Instruction set architecture: affects CPI,IC,T


### Amdahl's Law

!!!Definition "Amdahl's Law"
    Amdahl's Law states that the performance improvement to be gained from using some faster mode of execution is limited by the fraction of the time the faster mode can be used.

    Amdahl's Law depends on two factors:

    - The fraction of the time the enhancement can be exploited.
    - The improvement gained by the enhancement while it is exploited.

    \[
    \text{Improved Execution Time} = \frac{\text{Affected Execution Time}}{\text{Amount of Improvement}} + \text{Unaffected Execution Time}
    \]

    即部分改进的执行时间除以改进的倍数，加上未改进的执行时间，等于改进后的执行时间。

So based on Amdahl's Law, we can get the following formula:

\[
\text{Execution time}_{\text{new}} = \text{Execution time}_{\text{old}} \times \left( (1 - \text{Fraction}_{\text{enhanced}}) + \frac{\text{Fraction}_{\text{enhanced}}}{\text{Speedup}_{\text{enhanced}}} \right)
\]

\[
\text{Speedup}_{\text{overall}} = \frac{\text{Execution time}_{\text{old}}}{\text{Execution time}_{\text{new}}} = \frac{1}{(1 - \text{Fraction}_{\text{enhanced}}) + \frac{\text{Fraction}_{\text{enhanced}}}{\text{Speedup}_{\text{enhanced}}}}
\]


from the formula above, we can conclude that:

- The overall speedup is limited by the enhancement that is used the least.
- If Fraction is close to 1, the overall speedup is close to the speedup of the enhancement.
- If speedup of the enhancement is close to infinity, the overall speedup is close to 1/(1-Fraction).Which ,in fact ,is hard to achieve.

!!!Eg "Amdahl's Law Example"
    - **Original Execution Time**: 10 seconds
    - **Enhancement**: 2x speedup
    - **Fraction of Execution Time Affected**: 0.5
    The execution time after enhancement is:

    \[
    \text{Execution time}_{\text{new}} = 10 \times \left( (1 - 0.5) + \frac{0.5}{2} \right) = 10 \times 0.75 = 7.5 \text{ seconds}
    \]

    The overall speedup is:

    \[
    \text{Speedup}_{\text{overall}} = \frac{10}{7.5} = 1.33
    \]
    

## Great Architecture ideas

### Moore's Law

Moore's Law is a principle that states that the number of transistors on a microchip doubles approximately every two years.

### Use abstraction to simplify design

Abstraction is a technique that allows us to simplify a complex system by hiding unnecessary details.Low-level details are hidden from the higher-level components.

### Make the common case fast
- Identify the common case and try to improve it.
- Most cost-efficient method to obtain improvements.

### Improve performance via parallelism

- Improve performance by performing operations in parallel.
- There are many levels of parallelism—instruction-level, process-level, etc.

### Improve performance via pipelining
- Break tasks into stages so that multiple tasks can be simultaneously performed in different stages.
- Commonly used to improve instruction throughput.

### Improve performance via prediction
- Sometimes faster to assume a particular result than waiting until the result is known.
- Known as speculation and is used to guess results of branches.

### Use a hierarchy of memories
- Make the fastest, smallest, and most expensive per bit memory the first level accessed and the slowest, largest, and cheapest per bit memory the last level accessed.
- Allows most accesses to be caught at the first level and be able to retain most of the information at the lowest level.

### Improve dependability via redundancy
- Include redundant components that can both detect and correct failures.
- Used at many different levels.

    
## Instruction Set Architecture

instruction set architecture(ISA) is the set of instructions that a processor can execute.

when designing an ISA, we need to consider the following basic principles:

- Compatibility:
      - The ISA should be compatible with the existing software.

- Versatility:
      - The ISA should be versatile enough to support a variety of applications.

- High efficiency:
      - The ISA should be efficient in terms of the number of instructions and the amount of data that can be processed in a single instruction.

- Security:
      - The ISA should be secure enough to prevent attacks.

### Instruction Set design issues

- Where are operands stored?: registers,memory,stack,accumulator,etc.
- How many operands are needed?: 0,1,2,3,etc. <span style="color:red">Classification of instructions</span>
- How is the operand location specified?: immediate,direct,indirect,relative,etc. <span style="color:red">Addressing modes</span>
- What type and  size of operands are needed?: integer,floating-point,vector,etc. <span style="color:red">Data representation</span>
- What operations are supported?: arithmetic,logic,control,etc. <span style="color:red">Types of instructions</span>


**ISA Classes**

- Stack architecture
- Accumulator architecture
- Register architecture
- General-purpose registers architecture(GPR)

对于`A*B-(A+C*B)`

```assembly
; Stack architecture
PUSH A
PUSH B
MUL         ; A * B
PUSH A
PUSH C
PUSH B
MUL         ; C * B
ADD         ; A + (C * B)
SUB         ; (A * B) - (A + C * B)
```

```assembly
; Accumulator architecture
LOAD A      ; Acc = A
MUL B       ; Acc = A * B
STORE TEMP  ; Store result in TEMP
LOAD B      ; Acc = B
MUL C       ; Acc = C * B
ADD A       ; Acc = A + (C * B)
STORE TEMP2 ; Store result in TEMP2
LOAD TEMP    ; Acc = (A * B)
SUB TEMP2   ; Acc = (A * B) - (A + C * B)
```

```assembly
; Register architecture
LOAD R1, A  ; R1 = A
LOAD R2, B  ; R2 = B
MUL R3, R1, R2  ; R3 = A * B
LOAD R4, C  ; R4 = C
MUL R4, R4, R2  ; R4 = C * B
ADD R4, R4, R1  ; R4 = A + C * B
SUB R3, R3, R4  ; R3 = (A * B) - (A + C * B)
```


```assembly
; General-purpose registers architecture(GPR)
load R1, A
load R2, B
mul R3, R1, R2  ; R3 = A * B
load R4, C
load R5, B
mul R6, R4, R5  ; R6 = C * B
add R6, R6, R1  ; R6 = A + C * B
sub R3, R3, R6  ; R3 = (A * B) - (A + C * B)
```







































