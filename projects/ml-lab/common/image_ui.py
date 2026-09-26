import hashlib
import streamlit as st
import plotly.express as px
from common.pictures import read_image
from common.charts import chart

def input_image(key):
    upload=st.file_uploader('换成自己的图片（PNG / JPG，自动缩小）',type=['png','jpg','jpeg'],key=key)
    image=read_image(upload)
    return image,hashlib.sha256(image.tobytes()).hexdigest()

def show_image(array,title,key):
    fig=px.imshow(array,zmin=0,zmax=1,color_continuous_scale='gray',labels=dict(x='像素列',y='像素行',color='亮度'))
    fig.update_layout(title=title,coloraxis_showscale=False,height=300)
    fig.update_xaxes(showticklabels=False);fig.update_yaxes(showticklabels=False)
    chart(fig,key=key)
