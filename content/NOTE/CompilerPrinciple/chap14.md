---
comments: true
---

# Chapter 14: Object-Oriented Languages

面向对象语言把“值”组织成对象（object）：对象既有**状态**（fields），也有**行为**（methods）。chap14 从编译器角度追踪类、继承、动态派发和运行时类型检查如何落到普通的记录、函数调用和表查找上。

OO 语言中最重要的三个特征：

| 特征 | 编译器视角 |
|---|---|
| **Inheritance** | 子类对象必须能被当作父类对象使用，因此字段和方法布局要兼容 |
| **Encapsulation** | private/protected 等访问限制主要在类型检查阶段静态保证 |
| **Polymorphism** | 同一个调用点 `x.f()` 可能在运行时调用不同 method instance |

---

## Object-Tiger

教材用 Object-Tiger 说明类语言的编译。它在 Tiger 上新增类声明、对象创建和方法调用：

```tiger
dec        -> classdec
classdec   -> class class-id extends class-id { {classfield} }
classfield -> vardec
classfield -> method
method     -> method id(tyfields) = exp
method     -> method id(tyfields) : type-id = exp

exp        -> new class-id
            | lvalue . id()
            | lvalue . id(exp {, exp})
```

### 类声明

`class B extends A { ... }` 声明类 `B` 继承 `A`：

- `A` 必须在当前 `let` 表达式作用域中；
- `A` 的字段和方法隐式属于 `B`；
- 方法可以 override，但参数类型和返回类型必须完全一致；
- 字段不能 override；
- 预定义类 `Object` 没有字段和方法，是所有类的根。

每个方法都有一个隐式参数 `self`，类型是当前类；`self` 由编译器自动绑定，不作为语言关键字处理。

### 对象创建和调用

| 表达式 | 含义 |
|---|---|
| `new B` | 分配一个 `B` 对象，并执行字段初始化表达式 |
| `b.x` | 访问对象 `b` 的字段 `x` |
| `b.f(x, y)` | 调用 `b` 的方法 `f`，同时把 `b` 作为隐式 `self` |

在示例程序里，`Car extends Vehicle`，所以 `Car` 可以用在需要 `Vehicle` 的地方：

```tiger
var c := new Car
var v : Vehicle := c
```

这就是**子类型多态**：静态类型是 `Vehicle` 的变量，运行时可以指向 `Car` 或 `Truck` 对象。

!!! note "方法体中的作用域"
    在 `Car.await(v: Vehicle)` 入口处，能看到普通词法作用域变量（如 `start`）、方法参数 `v`、隐式参数 `self`，以及当前类和祖先类的字段（如 `passengers`、`position`）。

---

## 单继承字段布局

问题：若变量 `v` 的静态类型是 `Vehicle`，运行时它可能指向 `Car` 或 `Truck`。编译器要生成 `v.position` 的访存代码，必须保证 `position` 在所有子类对象中的 offset 一致。

单继承的经典做法是 **prefixing**：

- 若 `B extends A`，则 `A` 的字段放在 `B` 对象记录的开头；
- inherited fields 的顺序和 offset 与 `A` 对象完全相同；
- `B` 自己新增的字段追加在后面。

<div align=center>
<img src="../img/chap14/fields-prefixing.png" width=760>
</div>

这样，父类字段的 offset 在所有子类对象中稳定。编译 `v.position` 时，只要根据静态类型 `Vehicle` 找到 `position` 的常量 offset，就能生成普通的：

```text
MEM(v + offset(position))
```

这也是为什么单继承语言中字段访问很快：字段 offset 可以在编译期确定。

---

## 方法实例与动态派发

一个 method declaration 会被编译成一个普通函数入口，例如 `Truck.move` 对应机器代码标签 `Truck_move`。不同类里同名方法若发生 override，就是不同的 **method instance**。

### Static methods

如果 `f` 是 static method，那么 `c.f()` 的目标只由 `c` 的**静态类型**决定。编译器沿着静态类的祖先链查找 `f`，找到后可直接生成：

```text
CALL A_f
```

这和普通函数调用一样，是静态绑定。

### Dynamic methods

若 `f` 是 dynamic method，`c.f()` 不能简单编译成 `A_f`。原因是：

- `c` 的静态类型可能是 `C`；
- 运行时 `c` 可能指向 `D extends C`；
- 如果 `D` override 了 `f`，应调用 `D_f`。

解决方案是把每个类的动态方法放入 **dispatch vector / virtual table / vtable**。类描述符中保存一张方法表，表项是 method instance 的机器代码地址。

<div align=center>
<img src="../img/chap14/dynamic-method-table.png" width=760>
</div>

方法表也使用 prefixing：

- 子类继承父类已知的 method slots；
- 新方法追加在后面；
- override 不改变 slot，只替换该 slot 中的函数地址。

因此，`c.f()` 的编译步骤是：

```text
d <- MEM(c + 0)            // 取对象的 class descriptor
p <- MEM(d + offset(f))    // 取 f 在 vtable 中的 method pointer
CALL p                     // 间接调用
```

!!! tip "为什么对象里通常有 descriptor pointer?"
    对象记录的第 0 个字常放 class descriptor pointer。字段访问、动态方法查找、`instanceof`、GC 类型信息等都可以从 descriptor 出发。

---

## 多继承

多继承中，一个类 `D` 可能同时继承 `A, B, C`。此时不可能让 `A` 的字段都位于 `D` 的开头，同时也让 `B` 的字段都位于 `D` 的开头。字段 offset 和方法 slot 都变难。

### Global graph coloring

一种做法是把字段布局建模成图染色：

| 图元素 | 含义 |
|---|---|
| node | 一个 distinct field name 或 method name |
| edge | 两个字段/方法会同时出现在某个类中 |
| color | offset 或 descriptor slot |

<div align=center>
<img src="../img/chap14/multiple-inheritance-coloring.png" width=760>
</div>

若直接让颜色代表对象内 offset，可能导致对象中间有空洞。改进做法是：

- 对象本身紧凑存放字段；
- descriptor 中为每个字段名保存“该字段在对象内的实际 offset”；
- descriptor 可以有空槽，因为 descriptor 数量通常远少于 object 数量。

<div align=center>
<img src="../img/chap14/descriptor-field-offsets.png" width=760>
</div>

访问字段 `x.a` 时的成本从单继承的一次 offset 访问变成三步：

```text
d <- MEM(x + 0)              // descriptor pointer
k <- MEM(d + slot(a))        // 字段 a 在对象内的 offset
v <- MEM(x + k)              // 字段值
```

<div align=center>
<img src="../img/chap14/descriptor.png" width=760>
</div>

方法 lookup 可用同一套思想：descriptor slot 中若是字段，保存对象内 offset；若是方法，保存 method instance 地址。

### 动态链接的问题

全局染色要求同时看到所有类，通常只能在 link-time 做。若语言支持运行时加载新类，已有颜色分配可能被破坏，因此全局方案不适合动态增量链接。

### Hashing

另一种适合 separate compilation 和 dynamic linking 的方案：每个 class descriptor 中放 hash table。

- `Ftab`：field-offset table，保存字段 offset 或 method address；
- `Ktab`：key table，保存 field/method name 的唯一运行时指针，用来检测冲突；
- field name 的 hash 在编译期确定，不需要运行时对字符串求 hash。

整体流程可以看成两次表访问和一次对象访问：

<div align=center>
<img src="../img/chap14/hashing-descriptor-lookup-v2.svg" width=820>
</div>

其中 `hash(x)` 产生同一个下标 `h`，分别访问 `Ktab[h]` 和 `Ftab[h]`。`Ktab[h]` 用来确认当前槽位确实属于字段 `x`，`Ftab[h]` 给出对象内实际 offset `k`。确认通过后，编译器再生成 `MEM(c + k)` 取得字段值。

访问字段 `x` 的伪代码：

```text
d <- MEM(c + 0)
f <- MEM(d + Ktab + hash(x))
if f != ptr(x) goto collision_resolution
k <- MEM(d + Ftab + hash(x))
v <- MEM(c + k)
```

<div align=center style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center">
<img src="../img/chap14/hashing-ppt-overview.png" width=390 style="max-width:100%; height:auto">
<img src="../img/chap14/hashing-ppt-lookup.png" width=390 style="max-width:100%; height:auto">
</div>

hash 方案的单次访问开销更高，但它不依赖全局布局，工程上更适合动态 OO 系统。

---

## Runtime Class Membership

许多 OO 语言支持运行时类型测试与安全向下转型：

| 功能 | Java 例子 | 含义 |
|---|---|---|
| 类型测试 | `x instanceof C` | `x` 是否属于 `C` 或 `C` 的子类 |
| 安全转型 | `(D)x` | 把静态类型更一般的 `x` 当作子类 `D` 使用，失败则抛异常 |

### 沿父类链查找

单继承时，最直接的 `x instanceof C` 实现是沿 descriptor 的 `super` 链向上查：

```text
t <- x.descriptor
L1:
    if t = C goto true
    t <- t.super
    if t = nil goto false
    goto L1
```

该方法简单，但类层次很深时会慢。

### Display

更快的方法是在每个 class descriptor 中保存一个祖先 display。设类 `D` 的深度是 `j`：

```text
display[j]   = D
display[j-1] = D.super
display[j-2] = D.super.super
...
display[0]   = Object
```

<div align=center>
<img src="../img/chap14/class-display.png" width=760>
</div>

于是 `x instanceof D` 只需：

```text
d <- MEM(x + 0)
t <- MEM(d + display_slot(depth(D)))
return t == D
```

这把 membership test 从沿链循环变成常数时间；代价是 descriptor 中要为最大继承深度预留 display 空间。

---

## Type Coercions 与 Typecase

### Upcast 永远安全

若 `C extends B`，则 `C` 对象一定也是 `B` 对象：

```tiger
var c : C := new C
var b : B := c       // safe
```

这是从子类到父类的 coercion，也叫 upcast。

### Downcast 需要运行时检查

反过来，`B` 静态类型的变量不一定真的指向 `C` 对象：

```tiger
var b : B := new B
var c : C := b       // unsafe unless b instanceof C
c.some_field_of_C
```

Java、Modula-3 这类安全语言会在 downcast 前插入 `instanceof` 检查，失败时抛异常。C++ 的某些 static cast 不做运行时检查，因此可能产生未定义或不可预测行为；`dynamic_cast` 则更接近安全语言的做法。

### Typecase

`typecase` 是“测试 + 转型 + 局部绑定”的组合：

```text
TYPECASE expr
OF C1 (v1) => S1
 | C2 (v2) => S2
 ...
ELSE S0
END
```

编译上可转成一串 else-if，每个分支做：

1. `instanceof`；
2. narrowing；
3. 声明该分支局部变量。

由于子类也匹配父类，不能像整数 `switch` 那样直接用 class id 做 jump table；若多个分支都匹配，取第一个。

---

## Private Fields and Methods

private field 不能被对象声明外部的函数/方法直接 fetch 或 update；private method 不能从外部调用。它们的保护通常由**类型检查阶段**完成：

- 类符号表中记录字段 offset、方法 offset；
- 同时记录 `private/protected/public` 等访问标志；
- 编译 `c.x` 或 `c.f()` 时检查当前访问上下文是否合法。

常见保护粒度：

| 保护形式 | 可访问范围 |
|---|---|
| private | 只有声明该字段/方法的类 |
| protected | 声明类及其子类 |
| package/module | 同一模块、包或命名空间 |
| readonly | 外部可读，但只有类方法可写 |

这些约束通常不需要运行时代码；类型检查拒绝非法程序即可。

---

## Classless Languages 与 OO 优化

教材还提到 classless OO language：对象不一定属于某个显式类，每个对象可以有自己的字段和方法。实现上通常仍会出现“伪类”：

- 通过 cloning 创建相似对象；
- 相似对象共享 descriptor；
- 一旦新增字段或 override method，就生成新的 descriptor；
- lookup 技术类似多继承和动态链接场景中的 hash descriptor。

### 动态调用转静态调用

OO 语言的重要优化是把动态方法调用转成静态 method-instance call：

```text
c.f()  ==>  CALL C_f
```

如果编译器能证明某个调用点只可能调用一个 method instance，就可以消除 vtable lookup。常见分析：

| 分析 | 作用 |
|---|---|
| Type hierarchy analysis | 查看 `C` 的子类中是否可能 override `f` |
| Type propagation | 从 `c <- new C` 传播精确运行时类型 |
| Method replication | 为子类复制 method body，使 `self.g()` 这类调用在复制版本中变成已知目标 |

这样不仅省掉间接调用，还让 inline expansion 和跨过程分析更容易发挥作用。

---

## 小结

| 问题 | 关键技术 |
|---|---|
| 子类对象如何兼容父类字段访问 | 单继承 prefixing |
| override 后如何选对方法实例 | vtable / dispatch vector |
| 多继承字段和方法如何定位 | global graph coloring 或 descriptor hash table |
| `instanceof` 如何实现 | super 链查找或 descriptor display |
| downcast 如何保证安全 | 运行时 membership test |
| private/protected 如何执行 | 类型检查阶段查符号表访问标志 |
| 动态 OO 如何优化 | type hierarchy analysis + type propagation |

要点：OO 编译需要在**静态类型与运行时真实类可能不同**的情况下，仍然保证布局、调用和类型检查都正确。
