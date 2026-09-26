# 坤坤的食品实验室：机器学习实践

十个可独立运行的实验，一个本地网页。先看演示，再补全 Python 函数，用图表检查自己的结果。

**第一次使用请打开 [从零开始的环境配置教程](GETTING_STARTED.md)**：包含 Windows、macOS、Linux 的按键与命令，解释终端、路径、虚拟环境和常见错误。

| 实验 | 练习目录 |
| --- | --- |
| 图像处理工作台 | `projects/image_lab` |
| 分类边界擂台 | `projects/classification_arena` |
| 葡萄酒分类 | `projects/wine_classification` |
| 酒精含量预测 | `projects/wine_regression` |
| 聚类与降维 | `projects/clustering` |
| 图片颜色压缩 | `projects/color_compression` |
| 数字识别 | `projects/digits` |
| 零食推荐器 | `projects/recommender` |
| 异常批次侦探 | `projects/anomaly` |
| 格子导航 | `projects/gridworld` |

已配置 Python 的读者：在本文件所在目录安装 `requirements.txt`，通过 `python -m streamlit run app.py` 启动。

每个项目包含任务说明、`exercises.py` 和页面，参考实现放在 `solutions`。演示与练习严格分开；练习不会自动调用答案。保存代码后重新点击检查或运行，会加载最新函数。修改代码或参数后旧结果标记为待更新。当前会话记录支持 CSV / JSON 下载，关闭会话前请保存。

基础实验无需 PyTorch / TensorFlow。数字识别可先用 scikit-learn；两个深度学习框架的可选依赖分开安装。所有默认数据随代码生成或来自 scikit-learn，图片上传只在本机处理。

维护检查：`python -m pytest -q`。测试使用临时练习骨架，不会改动读者写好的答案。
