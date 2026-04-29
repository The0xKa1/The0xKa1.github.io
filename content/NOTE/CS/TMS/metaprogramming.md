---
comments: true
---

# Metaprogramming

本次主要讨论的是元编程，然而，虽然其名为元编程，其内容更加关注的是 *流程* 而不是编程本身。本次课主要从学习如何构建系统，代码测试以及依赖管理...

## 构建系统

如果使用 $ \LaTeX $ 来编写论文，需要执行哪些命令才能编译出我们想要的论文呢？执行基准测试、绘制图表然后将其插入论文的命令又有哪些？或者，如何编译某课程提供的代码并执行测试呢？

对于大多数系统来说，不论其是否包含代码，通常都会包含一个 “构建过程” ，例如从 $\LaTeX$ 源代码到 PDF 文件的转换过程。执行一些命令来生成图表，然后执行另外的命令来生成结果，最再执行其它的命令来生成最终的论文，有很多事情需要完成，如果每次更新都需要一步步重复这些过程，这将很令人苦恼...

名为"构建系统"的工具可以帮助我们自动化这些过程，例如 `make`、`cmake`、`scons`、`ninja` 等等。这些工具可以帮助我们定义一系列的规则，然后根据这些规则来执行一系列的命令，从而生成我们想要的结果。

这些工具都是非常类似的。我们需要定义 依赖、目标 和 规则。我们必须告诉构建系统我们具体的构建目标，系统的任务则是找到构建这些目标所需要的依赖，并根据规则构建所需的中间产物，直到最终目标被构建出来。理想的情况下，如果目标的依赖没有发生改动，并且我们可以从之前的构建中复用这些依赖，那么与其相关的构建规则并不会被执行。

`make`是最常用的构建系统之一，我们会发现它通常被安装到了几乎所有基于 UNIX 的系统中。`make` 并不完美，但是对于中小型项目来说，它已经足够好了。当您执行 `make` 时，它会去参考当前目录下名为 `Makefile` 的文件。所有构建目标、相关依赖和规则都需要在该文件中定义，它看上去是这样的：

```makefile
target: dependencies
    command
```

例如


```makefile
paper.pdf: paper.tex plot-data.png
	pdflatex paper.tex

plot-%.png: %.dat plot.py
	./plot.py -i $*.dat -o $@
```


这段 Makefile 代码描述了两个规则，它们的作用分别如下：

 `paper.pdf: paper.tex plot-data.png`
这个规则的含义是，如果你需要生成 `paper.pdf` 文件，那么需要先生成 `paper.tex` 和 `plot-data.png`。  

```makefile
pdflatex paper.tex
```
这个命令会用 `pdflatex` 工具编译 `paper.tex` 文件，生成 `paper.pdf` 文件。注意，如果 `paper.tex` 或 `plot-data.png` 文件有更新，`make` 会重新执行这个命令。

`plot-%.png: %.dat plot.py`

这个规则的作用是生成以 `plot-` 为前缀的 PNG 图像文件（例如 `plot-something.png`），图像文件的生成依赖于对应的 `.dat` 数据文件和一个 Python 脚本 `plot.py`。

规则中的命令：
```makefile
./plot.py -i $*.dat -o $@
```

- `$*` 表示匹配模式中的通配符部分，这里会替换为 `%.dat` 中的文件名部分（比如 `data` 会变成 `data.dat`）。
- `$@` 是目标文件的名称，即生成的 `plot-*.png` 文件。

因此，假设你有一个 `data.dat` 文件，`make` 会调用 `plot.py`，并传递参数：`-i data.dat` 和 `-o plot-data.png`，最终生成 `plot-data.png` 文件。

### Example

现在，如果我们直接执行`make`,其会默认执行第一个规则，即生成 `paper.pdf` 文件。如果我们只想生成 `plot-data.png` 文件，可以执行 `make plot-data.png`。如果我们想生成 `plot-something.png` 文件，可以执行 `make plot-something.png`。

```bash
$ make
make: *** No rule to make target 'paper.tex', needed by 'paper.pdf'.  Stop.
```

这告诉我们，`make` 需要 `paper.tex` 文件，但是我们没有提供它。我们可以通过执行 `touch paper.tex` 来创建一个空的 `paper.tex` 文件，然后再次执行 `make`。

```bash
$ touch paper.tex
$ make
make: *** No rule to make target 'plot-data.png', needed by 'paper.pdf'.  Stop.
```
我们是有构建 plot-data.png 的规则的，但是这是一条模式规则。因为源文件 data.dat 并不存在，因此 make 就会告诉您它不能构建 plot-data.png，让我们创建这些文件：

```bash
$ cat paper.tex
\documentclass{article}
\usepackage{graphicx}
\begin{document}
\includegraphics[scale=0.65]{plot-data.png}
\end{document}
$ cat plot.py
#!/usr/bin/env python
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-i', type=argparse.FileType('r'))
parser.add_argument('-o')
args = parser.parse_args()

data = np.loadtxt(args.i)
plt.plot(data[:, 0], data[:, 1])
plt.savefig(args.o)
$ cat data.dat
1 1
2 2
3 3
4 4
5 8
```

现在我们可以执行 `make` 来生成 `paper.pdf` 文件：

```bash
$ make
./plot.py -i data.dat -o plot-data.png
pdflatex paper.tex
This is pdfTeX, Version....
...
...
```
现在我们已经得到了 `paper.pdf` 文件，其中包含了我们的图表。

如果再次执行 `make`，`make` 会告诉我们 `paper.pdf` 是最新的，不需要重新生成。如果我们删除 `plot-data.png` 文件，再次执行 `make`，`make` 会重新生成 `plot-data.png` 文件，然后再次生成 `paper.pdf` 文件。事实上也应该这样，因为没有任何东西发生改变，所以 `paper.pdf` 文件也不应该被重新生成。


如果想要生成其它的图表，可以执行 `make plot-something.png`，`make` 会根据规则生成对应的图表。(确保`something.data`文件存在)

## 依赖管理


### 版本号

对于某些项目，它的依赖本身也有可能是其它的项目。我们也许会依赖某些程序(Python),某些系统包(openssl)或者某些编程语言的库(matplotlib)。这些依赖可能会有不同的版本，而且不同的项目可能会依赖于不同的版本。这就是依赖管理的问题。

由于每个仓库、每种工具的运行机制都不太一样，因此我们并不会在本节课深入讲解具体的细节。我们会介绍一些通用的术语，例如 版本控制。大多数被其他项目所依赖的项目都会在每次发布新版本时创建一个 版本号。通常看上去像 8.1.3 或 64.1.20192004。版本号一般是数字构成的，但也并不绝对。也有可能使用git的commit hash作为版本号。

版本号一个很重要的用途就是它可以保证项目可以运行,试想一下，假如我的库要发布一个新版本，在这个版本里面我重命名了某个函数。如果有人在我的库升级版本后，仍希望基于它构建新的软件，那么很可能构建会失败，因为它希望调用的函数已经不复存在了。有了版本控制就可以很好的解决这个问题，我们可以指定当前项目需要基于某个版本，甚至某个范围内的版本，或是某些项目来构建。这么做的话，即使某个被依赖的库发生了变化，依赖它的软件可以基于其之前的版本进行构建。

但是这还不够好，如果我修复了一写安全上的问题，但是没有更改任何借口（API），同时我也没有增加任何新的功能，但是这也应该是一个新的版本。那么问题就来了，如何去确定什么样的更新应该被认为是一个新的版本呢，换句话说，如何去确定版本与版本之间的区别大小呢？


一套常用的标准是 [Semantic Versioning](https://semver.org/)。语义化版本，这个标准定义了版本号的格式以及版本号的含义。一个版本号通常由三个数字构成，分别是 `MAJOR.MINOR.PATCH`。当我们发布一个新版本时，我们会根据我们的改动来决定如何更新这三个数字：

- 如果我们只是修复了一些 bug，那么我们会更新 `PATCH` 版本号，（API不改变）
- 如果我们增加的新的接口，但是不会破坏之前的接口(backward compatible)，那么我们会更新 `MINOR` 版本号。
- 如果我们改变了接口(non-backward-compatible)，那么我们会更新 `MAJOR` 版本号。即彻底改变了某个函数的功能，或者删除了某个函数等等。

例如，如果我们的项目依赖某个库的版本是 `1.2.3`,那么想要运行我们软件的该库的版本号的 `MAJOR` 版本号必须是 `1`，`MINOR` 版本号必须大于等于 `2`，`PATCH`版本号任意，但是一般来说高于等于 `3`。

虽然有可能`2.x.x`运行也有可能不会报错，但是也有可能会出现一些奇怪的结果。

就像Python2和Python3对于大部分程序是不兼容的，Python3.5能运行的Python3.7也可以运行，但是反过来3.7能运行的3.5就不一定能运行了。因为其可能用到了3.7新增的一些特性。

### Lockfile

使用依赖管理系统的时候，也有可能遇到lock files(锁文件)这一概念，其例出了您当前每个依赖所对应的具体版本号

通常需要执行升级程序才能更新以来的版本，这样做有很多好处，例如避免不必要的重新编译，创建可以重现的构建环境，以及避免不必要的更新（Windows的自动更新就经常会导致一些问题）。

### Vendoring

还有一种极端的依赖锁定叫做 vendoring。这种方法是将依赖的代码直接复制到项目的源代码中。这样做的好处是，您可以确保您的项目可以在任何情况下构建，即使依赖的项目不再存在，或者依赖的项目发生了变化，甚至可以将自己的修改添加进去。但是这样做也有很多缺点，例如代码冗余，依赖的代码不会自动更新，当开发者更新了一些功能时，你需要自己去拉去这些更新，还可能会导致一些法律问题。

## 持续集成系统

持续集成系统(continous integration systems)是一种自动化的构建系统.

设想这样的场景：你正在开发一个大型项目，你对你的代码修改了一行，接下来，你需要要上传一份新的版本的文档，上传重新编译后的文件到某处，发布代码到pypi，执行测试。

或者你希望当别人提交pull request时，自动运行一些测试，以确保新的代码不会破坏现有的代码。

持续集成系统就是为了解决这些问题而存在的。持续集成系统（aka CI）是一种 *雨伞术语*（umbrella term，涵盖了一组术语的术语），它指的是“当代码变动时，自动运行的东西”CI 系统通常用于自动化构建、测试和部署流程，以确保代码在提交或合并到版本控制系统时不会破坏现有功能，保证软件质量。

Github Actions就是一个很好的持续集成系统，

是的，**GitHub Actions** 完全属于 **Continuous Integration (CI)** 和 **Continuous Deployment (CD)** 系统的一部分。

GitHub Actions 是 GitHub 提供的一种自动化工具，它允许开发者为他们的项目设置 CI/CD 流程。它可以帮助你自动化代码构建、测试、部署、发布等工作，直接集成在 GitHub 仓库中，因此非常适合 GitHub 用户。

1. 可以使用 GitHub Actions 来创建工作流，当某些事件发生（如推送代码、创建拉取请求等）时，自动触发构建、测试和部署流程。
   
- GitHub Actions 使用 YAML 文件来定义工作流，通常是 `.github/workflows` 目录下的文件。例如，你可以定义一个 CI 工作流来在每次提交代码后自动运行测试。

- GitHub Actions 可以与其他服务进行集成，如发送通知、上传文件、部署到云平台等。

-  还可以通过多种事件来触发工作流，包括：
   - **push**：当代码被推送到仓库时触发。
   - **pull_request**：当有拉取请求时触发。
   - **issue**：当创建、修改或关闭一个 issue 时触发。
   - **schedule**：按预定的时间表触发（类似 cron 作业）。
   - **release**：当发布版本时触发。

### 一个简单的 CI 工作流（在 `.github/workflows/ci.yml` 文件中）：

```yaml
name: CI Workflow

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          pytest
```

在这个示例中，GitHub Actions 会在每次推送或拉取请求到 `main` 分支时，自动触发以下步骤：
1. 检出代码（`actions/checkout@v2`）。
2. 设置 Python 环境（`actions/setup-python@v2`）。
3. 安装项目的依赖。
4. 运行测试。

### 测试

多数的大型软件都有“测试套件”，以下是一些常见的测试方法和测试术语：

- 测试套件（Test suite）：所有测试的统称。
- 单元测试（Unit test）：一种“微型测试”，用于对某个封装的特性进行测试。
- 集成测试（Integration test）：一种“宏观测试”，针对系统的某一大部分进行，测试其不同的特性或组件是否能 协同 工作。
- 回归测试（Regression test）：一种实现特定模式的测试，用于保证之前引起问题的 bug 不会再次出现。
- 模拟（Mocking）: 使用一个假的实现来替换函数、模块或类型，屏蔽那些和测试不相关的内容。例如，您可能会“模拟网络连接” 或 “模拟硬盘”。

