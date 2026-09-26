import numpy as np
import pandas as pd
from sklearn.datasets import make_blobs, load_wine
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, adjusted_rand_score


def iterate(fn, X, k, seed):
    rng = np.random.default_rng(seed)
    centers = X[rng.choice(len(X), k, replace=False)].copy()
    frames = []
    for _ in range(101):
        d = fn.distances(X, centers)
        groups = np.asarray(fn.assign_groups(d))
        if groups.shape != (len(X),) or not np.issubdtype(groups.dtype, np.integer) or groups.min() < 0 or groups.max() >= k:
            raise ValueError('assign_groups 应返回每个样本的整数簇编号，范围为 0..K-1。')
        inertia = float(d[np.arange(len(X)), groups].sum())
        frames.append(dict(centers=centers.copy(), groups=groups.copy(), inertia=inertia))
        updated = fn.update_centers(X, groups, centers)
        if fn.converged(centers, updated):
            centers = updated
            d = fn.distances(X, centers)
            groups = fn.assign_groups(d)
            frames.append(dict(centers=centers.copy(), groups=groups.copy(), inertia=float(d[np.arange(len(X)), groups].sum())))
            break
        centers = updated
    return frames


def run(fn, dataset, k, scale, seed, restarts, project_first):
    if dataset == '二维点集':
        X, labels = make_blobs(n_samples=180, centers=3, cluster_std=1.1, random_state=12)
        X[:, 0] *= 3
    else:
        data = load_wine()
        X, labels = data.data, data.target
    X = StandardScaler().fit_transform(X) if scale else X.copy()
    pca = PCA(n_components=2).fit(X)
    projected = pca.transform(X)
    fitX = projected if project_first else X
    attempts = [iterate(fn, fitX, k, seed+i) for i in range(restarts)]
    best = fn.best_restart([a[-1]['inertia'] for a in attempts]) if restarts > 1 else 0
    frames = attempts[best]
    groups = frames[-1]['groups']
    reference = KMeans(n_clusters=k, n_init=20, random_state=seed).fit(fitX)
    coords = projected if dataset == 'Wine' else X
    for frame in frames:
        frame['display_centers'] = pca.transform(frame['centers']) if dataset == 'Wine' and not project_first else frame['centers']
    metrics = dict(inertia=frames[-1]['inertia'], sklearn_inertia=float(reference.inertia_),
                   silhouette=float(silhouette_score(fitX, groups)) if 1 < len(np.unique(groups)) < len(X) else None)
    return dict(coords=coords, labels=labels, frames=frames, groups=groups, metrics=metrics,
                label_ari=float(adjusted_rand_score(labels, groups)),
                pca_variance=pca.explained_variance_ratio_,
                curve=pd.DataFrame({'iteration': range(len(frames)), 'inertia': [f['inertia'] for f in frames]}))
