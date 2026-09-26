import numpy as np
from sklearn.cluster import KMeans

def fit_palette(pixels, colors, seed=42):
    """输入 N×3 RGB（0..1），颜色数 K；返回 K×3 调色板，仅拟合输入像素。"""
    return KMeans(n_clusters=colors,n_init=3,random_state=seed).fit(pixels).cluster_centers_

def reconstruct(image, palette):
    """将 H×W×3 图的每个像素换为最近的调色板颜色，返回相同形状图。"""
    flat=image.reshape(-1,3)
    ids=((flat[:,None,:]-palette[None,:,:])**2).sum(2).argmin(1)
    return palette[ids].reshape(image.shape)

def mse(original, compressed):
    """返回所有像素通道的均方误差；相同图应为 0。"""
    return float(np.mean((original-compressed)**2))
