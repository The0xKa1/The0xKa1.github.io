import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from common.ui import run_panel
from common.charts import chart, animation, COLORS
from .experiment import run


def render(mode):
    c1, c2, c3 = st.columns(3)
    dataset = c1.selectbox('数据', ['二维点集', 'Wine'])
    k = c2.slider('簇数 K', 2, 6, 3)
    seed = c3.number_input('初始中心种子', min_value=0, max_value=9999, value=42)
    scale = st.checkbox('标准化', value=True)
    restarts = st.selectbox('初始化次数（多次为进阶练习）', [1, 5, 10])
    project_first = st.checkbox('先降至二维再聚类', value=False, disabled=dataset != 'Wine') and dataset == 'Wine'
    params = dict(dataset=dataset, k=k, scale=scale, seed=seed, restarts=restarts, project_first=project_first)
    result = run_panel('clustering', mode, params, lambda fn: run(fn, **params))
    if result is None:
        return
    coords = result['coords']
    frames = []
    for i, frame in enumerate(result['frames']):
        centers = frame['display_centers']
        traces = [go.Scatter(x=coords[:, 0], y=coords[:, 1], mode='markers', name='样本',
            marker=dict(color=[COLORS[g] for g in frame['groups']], symbol=[['circle','diamond','square','triangle-up','cross','star'][g] for g in frame['groups']], size=7), text=[f'样本 {j} · 簇 {g}' for j, g in enumerate(frame['groups'])], hovertemplate='%{text}<extra></extra>')]
        for group in range(k):
            path = np.array([f['display_centers'][group] for f in result['frames'][:i+1]])
            traces.append(go.Scatter(x=path[:, 0], y=path[:, 1], mode='lines', name=f'中心 {group} 轨迹', line=dict(color=COLORS[group], dash='dot'), showlegend=False))
        traces.append(go.Scatter(x=centers[:, 0], y=centers[:, 1], mode='markers+text', text=[str(g) for g in range(k)], textposition='top center', name='中心', marker=dict(symbol='x', size=14, color=[COLORS[g] for g in range(k)])))
        frames.append(traces)
    axes = ('主成分 1', '主成分 2') if dataset == 'Wine' else ('特征 1', '特征 2')
    fig = animation(frames, '中心移动与样本分组', *axes)
    for index, frame in enumerate(fig.frames):
        frame.layout = go.Layout(title=dict(text=f"中心移动 · 第 {index} 步 · 组内距离平方和 {result['frames'][index]['inertia']:.2f}"))
    fig.update_xaxes(range=[coords[:, 0].min()-1, coords[:, 0].max()+1])
    fig.update_yaxes(range=[coords[:, 1].min()-1, coords[:, 1].max()+1], scaleanchor='x', scaleratio=1)
    chart(fig, key='clustering_animation')
    if dataset == 'Wine':
        st.caption(('在二维主成分坐标中聚类。' if project_first else '在完整 13 维成分空间聚类，再投影显示；二维重叠不代表原空间重合。') + f" 两个主成分解释方差 {sum(result['pca_variance']):.1%}。")
    chart(px.line(result['curve'], x='iteration', y='inertia', markers=True, labels=dict(iteration='迭代', inertia='组内距离平方和')))
    c1, c2, c3 = st.columns(3)
    c1.metric('手写 K-means 组内距离平方和', f"{result['metrics']['inertia']:.2f}")
    c2.metric('scikit-learn 组内距离平方和', f"{result['metrics']['sklearn_inertia']:.2f}")
    c3.metric('轮廓系数', '无有效分组' if result['metrics']['silhouette'] is None else f"{result['metrics']['silhouette']:.3f}")
    st.caption('指标在实际聚类输入空间计算；改变尺度或降维方式后，距离平方和不直接横向比较。')
    if st.checkbox('揭开真实标签'):
        fig = px.scatter(x=coords[:, 0], y=coords[:, 1], color=result['labels'].astype(str), symbol=result['labels'].astype(str), color_discrete_map={str(i):COLORS[i] for i in range(3)}, labels=dict(x=axes[0], y=axes[1], color='真实类别', symbol='真实类别'))
        fig.update_xaxes(range=[coords[:, 0].min()-1, coords[:, 0].max()+1]); fig.update_yaxes(range=[coords[:, 1].min()-1, coords[:, 1].max()+1], scaleanchor='x', scaleratio=1)
        chart(fig)
        st.metric('调整兰德指数 ARI', f"{result['label_ari']:.3f}")
        st.dataframe(pd.crosstab(pd.Series(result['groups'], name='簇'), pd.Series(result['labels'], name='真实类别')))
