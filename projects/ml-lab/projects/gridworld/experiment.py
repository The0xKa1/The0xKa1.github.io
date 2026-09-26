from collections import deque
import numpy as np
import pandas as pd

MAPS = {'小 · 4×4': 'S...\n.##.\n....\n.#.G',
        '中 · 6×6': 'S.....\n.###..\n...#..\n.#....\n.#.##.\n.....G',
        '大 · 8×8': 'S.......\n.####...\n....#...\n.##.#.#.\n....#.#.\n.##...#.\n....#...\n......G.'}
ACTIONS = [(-1, 0), (0, 1), (1, 0), (0, -1)]


def parse_map(text):
    grid = [list(row.strip()) for row in text.strip().splitlines()]
    if not grid or not 2 <= len(grid) <= 12 or any(len(row) != len(grid[0]) for row in grid) or not 2 <= len(grid[0]) <= 12:
        raise ValueError('地图须为 2—12 行、2—12 列的矩形。')
    if any(cell not in 'S.G#' for row in grid for cell in row):
        raise ValueError('地图只能包含 S、G、.、#。')
    positions = {char: [(r, c) for r, row in enumerate(grid) for c, cell in enumerate(row) if cell == char] for char in 'SG'}
    if any(len(positions[char]) != 1 for char in 'SG'):
        raise ValueError('地图需要且只能有一个起点 S 和一个终点 G。')
    return np.array(grid), positions['S'][0], positions['G'][0]


def transition(grid, goal, state, action):
    dr, dc = ACTIONS[action]
    nr, nc = state[0]+dr, state[1]+dc
    nxt = (nr, nc) if 0 <= nr < grid.shape[0] and 0 <= nc < grid.shape[1] and grid[nr, nc] != '#' else state
    done = nxt == goal
    return nxt, 10. if done else -1., done


def shortest_distance(grid, start, goal):
    queue, seen = deque([(start, 0)]), {start}
    while queue:
        state, distance = queue.popleft()
        if state == goal:
            return distance
        for action in range(4):
            nxt, _, _ = transition(grid, goal, state, action)
            if nxt not in seen:
                queue.append((nxt, distance+1)); seen.add(nxt)
    return None


def rollout(grid, start, goal, q, seed=43, max_steps=200):
    rng = np.random.default_rng(seed)
    state, path, records = start, [start], []
    for _ in range(max_steps):
        values = q[state]
        action = int(rng.choice(np.flatnonzero(values == values.max())))
        nxt, reward, done = transition(grid, goal, state, action)
        records.append(dict(action=action, reward=reward))
        state = nxt; path.append(state)
        if done:
            return path, records, True
    return path, records, False


def run(fn, text, episodes=2000, seed=42, strategy='衰减', epsilon=.1):
    grid, start, goal = parse_map(text)
    shortest = shortest_distance(grid, start, goal)
    if shortest is None:
        raise ValueError('终点不可达，请在地图中留出一条通路后重新训练。')
    q = np.zeros((*grid.shape, 4), dtype=float)
    rng = np.random.default_rng(seed)
    rows, snapshots, traces = [], {}, {}
    checkpoints = set([0, 1, 10, 100, episodes])
    checkpoints.update([episodes//4, episodes//2])
    snapshots[0] = q.copy()
    limit = min(500, max(80, grid.size*4))
    for episode in range(episodes):
        state, total, path, records = start, 0., [start], []
        rate = fn.exploration_rate(episode, episodes) if strategy == '衰减' else epsilon
        if not 0 <= rate <= 1:
            raise ValueError('探索率必须处于 0—1。')
        done = False
        for step in range(limit):
            action = fn.choose_action(q[state], rate, rng)
            if not isinstance(action, (int, np.integer)) or not 0 <= action < 4:
                raise ValueError('动作必须是 0、1、2、3 中的一个整数。')
            nxt, reward, done = transition(grid, goal, state, action)
            q[state][action] = fn.update_value(q[state][action], reward, q[nxt], done)
            total += reward; state = nxt; path.append(state); records.append(dict(action=action, reward=reward))
            if done:
                break
        rows.append(dict(episode=episode+1, reward=total, steps=step+1, success=int(done), epsilon=rate))
        if episode+1 in checkpoints:
            snapshots[episode+1] = q.copy()
            traces[episode+1] = (path, records, done)
    path, records, success = rollout(grid, start, goal, q, seed+1, limit)
    curve = pd.DataFrame(rows)
    curve['success_rate'] = curve.success.rolling(50, min_periods=1).mean()
    curve['mean_steps'] = curve.steps.rolling(50, min_periods=1).mean()
    return dict(grid=grid, start=start, goal=goal, q=q, path=path, records=records, snapshots=snapshots,
                traces=traces, curve=curve, metrics=dict(success=success, steps=len(path)-1, shortest=shortest,
                extra_steps=len(path)-1-shortest if success else None, reward=sum(r['reward'] for r in records)))
