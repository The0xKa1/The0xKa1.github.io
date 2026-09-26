"""在这里完成练习。参考实现位于 solutions/，页面不会自动代填。"""
import numpy as np


def distances(X, centers):
    """返回 shape=(样本数, 中心数) 的欧氏距离平方矩阵。

    X 与 centers 都为二维数组；例 X=[[0,0]], centers=[[3,4]] → [[25]]。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('distances')


def assign_groups(squared_distances):
    """每行选最近中心，返回一维整数数组；距离相同时选编号较小的中心。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('assign_groups')


def update_centers(X, groups, old_centers):
    """返回同形状的新中心数组；空簇保留旧中心，不修改传入数组。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('update_centers')


def converged(old, new, tolerance=1e-4):
    """所有中心的欧氏移动距离 <= tolerance 时返回 True。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('converged')


def best_restart(inertias):
    """进阶：返回多次初始化中最终组内距离平方和最小者的位置。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('best_restart')
