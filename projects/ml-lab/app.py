"""python -m streamlit run app.py"""
import importlib
import streamlit as st
from common.ui import lesson, history_panel

st.set_page_config(page_title='坤坤的食品实验室', page_icon='🧪', layout='wide')
st.markdown('''<style>
.stApp {background:#fff;color:#253044}
.block-container {max-width:1160px;padding-top:2.5rem;padding-bottom:4rem}
h1 {font-size:2rem!important;letter-spacing:-.03em;font-weight:650!important}
h2 {font-size:1.4rem!important;margin-top:1.5rem!important}
h3 {font-size:1.12rem!important}
[data-testid="stSidebar"] {background:#f7f8fa;border-right:1px solid #e5e7eb}
[data-testid="stMetricValue"] {font-size:1.7rem}
.stButton button {border-radius:6px;box-shadow:none}
[data-testid="stCaptionContainer"], [data-testid="stCaptionContainer"] p {color:#566174!important}
</style>''', unsafe_allow_html=True)
PROJECTS = {
    '01 图像处理工作台': ('image_lab', '加噪、降噪和边缘：一张图是怎样变清楚或变模糊的？'),
    '02 分类边界擂台': ('classification_arena', '三种模型，同一批点，谁能绕过弯？'),
    '03 葡萄酒分类': ('wine_classification', '把分类方法用到真实的成分数据。'),
    '04 酒精含量预测': ('wine_regression', '误差到底大在哪里？'),
    '05 聚类与降维': ('clustering', '一组点是怎样形成的？'),
    '06 图片颜色压缩': ('color_compression', '只留下八种颜色，还能认出原图吗？'),
    '07 数字识别': ('digits', '训练之后，再看看错题。'),
    '08 零食推荐器': ('recommender', '改一点偏好，推荐会怎样变化？'),
    '09 异常批次侦探': ('anomaly', '宁可多报警，还是少漏掉异常？'),
    '10 格子导航': ('gridworld', '画一张地图，让机器人把样品送到终点。'),
}
st.sidebar.title('食品实验室')
st.sidebar.caption('机器学习实践 / 十个实验')
selection = st.sidebar.radio('选择实验', ['开始与环境配置'] + list(PROJECTS))
mode = st.sidebar.radio('运行模式', ['演示', '练习'])
st.sidebar.divider()
st.sidebar.write('先观察演示，再填写函数。')
st.sidebar.caption('演示调用参考实现；练习只调用自己的 exercises.py。')
if selection == '开始与环境配置':
    from pathlib import Path
    st.caption('坤坤的食品实验室 · 机器学习实践')
    st.title('从一张图片开始，亲手做出十个实验')
    st.write('第一次使用，先读下面的环境配置。已经启动成功，可以从左侧选择实验，点击“运行实验”看效果。')
    route,setup=st.tabs(['实验路线','环境配置 · 从零开始'])
    with route:
        for title,(_,description) in PROJECTS.items():
            st.subheader(title)
            st.write(description)
        st.info('推荐顺序：图像处理 → 分类边界 → 聚类 → 图片压缩；再选择数字识别、推荐或导航。每个实验均可独立运行。')
    with setup: st.markdown((Path(__file__).parent/'GETTING_STARTED.md').read_text())
else:
    project, subtitle = PROJECTS[selection]
    st.caption('坤坤的食品实验室 · 机器学习实践')
    st.title(selection[3:])
    st.write(subtitle)
    st.caption('当前：参考实现演示' if mode == '演示' else '当前：我的实现')
    lesson(project)
    importlib.import_module(f'projects.{project}.page').render(mode)
    history_panel(project)
