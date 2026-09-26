import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from common.charts import chart,COLORS,matrix
from common.ui import run_panel,sample_detail,error,record_final
from common.runtime import load_functions
from sklearn.metrics import confusion_matrix
from .experiment import run,final_test,KINDS

def boundary(r,name):
    axes=r['axes'];z=r['boundaries'][name]
    fig=go.Figure(go.Contour(x=axes[0],y=axes[1],z=z,contours=dict(start=.5,end=.5,size=1),colorscale=[[0,COLORS[0]],[1,COLORS[1]]],opacity=.16,showscale=False,hoverinfo='skip'))
    for label in [0,1]:
        ids=r['valid'][r['y'].loc[r['valid']].to_numpy()==label];X=r['X'].loc[ids]
        fig.add_scatter(x=X.iloc[:,0],y=X.iloc[:,1],mode='markers',name=f'类别 {label}',customdata=ids,marker=dict(color=COLORS[label],symbol=['circle','diamond'][label],size=7),hovertemplate='样本 %{customdata}<extra></extra>')
    fig.update_layout(title=name,height=360,xaxis_title='特征 1',yaxis_title='特征 2',legend=dict(orientation='h',y=-.3,x=0))
    fig.update_xaxes(range=[axes[0][0],axes[0][-1]],constrain='domain');fig.update_yaxes(range=[axes[1][0],axes[1][-1]],scaleanchor='x',scaleratio=1,constrain='domain')
    return fig

def render(mode):
    a,b,c=st.columns(3)
    shape=a.selectbox('点集形状',['同心圆','月牙','交叉棋盘'])
    noise=b.slider('数据噪声',0.,.45,.15,step=.05)
    complexity=c.select_slider('模型复杂度 / C 或树深',[1.,2.,3.,5.,10.,20.],value=3.)
    seed=st.number_input('数据种子',0,9999,42)
    r=run_panel('classification_arena',mode,dict(shape=shape,noise=noise,complexity=complexity,seed=seed),lambda fn:run(fn,shape,noise,complexity,seed))
    if r is None: return
    st.subheader('同一批验证点，三种分界线')
    for col,name in zip(st.columns(3),KINDS):
        with col: chart(boundary(r,name),key='arena_'+name)
    st.caption('点形状与颜色表示真实类别；浅色背景表示预测类别。三个图共享坐标范围。数据固定划分为 60% 训练、20% 验证、20% 测试。')
    chart(px.bar(r['scores'].melt(id_vars='model'),x='model',y='value',color='variable',barmode='group').update_yaxes(range=[0,1],title='准确率').update_xaxes(title='模型'))
    st.dataframe(r['scores'],hide_index=True)
    name=st.selectbox('查看错分与概率',list(r['models']),index=1)
    X=r['X'].loc[r['valid']];actual=r['y'].loc[r['valid']];pred=r['predictions'][name]
    chart(matrix(confusion_matrix(actual,pred,labels=[0,1]),['0','1']))
    table=X.assign(真实类别=actual,预测类别=pred)
    wrong=st.checkbox('仅查看错分',True)
    shown=table[table['真实类别']!=table['预测类别']] if wrong else table
    if shown.empty: st.success('当前验证集没有错分。')
    else:
        idx=sample_detail(shown,'arena_sample')
        prob=r['models'][name].predict_proba(X.loc[[idx]])[0]
        chart(px.bar(x=['类别 0','类别 1'],y=prob,labels=dict(x='类别',y='概率')).update_yaxes(range=[0,1]))
    st.caption('先根据验证结果确定模型，再评价测试集；更换数据形状或种子是一个新实验。')
    if st.button('确定模型并评价测试集',key='arena_test'):
        try:
            value=final_test(load_functions('classification_arena',mode),r,name)
            record_final('classification_arena',mode,r,{'model':name,'test_accuracy':value},{})
            st.session_state['arena_final']=(r['_signature'],name,value)
        except Exception as exc: error(exc)
    final=st.session_state.get('arena_final')
    if final and final[:2]==(r['_signature'],name): st.metric('最终测试准确率',f'{final[2]:.1%}')
