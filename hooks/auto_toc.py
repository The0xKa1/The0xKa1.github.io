from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
import posixpath
import re


TOKEN = "{{TableOfContents}}"
ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"


@dataclass
class TocItem:
    title: str
    url: str | None = None
    children: list["TocItem"] = field(default_factory=list)
    is_index: bool = False


def _is_same_page(item, page) -> bool:
    item_src = getattr(getattr(item, "file", None), "src_path", None)
    page_src = getattr(getattr(page, "file", None), "src_path", None)
    if item_src and page_src:
        return item_src == page_src
    return getattr(item, "url", None) == getattr(page, "url", None)


def _first_child_url(item) -> str | None:
    direct_url = getattr(item, "url", None)
    if direct_url:
        return direct_url

    for child in getattr(item, "children", []) or []:
        child_url = _first_child_url(child)
        if child_url:
            return child_url
    return None


def _normalize_nav_item(item, page) -> TocItem | None:
    if _is_same_page(item, page):
        return None

    title = getattr(item, "title", None) or "未命名"
    item_src = getattr(getattr(item, "file", None), "src_path", None) or ""
    is_index = item_src.replace("\\", "/").endswith("/index.md") or item_src == "index.md"
    children = []
    for child in getattr(item, "children", []) or []:
        normalized = _normalize_nav_item(child, page)
        if normalized is not None:
            children.append(normalized)

    if title == "未命名" and is_index:
        title = "概览"

    direct_url = getattr(item, "url", None)
    return TocItem(
        title=title,
        url=_relative_nav_url(direct_url, page),
        children=children,
        is_index=is_index,
    )


def _nav_items_from_page(page) -> list[TocItem]:
    parent = getattr(page, "parent", None)
    if parent is None:
        return []

    items = []
    for child in getattr(parent, "children", []) or []:
        normalized = _normalize_nav_item(child, page)
        if normalized is not None:
            items.append(normalized)
    return items


def _relative_nav_url(target_url: str | None, page) -> str | None:
    if not target_url:
        return None

    page_url = getattr(page, "url", "") or ""
    if not page_url:
        return target_url

    page_dir = page_url if page_url.endswith("/") else posixpath.dirname(page_url)
    relative = posixpath.relpath(target_url, start=page_dir or ".")
    if relative == ".":
        return "./"
    if target_url.endswith("/") and not relative.endswith("/"):
        relative += "/"
    return relative


def _extract_title(file_path: Path) -> str:
    lines = file_path.read_text(encoding="utf-8").splitlines()
    index = 0
    if lines and lines[0].strip() == "---":
        index += 1
        while index < len(lines) and lines[index].strip() != "---":
            index += 1
        index += 1

    pattern = re.compile(r"^#\s+(.+?)\s*$")
    for line in lines[index:]:
        match = pattern.match(line.strip())
        if match:
            return match.group(1)
    return file_path.stem


def _relative_url(base_dir: Path, file_path: Path) -> str:
    rel = file_path.relative_to(base_dir).as_posix()
    if rel.endswith("/index.md"):
        return "./" + rel[:-8]
    if rel == "index.md":
        return "./"
    if rel.endswith(".md"):
        return "./" + rel[:-3]
    return "./" + rel


def _filesystem_items(page) -> list[TocItem]:
    src_path = getattr(getattr(page, "file", None), "src_path", None)
    if not src_path:
        return []

    current = DOCS_DIR / src_path
    current_dir = current.parent
    items = []
    for file_path in sorted(current_dir.glob("*.md")):
        if file_path.name == current.name:
            continue
        items.append(
            TocItem(
                title=_extract_title(file_path),
                url=_relative_url(current_dir, file_path),
                is_index=file_path.name == "index.md",
            )
        )
    return items


def _collect_leaf_count(items: list[TocItem]) -> int:
    total = 0
    for item in items:
        if item.url:
            total += 1
        total += _collect_leaf_count(item.children)
    return total


def _collect_group_count(items: list[TocItem]) -> int:
    total = 0
    for item in items:
        if item.children:
            total += 1
        total += _collect_group_count(item.children)
    return total


def _preferred_url(item: TocItem) -> str | None:
    if item.url:
        return item.url

    for child in item.children:
        if child.is_index and child.url:
            return child.url

    for child in item.children:
        nested = _preferred_url(child)
        if nested:
            return nested

    return None


def _visible_child_count(item: TocItem, flat: bool) -> int:
    if flat:
        return _collect_leaf_count(item.children)
    return sum(1 for child in item.children if not (child.is_index and child.title == "概览"))


def _directory_stats(page) -> dict[str, str]:
    src_path = getattr(getattr(page, "file", None), "src_path", None)
    if not src_path:
        return {"notes": "0", "words": "0", "updated": "-"}

    current = DOCS_DIR / src_path
    current_dir = current.parent
    markdown_files = [path for path in current_dir.glob("*.md") if path.name != current.name]

    word_total = 0
    for file_path in markdown_files:
        text = file_path.read_text(encoding="utf-8")
        word_total += len(re.findall(r"[\u4e00-\u9fff]|[A-Za-z0-9_]+", text))

    if markdown_files:
        latest = max(markdown_files, key=lambda path: path.stat().st_mtime)
        updated = datetime.fromtimestamp(latest.stat().st_mtime).strftime("%Y-%m-%d")
    else:
        updated = "-"

    return {
        "notes": str(len(markdown_files)),
        "words": str(word_total),
        "updated": updated,
    }


def _render_links(items: list[TocItem], prefix: str = "") -> str:
    parts: list[str] = []
    for item in items:
        if item.is_index and item.title == "概览":
            continue
        label = f"{prefix} · {item.title}" if prefix else item.title
        if item.url:
            parts.append(f'<a class="auto-toc__link" href="{item.url}">{label}</a>')
        if item.children:
            next_prefix = item.title if not prefix else f"{prefix} · {item.title}"
            parts.append(_render_links(item.children, next_prefix))
    return "".join(parts)


def _render_group_links(item: TocItem, flat: bool) -> str:
    if flat:
        return _render_links(item.children)

    links: list[str] = []
    for child in item.children:
        if child.is_index and child.title == "概览":
            continue
        href = _preferred_url(child) or "javascript:;"
        links.append(f'<a class="auto-toc__link" href="{href}">{child.title}</a>')
    return "".join(links)


def _render_item(item: TocItem, opened: bool = False, flat: bool = True) -> str:
    if not item.children:
        href = item.url or "javascript:;"
        return f'<a class="auto-toc__link auto-toc__link--solo" href="{href}">{item.title}</a>'

    open_attr = " open" if opened else ""
    header = item.title
    if item.url:
        header = f'<a href="{item.url}">{item.title}</a>'
    return (
        f'<details class="auto-toc__group"{open_attr}>'
        f'<summary>{header}<span>{_visible_child_count(item, flat)} 项</span></summary>'
        f'<div class="auto-toc__links">{_render_group_links(item, flat=flat)}</div>'
        "</details>"
    )


def _render(items: list[TocItem], page) -> str:
    stats = _directory_stats(page)
    leaf_count = _collect_leaf_count(items)
    group_count = _collect_group_count(items)
    page_src = getattr(getattr(page, "file", None), "src_path", "") or ""
    flat = page_src.replace("\\", "/") != "NOTE/index.md"
    body = "".join(_render_item(item, opened=index == 0, flat=flat) for index, item in enumerate(items))
    return (
        '<section class="auto-toc">'
        '<div class="auto-toc__intro">'
        '<p class="auto-toc__eyebrow">AUTO GENERATED</p>'
        '<h2>目录</h2>'
        '<p class="auto-toc__desc">基于当前页面所在栏目自动生成，顺序默认跟随站点导航。</p>'
        "</div>"
        '<div class="auto-toc__stats">'
        f'<div class="auto-toc__stat"><span>条目</span><strong>{leaf_count}</strong></div>'
        f'<div class="auto-toc__stat"><span>分组</span><strong>{group_count}</strong></div>'
        f'<div class="auto-toc__stat"><span>字数</span><strong>{stats["words"]}</strong></div>'
        f'<div class="auto-toc__stat"><span>更新</span><strong>{stats["updated"]}</strong></div>'
        "</div>"
        f'<div class="auto-toc__body">{body}</div>'
        "</section>"
    )


def on_page_markdown(markdown, page, config, files):
    if TOKEN not in markdown:
        return markdown

    items = _nav_items_from_page(page)
    if not items:
        items = _filesystem_items(page)

    return markdown.replace(TOKEN, _render(items, page))
