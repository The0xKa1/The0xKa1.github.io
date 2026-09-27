---
title: 项目实践
comments: false
statistics: false
---

# 坤坤的食品实验室

坤坤最近接手了实验室里几件琐事：给报告修图、分辨葡萄酒样本、整理手写编号，还想让小车帮忙送样。每件事看起来都不大，真做起来却各有难处。

编程基础见[实验编程入门](./python-data.md)。

| 项目 | 坤坤要做什么 |
| --- | --- |
| [图像处理工作台](./learning-log.md) | 把有噪点的果盘照片处理清楚，留住边缘。 |
| [分类边界擂台](./classification-arena.md) | 为分布不同的食品样本挑选分类方法。 |
| [葡萄酒研究室](./iris.md) | 认类别、估酒精含量，再给相似的酒分组。 |
| [图片颜色压缩](./color-compression.md) | 用有限的颜色还原一张水果照片。 |
| [手写数字识别](./digits.md) | 让电脑辨认实验记录里的手写编号。 |
| [小车送样](./gridworld.md) | 让小车学会绕开障碍，把样本送到实验台。 |

## 下载与打开实验室 {#setup}


### 下载与解压

1. 点击[下载食品实验室完整项目包](/downloads/ml-guide/ml-lab.zip)，把 `ml-lab.zip` 保存到电脑。下载完成后，一般能在浏览器右上角的下载列表或电脑的“下载”文件夹里找到它。
2.  Windows 右键 ZIP，选择“全部解压缩”；macOS 双击 ZIP；Linux 右键选择解压。不要在压缩包预览窗口里直接运行文件。Windows用户，一般来说不要直接放在C盘根目录，建议放在用户文件夹或其他非系统盘。
3. 打开解压后的文件夹，找到同时包含 `app.py`、`requirements.txt` 和 `projects` 的那一层。如果外面又套了一层同名文件夹，就继续打开，直到看到这些文件。
4. 按自己的操作系统完成下面的安装与启动。**不要双击 `app.py` 启动实验**，也不用先读懂代码；把对应命令逐行复制到终端运行即可。

安装时需要联网下载 Python 和依赖。装好后，实验在你的电脑上运行，用浏览器打开界面即可，不需要网站账号或显卡。

### 终端和路径

- 文件夹：用来放文件。解压后应得到 `ml-lab` 文件夹，里面能看到 `app.py`、`requirements.txt`、`projects`。
- 路径：一个文件或文件夹的地址，例如 `C:\Users\你的用户名\Downloads\ml-lab`。路径含空格时，要用英文双引号包住。
- 终端：输入命令的窗口。键盘输入一行，按 **Enter / 回车**执行，等提示符再次出现才输入下一行。这里的“终端”不是 Python 里出现 `>>>` 的窗口。
- 当前文件夹：终端现在所在的位置。`cd` 是“进入文件夹”；`..` 表示上一层。后面的命令必须在含有 `app.py` 的文件夹里执行。

下面的代码框里是需要执行的命令，复制时不必带上标题。命令会创建一个叫 `.venv` 的虚拟环境，本项目的依赖都装在里面，与其他 Python 项目分开。

### Windows 10 / 11

1. 到 [Python 官方下载页](https://www.python.org/downloads/) 安装 **Python 3.11 或 3.12**。安装器中勾选 **Add python.exe to PATH**，然后安装。安装后重新打开命令窗口。
2. 在资源管理器中找到下载的 ZIP，点击右键，选择**全部解压缩**。不要直接在 ZIP 预览窗口里运行。
3. 打开解压后的 `ml-lab` 文件夹，确认看得到 `app.py`。按 **Alt + D** 选中文件夹地址栏，输入 `cmd`，按 **Enter**。会打开黑色命令提示符窗口，且已经位于这个文件夹。
4. 逐行运行下面的命令。若安装时询问访问网络，允许 Python 下载依赖。

```bat
py -3.12 --version
py -3.12 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m streamlit run app.py
```

如果安装的是 3.11，把前两行中的 `-3.12` 改成 `-3.11`。如果提示找不到 `py`，关闭窗口重新打开；仍无效则重新运行 Python 安装器，检查 PATH 和 Python Launcher。这些命令直接调用虚拟环境里的 Python，不需要另外运行激活脚本，也不需要更改 PowerShell 执行策略。

### macOS

1. 从 [Python 官方下载页](https://www.python.org/downloads/) 安装 **Python 3.11 或 3.12** 的 macOS 安装包。双击 ZIP 解压。
2. 按 **Command + 空格** 打开 Spotlight，输入“终端”或 `Terminal`，按 **回车**。
3. 在终端输入 `cd `（注意后面有一个空格），先不要按回车。将 Finder 中解压后的 `ml-lab` 文件夹拖到终端窗口里，路径会自动填入，再按回车。
4. 输入 `ls`，应能看到 `app.py`。然后逐行运行：

```sh
python3.12 --version
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m streamlit run app.py
```

如果安装的是 3.11，把前两行的 `python3.12` 改成 `python3.11`。不要用系统自带的旧 Python 代替。如果下载依赖出现证书错误，打开“应用程序”中的 `Python 3.12`（或 3.11）文件夹，双击 `Install Certificates.command` 后重试安装依赖。

### Linux（以 Ubuntu 24.04 / Debian 系为例）

1. 在文件管理器中解压 ZIP。按 **Ctrl + Alt + T** 打开终端；如果快捷键无效，在应用菜单搜索“终端”。
2. 输入 `cd `，将 `ml-lab` 文件夹拖入窗口后回车。也可以在文件管理器地址栏复制路径，再输入 `cd "你复制的完整路径"`。输入 `ls`，确认有 `app.py`。
3. Ubuntu 24.04 可以使用下面的命令。`sudo` 会询问你的电脑登录密码；输入时不显示字符，正常输入后回车即可。

```sh
sudo apt update
sudo apt install python3 python3-venv python3-pip
python3 --version
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m streamlit run app.py
```

建议版本为 3.11 / 3.12。其他发行版的软件包命令不同：Fedora 使用 `dnf`，Arch 使用 `pacman`；请安装对应发行版的 Python 和 venv 支持，再从创建 `.venv` 这一步继续。没有管理员权限时，联系电脑管理员安装 Python，不要把 `sudo` 加到后面的 pip 命令上。

### 浏览器打开以后

终端显示类似 `Local URL: http://localhost:8501`，浏览器通常会自动打开食品实验室。如果没有自动打开，把终端给出的 **Local URL** 复制到浏览器地址栏。`localhost` 表示你自己的电脑。

网页运行期间，终端会一直被占用，不再出现新的提示符。保持这个窗口打开。要停止实验网页，回到终端按 **Ctrl + C**（macOS 也是 Control + C，而不是 Command + C）。之后网页断开连接是正常现象。

下次使用不需要重新安装：重新进入 `ml-lab` 文件夹，仅执行最后一条启动命令。若端口被占用，在启动命令末尾追加 `--server.port 8502`，再打开终端显示的新地址。

### 演示实验

1. 在网页左侧选一个实验，保持“演示”，点“运行实验”先观察效果。
2. 用 VS Code 等代码编辑器打开整个 `ml-lab` 文件夹。选择实验说明中标出的 `projects/实验名/exercises.py`。
3. 每个函数写清了输入、输出。替换函数中的 `raise NotImplementedError(...)`，保留函数名、参数名和缩进；不要把答案写进 `page.py`。
4. 按 **Ctrl + S** 保存（macOS：**Command + S**）。回到网页切换到“练习”，点“检查练习”，再点“运行实验”。
5. 修改代码、参数或数据后，旧结果会标记为待更新。重新点击运行按钮，才会执行你的新实现。完整参考实现位于 `solutions` 文件夹。

### 常见提示怎么处理

| 提示 | 含义与处理 |
|---|---|
| 找不到 `app.py` 或 `requirements.txt` | 当前文件夹不对。Windows 输入 `dir`，macOS/Linux 输入 `ls`，确认列出了这两个文件。不要进入里面第二层 `projects`。 |
| `>>>` | 打开了 Python 交互窗口。输入 `exit()` 回车退出，再输入安装命令。 |
| `No module named streamlit` | 依赖没有装进当前 Python。使用上面 `.venv` 开头的完整命令重新安装和启动。 |
| 下载超时 | 检查网络，重新运行安装依赖那一行。已装好的包通常不必重新下载。 |
| `NotImplementedError` / 待完成 | 练习函数还没有写完。先切回演示看效果，再逐题填写。 |
| `SyntaxError` / `IndentationError` | 查看报错对应文件和行号，检查冒号、括号以及同一层代码的缩进。 |
| PyTorch 未安装 | 其他实验仍可使用；手写数字识别的 CNN 训练与预测需要安装下方依赖。 |

### 手写数字识别：安装 PyTorch

先装好基础环境，再停止实验网页。仍在同一文件夹里运行下面的安装命令，安装 PyTorch。

Windows：

```bat
.venv\Scripts\python.exe -m pip install -r requirements-torch.txt
```

macOS / Linux：

```sh
.venv/bin/python -m pip install -r requirements-torch.txt
```

安装后重新启动网页，到数字识别的“数据准备”下载 MNIST（约 12 MB）。数据会保存在本地，后续无需重复下载。计算设备默认自动选择 CUDA、Apple MPS 或 CPU；训练只在点击“从头训练 CNN”后开始。
