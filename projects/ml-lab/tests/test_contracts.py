from types import SimpleNamespace
import numpy as np
import pandas as pd
import pytest
from common.runtime import load_functions
from common.checks import check_project

PROJECTS = ['image_lab', 'classification_arena', 'wine_classification', 'wine_regression', 'clustering', 'color_compression', 'digits', 'recommender', 'anomaly', 'gridworld']

@pytest.mark.parametrize('project', PROJECTS)
def test_reference_contracts(project):
    reports = check_project(project, load_functions(project, '演示'))
    errors = [r for r in reports if not r['passed'] and 'ModuleNotFoundError' not in r['message']]
    assert not errors, errors

@pytest.mark.parametrize('project', PROJECTS)
def test_empty_exercises_are_never_solved_silently(project):
    reports = check_project(project, load_functions(project, '练习'))
    assert not any(r['passed'] for r in reports)
    assert any('待完成' in r['message'] for r in reports)


def test_incorrect_and_alternative_answers():
    fn = load_functions('wine_regression', '演示')
    fn.errors = lambda a,b: {'mae': 0, 'residuals': [0,0]}
    reports = check_project('wine_regression', fn)
    assert not next(r for r in reports if r['function']=='errors')['passed']
    fn.errors = lambda a,b: {'mae': sum(abs(x-y) for x,y in zip(a,b))/len(a), 'residuals': np.array([x-y for x,y in zip(a,b)])}
    assert all(r['passed'] for r in check_project('wine_regression', fn))


def test_clustering_objective_and_label_permutation():
    from projects.clustering.experiment import run
    from sklearn.metrics import adjusted_rand_score
    fn = load_functions('clustering', '演示')
    for dataset in ['二维点集','Wine']:
        result = run(fn,dataset,3,True,42,5,False)
        assert np.all(np.diff(result['curve'].inertia) <= 1e-6)
        assert adjusted_rand_score(result['groups'], (result['groups']+1)%3)==1


def test_navigation_terminal_truncation_and_maps():
    from projects.gridworld.experiment import parse_map, transition, shortest_distance, run, MAPS
    fn=load_functions('gridworld','演示')
    grid,start,goal=parse_map('S#\n.G')
    assert transition(grid,goal,start,1)==(start,-1.,False)
    assert shortest_distance(grid,start,goal)==2
    assert fn.update_value(0,10,np.full(4,999),True)==2
    assert fn.update_value(0,-1,np.full(4,2),False)==pytest.approx(.18)
    with pytest.raises(ValueError, match='不可达'):
        run(fn,'S#\n#G',10)
    for seed in [0,1,2]:
        result=run(fn,MAPS['小 · 4×4'],2000,seed)
        assert result['metrics']['success']
        assert result['metrics']['steps']==result['metrics']['shortest']


def test_supervised_protocol():
    from common.data import wine_split, digits_split
    from projects.wine_classification.experiment import run as classify
    from projects.wine_regression.experiment import run as regress
    from sklearn.datasets import load_wine
    xd,xt,yd,yt=wine_split()
    assert set(xd.index).isdisjoint(xt.index)
    result=classify(load_functions('wine_classification','演示'),['alcohol','flavanoids'],1.,3,42,True)
    assert set(result['Xv'].index).isdisjoint(xt.index)
    assert result['metrics']['逻辑回归']>result['metrics']['多数类基线']
    r=regress(load_functions('wine_regression','演示'),load_wine(as_frame=True).data.columns.drop('alcohol').tolist())
    assert 'alcohol' not in r['Xd'].columns
    assert set(r['samples'].index).isdisjoint(r['Xtest'].index)
    assert r['metrics']['岭回归']<r['metrics']['均值基线']
    data,tr,va,te=digits_split()
    assert len(set(tr)|set(va)|set(te))==len(data.target)
    assert not set(tr)&set(va) and not set(va)&set(te)

@pytest.mark.parametrize('framework',['scikit-learn','PyTorch','TensorFlow'])
def test_digits_framework(framework):
    if framework=='PyTorch': pytest.importorskip('torch')
    if framework=='TensorFlow': pytest.importorskip('tensorflow')
    from projects.digits.experiment import train,predict,perturb
    r=train(load_functions('digits','演示'),framework,32,5,.001,42)
    assert len(r['curves'])==5
    np.testing.assert_allclose(r['probabilities'].sum(1),1,atol=1e-5)
    assert r['metrics']['valid_accuracy']>.5
    original=np.zeros((8,8),dtype='float32'); original[:,7]=1
    assert perturb(original,0,1).sum()==0
