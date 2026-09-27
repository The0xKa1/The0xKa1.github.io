#!/usr/bin/env python3
"""从独立实验仓库更新网站下载包；网站构建本身不依赖此仓库。"""
import argparse
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='从独立 ml-lab 仓库生成网站下载包')
    parser.add_argument('--source', type=Path, default=ROOT.parent / 'ml-lab', help='独立实验仓库位置')
    args = parser.parse_args()
    source = args.source.expanduser().resolve()
    script = source / 'scripts/package.py'
    if not script.is_file():
        parser.error(f'找不到 {script}。请先获取独立实验仓库，或使用 --source 指定位置。')
    subprocess.run([sys.executable, str(script), '--output', str(ROOT / 'apps/web/public/downloads/ml-guide/ml-lab.zip')], check=True)
