import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, log_loss, confusion_matrix
from common.data import digits_split


def train(fn, framework, hidden, epochs, learning_rate, seed):
    data, train_ids, valid_ids, test_ids = digits_split()
    X = fn.normalize(data.images)
    Xt, Xv = X[train_ids], X[valid_ids]
    yt, yv = data.target[train_ids], data.target[valid_ids]
    rows = []
    if framework == 'PyTorch':
        import torch
        from torch.utils.data import DataLoader, TensorDataset
        torch.set_num_threads(2)
        torch.manual_seed(seed)
        model = fn.build_network(hidden)
        optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
        loader = DataLoader(TensorDataset(torch.tensor(Xt), torch.tensor(yt, dtype=torch.long)),
                            batch_size=64, shuffle=True, generator=torch.Generator().manual_seed(seed))
        for epoch in range(epochs):
            for xb, yb in loader:
                fn.train_step(model, optimizer, xb, yb)
            pt, proba_t = fn.evaluate(model, torch.tensor(Xt))
            pv, proba_v = fn.evaluate(model, torch.tensor(Xv))
            rows.append(history(epoch, yt, pt, proba_t, yv, pv, proba_v))
    elif framework == 'scikit-learn':
        from sklearn.neural_network import MLPClassifier
        model = MLPClassifier(hidden_layer_sizes=(hidden,), learning_rate_init=learning_rate,
                              random_state=seed, batch_size=64, max_iter=1)
        for epoch in range(epochs):
            model.partial_fit(Xt, yt, classes=np.arange(10))
            proba_t, proba_v = model.predict_proba(Xt), model.predict_proba(Xv)
            rows.append(history(epoch, yt, proba_t.argmax(1), proba_t, yv, proba_v.argmax(1), proba_v))
    else:
        # TensorFlow is an optional full reference, not a second set of exercises.
        import tensorflow as tf
        tf.keras.utils.set_random_seed(seed)
        model = tf.keras.Sequential([tf.keras.Input(shape=(64,)), tf.keras.layers.Dense(hidden, activation='relu'), tf.keras.layers.Dense(10)])
        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate), loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True))
        rng = np.random.default_rng(seed)
        for epoch in range(epochs):
            indices = rng.permutation(len(Xt))
            for batch in range(0, len(indices), 64):
                ids = indices[batch:batch+64]
                model.train_on_batch(Xt[ids], yt[ids])
            proba_t = tf.nn.softmax(model(Xt, training=False)).numpy()
            proba_v = tf.nn.softmax(model(Xv, training=False)).numpy()
            rows.append(history(epoch, yt, proba_t.argmax(1), proba_t, yv, proba_v.argmax(1), proba_v))
    result = dict(model=model, framework=framework, fn=fn, X=X, data=data, train_ids=train_ids,
                  valid_ids=valid_ids, test_ids=test_ids, curves=pd.DataFrame(rows),
                  metrics=dict(valid_accuracy=rows[-1]['valid_accuracy'], valid_loss=rows[-1]['valid_loss']))
    result['probabilities'] = predict(result, Xv)
    result['predictions'] = result['probabilities'].argmax(1)
    result['samples'] = pd.DataFrame(dict(actual=yv, predicted=result['predictions']), index=valid_ids)
    return result


def history(epoch, yt, pt, proba_t, yv, pv, proba_v):
    return dict(epoch=epoch+1, train_loss=log_loss(yt, proba_t, labels=np.arange(10)),
                valid_loss=log_loss(yv, proba_v, labels=np.arange(10)),
                train_accuracy=accuracy_score(yt, pt), valid_accuracy=accuracy_score(yv, pv))


def predict(result, X):
    if result['framework'] == 'PyTorch':
        import torch
        return result['fn'].evaluate(result['model'], torch.tensor(X, dtype=torch.float32))[1]
    if result['framework'] == 'TensorFlow':
        import tensorflow as tf
        return tf.nn.softmax(result['model'](X, training=False)).numpy()
    return result['model'].predict_proba(X)


def perturb(image, noise, shift, seed=42):
    """Horizontal zero-padded shift, never np.roll wrap-around."""
    shifted = np.zeros_like(image)
    if shift > 0:
        shifted[:, shift:] = image[:, :-shift]
    elif shift < 0:
        shifted[:, :shift] = image[:, -shift:]
    else:
        shifted[:] = image
    return np.clip(shifted + np.random.default_rng(seed).normal(0, noise, shifted.shape), 0, 1).astype('float32')
