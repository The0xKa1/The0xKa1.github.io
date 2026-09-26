"""用葡萄酒的其他成分指标预测酒精测量值，比较均值基线与岭回归。"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.datasets import load_wine
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import GridSearchCV, KFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def main():
    output_dir = Path(__file__).resolve().parent
    # alcohol 是预测目标，从输入特征中移除。
    dataset = load_wine(as_frame=True)
    X = dataset.data.drop(columns="alcohol")
    y = dataset.data["alcohol"]
    print("教学数据特征预览：")
    print(X.head().to_string(index=False))
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"训练样本：{len(X_train)}；测试样本：{len(X_test)}")

    model = Pipeline([("scale", StandardScaler()), ("ridge", Ridge())])
    folds = KFold(n_splits=5, shuffle=True, random_state=42)
    search = GridSearchCV(
        model,
        param_grid={"ridge__alpha": [0.01, 0.1, 1.0, 10.0, 100.0]},
        scoring="neg_mean_absolute_error",
        cv=folds,
        refit=True,
        return_train_score=True,
        error_score="raise",
    )
    # 每折各自 fit 标准化和模型；整个搜索不接触测试集。
    search.fit(X_train, y_train)
    print("\n训练数据内的 5 折交叉验证：")
    for params, train_score, validation_score in zip(
        search.cv_results_["params"],
        search.cv_results_["mean_train_score"],
        search.cv_results_["mean_test_score"],
    ):
        print(
            f"alpha={params['ridge__alpha']:6g} | "
            f"训练 MAE={-train_score:.3f} | 验证 MAE={-validation_score:.3f}"
        )
    print(f"选定 alpha：{search.best_params_['ridge__alpha']:g}")
    print(f"选定方案的交叉验证 MAE：{-search.best_score_:.3f}")

    baseline = DummyRegressor(strategy="mean")
    baseline.fit(X_train, y_train)
    # refit=True 已用全部训练集重训选定方案。到这里才打开测试集。
    baseline_predictions = baseline.predict(X_test)
    predictions = search.predict(X_test)
    print("\n最终测试集评价：")
    for name, values in [("训练均值基线", baseline_predictions), ("Ridge", predictions)]:
        print(
            f"{name}: MAE={mean_absolute_error(y_test, values):.3f}, "
            f"R²={r2_score(y_test, values):.3f}"
        )

    residuals = y_test.to_numpy() - predictions
    fig, ax = plt.subplots(figsize=(6.6, 4.6))
    ax.scatter(predictions, residuals, s=26, alpha=0.75, color="#527a9b")
    ax.axhline(0, color="#8a5046", linewidth=1.2, linestyle="--")
    ax.set(
        title="Ridge: held-out test residuals",
        xlabel="Predicted alcohol",
        ylabel="Residual (actual - predicted)",
    )
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    image_path = output_dir / "wine-residuals.png"
    fig.savefig(image_path, dpi=160)
    plt.close(fig)
    print(f"残差图已保存：{image_path}")


if __name__ == "__main__":
    main()
