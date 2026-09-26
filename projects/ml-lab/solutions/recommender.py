import numpy as np

def similarity(profile, features):
    """profile 为 D 维偏好向量；features 为 N×D。返回余弦相似度，零向量得 0。"""
    denom=np.linalg.norm(features,axis=1)*np.linalg.norm(profile)
    return np.divide(features@profile,denom,out=np.zeros(len(features)),where=denom>0)

def rank_items(scores, excluded, count):
    """返回分数降序的原始行号，排除已选行；同分保持原顺序，最多 count 项。"""
    return np.array([i for i in np.argsort(-np.asarray(scores),kind='stable') if i not in excluded][:count])
