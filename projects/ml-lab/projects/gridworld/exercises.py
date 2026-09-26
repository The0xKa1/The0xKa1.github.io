"""在这里完成练习。参考实现位于 solutions/，页面不会自动代填。"""
import numpy as np


def choose_action(values, epsilon, rng):
    """values 为四个 Q 值；rng 为 numpy Generator；返回 0..3。

    epsilon 概率随机探索；否则从所有最大值动作中随机选一个。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('choose_action')


def update_value(current, reward, next_values, terminated, alpha=.2, gamma=.95):
    """返回更新后的一个 Q 值，不修改数组。

    终止目标=reward；其他情况目标=reward+gamma*max(next_values)。
    达到回合步数上限是截断，仍用 terminated=False。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('update_value')


def exploration_rate(episode, episodes):
    """episode 从 0 开始；前 80% 回合由 1 线性降到 .05，之后保持 .05。
    """
    # TODO: 实现上面的输入输出约定。
    raise NotImplementedError('exploration_rate')
