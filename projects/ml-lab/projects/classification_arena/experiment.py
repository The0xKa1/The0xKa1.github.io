import numpy as np
import pandas as pd
from sklearn.datasets import make_moons,make_circles
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.base import clone

KINDS=['逻辑回归','决策树','RBF 核方法']
def data(shape,noise,seed):
    if shape=='月牙': X,y=make_moons(600,noise=noise,random_state=seed)
    elif shape=='同心圆': X,y=make_circles(600,noise=noise,factor=.4,random_state=seed)
    else:
        rng=np.random.default_rng(seed);X=rng.uniform(-1,1,(600,2));y=(X[:,0]*X[:,1]>0).astype(int)
        X+=rng.normal(0,noise,X.shape)
    X=pd.DataFrame(X,columns=['特征 1','特征 2']);y=pd.Series(y,index=X.index)
    dev,test=train_test_split(X.index,test_size=.2,stratify=y,random_state=42)
    train,valid=train_test_split(dev,test_size=.25,stratify=y.loc[dev],random_state=42)
    return X,y,train,valid,test

def run(fn,shape='同心圆',noise=.15,complexity=3.,seed=42):
    X,y,train,valid,test=data(shape,noise,seed)
    rows=[];models={};predictions={};boundaries={}
    # Axis bounds are computed from development data only.
    dev=np.concatenate([train,valid]);low=X.loc[dev].min()-.3;high=X.loc[dev].max()+.3
    axes=[np.linspace(low.iloc[i],high.iloc[i],110) for i in range(2)]
    xx,yy=np.meshgrid(*axes);mesh=pd.DataFrame(np.c_[xx.ravel(),yy.ravel()],columns=X.columns)
    for name in ['多数类基线']+KINDS:
        m=DummyClassifier(strategy='most_frequent') if name=='多数类基线' else fn.build_model(name,complexity,seed)
        m.fit(X.loc[train],y.loc[train]);pred=m.predict(X.loc[valid])
        rows.append(dict(model=name,train_accuracy=fn.accuracy(y.loc[train],m.predict(X.loc[train])),valid_accuracy=fn.accuracy(y.loc[valid],pred)))
        models[name]=m;predictions[name]=pred;boundaries[name]=m.predict(mesh).reshape(xx.shape)
    return dict(X=X,y=y,train=train,valid=valid,test=test,models=models,predictions=predictions,boundaries=boundaries,axes=axes,
                scores=pd.DataFrame(rows),metrics={r['model']:r['valid_accuracy'] for r in rows})

def final_test(fn,result,name):
    dev=np.concatenate([result['train'],result['valid']]);test=result['test']
    m=clone(result['models'][name]).fit(result['X'].loc[dev],result['y'].loc[dev])
    return fn.accuracy(result['y'].loc[test],m.predict(result['X'].loc[test]))
