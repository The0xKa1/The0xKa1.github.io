"""在这里完成练习。参考实现位于 solutions/，页面不会自动代填。"""
import numpy as np


def normalize(images):
    """输入 (N,8,8) 或 (N,64) 像素，范围 0..16；返回 float32 (N,64)，范围 0..1。

    非法形状或范围抛 ValueError，不用数据集统计量做缩放。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('normalize')


def build_network(hidden=32):
    """返回 PyTorch 网络：Linear(64,hidden) → ReLU → Linear(hidden,10)。

    最后一层返回 logits（未归一化的类别得分），交叉熵内部负责归一化。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('build_network')


def train_step(model, optimizer, x, y):
    """完成一个批次训练，返回 float 损失。x 是 float32 Tensor，y 是 long Tensor。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('train_step')


def evaluate(model, x):
    """评价：返回 (predictions, probabilities) 两个 numpy 数组，形状 (N,) 和 (N,10)。

    使用 eval 和 no_grad，不更新参数；对 logits 做 softmax 得到概率。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('evaluate')
