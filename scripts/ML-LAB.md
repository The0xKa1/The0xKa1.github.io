# 更新实验下载包

实验源码独立维护，默认位于笔记仓库旁边的 `ml-lab/`，不作为子模块或嵌套仓库加入本站。

在笔记仓库运行：

```sh
python3 scripts/package-ml-lab.py
```

也可以指定来源：

```sh
python3 scripts/package-ml-lab.py --source /path/to/ml-lab
```

打包逻辑由实验仓库的 `scripts/package.py` 维护。本站只接收 `apps/web/public/downloads/ml-guide/ml-lab.zip`；介绍页与预览图仍在本站维护。网站构建使用已生成的 ZIP，不要求构建环境包含实验源码。
