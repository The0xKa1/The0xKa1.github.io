# 第一次运行：从打开终端开始

你需要一台 Windows、macOS 或 Linux 电脑，以及可联网的安装过程。实验安装完成后在本机运行，浏览器只是显示界面；不需要网站账号，也不需要显卡。

## 先认识四个词

- **文件夹**：用来放文件。解压后应得到 `ml-lab` 文件夹，里面能看到 `app.py`、`requirements.txt`、`projects`。
- **路径**：一个文件或文件夹的地址，例如 `C:\Users\你的用户名\Downloads\ml-lab`。路径含空格时，要用英文双引号包住。
- **终端**：输入命令的窗口。键盘输入一行，按 **Enter / 回车**执行，等提示符再次出现才输入下一行。这里的“终端”不是 Python 里出现 `>>>` 的窗口。
- **当前文件夹**：终端现在所在的位置。`cd` 是“进入文件夹”；`..` 表示上一层。后面的命令必须在含有 `app.py` 的文件夹里执行。

复制代码框里的命令即可，不要复制代码框上面的标题。虚拟环境 `.venv` 用来把这个实验需要的依赖放在一起，避免混入其他 Python 项目。

## Windows 10 / 11

1. 到 [Python 官方下载页](https://www.python.org/downloads/) 安装 **Python 3.11 或 3.12**。安装器中勾选 **Add python.exe to PATH**，然后安装。安装后重新打开命令窗口。
2. 在资源管理器中找到下载的 ZIP，右键 → **全部解压缩**。不要直接在 ZIP 预览窗口里运行。
3. 打开解压后的 `ml-lab` 文件夹，确认看得到 `app.py`。按 **Alt + D** 选中文件夹地址栏，输入 `cmd`，按 **Enter**。会打开黑色命令提示符窗口，且已经位于这个文件夹。
4. 逐行运行下面的命令。若安装时询问访问网络，允许 Python 下载依赖。

```bat
py -3.12 --version
py -3.12 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m streamlit run app.py
```

如果安装的是 3.11，把前两行中的 `-3.12` 改成 `-3.11`。如果提示找不到 `py`，关闭窗口重新打开；仍无效则重新运行 Python 安装器，检查 PATH 和 Python Launcher。这里直接调用虚拟环境里的 Python，无需激活脚本，也无需更改 PowerShell 执行策略。

## macOS

1. 从 [Python 官方下载页](https://www.python.org/downloads/) 安装 **Python 3.11 或 3.12** 的 macOS 安装包。双击 ZIP 解压。
2. 按 **Command + 空格** 打开 Spotlight，输入“终端”或 `Terminal`，按 **回车**。
3. 在终端输入 `cd `（注意后面有一个空格），先不要按回车。将 Finder 中解压后的 `ml-lab` **文件夹**拖到终端窗口里，路径会自动填入，再按回车。
4. 输入 `ls`，应能看到 `app.py`。然后逐行运行：

```sh
python3.12 --version
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m streamlit run app.py
```

如果安装的是 3.11，把前两行的 `python3.12` 改成 `python3.11`。不要用系统自带的旧 Python 代替。如果下载依赖出现证书错误，打开“应用程序”中的 `Python 3.12`（或 3.11）文件夹，双击 `Install Certificates.command` 后重试安装依赖。

## Linux（以 Ubuntu 24.04 / Debian 系为例）

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

## 启动后应该看到什么

终端显示类似 `Local URL: http://localhost:8501`，浏览器通常会自动打开食品实验室。如果没有自动打开，把终端给出的 **Local URL** 复制到浏览器地址栏。`localhost` 表示你自己的电脑。

终端暂时不出现新的提示符，说明网页服务正在运行。**让这个窗口保持打开**。停止时回到终端按 **Ctrl + C**（macOS 也是 Control + C，而不是 Command + C）。之后网页断开连接是正常现象。

下次使用不需要重新安装：重新进入 `ml-lab` 文件夹，仅执行最后一条启动命令。若端口被占用，在启动命令末尾追加 `--server.port 8502`，再打开终端显示的新地址。

## 第一道练习怎么写

1. 在网页左侧选一个实验，保持“演示”，点“运行实验”先观察效果。
2. 用 VS Code 等代码编辑器打开整个 `ml-lab` 文件夹。选择实验说明中标出的 `projects/实验名/exercises.py`。
3. 每个函数写清了输入、输出。替换函数中的 `raise NotImplementedError(...)`，保留函数名、参数名和缩进；不要把答案写进 `page.py`。
4. 按 **Ctrl + S** 保存（macOS：**Command + S**）。回到网页切换到“练习”，点“检查练习”，再点“运行实验”。
5. 修改代码、参数或数据后，旧结果会标记为待更新。重新点击运行按钮，才会执行你的新实现。完整参考实现位于 `solutions` 文件夹。

## 常见提示怎么处理

| 提示 | 含义与处理 |
|---|---|
| 找不到 `app.py` 或 `requirements.txt` | 当前文件夹不对。Windows 输入 `dir`，macOS/Linux 输入 `ls`，确认列出了这两个文件。不要进入里面第二层 `projects`。 |
| `>>>` | 打开了 Python 交互窗口。输入 `exit()` 回车退出，再输入安装命令。 |
| `No module named streamlit` | 依赖没有装进当前 Python。使用上面 `.venv` 开头的完整命令重新安装和启动。 |
| 下载超时 | 检查网络，重新运行安装依赖那一行。已装好的包通常不必重新下载。 |
| `NotImplementedError` / 待完成 | 练习函数还没有写完。先切回演示看效果，再逐题填写。 |
| `SyntaxError` / `IndentationError` | 查看报错对应文件和行号，检查冒号、括号以及同一层代码的缩进。 |
| PyTorch / TensorFlow 未安装 | 其他实验仍可使用；数字识别先选 scikit-learn，想做深度学习再安装下方可选依赖。 |

## 可选：数字识别的深度学习框架

先按上述步骤装好基础环境。停止网页后，在同一文件夹运行你想使用的框架安装命令，不需要同时安装两个。

Windows：

```bat
.venv\Scripts\python.exe -m pip install -r requirements-torch.txt
```

macOS / Linux：

```sh
.venv/bin/python -m pip install -r requirements-torch.txt
```

TensorFlow 对照示例把上面的文件名改为 `requirements-tensorflow.txt`。安装后重新启动网页，默认使用 CPU。
