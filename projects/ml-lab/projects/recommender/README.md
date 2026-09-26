# 零食推荐器

坤坤要挑五种零食招待同学。有的人喜欢酥脆，有的人偏爱酸甜。先把口味写成向量，看看推荐名单如何随偏好变化。

## 看演示 → 写函数 → 做对照 → 挑战

1. 拖动四个偏好滑块，观察前五名与属性对照。
2. 完成 similarity 与 rank_items；推荐不能包含已经尝过的项。
3. 比较单一偏好、混合偏好、全零偏好；排除当前第一名后重新运行。
4. 挑战：用点赞食品的平均属性生成偏好向量，加入负反馈。

## 函数接口

### `similarity`

profile 为 D 维偏好向量；features 为 N×D。返回余弦相似度，零向量得 0。

### `rank_items`

返回分数降序的原始行号，排除已选行；同分保持原顺序，最多 count 项。

<details><summary>提示一：思路</summary>

余弦相似度比较向量方向；先算分数，再排除已选项并排序。零向量不能直接除以零。

</details>

<details><summary>提示二：接口</summary>

np.linalg.norm、np.divide(where=...)；np.argsort(-scores,kind="stable")。

</details>

完整实现：`solutions/recommender.py`。练习模式只调用 `projects/recommender/exercises.py`。

## 完成标准

通过函数检查，跑通练习模式；保存至少两次参数不同的实验记录，说明观察到的变化与原因。检查失败时先核对输入与输出，不要只看图是否漂亮。
