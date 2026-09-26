import pandas as pd
import plotly.express as px
import streamlit as st
from common.charts import chart
from common.ui import run_panel,sample_detail
from .experiment import run,catalog,FEATURES,NAMES

def render(mode):
    st.caption('这是人工设定属性的教学菜单，不是真实用户行为或营养建议。改变偏好，观察谁进入前五名。')
    prefs=[col.slider(feature,0,10,value) for col,feature,value in zip(st.columns(4),FEATURES,[8,3,7,4])]
    excluded_names=st.multiselect('已经尝过，暂不推荐',NAMES,default=['原味曲奇'])
    excluded=[NAMES.index(name) for name in excluded_names]
    r=run_panel('recommender',mode,dict(preferences=prefs,excluded=excluded,count=5),lambda fn:run(fn,prefs,excluded,5))
    if r is None: return
    if not any(prefs): st.info('没有偏好时所有匹配分数为 0；同分按菜单原顺序显示。')
    if r['ranked'].empty: st.info('所有食品都已排除，可以取消一些选择。');return
    chart(px.bar(r['ranked'],x='匹配分数',y='食品',orientation='h').update_xaxes(range=[0,1]).update_yaxes(autorange='reversed'))
    idx=sample_detail(r['ranked'],'recommend_item')
    frame=pd.DataFrame({'属性':FEATURES,'你的偏好':r['profile'],'食品属性':r['catalog'].loc[idx,FEATURES].astype(float).to_numpy()})
    chart(px.bar(frame.melt(id_vars='属性'),x='属性',y='value',color='variable',barmode='group').update_yaxes(range=[0,1],title='属性强度'))
    st.caption('余弦相似度比较偏好方向。试试把全部偏好同时减半：排序为什么基本不变？')
    with st.expander('完整教学菜单'): st.dataframe(r['catalog'],hide_index=True)
