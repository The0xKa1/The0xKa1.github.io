import numpy as np
from numpy.lib.stride_tricks import sliding_window_view

def grayscale(image):
    """输入 H×W×3、0..1 RGB；返回 H×W 亮度。例：纯红像素约为 0.2126。"""
    raise NotImplementedError('grayscale')

def adjust(image, brightness, contrast):
    """以 0.5 为中心调整对比度，再加亮度；裁剪到 0..1，不改变形状。"""
    raise NotImplementedError('adjust')

def mean_filter(image, size=3):
    """输入二维灰度图、奇数窗口；边缘复制填充，返回等尺寸窗口均值。"""
    raise NotImplementedError('mean_filter')

def edge_strength(image):
    """返回相邻像素差的梯度幅度，右/下边界差置零；输出 H×W。"""
    raise NotImplementedError('edge_strength')
