# Data Wrangling

>这节课太炫了


Data Wrangling，中文通常翻译为数据整理或数据清洗，是指将原始数据转换为更易于分析和使用的格式的过程。是数据分析和数据科学工作流程中的重要环节，因为高质量的数据是进行有效分析和建模的基础。通过数据整理，可以提高数据的可用性和可靠性，从而为后续的分析和决策提供坚实的基础。

这门课主要演示了各种处理文本数据的方法，以及使用`|`将各种命令连接起来，形成一个管道，从而实现更复杂优雅的数据处理任务。


## 正则表达式

正则表达式(Regular Expression)是一种用于描述字符串模式的表达式。它可以在文本中搜索、替换、插入和删除特定的字符或字符组合。

1. **字符匹配**：
  
      - 普通字符：匹配自身，如 `a` 匹配字符 'a'。
      - 特殊字符：使用反斜杠 `\` 转义，如 `\.` 匹配字符 '.'。
      - `.`：匹配任意一个字符。

2. **字符类**：
  
      - 方括号 `[]`：匹配方括号内的任意一个字符，如 `[abc]` 匹配 'a'、'b' 或 'c'。
      - 范围：使用连字符 `-` 表示范围，如 `[a-z]` 匹配所有小写字母。
      - 否定：在方括号内使用 `^` 表示否定，如 `[^0-9]` 匹配所有非数字字符。

3. **预定义字符类**：
  
      - `\d`：匹配任意数字，相当于 `[0-9]`。
      - `\D`：匹配任意非数字字符，相当于 `[^0-9]`。
      - `\w`：匹配任意字母、数字或下划线字符，相当于 `[a-zA-Z0-9_]`。
      - `\W`：匹配任意非字母、数字或下划线字符，相当于 `[^a-zA-Z0-9_]`。
      - `\s`：匹配任意空白字符（空格、制表符等）。
      - `\S`：匹配任意非空白字符。

4. **量词**：
  
      - `*`：匹配前面的字符零次或多次。`.*`可以匹配任意字符串。
      - `+`：匹配前面的字符一次或多次。
      - `?`：匹配前面的字符零次或一次。
      - `{n}`：匹配前面的字符恰好 n 次。
      - `{n,}`：匹配前面的字符至少 n 次。
      - `{n,m}`：匹配前面的字符至少 n 次，至多 m 次。

5. **位置匹配**：
  
      - `^`：匹配字符串的开头。
      - `$`：匹配字符串的结尾。
      - `\b`：匹配单词边界。
      - `\B`：匹配非单词边界。

6. **分组和引用**：
  
      - 括号 `()`：用于分组，如 `(abc)` 匹配字符串 'abc'，(a|b) 匹配 'a' 或 'b'。
      - 反向引用：使用 `\1`、`\2` 等表示前面分组匹配的内容，如 `(a)(b)\1\2` 匹配 'abab'。
    


## sed

sed 是一种流编辑器，用于处理和转换文本数据。它允许您对文件或标准输入进行各种文本操作，如搜索、替换、插入、删除等。sed 通常用于批量处理文本文件，特别是在需要自动化文本处理任务时。

例如 `sed "s/REGEX/SUBSTITUTION/"`，其中 `REGEX` 部分是我们需要使用的正则表达式，而 `SUBSTITUTION` 是用于替换匹配结果的文本。


即搜寻REGEX，并替换为SUBSTITUTION。

在课程上，jon演示了如何使用sed来处理文本数据。目标是找出ssh的log文件中的用户信息。

大概是这样的信息


```
Jan 17 03:13:00 thesquareplanet.com sshd[2631]: Disconnected from invalid user nameofuser 46.97.239.16 port 55920 [preauth]
```


```bash
sed sed 's/.*Disconnected from //'
```
即会搜索所有包含`Disconnected from`的行，并将其替换为空字符串。


但是如果有人将`user`设置为`Disconnected from`，那么就会导致无法正确处理。

```
Disconnected from invalid user Disconnected from 46.97.239.16 port 55920 [preauth]
```

这是因为在默认情况下，`*`和`+`都是贪婪的，会尽可能多地匹配字符。

所以遇到第二个`Disconnected from`时，会将其与前面的`Disconnected from`一起替换为空字符串。

可任意使用`*?`来取消贪婪，只匹配第一个;

这样匹配了用户名前面的信息，但是还需要匹配用户名后面的信息。

方法是使用`^`和`$`来匹配行首和行尾，进行一整行的匹配。

```bash
sed -E 's/.*Disconnected from (invalid |authenticating )?user .* [^ ]+ port [0-9]+( \[preauth\])?$//'
```

这个的意思是：

- `-E`：使用扩展正则表达式，因为`sed`太老了。
- `.*Disconnected from`：匹配`Disconnected from`。
- `(invalid |authenticating )?`：匹配`invalid`或`authenticating`，即user前面有可能是这俩。
- `user`：匹配`user`。

- `.*`：匹配用户名后面的任意字符

- `[^ ]+`：匹配一个或多个非空白字符(所以可以匹配到`46.97.239.16`)

- `port [0-9]+( \[preauth\])?$`：匹配`port`，然后是1个或多个数字，然后创建一个组来匹配`[preauth]`(使用了`\`来进行转义匹配`[]`)，然后是行尾。

注意在这一正则表达式中空格的位置和原本行的位置是一样的，也就是空格也要被考虑匹配，不然就会匹配不上



这样我们就完全匹配了一整行，但是我们只需要用户名，所以需要将用户名提取出来，方法是使用`()`来创建一个组，然后使用`\2`来引用这个组，`\2`表示第二个组，因为第一个组是`invalid |authenticating`，第二个组才是是`user`跟着的。

```bash
sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
```
通过这种方法，我们终于提取出了所有用户名


!!!Tip
    可以使用[regex debugger](https://regex101.com/r/qqbZqh/2)来理解，从这里我们已经可以看出
正则表达式的编写十分复杂，例如，这里有一篇关于如何匹配电子邮箱地址的文章 [e-mail address](https://www.regular-expressions.info/email.html)，匹配电子邮箱可一点也[不简单](https://emailregex.com/)。网络上还有很多关于如何匹配电子邮箱地址的讨论。人们还为其编写了测试用例及[测试矩阵](https://mathiasbynens.be/demo/url-regex)。您甚至可以编写一个用于判断一个数[是否为质数](https://www.noulakaz.net/2007/03/18/a-regular-expression-to-check-for-prime-numbers/)的正则表达式。

## sort

现在我们通过`sed`提取出了所有用户名，我们还可以利用`sort`来对这些用户名进行排序。

```bash
sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/' ssh.log 
| sort

```
`sort`命令用于对文本文件中的内容进行排序。它可以按字母顺序、数字顺序或其他指定的方式对文件中的行进行排序。默认情况下，`sort`命令会按字母顺序对文本进行排序。


- `-n`：按数值排序。
- `-r`：按相反顺序排序。
- `-u`：去除重复行。
- `-o`：将排序结果输出到指定文件。

## uniq 

`uniq` 命令用于报告或忽略文件中的重复行。它通常与 sort 命令一起使用，用于处理排序后的数据。
例如

```bash
sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/' ssh.log 
| sort
| uniq -c
```

`uniq -c`参数会统计每个用户名出现的次数。

然后再根据这些次数进行排序。

```bash
sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/' ssh.log 
| sort
| uniq -c
| sort -nk1,1
```
`-k1,1` 则表示“仅基于以空格分割的第一列进行排序”。`,n` 部分表示“仅排序到第 n 个部分”，默认情况是到行尾。

如果我们只想要显示出用户名，那么

```bash
sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/' ssh.log 
| sort
| uniq -c
| sort -nk1,1
| awk '{print $2}'
```


## awk

awk 其实是一种编程语言，只不过它碰巧非常善于处理文本。

在上面的例子中

```bash
awk '{print $2}'
```

`awk` 程序接受一个模式串（可选），
以及一个代码块，
指定当模式匹配时应该做何种操作。
默认当模式串即匹配所有行（上面命令中当用法）。 
在代码块中，`$0` 表示整行的内容，
`$1` 到 `$n` 为一行中的 `n` 个区域，区域的分割基于 awk 的域分隔符（
默认是空格，可以通过 `-F` 来修改）。
在这个例子中，我们的代码意思是：对于每一行文本，打印其第二个部分，也就是用户名。

最后，我们还可以接上`paste`来将用户名和用户名出现的次数进行合并。

```bash
sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/' ssh.log 
| sort
| uniq -c
| sort -nk1,1
| awk '{print $2}'
| paste -sd ","
```
即`awk`提取用户名后，`paste`将用户名和用户名出现的次数进行合并，分割符为`,`。

现在，我们统计一下所有以 c 开头，以 e 结尾，并且仅尝试过一次登录的用户。

```bash
 | awk '$1 == 1 && $2 ~ /^c[^ ]*e$/ { print $2 }' | wc -l
```
首先，注意这次我们为 awk 
指定了一个匹配模式串（也就是 `{...} 前面的那部分内容`）。该匹配要求文本的第
一部分需要等于 1（这部分刚好是 `uniq -c` 得到的计数值），然后其第二部分必须满足给定的一个正则表达式。代码块中的内容则表示打印用
户名。然后我们使用 `wc -l` 统计输出结果的行数。

在 `awk` 中，`~` 运算符用于将字段与正则表达式进行匹配。


## bc

`bc` 是一个任意精度计算器语言，通常用于进行数学计算。它允许您执行复杂的算术运算，包括浮点运算。

可以将每行的数字加起来：

```bash
 | paste -sd+ | bc -l
```
下面这种更加复杂的表达式也可以：

```bash
echo "2*($(data | paste -sd+))" | bc -l
```

首先`$(data | paste -sd+)`获取了`data | paste -sd+`的输出，然后把它放在`2*()`中。再传递给`bc`进行计算。`-l`表示使用`bc`的数学库。


如果想要绘制图表，可以使用`gnuplot`。

我们还可以处理二进制数据

```bash
ffmpeg -loglevel panic -i /dev/video0 -frames 1 -f image2 -
 | convert - -colorspace gray -
 | gzip
 | ssh mymachine 'gzip -d | tee copy.jpg | env DISPLAY=:0 feh -'
```

 - `ffmpeg`：一个强大的多媒体框架，用于录制、转换和流式传输音频和视频。
 - `-loglevel panic`：设置日志级别为“panic”，这意味着只显示致命错误。
 - `-i /dev/video0`：指定输入设备，通常是Linux系统上的默认视频捕获设备。
 - `-frames 1`：只捕获视频输入中的一帧。
 - `-f image2 -`：指定输出格式为单个图像，并将其输出到标准输出。
 - `convert`：ImageMagick套件中的一个命令，用于转换和处理图像。
 - `-`：表示输入来自标准输入。
 - `-colorspace gray`：将图像转换为灰度色彩空间。
 - `-`：将处理后的图像输出到标准输出。
 - `gzip`：用于压缩数据的工具。这里将图像数据进行压缩。
 - `ssh mymachine`：通过SSH连接到名为`mymachine`的远程机器。
 - `'gzip -d | tee copy.jpg | env DISPLAY=:0 feh -'`：在远程机器上执行的命令。
 - `gzip -d`：解压缩数据。
 - `tee copy.jpg`：将解压缩后的图像保存为`copy.jpg`，同时将其传递到下一个命令。
 - `env DISPLAY=:0 feh -`：使用`feh`在远程机器的显示器上显示图像，`DISPLAY=:0`指定显示器。

这段代码的整体功能是从本地视频设备捕获一帧图像，转换为灰度，压缩后通过SSH传输到远程机器，并在远程机器上显示该图像。



## Exercise & Solutions

1.Take [this short interactive regex tutorial](https://regexone.com/)

这个没什么好说的，玩一玩,一共十五节入门练习，练习之前会给你介绍一下正则表达式的基本知识

<figure markdown='span'>
![](./img/lec3.png){ width=65% }
<figcaption>Passed</figcaption>
</figure>

2.Find the number of words (in `/usr/share/dict/words`) that contain at least three `a`s and don’t have a `'s` ending. What are the three most common last two letters of those words? `sed`’s `y` command, or the `tr` program, may help you with case insensitivity. How many of those two-letter combinations are there? And for a challenge: which combinations do not occur?


即要求

- 包含至少三个`a`
- 不以`'s`结尾
- 使用`sed`的`y`命令或`tr`程序实现大小写不敏感
- 找出最常见的三个最后两个字母组合
- 找出总共有多少种这样的两个字母组合
- 找出哪些组合没有出现

首先看看`sed`的`y`命令

首先找到包含至少三个`a`的单词

```bash
cat /usr/share/dict/words 
| sed 'y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/'
|grep -E  "^([^a]*a){3}.*$"
|grep -vE "'s$"
| wc -l
```

然后统计这些单词的最后两个字母组合,找出最常见的三种

```bash
cat /usr/share/dict/words 
| sed 'y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/'
|grep -E  "^([^a]*a){3}.*$"
|grep -vE "'s$"
|sed -E "s/.*([a-z]{2})$/\1/"
|sort
|uniq -c
|sort -nk1,1
|head -3
```

3.To do in-place substitution it is quite tempting to do something like `sed s/REGEX/SUBSTITUTION/ input.txt > input.txt`. However this is a bad idea, why? Is this particular to sed? Use man sed to find out how to accomplish this.

`sed s/REGEX/SUBSTITUTION/ input.txt > input.txt` 表达式中后一个 `input.txt` 会首先被清空，而且是发生在前的。所以前面一个 `input.txt` 在还没有被 `sed` 处理时已经为空了。在使用正则处理文件前最好是首先备份文件。

```bash
sed -i.bak 's/REGEX/SUBSTITUTION/' input.txt
```

4.Find your average, median, and max system boot time over the last ten boots. Use journalctl on Linux and log show on macOS, and look for log timestamps near the beginning and end of each boot. On Linux, they may look something like:
```
Logs begin at ...
```
and
```
systemd[577]: Startup finished in ...
```
On macOS, look for:

```
=== system boot:
```
and
```
Previous shutdown cause: 5
```


编写脚本获取最近启动时间


```bash
#!/bin/bash
for i in {1..10}
do
    journalctl -b-$i | grep "Startup finished in" | grep "systemd\[1\]">> boot_time.txt
done
```
然后会得到

```
Feb 05 20:21:43 Kailqq systemd[1]: Startup finished in 1.359s.
Feb 05 16:30:06 Kailqq systemd[1]: Startup finished in 1.342s.
Feb 05 16:44:03 Kailqq systemd[1]: Startup finished in 1.294s.
Feb 05 11:13:19 Kailqq systemd[1]: Startup finished in 1.404s.
Feb 04 15:57:46 Kailqq systemd[1]: Startup finished in 1.409s.
Feb 04 10:45:36 Kailqq systemd[1]: Startup finished in 1.419s.
Feb 03 23:31:58 Kailqq systemd[1]: Startup finished in 1.359s.
Feb 03 19:40:25 Kailqq systemd[1]: Startup finished in 1.372s.
Jan 30 09:36:06 Kailqq systemd[1]: Startup finished in 1.334s.
Jan 27 11:09:24 Kailqq systemd[1]: Startup finished in 3.232s.
Jan 26 21:52:40 Kailqq systemd[1]: Startup finished in 1.333s.
Jan 26 23:11:53 Kailqq systemd[1]: Startup finished in 1.476s.
```
这样只要把最后的时间提取出来就行

```bash
 cat boot_time.txt | sed -E 's/^.*([0-9]+\.[0-9]+)s\.$/\1/' 
 | paste -sd'\n' > timelist.txt
```

!!!Note
    呃啊，本来用的是`\d+\.\d+`来替代`[0-9]+\.[0-9]`, 结果`sed`好像不支持导致搞了好久

这样就得到了时间列表    

```bash
cat timelist.txt
1.359
1.342
1.294
1.404
1.409
1.419
1.359
1.372
1.334
3.232
1.333
1.476
```

计算平均值

```bash
amount=$(cat timelist.txt | wc -l)
sum=$(cat timelist.txt | paste -sd+ | bc -l)
mean=$(echo "scale=2; $sum / $amount" | bc -l)
echo "平均值: $mean"
```

计算中位数

```bash
cat timelist.txt | sort -n | paste -sd\ | awk '{
    split($0, a, " ")
    n = length(a)
    if (n % 2 == 1) {
        median = a[(n + 1) / 2]
    } else {
        median = (a[n / 2] + a[(n / 2) + 1]) / 2
    }
    print median
}'
```

可能需要解释一下这段awk代码：
`split($0, a, " ")` 将输入的每一行按空格分割成一个数组a
`n = length(a)` 获取数组a的长度
`if (n % 2 == 1)` 如果数组a的长度为奇数，则中位数为数组a的中间一个元素
`median = a[(n + 1) / 2]` 如果数组a的长度为奇数，则中位数为数组a的中间一个元素
`median = (a[n / 2] + a[(n / 2) + 1]) / 2` 如果数组a的长度为偶数，则中位数为数组a的中间两个元素的平均值
`print median` 打印中位数

计算最大值

```bash
cat timelist.txt | sort -n | tail -1
```
计算最小值

```bash
cat timelist.txt | sort -n | head -1
```

累了，后面的两题不想做了:sob:

































