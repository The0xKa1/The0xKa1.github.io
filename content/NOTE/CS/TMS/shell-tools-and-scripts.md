---
comments: true
---
# Shell tools

## shell programming

### 变量定义

在shell中，变量定义使用等号`=`，等号两边不能有空格。


```bash
name="kailqq"
```
然后使用`$`来引用变量。

```bash
echo $name
```
这将会输出`kailqq`。

但是如果变量名中包含空格，则需要使用引号。

```bash
name = kailqq
```

这将会报错，因为此时相当于我们在调用`name`这个命令，第一个参数是`=`，第二个参数是`kailqq`

在[lec1](./overview-and-shell.md)的作业中，提到了`""`和`''`的区别，`""`解析`$`符号.

```bash
name="kailqq"
echo "$name"
echo '$name'
```

第一个输出`kailqq`，第二个输出`$name`。

我们也可以将命令的输出赋值给变量。

```bash
directories=$(ls)
echo $directories
```

这将会获取当前目录下的所有文件名，并赋值给变量`name`。`$()`也可以替换为` `` `

除了`$()`，还可以使用`<()`将命令的输出作为标准输入传递给另一个命令。

```bash
[command] <(command_1) <(command_2)
```

这将会先执行`command_1`，输出结果传递给`command`，然后执行`command_2`，输出结果也传递给`command`。


```bash
cat <(ls) <(ls -l)
```

这将会输出当前目录下的所有文件名和文件的详细信息。




### 逻辑运算符

`true` 表示真，执行`true`，后执行`echo $?`，输出0。

`false` 表示假，执行`false`，后执行`echo $?`，输出1。

`||` 表示或，只有当第一个命令失败时，才会执行第二个命令。(遇到第一个成功的命令结束)

`&&` 表示与，只有当第一个命令成功时，才会执行第二个命令。(遇到第一个失败的命令结束)

`;` 表示分隔符，用于分隔多个命令，不管上一个命令是否成功，都会执行下一个命令。

!!!eg
    ```bash
    false || echo "hello"
    echo $?
    ```
    
    第一行第一个命令失败，执行第二个命令成功，输出`hello`和`0`。
    
    ```bash
    true || echo "hello"
    echo $?
    ```
    
    第一行第一个命令成功，不执行第二个命令，输出`0`。


    ```bash
    false && echo "hello"
    echo $?
    ```
    
    第一行第一个命令失败，不执行第二个命令，输出`1`。
    
    ```bash
    true && false
    echo $?
    ```
    
    第一行第一个命令成功，执行第二个命令失败，输出`1`。

    ```bash
    false || true
    echo $?
    ```
    
    第一行第一个命令失败，执行第二个命令成功，输出`0`。
    
    ```bash
    false ; echo $?
    ```
    
    执行第二个命令时，由于它的前一个命令失败，所以输出`1`。

    ```bash
    true ; echo $?
    ```
    
    执行第二个命令时，由于它的前一个命令成功，所以输出`0`。




### 函数
首先创建一个函数

```bash
code mcd.sh
```

输入

```bash

mcd(){
    mkdir -p "$1"
    cd "$1"
}
```

然后保存文件，并`source`这个文件。

```bash
source mcd.sh
```

然后就可以使用这个函数了
```bash
mcd test
```

这会在当前目录下创建一个名为`test`的目录，并进入该目录。

!!!Note "分析"
    `mkdir -p "$1"`: 这个命令用于创建目录。`-p` 选项告诉 `mkdir` 创建所需的父目录，这意味着如果目录已经存在，它不会报错。`$1` 是一个位置参数，表示传递给函数的第一个参数。因此，如果你调用 `mcd test`，`$1` 就是 `test`。

    而`source`命令用于读取并执行指定文件中的命令。在这个例子中，`source mcd.sh` 读取 `mcd.sh` 文件中的命令，并执行它们。

    使得`mcd`命令在当前shell中可用。
    
    `$0` 是一个特殊变量，表示当前脚本的名称。

    `$i` 是一个位置参数，表示传递给函数的第i个参数。
    
    其中`$1`表示第一个参数，`$2`表示第二个参数，以此类推。

    `$?` 是一个特殊变量，表示上一个命令的退出状态,0表示成功，1表示error,执行命令后可以通过`echo $?`查看是否成功。



    `$_` 是一个特殊变量，表示上一个命令的最后一个参数。

    `$$` 是一个特殊变量，表示当前进程的进程ID(PID)。

    `$#` 是一个特殊变量，表示传递给函数的参数个数。

    `!!` 是一个特殊变量，表示上一条命令。(Bang Bang)


```bash
#!/bin/zsh
echo "Starting program at $(date)"

echo "Running Program $0 with $# arguments with pid $$"

for file in "$@"; do
    grep foobar "$file" > /dev/null 2> /dev/null

    if [[ "$?" -ne 0 ]]; then
    echo "File $file does not have any foobar,add one"
    echo "#foobar">>"$file"
    fi
done
```


如果没有第一行的shebang，则会报错找不到`[[`

因为shebang指定了脚本的解释器，所以需要使用`#!/bin/zsh`或者`#!/bin/bash`。使用`#!/bin/sh`也不行.


**`echo "Starting program at $(date)"`**:

- 输出当前程序的启动时间。`$(date)` 执行 `date` 命令并将其输出插入到字符串中。

**`echo "Running Program $0 with $# arguments with pid $$"`**:

- 输出当前正在运行的程序名（`$0`），传递给程序的参数个数（`$#`），以及当前进程的进程 ID（`$$`）。


**`for file in "$@"; do`**:

- 开始一个循环，遍历传递给脚本的所有参数（文件名）。`"$@"` 表示所有传递的参数，每个参数作为一个独立的字符串。


**`grep foobar "$file" > /dev/null 2> /dev/null`**:

- 在当前文件中搜索字符串 "foobar"。`> /dev/null` 和 `2> /dev/null` 将标准输出和标准错误输出重定向到 `/dev/null`，即忽略输出。


**`if [[ "$?" -ne 0 ]]; then`**:

- 检查上一个命令的退出状态（`$?`）。如果 `grep` 没有找到 "foobar"，退出状态将不为 0，表示失败。


**`echo "File $file does not have any foobar,add one"`**:

- 输出一条信息，说明文件中没有找到 "foobar"。


**`echo "#foobar">>"$file"`**:

- 将字符串 `#foobar` 追加到文件的末尾。


**`done`**:

- 结束 `for` 循环。


使用`./foobarchecker`运行脚本，并传递参数`file1.txt file2.txt file3.txt`。
甚至可以不传递参数，直接运行`./foobarchecker foobarchecker`，来检查当前脚本是否包含`foobar`。


## shell-tools


---
检查脚本语法可以使用`shellcheck`


```bash
shellcheck foobarchecker
```

---

`tldr` 是一个社区驱动的命令行工具，旨在提供简洁明了的命令行工具使用示例。它的名字来源于 "Too Long; Didn't Read"，意在为用户提供简化的命令行工具文档，帮助快速理解和使用命令。


```bash
tldr ls
```

---


`ripgrep` 是一个用于搜索文本的工具，类似于 `grep`，但提供了更快的搜索速度和更丰富的功能。


```bash
rg --help
```

---

`history` 是一个用于显示命令历史的工具。


```bash
history
```

---

`autojump` 是一个用于快速跳转目录的工具。


```bash
j test
```

---

`fzf` 是一个用于模糊搜索的工具。


```bash
cat text.txt | fzf
```

这会进入到一个交互式搜索界面，搜索文件内容时很有帮助


如果启用了绑定键，则可以按下`Ctrl+R`来搜索命令历史。

如果直接使用`fzf`，则进入交互式寻找当前目录下文件。

---

`tree` 是一个用于显示目录树的工具,功能类似于`ls -R`。


```bash
tree
```

`broot`可以进入交互式文件导航


```bash
broot
```

---

## Exercise & Solutions

1. Read `man ls` and write an `ls` command that lists files in the following manner:

   - Includes all files, including hidden files
   - Sizes are listed in human readable format (e.g. 454M instead of 454279954)
   - Files are ordered by recency
   - Output is colorized

   A sample output would look like this

   ```bash
   -rw-r--r--  1 user group 1.1M Jan 14 09:53 baz
   drwxr-xr-x  5 user group 160 Jan 14 09:53 .
   -rw-r--r--  1 user group 514 Jan 14 06:42 bar
   -rw-r--r--  1 user group 106M Jan 13 12:12 foo
   drwx------ 47 user group 1.5K Jan 12 18:08 ..
   ```

即要求输出文件详细信息，size以人类可读格式显示，文件按最近修改时间排序，并启用彩色输出。

`-l` 参数可以显示文件的详细信息

`-a` 参数可以显示隐藏文件

`-h` 参数可以以人类可读格式显示文件大小

`--color=auto` 参数可以启用彩色输出

`--sort=time` 参数可以按最近修改时间排序

```bash
ls -lah --color=auto --sort=time
```


2. Write bash functions `marco` and `polo` that do the following. Whenever you execute `marco` the current working directory should be saved in some manner, then when you execute `polo`, no matter what directory you are in, `polo` should `cd` you back to the directory where you executed `marco`. For ease of debugging you can write the code in a file `marco.sh` and (re)load the definitions to your shell by executing `source marco.sh`.

即要求`marco`保存当前工作目录，`polo`返回`marco`保存的工作目录。


考虑到可以进行变量定义，所以`macro`只需要定义一个保存当前目录的变量，`polo`只需要`cd`到这个变量定义的目录。


```bash
marco(){
    MARCO_DIR=$(pwd)
}

polo(){
    cd $MARCO_DIR
}
```

也可以在`marco`中使用`export MARCO_DIR=$(pwd)`来定义变量,`export`定义的变量是全局变量，可以在子进程中使用

如果没有使用`export`，则我在zsh中`marco`了一次后，然后输入`bash`，在bash中执行`echo $MARCO_DIR`什么都不会输出

如果使用了`export`，则我在zsh中`marco`了一次后，然后输入`bash`，在bash中执行`echo $MARCO_DIR`会输出我之前`marco`的目录。

>注意修改了之后需要source才会生效
 
???info "source"
    在 shell 中，`source` 命令用于在当前 shell 会话中执行一个脚本文件中的命令，而不创建新的子进程。这意味着所有在脚本中定义的变量、函数和环境设置都会直接影响 **当前 shell 会话** 。
    

    与执行脚本的区别: 如果直接执行脚本，会在一个 **新的子进程** 中运行，脚本中的变量和函数不会影响当前 shell。

    即如果我写了一个`cd ~`命令进一个文件comehome，然后执行`source comehome`，那么我确实进入了`~`目录，但是如果我直接执行`./comehome`，那么不会进入`~`目录。


3. Say you have a command that fails rarely. In order to debug it you need to capture its output but it can be time consuming to get a failure run. Write a bash script that runs the following script until it fails and captures its standard output and error streams to files and prints everything at the end. Bonus points if you can also report how many runs it took for the script to fail.

```bash
#!/usr/bin/env bash

 n=$(( RANDOM % 100 ))

 if [[ n -eq 42 ]]; then
    echo "Something went wrong"
    >&2 echo "The error was using magic numbers"
    exit 1
 fi

 echo "Everything went according to plan"
```

`n=$(( RANDOM % 100 ))` 表示生成一个0到99之间的随机数,使用两个括号是bash的特性，表示计算表达式。



即要求我写一个脚本，运行这个脚本直到它失败，并捕获它的标准输出和错误流到文件中，最后打印所有内容。

这个脚本在结束时会把错误信息输出到标准错误流，所以我们可以使用`2>`来捕获错误流。

如下

首先将其保存为`script.sh`

然后创建我们的脚本`run.sh`，首先创建一个`while`循环，然后创建一个`if`条件，如果脚本运行失败，则退出循环，否则就一直运行，把标准输出和错误流分别重定向到`output.txt`和`error.txt`。



```bash
#!/usr/bin/env bash
while true; do
    ./script.sh >> output.txt 2>> error.txt
    if [[ $? -ne 0 ]]; then
        echo "Script failed, retrying..."
        break
    fi
done
```

这样就基本完成了,如果想要计算运行了多少次，可以再创建一个变量，在每次运行后加一。

一开始我的想法是这样的
```bash
count=0
while true; do
    ./script.sh >> output.txt 2>> error.txt
    count=$(($count + 1))
    if [[ $? -ne 0 ]]; then
        echo "Script failed, retrying...,$count times"
        break
    fi
done
```
但是这样会导致上一条命令的`$?`变为`count+1`的值，所以需要调换一下位置


```bash
count=0
while true; do
    count=$(($count + 1))
    ./script.sh >> output.txt 2>> error.txt
    if [[ $? -ne 0 ]]; then
        echo "Script failed, retrying...,$count times"
        break
    fi
done
```

!!!Warning
    这里`./run.sh`结束脚本后使用`echo $count`并不会显示任何值，因为直接执行脚本会创建新的进程，所以如果想要在脚本结束后`echo $count`来查看，需要使用`source run.sh`来执行脚本。


4.As we covered in the lecture find’s -exec can be very powerful for performing operations over the files we are searching for. However, what if we want to do something with all the files, like creating a zip file? As you have seen so far commands will take input from both arguments and STDIN. When piping commands, we are connecting STDOUT to STDIN, but some commands like tar take inputs from arguments. To bridge this disconnect there’s the xargs command which will execute a command using STDIN as arguments. For example ls | xargs rm will delete the files in the current directory.

Your task is to write a command that recursively finds all HTML files in the folder and makes a zip with them. Note that your command should work even if the files have spaces (hint: check -d flag for xargs).

If you’re on macOS, note that the default BSD find is different from the one included in GNU coreutils. You can use -print0 on find and the -0 flag on xargs. As a macOS user, you should be aware that command-line utilities shipped with macOS may differ from the GNU counterparts; you can install the GNU versions if you like by using brew.

即要求我们写一个命令，递归地找到当前目录下的所有HTML文件，并把它们压缩成一个zip文件。提示是`xargs`的`-d`参数。


首先查看一下`xargs`命令，`xargs`命令可以接受标准输入作为参数，然后执行命令。

>tips:这里解决了我的一个疑问，之前我使用`ls | echo`不会echo任何东西，但是使用`ls | xargs echo`会echo所有文件名。这是因为`echo`以命令行参数的形式接受输入，所以不会接受标准输入，而`xargs`以标准输入作为参数，转化为命令行参数传递给`echo`,所以成功了


首先递归找到当前目录下的所有HTML文件

```bash
find . -type f -name "*.html"
```

然后使用`xargs`来压缩这些文件

即使文件名中包含空格，使用`xargs -d`也可以正确处理。

```bash
touch {1..10}.html 
find . -type f -name "*.html" | xargs -d '\n' zip -r archive.zip
```

5.(Advanced) Write a command or script to recursively find the most recently modified file in a directory. More generally, can you list all files by recency?

即要求我们写一个命令或脚本，递归地找到当前目录下最近修改的文件，或者列出所有文件按修改时间排序。

可以使用`ls -t`来列出所有文件按修改时间排序

```bash
find . -type f | xargs ls -lt
```

如果没有`xargs`，则`ls -lt`会接受不到参数，直接执行了`ls -lt`



































































