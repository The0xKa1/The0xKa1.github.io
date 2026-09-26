import pytest
from pathlib import Path
from streamlit.testing.v1 import AppTest
from common.runtime import ROOT

NAMES=['01 图像处理工作台', '02 分类边界擂台', '03 葡萄酒分类', '04 酒精含量预测', '05 聚类与降维', '06 图片颜色压缩', '07 数字识别', '08 零食推荐器', '09 异常批次侦探', '10 格子导航']
IDS=['image_lab', 'classification_arena', 'wine_classification', 'wine_regression', 'clustering', 'color_compression', 'digits', 'recommender', 'anomaly', 'gridworld']

@pytest.mark.parametrize('name,project',list(zip(NAMES,IDS)))
def test_pages_run_and_invalidate(name,project):
    at=AppTest.from_file(str(ROOT/'app.py'), default_timeout=90).run()
    at.sidebar.radio[0].set_value(name).run()
    assert not at.exception
    at.button(key=f'run_{project}').click().run()
    assert not at.exception and not at.error, [e.value for e in at.error]
    assert f'result_{project}' in at.session_state
    assert len(at.session_state['history'])==1
    at.run()
    assert len(at.session_state['history'])==1, '普通重绘不应训练'
    at.sidebar.radio[1].set_value('练习').run()
    assert any('待更新' in x.value for x in at.info)
    at.button(key=f'run_{project}').click().run()
    assert any('待完成' in x.value for x in at.warning)
    assert len(at.session_state['history'])==1
    assert f'result_{project}' not in at.session_state
    assert not at.exception


def test_hot_reload_correct_then_wrong_code(isolated_exercises):
    from common.runtime import source_path
    project='wine_classification'
    path=isolated_exercises[project]
    at=AppTest.from_file(str(ROOT/'app.py'),default_timeout=90).run()
    at.sidebar.radio[0].set_value(NAMES[2]).run()
    at.sidebar.radio[1].set_value('练习').run()
    path.write_text(source_path(project,'演示').read_text())
    at.button(key=f'run_{project}').click().run()
    assert not at.exception and not at.error
    assert len(at.session_state['history'])==1
    # A same-length/same-second change must not be hidden by Python bytecode caching.
    path.write_text(path.read_text().replace('accuracy=float(accuracy_score(y_true, predictions))','accuracy=0.123'))
    at.run()
    assert any('待更新' in x.value for x in at.info)
    at.button(key=f'run_{project}').click().run()
    assert at.session_state[f'result_{project}']['metrics']['逻辑回归']==.123
    at.button(key=f'{project}_check').click().run()
    assert any('evaluate' in x.value and '实际' in x.value for x in at.warning)


def test_parameter_invalidation_and_optional_controls():
    at=AppTest.from_file(str(ROOT/'app.py'),default_timeout=90).run()
    at.sidebar.radio[0].set_value(NAMES[4]).run()
    at.button(key='run_clustering').click().run()
    at.slider[0].set_value(4).run()
    assert any('待更新' in x.value for x in at.info)
    at.button(key='run_clustering').click().run()
    at.checkbox[-1].check().run()
    assert not at.exception
    assert len(at.session_state['history'])==2

@pytest.mark.parametrize('index,button', [(1,'arena_test'),(2,'classification_test'),(3,'regression_test'),(6,'digits_test')])
def test_final_test_outputs_are_recorded(index,button):
    at=AppTest.from_file(str(ROOT/'app.py'),default_timeout=90).run()
    at.sidebar.radio[0].set_value(NAMES[index]).run()
    at.button(key=f'run_{IDS[index]}').click().run()
    at.button(key=button).click().run()
    assert not at.exception and not at.error
    records=at.session_state['history']
    assert records[-1]['phase']=='最终评价' and records[-1]['metrics']


def test_grid_edit_rejects_old_policy():
    at=AppTest.from_file(str(ROOT/'app.py'),default_timeout=90).run()
    at.sidebar.radio[0].set_value(NAMES[9]).run()
    at.button(key='run_gridworld').click().run()
    at.button(key='cell_0_1').click().run()
    at.button(key='cell_1_0').click().run()
    assert any('待更新' in x.value for x in at.info)
    at.button(key='run_gridworld').click().run()
    assert any('不可达' in x.value for x in at.error)
    assert 'result_gridworld' not in at.session_state


def test_image_pixel_selection_does_not_recompute():
    at=AppTest.from_file(str(ROOT/'app.py'),default_timeout=90).run()
    at.sidebar.radio[0].set_value(NAMES[0]).run()
    at.button(key='run_image_lab').click().run()
    at.slider[-1].set_value(10).run()
    assert not at.exception and len(at.session_state['history'])==1


def test_home_has_beginner_setup():
    at=AppTest.from_file(str(ROOT/'app.py')).run()
    assert not at.exception
    text=' '.join(item.value for item in at.markdown)
    assert 'Alt + D' in text and 'Command + 空格' in text and 'Ctrl + Alt + T' in text


@pytest.mark.parametrize('project,name',[(p,n) for p,n in zip(IDS,NAMES) if p in ['image_lab','classification_arena','color_compression','recommender','anomaly']])
def test_new_exercises_correct_and_wrong(isolated_exercises,project,name):
    from common.runtime import source_path
    path=isolated_exercises[project]
    at=AppTest.from_file(str(ROOT/'app.py'),default_timeout=90).run()
    at.sidebar.radio[0].set_value(name).run()
    at.sidebar.radio[1].set_value('练习').run()
    path.write_text(source_path(project,'演示').read_text())
    at.button(key=f'run_{project}').click().run()
    assert not at.exception and not at.error
    assert len(at.session_state['history'])==1
    path.write_text(path.read_text()+"\nraise ValueError('学习者错误示例')\n")
    at.run()
    assert any('待更新' in x.value for x in at.info)
    at.button(key=f'run_{project}').click().run()
    assert any('学习者错误示例' in x.value for x in at.error)
    assert f'result_{project}' not in at.session_state
