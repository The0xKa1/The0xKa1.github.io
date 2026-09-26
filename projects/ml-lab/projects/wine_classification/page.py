import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from common.data import wine_split
from common.charts import chart, matrix, COLORS
from common.ui import run_panel, sample_detail, error, record_final
from common.runtime import load_functions
from .experiment import run, final_test


def render(mode):
    Xdev, _, ydev, _ = wine_split()
    c1, c2 = st.columns(2)
    a = c1.selectbox('横轴成分', Xdev.columns, index=0)
    b = c2.selectbox('纵轴成分', [f for f in Xdev.columns if f != a], index=4)
    c1, c2, c3 = st.columns(3)
    C = c1.select_slider('逻辑回归 C', options=[.01, .1, 1., 10., 100.], value=1.)
    depth = c2.slider('决策树最大深度', 1, 10, 3)
    seed = c3.number_input('验证划分种子', min_value=0, max_value=9999, value=42)
    challenge = st.checkbox('运行进阶：树深度对照')
    params = dict(features=[a, b], C=C, depth=depth, seed=seed, challenge=challenge)
    result = run_panel('wine_classification', mode, params, lambda fn: run(fn, **params))
    if result is None:
        st.caption('固定留出 20% 测试数据；运行后先查看开发数据中的训练与验证结果。')
        return
    st.subheader('两个特征的决策边界')
    ranges, z = result['grid']
    fig = go.Figure(go.Contour(x=ranges[0], y=ranges[1], z=z, contours=dict(start=0, end=2, size=1),
        colorscale=[[0, COLORS[0]], [.5, COLORS[1]], [1, COLORS[2]]], opacity=.16, showscale=False, hoverinfo='skip'))
    for label in range(3):
        selected = result['yv'] == label
        frame = result['Xv'][selected]
        fig.add_trace(go.Scatter(x=frame[a], y=frame[b], name=f'类别 {label}', mode='markers',
            marker=dict(color=COLORS[label], symbol=['circle', 'diamond', 'square'][label], size=9, line=dict(width=1, color='white')),
            customdata=frame.index, hovertemplate='样本 %{customdata}<br>%{x}, %{y}<extra>%{fullData.name}</extra>'))
    fig.update_layout(xaxis_title=a, yaxis_title=b)
    chart(fig, key='classification_boundary')
    st.caption('背景：只用两个所选特征训练的逻辑回归。点：验证样本，按真实类别着色和标记。')
    st.subheader('完整 13 特征模型')
    chart(px.bar(result['scores'].melt(id_vars='model', var_name='split', value_name='accuracy'), x='model', y='accuracy', color='split', barmode='group').update_yaxes(range=[0, 1], title='准确率').update_xaxes(title='模型'))
    st.dataframe(result['scores'], hide_index=True)
    name = st.selectbox('查看模型', list(result['models']), index=1)
    info = result['predictions'][name]
    chart(matrix(info['report']['matrix'], ['0', '1', '2']))
    table = result['Xv'].copy()
    table['真实类别'] = result['yv']
    table['预测类别'] = info['pred']
    for i in range(3):
        table[f'P({i})'] = info['probabilities'][:, i]
    wrong = st.checkbox('只看错分样本', value=True)
    shown = table.iloc[info['report']['wrong']] if wrong else table
    if shown.empty:
        st.success('这个模型在当前验证集上没有错分。')
    else:
        points = shown.assign(类别=shown['真实类别'].astype(str), 样本=shown.index)
        event = chart(px.scatter(points, x=a, y=b, color='类别', symbol='类别', color_discrete_map={str(i): COLORS[i] for i in range(3)}, symbol_map={'0':'circle','1':'diamond','2':'square'}, custom_data=['样本']), key='classification_samples', select=True)
        chosen = event.selection.points[0]['customdata'][0] if event.selection.points else None
        selected_id = sample_detail(shown, 'classification_sample', chosen)
        chart(px.bar(x=['类别 0','类别 1','类别 2'], y=shown.loc[selected_id, ['P(0)','P(1)','P(2)']].to_numpy(), labels=dict(x='类别',y='预测概率')).update_yaxes(range=[0,1]))
    if 'depths' in result:
        chart(px.line(result['depths'].melt(id_vars='depth'), x='depth', y='value', color='variable', markers=True).update_yaxes(range=[0, 1], title='准确率').update_xaxes(title='树深度'))
    st.subheader('最终测试')
    st.caption('选好模型后，用全部开发数据重训，再评价固定留出的测试集。')
    if st.button('确认当前模型并评价测试集', key='classification_test'):
        try:
            report = final_test(result, name, load_functions('wine_classification', mode))
            record_final('wine_classification', mode, result, {'model': name, 'test_accuracy': report['accuracy']}, {'confusion_matrix': report['matrix']})
            st.session_state['classification_final'] = (result['_signature'], name, report)
        except Exception as exc:
            error(exc)
    final = st.session_state.get('classification_final')
    if final and final[:2] == (result['_signature'], name):
        st.metric('最终测试准确率', f"{final[2]['accuracy']:.1%}")
        chart(matrix(final[2]['matrix'], ['0', '1', '2'], '测试集混淆矩阵'))
