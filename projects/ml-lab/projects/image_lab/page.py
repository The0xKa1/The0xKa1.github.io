import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from common.image_ui import input_image,show_image
from common.charts import chart
from common.ui import run_panel
from .experiment import run

def render(mode):
    image,digest=input_image('image_upload')
    c1,c2=st.columns(2)
    brightness=c1.slider('亮度偏移',-.5,.5,0.,step=.05)
    contrast=c2.slider('对比度',0.,3.,1.,step=.1)
    noise=c1.slider('噪声强度',0.,.5,.12,step=.01)
    size=c2.select_slider('均值滤波窗口',[1,3,5,9,15],value=3)
    seed=st.number_input('噪声种子',0,9999,42)
    params=dict(image=digest,brightness=brightness,contrast=contrast,noise=noise,size=size,seed=seed)
    r=run_panel('image_lab',mode,params,lambda fn:run(fn,image,brightness,contrast,noise,size,seed))
    if r is None: return
    st.subheader('先看调整，再看降噪的代价')
    for pair in [[('原始彩色图','image'),('亮度与对比度','adjusted')],[('加噪灰度图','noisy'),('均值滤波结果','smooth')]]:
        for col,(title,field) in zip(st.columns(2),pair):
            with col: show_image(r[field],title,'img_'+field)
    a,b=st.columns(2);a.metric('加噪 MSE',f"{r['metrics']['noisy_mse']:.4f}");b.metric('滤波 MSE',f"{r['metrics']['filtered_mse']:.4f}")
    st.caption('MSE 相对原始灰度图计算，越小越接近原图。窗口增大可能抹掉边缘；无噪声时滤波也会造成失真。')
    with st.expander('像素剖面：为什么变模糊了？',expanded=True):
        row=st.slider('观察第几行像素',0,image.shape[0]-1,image.shape[0]//2)
        frame=pd.DataFrame({'像素列':np.arange(image.shape[1]),'原始':r['gray'][row],'加噪':r['noisy'][row],'滤波':r['smooth'][row]})
        chart(px.line(frame,x='像素列',y=['原始','加噪','滤波']).update_yaxes(range=[0,1],title='亮度'))
        show_image(np.clip(r['edge'],0,1),'原图边缘强度（显示上限 1）','img_edges')
    st.download_button('下载当前像素剖面 CSV',frame.to_csv(index=False).encode('utf-8-sig'),'pixels.csv')
