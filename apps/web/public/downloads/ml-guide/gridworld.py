"""Tabular Q-learning on a deterministic grid. Python standard library only."""

import argparse
import random
from collections import deque

GRID = (
    "S...",
    ".##.",
    "....",
    ".#.G",
)
ACTIONS = ((-1, 0), (0, 1), (1, 0), (0, -1))  # up, right, down, left
START = (0, 0)
GOAL = (3, 3)
MAX_STEPS = 80


def transition(state, action):
    """A blocked move stays put; reaching G terminates the episode."""
    dr, dc = ACTIONS[action]
    row, col = state[0] + dr, state[1] + dc
    if not (0 <= row < len(GRID) and 0 <= col < len(GRID[0])):
        next_state = state
    elif GRID[row][col] == "#":
        next_state = state
    else:
        next_state = (row, col)
    terminated = next_state == GOAL
    return next_state, 10.0 if terminated else -1.0, terminated


def best_action(values, rng):
    # Random tie-breaking avoids preferring "up" when values are equal.
    maximum = max(values)
    return rng.choice([i for i, value in enumerate(values) if value == maximum])


def train(episodes, seed):
    rng = random.Random(seed)
    q = {
        (r, c): [0.0] * len(ACTIONS)
        for r, row in enumerate(GRID)
        for c, cell in enumerate(row)
        if cell != "#"
    }
    alpha, gamma = 0.2, 0.95
    successes = 0
    for episode in range(episodes):
        state = START
        epsilon = max(0.05, 1.0 - episode / (0.8 * episodes))
        for _ in range(MAX_STEPS):
            action = (
                rng.randrange(len(ACTIONS))
                if rng.random() < epsilon
                else best_action(q[state], rng)
            )
            next_state, reward, terminated = transition(state, action)
            # An episode time limit is a truncation, not a terminal state.
            target = reward if terminated else reward + gamma * max(q[next_state])
            q[state][action] += alpha * (target - q[state][action])
            state = next_state
            if terminated:
                successes += 1
                break
    return q, successes


def evaluate(q, seed):
    rng = random.Random(seed)
    state, path, total_reward = START, [START], 0.0
    for _ in range(MAX_STEPS):
        state, reward, terminated = transition(state, best_action(q[state], rng))
        path.append(state)
        total_reward += reward
        if terminated:
            return path, total_reward, True
    return path, total_reward, False


def shortest_distance():
    """BFS uses the known map only as an evaluation reference, never to train Q."""
    queue = deque([(START, 0)])
    seen = {START}
    while queue:
        state, distance = queue.popleft()
        if state == GOAL:
            return distance
        for action in range(len(ACTIONS)):
            next_state, _, _ = transition(state, action)
            if next_state not in seen:
                seen.add(next_state)
                queue.append((next_state, distance + 1))
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--episodes", type=int, default=2000)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    if args.episodes < 1:
        parser.error("--episodes must be positive")
    q, successes = train(args.episodes, args.seed)
    path, reward, success = evaluate(q, args.seed + 1)
    print("Map (S=start, G=goal, #=wall):")
    print("\n".join(GRID))
    print(f"Training successes: {successes}/{args.episodes}")
    print(f"Greedy success: {success}")
    print(f"Steps: {len(path) - 1}; shortest possible: {shortest_distance()}")
    print(f"Undiscounted evaluation reward: {reward:g}")
    print("Path (row, column):", " -> ".join(map(str, path)))


if __name__ == "__main__":
    main()
