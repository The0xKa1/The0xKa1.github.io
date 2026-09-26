"""数字识别参考实现；导入本文件不要求安装 PyTorch。"""
import numpy as np


def normalize(images):
    """输入 (N,8,8) 或 (N,64) 像素，范围 0..16；返回 float32 (N,64)，范围 0..1。

    非法形状或范围抛 ValueError，不用数据集统计量做缩放。
    """
    images = np.asarray(images)
    if images.ndim not in (2, 3) or (images.ndim == 2 and images.shape[1] != 64) or (images.ndim == 3 and images.shape[1:] != (8, 8)):
        raise ValueError('输入需要 (N,8,8) 或 (N,64)')
    if not np.isfinite(images).all() or (images < 0).any() or (images > 16).any():
        raise ValueError('像素须为 0..16 的有限数值')
    return images.reshape(-1, 64).astype('float32') / 16.


def build_network(hidden=32):
    """返回 PyTorch 网络：Linear(64,hidden) → ReLU → Linear(hidden,10)。

    最后一层返回 logits（未归一化的类别得分），交叉熵内部负责归一化。
    """
    from torch import nn
    return nn.Sequential(nn.Linear(64, hidden), nn.ReLU(), nn.Linear(hidden, 10))


def train_step(model, optimizer, x, y):
    """完成一个批次训练，返回 float 损失。x 是 float32 Tensor，y 是 long Tensor。"""
    import torch.nn.functional as F
    model.train()
    optimizer.zero_grad()
    loss = F.cross_entropy(model(x), y)
    loss.backward()
    optimizer.step()
    return float(loss.detach())


def evaluate(model, x):
    """评价：返回 (predictions, probabilities) 两个 numpy 数组，形状 (N,) 和 (N,10)。

    使用 eval 和 no_grad，不更新参数；对 logits 做 softmax 得到概率。
    """
    import torch
    model.eval()
    with torch.no_grad():
        probabilities = torch.softmax(model(x), dim=1).cpu().numpy()
    return probabilities.argmax(axis=1), probabilities
