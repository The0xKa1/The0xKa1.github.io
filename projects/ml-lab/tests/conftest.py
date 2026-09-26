import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import ast
import pytest
from common import runtime

@pytest.fixture(autouse=True)
def isolated_exercises(tmp_path, monkeypatch):
    """框架测试使用临时骨架，不读写学习者已填写的 exercises.py。"""
    original = runtime.source_path
    paths = {}
    for project in ['image_lab', 'classification_arena', 'wine_classification', 'wine_regression', 'clustering', 'color_compression', 'digits', 'recommender', 'anomaly', 'gridworld']:
        source = original(project,'演示').read_text()
        tree = ast.parse(source)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                node.body = ast.parse(f'raise NotImplementedError({node.name!r})').body
        path = tmp_path / f'{project}.py'
        path.write_text(ast.unparse(tree))
        paths[project] = path
    monkeypatch.setattr(runtime, 'source_path', lambda project,mode: paths[project] if mode=='练习' else original(project,mode))
    return paths
