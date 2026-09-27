---
title: 图片颜色压缩
comments: false
statistics: false
---

# 图片颜色压缩

坤坤要把一张水果照片做成小海报，印刷时只能使用有限的颜色。颜色减得太狠，草莓和背景混在一起；留得太多，又失去了压缩的意义。

![果盘照片、有限调色板与重建图像](/images/ml-guide/teaser-color.png)

替这张照片挑一组代表色，用它们重画整张图。尝试不同的颜色数量，比较调色板、还原效果与误差，找出既能认清水果、又足够精简的一版。

## 相关知识

- [数组与形状](./python-data.md#arrays)：把每个像素的 RGB 值当作一个三维数据点。
- [K-means 聚类](../unsupervised.md#kmeans)：把相近的颜色归为一组，用聚类中心充当代表色。
- [均方误差](../linear-models.md#loss)：衡量代表色与原像素之间的差距，比较不同颜色数量的还原效果。

[进入实验：下载完整项目包](/downloads/ml-guide/ml-lab.zip) · [查看全部项目](./index.md)

打开项目后选择「图片颜色压缩」。运行方法见包内 `GETTING_STARTED.md`，原理讲解和练习引导在实验页面里。
