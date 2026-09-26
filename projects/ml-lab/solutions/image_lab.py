import numpy as np
from numpy.lib.stride_tricks import sliding_window_view

def grayscale(image):
    """输入 H×W×3、0..1 RGB；返回 H×W 亮度。例：纯红像素约为 0.2126。"""
    return np.asarray(image) @ np.array([.2126,.7152,.0722])

def adjust(image, brightness, contrast):
    """以 0.5 为中心调整对比度，再加亮度；裁剪到 0..1，不改变形状。"""
    return np.clip((np.asarray(image)-.5)*contrast+.5+brightness,0,1)

def mean_filter(image, size=3):
    """输入二维灰度图、奇数窗口；边缘复制填充，返回等尺寸窗口均值。"""
    if size<1 or size%2==0: raise ValueError('窗口必须是正奇数')
    return sliding_window_view(np.pad(image,size//2,mode='edge'),(size,size)).mean(axis=(-2,-1))

def edge_strength(image):
    """返回相邻像素差的梯度幅度，右/下边界差置零；输出 H×W。"""
    dx=np.diff(image,axis=1,append=image[:,-1:])
    dy=np.diff(image,axis=0,append=image[-1:,:])
    return np.sqrt(dx*dx+dy*dy)
