import numpy as np
from sklearn.ensemble import IsolationForest

def fit_detector(X, seed=42):
    """输入正常历史记录 N×2；返回拟合后的 IsolationForest。只接收训练集。"""
    raise NotImplementedError('fit_detector')

def flag_anomalies(scores, threshold):
    """分数越大越异常；大于等于阈值返回 True，返回布尔数组。"""
    raise NotImplementedError('flag_anomalies')

def evaluate(actual, flagged):
    """输入真实异常布尔标签与报警布尔数组；返回 precision/recall，分母零时取 0。"""
    raise NotImplementedError('evaluate')
