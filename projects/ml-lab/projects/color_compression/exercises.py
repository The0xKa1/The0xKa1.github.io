import numpy as np
from sklearn.cluster import KMeans

def fit_palette(pixels, colors, seed=42):
    """输入 N×3 RGB（0..1），颜色数 K；返回 K×3 调色板，仅拟合输入像素。"""
    raise NotImplementedError('fit_palette')

def reconstruct(image, palette):
    """将 H×W×3 图的每个像素换为最近的调色板颜色，返回相同形状图。"""
    raise NotImplementedError('reconstruct')

def mse(original, compressed):
    """返回所有像素通道的均方误差；相同图应为 0。"""
    raise NotImplementedError('mse')
