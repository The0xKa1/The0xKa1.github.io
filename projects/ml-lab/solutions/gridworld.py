"""Q-learning 参考实现。"""
import numpy as np


def choose_action(values, epsilon, rng):
    """values 为四个 Q 值；rng 为 numpy Generator；返回 0..3。

    epsilon 概率随机探索；否则从所有最大值动作中随机选一个。
    """
    if rng.random() < epsilon:
        return int(rng.integers(4))
    return int(rng.choice(np.flatnonzero(values == np.max(values))))


def update_value(current, reward, next_values, terminated, alpha=.2, gamma=.95):
    """返回更新后的一个 Q 值，不修改数组。

    终止目标=reward；其他情况目标=reward+gamma*max(next_values)。
    达到回合步数上限是截断，仍用 terminated=False。
    """
    target = reward if terminated else reward + gamma * np.max(next_values)
    return float(current + alpha * (target-current))


def exploration_rate(episode, episodes):
    """episode 从 0 开始；前 80% 回合由 1 线性降到 .05，之后保持 .05。"""
    return max(.05, 1. - episode / (.8 * episodes))
