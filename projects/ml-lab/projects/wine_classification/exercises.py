"""在这里完成练习。参考实现位于 solutions/，页面不会自动代填。"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.tree import DecisionTreeClassifier


def split_data(X, y, seed=42):
    """将开发数据按 75%/25% 分为训练、验证集，保持类别比例。

    返回 X_train, X_valid, y_train, y_valid；保留 pandas 行索引。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('split_data')


def build_model(C=1.0):
    """返回未拟合的 StandardScaler → LogisticRegression 管道。

    C 是正则化强度的倒数；只在 fit 时学习缩放参数。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('build_model')


def evaluate(y_true, predictions):
    """返回 accuracy、matrix、wrong 三个字段。

    matrix 固定为 3×3（类别 0、1、2）；wrong 为错分位置的一维整数数组。
    例：[0,1,2] 与 [0,2,2] → accuracy=2/3，wrong=[1]。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('evaluate')


def compare_depths(X_train, y_train, X_valid, y_valid, depths, seed=42):
    """进阶：返回 depth、train_accuracy、valid_accuracy 三列的 DataFrame。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('compare_depths')
