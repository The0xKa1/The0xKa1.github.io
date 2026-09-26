import plotly.express as px
import streamlit as st
from sklearn.datasets import load_wine
from common.charts import chart
from common.ui import run_panel, sample_detail, error, record_final
from common.runtime import load_functions
from .experiment import run, final_test


def render(mode):
    all_features = load_wine(as_frame=True).data.columns.drop('alcohol').tolist()
    features = st.multiselect('输入成分', all_features, default=all_features)
    seed = st.number_input('交叉验证种子', min_value=0, max_value=9999, value=42)
    if not features:
        st.info('至少选择一项成分。'); return
    result = run_panel('wine_regression', mode, dict(features=features, seed=seed), lambda fn: run(fn, features, seed))
    if result is None:
        return
    st.metric('选择的 alpha', result['best'])
    st.caption('下方散点为开发数据的五折折外预测；测试数据尚未参与比较。')
    sample = result['samples'].copy()
    sample['样本'] = sample.index
    fig = px.scatter(sample, x='actual', y='predicted', custom_data=['样本'], labels=dict(actual='实测酒精含量', predicted='预测酒精含量'))
    limits = [min(sample.actual.min(), sample.predicted.min()), max(sample.actual.max(), sample.predicted.max())]
    fig.add_shape(type='line', x0=limits[0], y0=limits[0], x1=limits[1], y1=limits[1], line=dict(color='#777', dash='dash'))
    fig.update_xaxes(range=limits); fig.update_yaxes(range=limits, scaleanchor='x', scaleratio=1)
    event = chart(fig, key='regression_samples', select=True)
    residual_fig = px.scatter(sample, x='predicted', y='residual', labels=dict(predicted='预测酒精含量', residual='残差（实测 − 预测）'))
    residual_fig.add_hline(y=0, line_dash='dash', line_color='#777')
    chart(residual_fig)
    chart(px.histogram(sample, x='residual', nbins=16, labels={'residual': '残差（实测 − 预测）'}).update_yaxes(title='样本数'))
    selected = event.selection.points[0]['customdata'][0] if event.selection.points else None
    sample_detail(sample.reindex(sample.residual.abs().sort_values(ascending=False).index), 'regression_sample', selected)
    st.subheader('参数与误差')
    chart(px.line(result['cv'].melt(id_vars=['alpha', 'valid_std'], value_vars=['train_mae', 'valid_mae']), x='alpha', y='value', color='variable', log_x=True, markers=True).update_yaxes(title='平均绝对误差（酒精含量单位）').update_xaxes(title='alpha（对数尺度）'))
    st.dataframe(result['cv'], hide_index=True)
    chart(px.line(result['coefficients'], x='alpha', y='coefficient', color='feature', log_x=True).update_yaxes(title='标准化输入的回归系数').update_xaxes(title='alpha（对数尺度）'))
    st.dataframe(result['scores'], hide_index=True)
    if st.button('确认配置并评价测试集', key='regression_test'):
        try:
            evaluation = final_test(result, load_functions('wine_regression', mode))
            record_final('wine_regression', mode, result, dict(zip(evaluation[0].model, evaluation[0].mae)), {'predictions': evaluation[1]})
            st.session_state['regression_final'] = (result['_signature'], evaluation)
        except Exception as exc:
            error(exc)
    final = st.session_state.get('regression_final')
    if final and final[0] == result['_signature']:
        st.write('最终测试结果')
        st.dataframe(final[1][0], hide_index=True)
        st.download_button('下载测试预测 CSV', final[1][1].to_csv().encode('utf-8-sig'), 'regression-test.csv', 'text/csv')
