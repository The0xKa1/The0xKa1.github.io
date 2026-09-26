"""K-means 核心步骤参考实现。"""
import numpy as np


def distances(X, centers):
    """返回 shape=(样本数, 中心数) 的欧氏距离平方矩阵。

    X 与 centers 都为二维数组；例 X=[[0,0]], centers=[[3,4]] → [[25]]。
    """
    return ((X[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2)


def assign_groups(squared_distances):
    """每行选最近中心，返回一维整数数组；距离相同时选编号较小的中心。"""
    return np.argmin(squared_distances, axis=1)


def update_centers(X, groups, old_centers):
    """返回同形状的新中心数组；空簇保留旧中心，不修改传入数组。"""
    centers = old_centers.copy()
    for i in range(len(centers)):
        if np.any(groups == i):
            centers[i] = X[groups == i].mean(axis=0)
    return centers


def converged(old, new, tolerance=1e-4):
    """所有中心的欧氏移动距离 <= tolerance 时返回 True。"""
    return bool(np.max(np.linalg.norm(new - old, axis=1)) <= tolerance)


def best_restart(inertias):
    """进阶：返回多次初始化中最终组内距离平方和最小者的位置。"""
    return int(np.argmin(inertias))
