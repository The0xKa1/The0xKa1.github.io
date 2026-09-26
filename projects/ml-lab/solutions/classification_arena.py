import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

def build_model(kind, complexity, seed=42):
    """kind 为 逻辑回归/决策树/RBF 核方法；complexity>0。树深取整数，其他模型作 C。返回未拟合模型。"""
    if kind=='逻辑回归': model=LogisticRegression(C=complexity,max_iter=2000)
    elif kind=='决策树': model=DecisionTreeClassifier(max_depth=int(complexity),random_state=seed)
    elif kind=='RBF 核方法': model=SVC(C=complexity,gamma='scale',probability=True,random_state=seed)
    else: raise ValueError(kind)
    return make_pipeline(StandardScaler(),model)

def accuracy(actual, predicted):
    """两个等长非空一维标签数组；返回正确比例。例：[0,1] 对 [0,0] -> 0.5。"""
    return float(np.mean(np.asarray(actual)==np.asarray(predicted)))
