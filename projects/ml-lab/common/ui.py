from datetime import datetime
import json
import traceback
import re
import pandas as pd
import streamlit as st
from common.runtime import ROOT, load_functions, fingerprint, json_default


def lesson(project):
    with st.expander('任务与分级提示', expanded=False):
        content = (ROOT / 'projects' / project / 'README.md').read_text(encoding='utf-8')
        blocks = re.split(r'<details><summary>(.*?)</summary>(.*?)</details>', content, flags=re.S)
        st.markdown(blocks[0])
        for i in range(1, len(blocks), 3):
            with st.expander(blocks[i]):
                st.markdown(blocks[i+1])
            st.markdown(blocks[i+2])
    st.caption(f'编辑 projects/{project}/exercises.py，保存后点击检查或运行。')
    if st.button('检查练习', key=f'{project}_check'):
        from common.checks import check_project
        try:
            reports = check_project(project, load_functions(project, '练习'))
            for report in reports:
                (st.success if report['passed'] else st.warning)(f"{report['function']}：{report['message']}")
        except Exception as exc:
            error(exc)


def error(exc):
    if isinstance(exc, NotImplementedError):
        st.warning(f'待完成：{exc}')
    elif isinstance(exc, ModuleNotFoundError):
        st.error(f'缺少依赖：{exc.name}。数字识别的 PyTorch / TensorFlow 需要分别安装对应 requirements 文件。')
    else:
        st.error(f'{type(exc).__name__}: {exc}')
        with st.expander('查看定位信息'):
            st.code(traceback.format_exc())


def run_panel(project, mode, params, compute):
    """Only an explicit run calls compute. No models are cached across edits."""
    try:
        signature = fingerprint(project, mode, params)
    except Exception as exc:
        error(exc)
        return None
    key = f'result_{project}'
    if st.button('运行实验', type='primary', key=f'run_{project}'):
        st.session_state.pop(key, None)
        try:
            with st.spinner('正在计算…'):
                result = compute(load_functions(project, mode))
            result['_signature'] = signature
            st.session_state[key] = result
            record = dict(project=project, mode=mode, time=datetime.now().isoformat(timespec='seconds'),
                          code=signature[:12], parameters=params, metrics=result.get('metrics', {}),
                          tables={k: v for k, v in result.items() if isinstance(v, pd.DataFrame)})
            history = st.session_state.setdefault('history', [])
            history.append(json.loads(json.dumps(record, default=json_default, ensure_ascii=False)))
        except Exception as exc:
            error(exc)
    result = st.session_state.get(key)
    if result and result['_signature'] != signature:
        st.info('代码、模式、数据或参数已改变；旧结果待更新，请重新运行实验。')
        return None
    return result


def history_panel(project):
    records = [r for r in st.session_state.get('history', []) if r['project'] == project]
    if not records:
        return
    with st.expander(f'实验记录 · {len(records)} 次'):
        table = pd.json_normalize([{k: v for k, v in r.items() if k != 'tables'} for r in records])
        st.dataframe(table, hide_index=True)
        st.download_button('下载完整记录 JSON', json.dumps(records, ensure_ascii=False, indent=2), f'{project}-runs.json', 'application/json')
        st.download_button('下载比较表 CSV', table.to_csv(index=False).encode('utf-8-sig'), f'{project}-runs.csv', 'text/csv')


def sample_detail(table, key, selected=None):
    if table.empty:
        st.info('当前筛选下没有样本。')
        return
    ids = table.index.tolist()
    event_key = f'{key}_last_click'
    if selected in ids and selected != st.session_state.get(event_key):
        st.session_state[key] = selected
        st.session_state[event_key] = selected
    if st.session_state.get(key) not in ids:
        st.session_state[key] = ids[0]
    default = 0
    row = st.selectbox('查看样本编号', ids, index=default, key=key)
    st.dataframe(table.loc[row].rename('值').to_frame(), hide_index=False)
    return row


def record_final(project, mode, result, metrics, tables=None):
    previous = next((r for r in reversed(st.session_state.get('history', [])) if r['project']==project and r['code']==result['_signature'][:12]), {})
    record = dict(project=project, mode=mode, phase='最终评价', time=datetime.now().isoformat(timespec='seconds'),
                  code=result['_signature'][:12], parameters=previous.get('parameters', {}), metrics=metrics, tables=tables or {})
    st.session_state.setdefault('history', []).append(json.loads(json.dumps(record, ensure_ascii=False, default=json_default)))
