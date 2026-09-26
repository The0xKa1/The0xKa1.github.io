import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

def run(fn,quantile=.95,seed=42):
    rng=np.random.default_rng(seed)
    def normal(n):
        X=rng.normal(size=(n,2));X[:,1]=.65*X[:,0]+.6*X[:,1]
        return X*np.array([1.2,12])+np.array([4.,100.])
    train=normal(300);calibration=normal(150);normal_test=normal(180)
    abnormal=np.c_[rng.uniform(7.5,10,30),rng.uniform(55,140,30)]
    test=np.vstack([normal_test,abnormal]);actual=np.arange(len(test))>=len(normal_test)
    scaler=StandardScaler().fit(train);m=fn.fit_detector(scaler.transform(train),seed)
    threshold=float(np.quantile(-m.score_samples(scaler.transform(calibration)),quantile))
    scores=-m.score_samples(scaler.transform(test));flagged=np.asarray(fn.flag_anomalies(scores,threshold))
    if flagged.shape!=actual.shape or flagged.dtype!=bool: raise ValueError('报警标记必须是等长布尔数组')
    metrics=fn.evaluate(actual,flagged);metrics.update(alerts=int(flagged.sum()),missed=int((actual & ~flagged).sum()),false_alarms=int((~actual & flagged).sum()),threshold=threshold)
    samples=pd.DataFrame(test,columns=['温度 / °C','重量 / g']);samples['异常分数']=scores;samples['报警']=flagged;samples['真实异常']=actual
    return dict(samples=samples,metrics=metrics,threshold=threshold)
