"""葡萄酒分类：固定一次划分，比较多数类基线与逻辑回归。"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_wine
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def main():
    output_dir = Path(__file__).resolve().parent
    wine = load_wine(as_frame=True)
    X, y = wine.data, wine.target
    print("特征预览：")
    print(X.head().to_string(index=False))
    print("\n标签对应的类别：", dict(enumerate(wine.target_names)))

    # stratify 保持类别比例；先拆分，再让模型学习标准化参数。
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"训练样本：{len(X_train)}；测试样本：{len(X_test)}")

    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(X_train, y_train)
    model = Pipeline(
        [
            ("scale", StandardScaler()),
            ("logistic", LogisticRegression(max_iter=1000)),
        ]
    )
    model.fit(X_train, y_train)

    # 模型和设置预先固定。这里才对留出的测试集做最后评价。
    baseline_predictions = baseline.predict(X_test)
    predictions = model.predict(X_test)
    print(f"\n多数类基线准确率：{accuracy_score(y_test, baseline_predictions):.3f}")
    print(f"逻辑回归准确率：{accuracy_score(y_test, predictions):.3f}")
    labels = np.arange(len(wine.target_names))
    print("\n逻辑回归各类表现：")
    print(
        classification_report(
            y_test,
            predictions,
            labels=labels,
            target_names=wine.target_names,
            digits=3,
            zero_division=0,
        )
    )
    matrix = confusion_matrix(y_test, predictions, labels=labels)
    print("混淆矩阵（行是真实类别，列是预测类别）：")
    print(matrix)

    fig, ax = plt.subplots(figsize=(6.4, 5.2))
    ConfusionMatrixDisplay(matrix, display_labels=wine.target_names).plot(
        ax=ax, cmap="Blues", colorbar=False, values_format="d"
    )
    ax.set_title("Wine: held-out test predictions")
    fig.tight_layout()
    image_path = output_dir / "wine-confusion-matrix.png"
    fig.savefig(image_path, dpi=160)
    plt.close(fig)
    print(f"图已保存：{image_path}")


if __name__ == "__main__":
    main()
