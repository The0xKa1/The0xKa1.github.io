"""无需下载的合成果盘；全部像素由本项目生成。"""
import numpy as np
from PIL import Image

def sample_image(size=128):
    y,x=np.mgrid[:size,:size]/size
    rgb=np.stack([.94-.12*y,.93-.13*y,.88-.12*y],axis=-1)
    plate=((x-.5)/.45)**2+((y-.55)/.34)**2<1
    rgb[plate]=[.98,.98,.96]
    for cx,cy,r,color in [(.35,.48,.18,[.85,.13,.1]),(.63,.57,.2,[.96,.55,.07]),(.49,.73,.12,[.25,.58,.19])]:
        d=np.sqrt((x-cx)**2+(y-cy)**2);mask=d<r
        shade=np.clip(1-.45*d/r+.16*(cx-x)/r,.4,1)
        rgb[mask]=(shade[:,:,None]*np.array(color))[mask]
    return np.clip(rgb,0,1).astype(np.float32)

def read_image(upload):
    if upload is None: return sample_image()
    with Image.open(upload) as im:
        im=im.convert('RGB');im.thumbnail((192,192))
        return np.asarray(im,dtype=np.float32)/255
