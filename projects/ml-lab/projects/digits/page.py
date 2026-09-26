import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st
from sklearn.metrics import accuracy_score, confusion_matrix
from common.ui import run_panel, error, record_final
from common.charts import chart, matrix
from .experiment import train, predict, perturb


def render(mode):
    framework = st.selectbox('训练框架', ['scikit-learn', 'PyTorch', 'TensorFlow'])
    st.caption('scikit-learn：可运行基线；PyTorch：网络和训练步骤练习；TensorFlow：完整接口对照。练习模式均调用你填写的 normalize。')
    c1, c2, c3, c4 = st.columns(4)
    hidden = c1.selectbox('隐藏层宽度', [8, 32, 64, 128], index=1)
    epochs = c2.slider('训练轮数', 5, 100, 30, step=5)
    learning_rate = c3.selectbox('学习率', [.0001, .001, .01], index=1)
    seed = c4.number_input('训练种子', min_value=0, max_value=9999, value=42)
    params = dict(framework=framework, hidden=hidden, epochs=epochs, learning_rate=learning_rate, seed=seed)
    result = run_panel('digits', mode, params, lambda fn: train(fn, **params))
    if result is None:
        return
    c1, c2 = st.columns(2)
    with c1:
        chart(px.line(result['curves'].melt(id_vars='epoch', value_vars=['train_loss', 'valid_loss']), x='epoch', y='value', color='variable', labels=dict(epoch='训练轮', value='交叉熵损失', variable='数据划分')))
    with c2:
        chart(px.line(result['curves'].melt(id_vars='epoch', value_vars=['train_accuracy', 'valid_accuracy']), x='epoch', y='value', color='variable', labels=dict(epoch='训练轮', value='准确率', variable='数据划分')).update_yaxes(range=[0, 1]))
    sample = result['samples']
    chart(matrix(confusion_matrix(sample.actual, sample.predicted, labels=range(10)), list(map(str, range(10)))))
    st.subheader('错题与样本')
    category = st.selectbox('真实数字筛选', ['全部'] + list(range(10)))
    only_wrong = st.checkbox('只看错题', value=True)
    shown = sample[sample.actual != sample.predicted] if only_wrong else sample
    if category != '全部':
        shown = shown[shown.actual == category]
    if shown.empty:
        st.info('当前筛选没有样本；可取消“只看错题”查看其他图像。')
    else:
        page = st.number_input('错题墙页码', min_value=1, max_value=max(1, (len(shown)+11)//12), value=1)
        ids = shown.index[(page-1)*12:page*12]
        fig = make_subplots(rows=(len(ids)+3)//4, cols=4,
            subplot_titles=[f'#{i} · {sample.loc[i,"actual"]} → {sample.loc[i,"predicted"]}' for i in ids])
        for pos, sample_id in enumerate(ids):
            fig.add_trace(go.Heatmap(z=result['X'][sample_id].reshape(8, 8), zmin=0, zmax=1, colorscale='Greys', reversescale=True, showscale=False), row=pos//4+1, col=pos%4+1)
        fig.update_xaxes(showticklabels=False, constrain='domain'); fig.update_yaxes(showticklabels=False, autorange='reversed')
        fig.update_layout(height=220*((len(ids)+3)//4))
        chart(fig)
        selected = st.selectbox('查看样本编号', shown.index.tolist())
        image = result['X'][selected].reshape(8, 8)
        c1, c2 = st.columns(2)
        noise = c1.slider('噪声标准差（像素范围 0—1）', 0., .5, 0., step=.05)
        shift = c2.slider('水平平移 / 像素', -2, 2, 0)
        changed = perturb(image, noise, shift)
        with c1:
            chart(px.imshow(image, color_continuous_scale='gray', zmin=0, zmax=1, title='原图', aspect='equal'), key='digits_original')
        with c2:
            chart(px.imshow(changed, color_continuous_scale='gray', zmin=0, zmax=1, title='扰动后', aspect='equal'), key='digits_changed')
        probabilities = predict(result, np.stack([image.ravel(), changed.ravel()]))
        frame = pd.DataFrame({'数字': list(map(str, range(10))), '原图': probabilities[0], '扰动后': probabilities[1]})
        chart(px.bar(frame.melt(id_vars='数字', var_name='输入', value_name='概率'), x='数字', y='概率', color='输入', barmode='group').update_yaxes(range=[0, 1]))
        with st.expander('查看归一化像素矩阵'):
            st.dataframe(pd.DataFrame(changed))
    st.subheader('最终测试')
    if st.button('确认当前配置并打开测试结果', key='digits_test'):
        try:
            ids = result['test_ids']
            pred = predict(result, result['X'][ids]).argmax(1)
            actual = result['data'].target[ids]
            record_final('digits', mode, result, {'test_accuracy':float(accuracy_score(actual,pred))}, {'predictions': pd.DataFrame({'sample':ids, 'actual':actual, 'predicted':pred})})
            st.session_state['digits_final'] = (result['_signature'], float(accuracy_score(actual, pred)), confusion_matrix(actual, pred, labels=range(10)))
        except Exception as exc:
            error(exc)
    final = st.session_state.get('digits_final')
    if final and final[0] == result['_signature']:
        st.metric('最终测试准确率', f'{final[1]:.1%}')
        chart(matrix(final[2], list(map(str, range(10))), '测试集混淆矩阵'))
