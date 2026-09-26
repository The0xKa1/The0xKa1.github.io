#!/usr/bin/env python3
"""Build one deterministic, self-contained course archive; never package workspace secrets."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'projects/ml-lab'
OUTPUT = ROOT / 'apps/web/public/downloads/ml-guide/ml-lab.zip'
EXCLUDED = {'.venv', '__pycache__', '.pytest_cache', 'outputs', '.git'}
SUFFIXES = {'.py', '.md', '.csv', '.txt', '.toml'}


def package():
    for path in ['app.py', 'requirements.txt', 'README.md', '.streamlit/config.toml']:
        if not (SOURCE / path).is_file():
            raise FileNotFoundError(path)
    files = sorted(p for p in SOURCE.rglob('*') if p.is_file()
                   and not EXCLUDED.intersection(p.relative_to(SOURCE).parts)
                   and (p.suffix in SUFFIXES or p.name == '.gitignore'))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, 'w', compression=ZIP_DEFLATED) as archive:
        for path in files:
            name = 'ml-lab/' + path.relative_to(SOURCE).as_posix()
            info = ZipInfo(name, date_time=(2026, 9, 26, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, path.read_bytes())
    with ZipFile(OUTPUT) as archive:
        assert archive.testzip() is None
        assert len(archive.namelist()) == len(files)
    print(f'{OUTPUT}\n{len(files)} files · {OUTPUT.stat().st_size} bytes\nsha256: {hashlib.sha256(OUTPUT.read_bytes()).hexdigest()}')


if __name__ == '__main__':
    package()
