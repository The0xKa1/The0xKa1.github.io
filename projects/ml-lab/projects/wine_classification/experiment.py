import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.dummy import DummyClassifier
from sklearn.tree import DecisionTreeClassifier
from common.data import wine_split


def run(fn, features, C, depth, seed, challenge=False):
    Xdev, Xtest, ydev, ytest = wine_split()
    Xt, Xv, yt, yv = fn.split_data(Xdev, ydev, seed)
    models = {'多数类基线': DummyClassifier(strategy='most_frequent'),
              '逻辑回归': fn.build_model(C),
              '决策树': DecisionTreeClassifier(max_depth=depth, random_state=seed)}
    rows, predictions = [], {}
    for name, model in models.items():
        model.fit(Xt, yt)
        pred = model.predict(Xv)
        report = fn.evaluate(yv, pred)
        rows.append(dict(model=name, train_accuracy=model.score(Xt, yt), valid_accuracy=report['accuracy']))
        predictions[name] = dict(pred=pred, report=report, probabilities=model.predict_proba(Xv))
    two = fn.build_model(C).fit(Xt[features], yt)
    rows.append(dict(model='逻辑回归（两个特征）', train_accuracy=two.score(Xt[features], yt), valid_accuracy=two.score(Xv[features], yv)))
    ranges = [np.linspace(Xdev[f].min() - Xdev[f].std() * .2, Xdev[f].max() + Xdev[f].std() * .2, 100) for f in features]
    xx, yy = np.meshgrid(*ranges)
    grid = pd.DataFrame(np.c_[xx.ravel(), yy.ravel()], columns=features)
    out = dict(models=models, predictions=predictions, Xv=Xv, yv=yv, Xdev=Xdev, ydev=ydev,
               grid=(ranges, two.predict(grid).reshape(xx.shape)), features=features,
               scores=pd.DataFrame(rows), metrics={r['model']: r['valid_accuracy'] for r in rows})
    if challenge:
        out['depths'] = fn.compare_depths(Xt, yt, Xv, yv, [1, 2, 3, 4, 6, 10], seed)
    return out


def final_test(result, name, fn):
    _, Xtest, _, ytest = wine_split()
    model = clone(result['models'][name]).fit(result['Xdev'], result['ydev'])
    return fn.evaluate(ytest, model.predict(Xtest))
