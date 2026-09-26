"""统一图表语义：分类用离散色，数量用连续色，误差以零为中心。"""
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

COLORS = ['#2563a6', '#b45309', '#087f8c', '#8b5ca6', '#60733d', '#b34765', '#4d5966', '#a17324', '#497e76', '#735c9c']
px.defaults.color_discrete_sequence = COLORS
px.defaults.template = 'plotly_white'


def style(fig, title=None):
    fig.update_layout(font=dict(family='Arial, sans-serif', size=13, color='#243044'),
                      margin=dict(l=48, r=20, t=55 if title else 25, b=45),
                      paper_bgcolor='white', plot_bgcolor='white',
                      legend_title_text='', hovermode='closest')
    names = {'train_accuracy':'训练准确率', 'valid_accuracy':'验证准确率', 'train_loss':'训练损失', 'valid_loss':'验证损失', 'train_mae':'训练误差', 'valid_mae':'验证误差'}
    for trace in fig.data:
        if trace.name in names:
            trace.name = names[trace.name]
    if title:
        fig.update_layout(title=dict(text=title, font=dict(size=17)))
    fig.update_xaxes(gridcolor='#eef0f3', zeroline=False)
    fig.update_yaxes(gridcolor='#eef0f3', zeroline=False)
    return fig


def chart(fig, key=None, select=False):
    return st.plotly_chart(style(fig), width='stretch', key=key, theme=None,
                           on_select='rerun' if select else 'ignore',
                           selection_mode='points', config={'displaylogo': False})


def matrix(values, labels, title='混淆矩阵'):
    fig = px.imshow(values, x=labels, y=labels, text_auto=True,
                    color_continuous_scale='Blues', zmin=0,
                    labels=dict(x='预测类别', y='真实类别', color='样本数'), aspect='auto')
    return style(fig, title)


def animation(frames, title, x_title, y_title, duration=450):
    """帧列表为同构 trace 列表；固定坐标由调用者设置。"""
    fig = go.Figure(data=frames[0], frames=[go.Frame(data=f, name=str(i)) for i, f in enumerate(frames)])
    fig.update_layout(updatemenus=[dict(type='buttons', direction='left', x=0, y=-0.2,
        buttons=[dict(label='播放', method='animate', args=[None, dict(frame=dict(duration=duration, redraw=True), fromcurrent=True, transition=dict(duration=0))]),
                 dict(label='暂停', method='animate', args=[[None], dict(mode='immediate', frame=dict(duration=0, redraw=False))]),
                 dict(label='重置', method='animate', args=[['0'], dict(mode='immediate', frame=dict(duration=0, redraw=True))])])],
        sliders=[dict(y=-0.08, currentvalue=dict(prefix='步骤 '), steps=[dict(label=str(i), method='animate', args=[[str(i)], dict(mode='immediate', frame=dict(duration=0, redraw=True))]) for i in range(len(frames))])],
        xaxis_title=x_title, yaxis_title=y_title, height=540)
    return style(fig, title)
