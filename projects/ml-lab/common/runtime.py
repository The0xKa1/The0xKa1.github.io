"""每次运行直接编译练习源码，避免同一秒保存时误用 .pyc。"""
from pathlib import Path
from types import ModuleType
import hashlib
import json
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]


def source_path(project, mode):
    return ROOT / ('solutions' if mode == '演示' else f'projects/{project}') / (f'{project}.py' if mode == '演示' else 'exercises.py')


def load_functions(project, mode):
    path = source_path(project, mode)
    module = ModuleType(f'lab_{project}_{mode}')
    module.__file__ = str(path)
    exec(compile(path.read_text(encoding='utf-8'), str(path), 'exec'), module.__dict__)
    return module


def fingerprint(project, mode, params):
    payload = json.dumps(params, sort_keys=True, ensure_ascii=False, default=str).encode()
    return hashlib.sha256(source_path(project, mode).read_bytes() + payload).hexdigest()


def json_default(value):
    if isinstance(value, pd.DataFrame):
        return value.to_dict(orient='records')
    if isinstance(value, (np.ndarray, pd.Series)):
        return value.tolist()
    if isinstance(value, np.generic):
        return value.item()
    return str(value)
