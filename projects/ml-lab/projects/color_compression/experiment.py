import numpy as np
import pandas as pd

def run(fn,image,colors=8,seed=42):
    pixels=image.reshape(-1,3)
    rng=np.random.default_rng(seed)
    sample=pixels[rng.choice(len(pixels),min(5000,len(pixels)),replace=False)]
    palette=fn.fit_palette(sample,colors,seed)
    compressed=fn.reconstruct(image,palette)
    error=fn.mse(image,compressed)
    if palette.shape!=(colors,3) or compressed.shape!=image.shape: raise ValueError('调色板或重建图形状不正确')
    n=len(pixels);bits=max(1,int(np.ceil(np.log2(colors))))
    ratio=n*24/(n*bits+colors*24)
    rows=[]
    for k in sorted(set([2,4,8,16,colors])):
        p=palette if k==colors else fn.fit_palette(sample,k,seed)
        rows.append(dict(colors=k,mse=fn.mse(image,fn.reconstruct(image,p))))
    return dict(image=image,compressed=compressed,palette=palette,curve=pd.DataFrame(rows),
                metrics=dict(mse=error,theoretical_ratio=ratio,colors=colors))
