import numpy as np
import pandas as pd
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split, KFold, cross_validate
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


def run(fn, features, seed=42):
    X, y = fn.split_target(load_wine(as_frame=True).data)
    if 'alcohol' in X.columns:
        raise ValueError('输入仍含 alcohol：请完成 split_target，将预测目标移出输入。')
    X = X[features]
    Xd, Xtest, yd, ytest = train_test_split(X, y, test_size=.2, random_state=42)
    folds = KFold(n_splits=5, shuffle=True, random_state=seed)
    rows, coefficients = [], []
    for alpha in [.001, .01, .1, 1., 10., 100., 1000.]:
        model = fn.build_model(alpha)
        scores = cross_validate(model, Xd, yd, cv=folds, scoring='neg_mean_absolute_error', return_train_score=True)
        rows.append(dict(alpha=alpha, train_mae=-scores['train_score'].mean(), valid_mae=-scores['test_score'].mean(), valid_std=scores['test_score'].std()))
        model.fit(Xd, yd)
        for feature, coefficient in zip(features, model[-1].coef_):
            coefficients.append(dict(alpha=alpha, feature=feature, coefficient=coefficient))
    cv = pd.DataFrame(rows)
    best = fn.select_alpha(cv)
    if best not in cv.alpha.values:
        raise ValueError('select_alpha 应从候选 alpha 中选择。')
    models = {'均值基线': DummyRegressor(), '线性回归': make_pipeline(StandardScaler(), LinearRegression()), '岭回归': fn.build_model(best)}
    # Out-of-fold predictions: every plotted development sample was predicted by a model that did not fit it.
    reports, predictions = [], {}
    for name, model in models.items():
        from sklearn.model_selection import cross_val_predict
        pred = cross_val_predict(model, Xd, yd, cv=folds)
        report = fn.errors(yd, pred)
        predictions[name] = pred
        reports.append(dict(model=name, mae=report['mae']))
    samples = Xd.copy()
    samples['actual'] = yd
    samples['predicted'] = predictions['岭回归']
    samples['residual'] = fn.errors(yd, samples.predicted)['residuals']
    return dict(cv=cv, coefficients=pd.DataFrame(coefficients), scores=pd.DataFrame(reports), samples=samples,
                models=models, Xd=Xd, yd=yd, Xtest=Xtest, ytest=ytest, best=best,
                metrics=dict(alpha=best, **{r['model']: r['mae'] for r in reports}))


def final_test(result, fn):
    rows, samples = [], result['Xtest'].copy()
    samples['actual'] = result['ytest']
    for name, model in result['models'].items():
        model.fit(result['Xd'], result['yd'])
        prediction = model.predict(result['Xtest'])
        report = fn.errors(result['ytest'], prediction)
        rows.append(dict(model=name, mae=report['mae']))
        samples[name] = prediction
    return pd.DataFrame(rows), samples
