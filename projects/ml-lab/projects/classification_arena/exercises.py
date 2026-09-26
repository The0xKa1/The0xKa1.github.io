import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

def build_model(kind, complexity, seed=42):
    """kind 为 逻辑回归/决策树/RBF 核方法；complexity>0。树深取整数，其他模型作 C。返回未拟合模型。"""
    raise NotImplementedError('build_model')

def accuracy(actual, predicted):
    """两个等长非空一维标签数组；返回正确比例。例：[0,1] 对 [0,0] -> 0.5。"""
    raise NotImplementedError('accuracy')
