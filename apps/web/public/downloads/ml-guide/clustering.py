"""Explore Wine with PCA and K-means; labels are used only for evaluation."""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_wine
from sklearn.decomposition import PCA
from sklearn.metrics import adjusted_rand_score, silhouette_score
from sklearn.preprocessing import StandardScaler


def main():
    data = load_wine()
    X = StandardScaler().fit_transform(data.data)
    # Cluster all 13 standardized measurements. No labels enter fitting.
    model = KMeans(n_clusters=3, n_init=20, random_state=42)
    groups = model.fit_predict(X)
    pca = PCA(n_components=2)
    projected = pca.fit_transform(X)

    # Ground-truth classes are consulted only after the groups are fixed.
    labels = data.target
    metrics = {
        "samples": int(X.shape[0]),
        "features_used_for_clustering": int(X.shape[1]),
        "clusters": 3,
        "cluster_sizes": np.bincount(groups).tolist(),
        "silhouette": float(silhouette_score(X, groups)),
        "adjusted_rand_index": float(adjusted_rand_score(labels, groups)),
        "pca_explained_variance_ratio": pca.explained_variance_ratio_.tolist(),
    }
    output = Path.cwd()
    metrics_path = output / "clustering-metrics.json"
    metrics_path.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")

    colors = ["#5684A0", "#388A72", "#D87969"]
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.3), sharex=True, sharey=True)
    panels = [
        (groups, [f"Cluster {i}" for i in range(3)], "K-means groups"),
        (labels, data.target_names, "Wine classes"),
    ]
    for ax, (values, names, title) in zip(axes, panels):
        for index, name in enumerate(names):
            selected = values == index
            ax.scatter(projected[selected, 0], projected[selected, 1],
                       s=30, color=colors[index], label=name, alpha=0.8,
                       edgecolors="white", linewidths=0.4)
        ax.set(title=title, xlabel="Principal component 1")
        ax.legend(frameon=False, fontsize=8)
        ax.spines[["top", "right"]].set_visible(False)
    axes[0].set_ylabel("Principal component 2")
    fig.suptitle("Wine: same PCA coordinates, different assignments", fontsize=12)
    fig.tight_layout()
    figure_path = output / "clustering-pca.png"
    fig.savefig(figure_path, dpi=160, bbox_inches="tight")
    plt.close(fig)
    print(json.dumps(metrics, indent=2))
    print(f"Saved: {figure_path}")
    print(f"Saved: {metrics_path}")


if __name__ == "__main__":
    main()
