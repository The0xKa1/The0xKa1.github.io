from sklearn.datasets import load_wine, load_digits
from sklearn.model_selection import train_test_split
import numpy as np


def wine_split():
    data = load_wine(as_frame=True)
    return train_test_split(data.data, data.target, test_size=0.2, stratify=data.target, random_state=42)


def digits_split():
    data = load_digits()
    ids = np.arange(len(data.target))
    dev, test = train_test_split(ids, test_size=0.2, stratify=data.target, random_state=42)
    train, valid = train_test_split(dev, test_size=0.25, stratify=data.target[dev], random_state=42)
    return data, train, valid, test
