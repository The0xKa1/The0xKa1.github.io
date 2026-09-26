import numpy as np

def similarity(profile, features):
    """profile 为 D 维偏好向量；features 为 N×D。返回余弦相似度，零向量得 0。"""
    raise NotImplementedError('similarity')

def rank_items(scores, excluded, count):
    """返回分数降序的原始行号，排除已选行；同分保持原顺序，最多 count 项。"""
    raise NotImplementedError('rank_items')
