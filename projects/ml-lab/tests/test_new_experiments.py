import numpy as np
import pytest
from common.runtime import load_functions
from common.pictures import sample_image


def test_image_filter_improves_noise_but_blurs_clean_edges():
    from projects.image_lab.experiment import run
    fn=load_functions('image_lab','演示');image=sample_image()
    r=run(fn,image)
    assert r['metrics']['filtered_mse']<r['metrics']['noisy_mse']
    clean=run(fn,image,noise=0,size=9)
    assert clean['metrics']['noisy_mse']==0 and clean['metrics']['filtered_mse']>0
    assert np.all((r['adjusted']>=0)&(r['adjusted']<=1))


@pytest.mark.parametrize('shape',['月牙','同心圆','交叉棋盘'])
def test_arena_split_and_visible_nonlinearity(shape):
    from projects.classification_arena.experiment import run
    r=run(load_functions('classification_arena','演示'),shape=shape,noise=.1,complexity=10)
    assert len(set(r['train'])|set(r['valid'])|set(r['test']))==600
    assert not set(r['train'])&set(r['valid']) and not set(r['valid'])&set(r['test']) and not set(r['train'])&set(r['test'])
    assert r['metrics']['RBF 核方法']>r['metrics']['逻辑回归']+.03


def test_compression_matches_palette_and_improves_with_colors():
    from projects.color_compression.experiment import run
    r=run(load_functions('color_compression','演示'),sample_image(48))
    unique=np.unique(r['compressed'].reshape(-1,3),axis=0)
    assert len(unique)<=8
    curve=r['curve'].set_index('colors').mse
    assert curve.loc[16]<curve.loc[2]
    assert 1<r['metrics']['theoretical_ratio']<8


def test_recommendation_changes_with_taste_and_respects_exclusions():
    from projects.recommender.experiment import run,NAMES
    fn=load_functions('recommender','演示')
    sweet=run(fn,[10,0,0,0],[]);crisp=run(fn,[0,0,10,0],[])
    assert sweet['ranked'].index[0]!=crisp['ranked'].index[0]
    old=int(sweet['ranked'].index[0]);excluded=run(fn,[10,0,0,0],[old])
    assert old not in excluded['ranked'].index
    assert run(fn,[0,0,0,0],list(range(len(NAMES))))['ranked'].empty


def test_anomaly_threshold_tradeoff_and_training_isolation():
    from projects.anomaly.experiment import run
    fn=load_functions('anomaly','演示');original=fn.fit_detector;seen=[]
    def spy(X,seed):
        seen.append(X.copy());return original(X,seed)
    fn.fit_detector=spy
    low=run(fn,.8);high=run(fn,.99)
    assert len(seen[0])==300
    np.testing.assert_allclose(seen[0].mean(0),0,atol=1e-10)
    assert low['metrics']['alerts']>=high['metrics']['alerts']
    assert low['metrics']['false_alarms']>=high['metrics']['false_alarms']
    assert low['metrics']['recall']>=high['metrics']['recall']
