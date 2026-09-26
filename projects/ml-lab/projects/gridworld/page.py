import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from common.charts import chart, animation
from common.ui import run_panel, error
from common.runtime import load_functions
from .experiment import MAPS, run, parse_map, rollout
from .board import editor, playback


def render(mode):
    text = editor()
    c1, c2 = st.columns(2)
    episodes = c1.select_slider('训练回合', [10, 100, 500, 2000, 5000], value=2000)
    seed = c2.number_input('随机种子', min_value=0, max_value=9999, value=42)
    strategy = st.radio('探索策略', ['衰减', '固定'], horizontal=True)
    epsilon = st.slider('固定探索率', 0., 1., .1, step=.05, disabled=strategy != '固定')
    params = dict(text=text, episodes=episodes, seed=seed, strategy=strategy, epsilon=epsilon)
    result = run_panel('gridworld', mode, params, lambda fn: run(fn, **params))
    if result is None:
        return
    metrics = result['metrics']
    cols = st.columns(3)
    cols[0].metric('最终贪心策略', '送达' if metrics['success'] else '未送达')
    cols[1].metric('路径步数', metrics['steps']); cols[2].metric('最短步数', metrics['shortest'])
    checkpoint = st.select_slider('回放训练阶段 / 回合', sorted(result['snapshots']), value=max(result['snapshots']))
    q = result['snapshots'][checkpoint]
    kind = st.radio('回放路线', ['贪心评价', '这一回合的探索轨迹'], horizontal=True)
    if kind == '这一回合的探索轨迹' and checkpoint in result['traces']:
        path, records, success = result['traces'][checkpoint]
    else:
        path, records, success = rollout(result['grid'], result['start'], result['goal'], q, seed+1)
        if kind != '贪心评价':
            st.caption('第 0 回合尚无探索轨迹，显示初始价值表的贪心评价。')
    grid = result['grid']
    st.subheader('送样路线回放')
    playback(grid, result['start'], result['goal'], path, records)
    st.subheader('策略与动作价值')
    values = q.max(axis=2).copy(); values[grid == '#'] = np.nan
    heat = go.Figure(go.Heatmap(z=values, colorscale='Cividis', zmin=-20, zmax=10, colorbar=dict(title='最大 Q 值'), hovertemplate='行 %{y}，列 %{x}<br>Q=%{z:.2f}<extra></extra>'))
    for row in range(grid.shape[0]):
        for col in range(grid.shape[1]):
            if grid[row, col] == '#':
                label = ''
                heat.add_shape(type='rect', x0=col-.5, x1=col+.5, y0=row-.5, y1=row+.5, fillcolor='#64748b', line=dict(color='#d0d9e4',width=1))
            elif (row, col) == result['goal']:
                label = '终点'
            else:
                choices = np.flatnonzero(np.isclose(q[row, col], q[row, col].max()))
                label = ''.join('↑→↓←'[a] for a in choices)
            heat.add_annotation(x=col, y=row, text=label, showarrow=False, font=dict(color='#111', size=17), bgcolor='rgba(255,255,255,0.8)')
    heat.update_yaxes(range=[grid.shape[0]-.5,-.5], dtick=1, scaleanchor='x', scaleratio=1, constrain='domain', title='行'); heat.update_xaxes(range=[-.5,grid.shape[1]-.5], dtick=1, constrain='domain', title='列')
    event = chart(heat, key='grid_q', select=True)
    cells = [(r, c) for r in range(grid.shape[0]) for c in range(grid.shape[1]) if grid[r, c] != '#']
    cell = st.selectbox('查看格子 (行, 列)', cells)
    if event.selection.points:
        point = event.selection.points[0]
        selected = (int(point['y']), int(point['x']))
        if selected in cells:
            cell = selected
    st.dataframe(pd.DataFrame({'动作': list('上右下左'), 'Q 值': q[cell]}), hide_index=True)
    st.caption('并列最大值显示多个箭头。颜色范围固定为 −20 到 10，便于比较训练阶段。')
    chart(px.line(result['curve'], x='episode', y='reward', labels=dict(episode='回合', reward='回合奖励')))
    chart(px.line(result['curve'], x='episode', y='success_rate', labels=dict(episode='回合', success_rate='最近 50 回合成功率')).update_yaxes(range=[0, 1]))
    fig = px.line(result['curve'], x='episode', y='mean_steps', labels=dict(episode='回合', mean_steps='最近 50 回合平均步数'))
    fig.add_hline(y=metrics['shortest'], line_dash='dash', annotation_text='BFS 最短距离')
    chart(fig)
    with st.expander('进阶：多地图、多种子对照'):
        st.write('使用三个预设地图、种子 0/1/2，比较衰减探索与固定探索；每项使用当前训练回合数。')
        if st.button('运行 18 组对照', key='grid_benchmark'):
            rows = []
            try:
                fn = load_functions('gridworld', mode)
                with st.spinner('运行对照…'):
                    for name, board in MAPS.items():
                        for trial_seed in [0, 1, 2]:
                            for method in ['衰减', '固定']:
                                r = run(fn, board, episodes, trial_seed, method, epsilon)
                                rows.append(dict(map=name, seed=trial_seed, strategy=method, **r['metrics']))
                st.session_state['grid_benchmark'] = (result['_signature'], pd.DataFrame(rows))
            except Exception as exc:
                error(exc)
        bench = st.session_state.get('grid_benchmark')
        if bench and bench[0] == result['_signature']:
            st.dataframe(bench[1], hide_index=True)
            st.download_button('下载对照 CSV', bench[1].to_csv(index=False).encode('utf-8-sig'), 'grid-comparison.csv', 'text/csv')
