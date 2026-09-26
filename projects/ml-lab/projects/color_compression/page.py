import io
import numpy as np
import pandas as pd
import streamlit as st
import plotly.express as px
from PIL import Image
from common.image_ui import input_image,show_image
from common.charts import chart
from common.ui import run_panel
from .experiment import run

def render(mode):
    image,digest=input_image('palette_upload')
    colors=st.select_slider('只允许多少种颜色',[2,4,8,16,32],value=8)
    r=run_panel('color_compression',mode,dict(image=digest,colors=colors,seed=42),lambda fn:run(fn,image,colors,42))
    if r is None: return
    for col,field,title in zip(st.columns(2),['image','compressed'],['原图','调色板重建']):
        with col:show_image(r[field],title,'palette_'+field)
    show_image(r['palette'][None,:,:].repeat(12,axis=0),'模型找到的颜色','palette_colors')
    a,b=st.columns(2);a.metric('均方误差 MSE',f"{r['metrics']['mse']:.5f}");b.metric('理论存储缩小倍数',f"{r['metrics']['theoretical_ratio']:.1f}×")
    st.caption('理论值按原图 24 bit/像素、索引 ceil(log2 K) bit/像素及调色板开销计算，未计文件头；不是 PNG 或 JPG 的实际压缩率。')
    chart(px.line(r['curve'],x='colors',y='mse',markers=True).update_xaxes(title='调色板颜色数').update_yaxes(title='均方误差',rangemode='tozero'))
    output=io.BytesIO();Image.fromarray(np.uint8(np.clip(r['compressed'],0,1)*255)).save(output,format='PNG')
    st.download_button('下载重建图片 PNG',output.getvalue(),'palette.png','image/png')
