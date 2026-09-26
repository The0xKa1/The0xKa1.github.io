import numpy as np
import pandas as pd

def run(fn, image, brightness=0., contrast=1., noise=.12, size=3, seed=42):
    gray=fn.grayscale(image)
    adjusted=fn.adjust(image,brightness,contrast)
    noisy=np.clip(gray+np.random.default_rng(seed).normal(0,noise,gray.shape),0,1)
    smooth=fn.mean_filter(noisy,size)
    edge=fn.edge_strength(gray)
    for array in [gray,noisy,smooth,edge]:
        if array.shape!=image.shape[:2] or not np.isfinite(array).all(): raise ValueError('输出应为等尺寸有限灰度数组')
    before=float(np.mean((noisy-gray)**2));after=float(np.mean((smooth-gray)**2))
    return dict(image=image,gray=gray,adjusted=adjusted,noisy=noisy,smooth=smooth,edge=edge,
                metrics=dict(noisy_mse=before,filtered_mse=after),
                errors=pd.DataFrame({'图像':['加噪','均值滤波'],'MSE':[before,after]}))
