import plotly.express as px
import streamlit as st
from common.charts import chart
from common.ui import run_panel,sample_detail
from .experiment import run

def render(mode):
    st.caption('合成质检数据：用正常历史批次训练，再查找温度与重量关系异常的新批次。真实标签只用于评价。')
    quantile=st.select_slider('正常校准集分位数（越高越少报警）',[.8,.9,.95,.98,.99],value=.95)
    seed=st.number_input('数据种子',0,9999,42)
    r=run_panel('anomaly',mode,dict(quantile=quantile,seed=seed),lambda fn:run(fn,quantile,seed))
    if r is None:return
    a,b,c,d=st.columns(4)
    a.metric('报警准确率',f"{r['metrics']['precision']:.1%}");b.metric('异常召回率',f"{r['metrics']['recall']:.1%}")
    c.metric('误报',r['metrics']['false_alarms']);d.metric('漏报',r['metrics']['missed'])
    samples=r['samples'].assign(状态=r['samples']['报警'].map({True:'报警',False:'正常'}),样本=r['samples'].index)
    reveal=st.checkbox('揭开真实异常标签')
    if reveal:samples['真相']=samples['真实异常'].map({True:'异常',False:'正常'})
    fig=px.scatter(samples,x='温度 / °C',y='重量 / g',color='状态',symbol='真相' if reveal else '状态',custom_data=['样本'],color_discrete_map={'正常':'#2563a6','报警':'#b45309'})
    event=chart(fig,key='anomaly_points',select=True)
    chosen=event.selection.points[0]['customdata'][0] if event.selection.points else None
    shown=samples if reveal else samples.drop(columns='真实异常')
    sample_detail(shown,'anomaly_sample',chosen)
    hist=px.histogram(samples,x='异常分数',color='状态',barmode='overlay',opacity=.65,nbins=30)
    hist.add_vline(x=r['threshold'],line_dash='dash',annotation_text='报警阈值')
    chart(hist)
    st.caption('报警准确率 = 真异常 / 全部报警；召回率 = 找到的异常 / 全部异常。阈值来自独立正常校准集，不使用新批次标签。')
