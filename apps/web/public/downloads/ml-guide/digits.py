"""Compare training APIs on sklearn's bundled digits dataset (CPU).
python digits.py --framework sklearn|pytorch|tensorflow
"""
import argparse
import json
from pathlib import Path
import numpy as np
from sklearn.datasets import load_digits
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--framework', choices=['sklearn', 'pytorch', 'tensorflow'], default='sklearn')
    parser.add_argument('--epochs', type=int, default=40)
    args = parser.parse_args()
    if args.epochs < 1:
        parser.error('--epochs must be positive')
    np.random.seed(42)
    X, y = load_digits(return_X_y=True)
    # Pixel values have a known domain [0, 16]; no test statistics are fitted.
    X = (X / 16.0).astype('float32')
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42)
    if args.framework == 'sklearn':
        from sklearn.neural_network import MLPClassifier
        model = MLPClassifier(hidden_layer_sizes=(32,), batch_size=64,
                              max_iter=args.epochs, random_state=42)
        model.fit(X_train, y_train)
        prediction = model.predict(X_test)
    elif args.framework == 'pytorch':
        import torch
        from torch import nn
        from torch.utils.data import DataLoader, TensorDataset
        torch.manual_seed(42)
        torch.set_num_threads(2)
        model = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10))
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        data = TensorDataset(torch.from_numpy(X_train), torch.tensor(y_train, dtype=torch.long))
        loader = DataLoader(data, batch_size=64, shuffle=True)
        model.train()
        for _ in range(args.epochs):
            for x_batch, y_batch in loader:
                optimizer.zero_grad()
                loss = nn.functional.cross_entropy(model(x_batch), y_batch)
                loss.backward()
                optimizer.step()
        model.eval()
        with torch.no_grad():
            prediction = model(torch.from_numpy(X_test)).argmax(dim=1).numpy()
    else:
        import tensorflow as tf
        tf.keras.utils.set_random_seed(42)
        model = tf.keras.Sequential([
            tf.keras.Input(shape=(64,)),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(10),
        ])
        model.compile(optimizer='adam',
            loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True))
        model.fit(X_train, y_train, epochs=args.epochs, batch_size=64, verbose=0)
        prediction = model.predict(X_test, verbose=0).argmax(axis=1)
    result = dict(framework=args.framework, epochs=args.epochs,
                  train_samples=len(y_train), test_samples=len(y_test),
                  accuracy=float(accuracy_score(y_test, prediction)),
                  confusion_matrix=confusion_matrix(y_test, prediction).tolist())
    output = Path(__file__).resolve().parent / ('digits-' + args.framework + '.json')
    output.write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))
    print('Saved:', output)


if __name__ == '__main__':
    main()
