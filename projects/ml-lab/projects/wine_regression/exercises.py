"""在这里完成练习。参考实现位于 solutions/，页面不会自动代填。"""
import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge


def split_target(data):
    """返回 X, y：y 为 alcohol 列，X 不含 alcohol；保留索引。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('split_target')


def errors(actual, predicted):
    """返回 {'mae': 浮点数, 'residuals': 一维数组}，残差=实测-预测。

    例：[1,3]、[2,2] → mae=1，residuals=[-1,1]。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('errors')


def build_model(alpha=1.0):
    """返回未拟合的 StandardScaler → Ridge 管道，alpha 为非负数。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('build_model')


def select_alpha(results):
    """results 含 alpha/valid_mae，返回验证误差最小的 alpha。

    相同最小误差时选择表中第一项，不读取测试集。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('select_alpha')
