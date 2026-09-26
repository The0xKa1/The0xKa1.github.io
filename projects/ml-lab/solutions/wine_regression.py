"""酒精含量预测参考实现。"""
import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge


def split_target(data):
    """返回 X, y：y 为 alcohol 列，X 不含 alcohol；保留索引。"""
    return data.drop(columns='alcohol'), data['alcohol'].copy()


def errors(actual, predicted):
    """返回 {'mae': 浮点数, 'residuals': 一维数组}，残差=实测-预测。

    例：[1,3]、[2,2] → mae=1，residuals=[-1,1]。
    """
    residuals = np.asarray(actual) - np.asarray(predicted)
    return dict(mae=float(np.abs(residuals).mean()), residuals=residuals)


def build_model(alpha=1.0):
    """返回未拟合的 StandardScaler → Ridge 管道，alpha 为非负数。"""
    return make_pipeline(StandardScaler(), Ridge(alpha=alpha))


def select_alpha(results):
    """results 含 alpha/valid_mae，返回验证误差最小的 alpha。

    相同最小误差时选择表中第一项，不读取测试集。
    """
    return float(results.loc[results.valid_mae.idxmin(), 'alpha'])
