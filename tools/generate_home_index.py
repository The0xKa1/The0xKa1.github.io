from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path, PurePosixPath
import re


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
MKDOCS_FILE = ROOT / "mkdocs.yml"
INDEX_FILE = DOCS_DIR / "index.md"
START_MARKER = "<!-- AUTO-GENERATED:START -->"
END_MARKER = "<!-- AUTO-GENERATED:END -->"


@dataclass
class NavNode:
    label: str | None = None
    path: str | None = None
    children: list["NavNode"] = field(default_factory=list)


def load_nav_lines() -> list[str]:
    lines = MKDOCS_FILE.read_text(encoding="utf-8").splitlines()
    for index, line in enumerate(lines):
        if line.strip() == "nav:":
            return lines[index + 1 :]
    raise RuntimeError("Could not find nav: section in mkdocs.yml")


def parse_nav(lines: list[str]) -> list[NavNode]:
    root: list[NavNode] = []
    stack: list[tuple[int, list[NavNode]]] = [(-1, root)]

    for raw_line in lines:
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if not raw_line.lstrip().startswith("- "):
            continue

        indent = len(raw_line) - len(raw_line.lstrip(" "))
        while len(stack) > 1 and indent <= stack[-1][0]:
            stack.pop()

        content = stripped[2:].rstrip()
        if content.endswith(":"):
            node = NavNode(label=content[:-1].strip())
        elif ": " in content:
            label, path = content.split(": ", 1)
            node = NavNode(label=label.strip(), path=path.strip())
        else:
            node = NavNode(path=content.strip())

        stack[-1][1].append(node)
        if node.path is None:
            stack.append((indent, node.children))

    return root


def markdown_title(path: str) -> str:
    file_path = DOCS_DIR / path
    if not file_path.exists():
        return PurePosixPath(path).stem

    lines = file_path.read_text(encoding="utf-8").splitlines()
    index = 0
    if lines and lines[0].strip() == "---":
        index += 1
        while index < len(lines) and lines[index].strip() != "---":
            index += 1
        index += 1

    heading_pattern = re.compile(r"^#\s+(.+?)\s*$")
    for line in lines[index:]:
        match = heading_pattern.match(line.strip())
        if match:
            return match.group(1)

    return PurePosixPath(path).stem.replace("-", " ")


def resolve_label(node: NavNode) -> str:
    if node.label:
        return node.label
    if node.path:
        return markdown_title(node.path)
    return "未命名分组"


def href_for(path: str) -> str:
    clean = path.replace("\\", "/")
    pure = PurePosixPath(clean)
    if pure.suffix != ".md":
        return clean
    if pure.name == "index.md":
        parent = pure.parent.as_posix()
        return "./" if parent == "." else f"{parent}/"
    return pure.with_suffix("").as_posix()


def count_leaf_pages(nodes: list[NavNode]) -> int:
    total = 0
    for node in nodes:
        if node.path:
            total += 1
        total += count_leaf_pages(node.children)
    return total


def count_groups(nodes: list[NavNode]) -> int:
    total = 0
    for node in nodes:
        if node.children:
            total += 1
            total += count_groups(node.children)
    return total


def latest_markdown_update() -> str:
    files = [path for path in DOCS_DIR.rglob("*.md") if path.name != "index.md" or path.parent != DOCS_DIR]
    latest = max(files, key=lambda item: item.stat().st_mtime)
    return datetime.fromtimestamp(latest.stat().st_mtime).strftime("%Y-%m-%d")


def render_links(nodes: list[NavNode], prefix: str = "") -> str:
    links: list[str] = []
    for node in nodes:
        label = resolve_label(node)
        link_label = f"{prefix} · {label}" if prefix else label
        if node.path:
            if label == markdown_title(node.path) and PurePosixPath(node.path).name == "index.md":
                link_label = f"{prefix} · 索引页" if prefix else "索引页"
            links.append(
                f'<a class="home-topic__link" href="{href_for(node.path)}">{link_label}</a>'
            )
        if node.children:
            next_prefix = label if not prefix else f"{prefix} · {label}"
            links.extend(render_links(node.children, next_prefix).splitlines())
    return "\n".join(links)


def render_group(node: NavNode, opened: bool) -> str:
    label = resolve_label(node)
    page_count = count_leaf_pages(node.children)
    details_open = " open" if opened else ""
    summary = (
        f'<summary><span>{label}</span>'
        f'<span class="home-topic__count">{page_count} 页</span></summary>'
    )
    links = render_links(node.children)
    return (
        f'<details class="home-topic"{details_open}>'
        f"{summary}"
        f'<div class="home-topic__links">{links}</div>'
        f"</details>"
    )


def render_card(node: NavNode, index: int) -> str:
    label = resolve_label(node)
    groups = [child for child in node.children if child.children]
    direct_links = [child for child in node.children if child.path]
    page_count = count_leaf_pages(node.children)
    group_count = len(groups)

    group_html = []
    if direct_links:
        group_html.append(
            '<div class="home-topic home-topic--flat"><div class="home-topic__links">'
            f"{render_links(direct_links)}"
            "</div></div>"
        )
    for group_index, group in enumerate(groups):
        group_html.append(render_group(group, opened=group_index == 0))

    return (
        '<article class="home-section-card">'
        '<div class="home-section-card__header">'
        f'<span class="home-section-card__index">{index:02d}</span>'
        f"<h3>{label}</h3>"
        f"<p>{group_count} 个专题 · {page_count} 个页面</p>"
        "</div>"
        f'<div class="home-section-card__body">{"".join(group_html)}</div>'
        "</article>"
    )


def build_home_markup(nav_tree: list[NavNode]) -> str:
    study = next((node for node in nav_tree if resolve_label(node) == "📚 学习笔记"), None)
    if study is None:
        raise RuntimeError("Could not find 学习笔记 section in nav")

    top_shortcuts = []
    for node in nav_tree:
        label = resolve_label(node)
        if label == "首页":
            continue
        if node.path:
            top_shortcuts.append(
                f'<a class="home-shortcut" href="{href_for(node.path)}">{label}</a>'
            )

    study_index = next((child for child in study.children if child.path), None)
    if study_index:
        top_shortcuts.insert(
            0,
            f'<a class="home-shortcut home-shortcut--accent" href="{href_for(study_index.path)}">'
            "总览入口</a>",
        )

    cards = [child for child in study.children if child.children]
    total_pages = count_leaf_pages(nav_tree)
    total_topics = sum(len([child for child in card.children if child.children]) for card in cards)
    latest_update = latest_markdown_update()

    card_markup = "\n".join(render_card(card, index + 1) for index, card in enumerate(cards))
    shortcuts = "\n".join(top_shortcuts)

    return f"""
<section class="home-index">
  <div class="home-index__hero">
    <p class="home-index__eyebrow">AUTO ATLAS</p>
    <h2>站点目录</h2>
    <p class="home-index__lead">首页目录由 <code>mkdocs.yml</code> 自动生成，顺序和站点导航保持一致，后续只需要重新运行脚本即可刷新。</p>
    <div class="home-index__tags">
      <span>{len(cards)} 大分区</span>
      <span>{total_topics} 个专题</span>
      <span>{total_pages} 个页面</span>
      <span>最近更新 {latest_update}</span>
    </div>
  </div>

  <div class="home-metrics">
    <article class="home-metric">
      <span class="home-metric__label">全站页面</span>
      <strong>{{{{ pages }}}}</strong>
      <p>由统计插件在构建时填充</p>
    </article>
    <article class="home-metric">
      <span class="home-metric__label">累计字数</span>
      <strong>{{{{ words }}}}</strong>
      <p>保留首页现有字数统计</p>
    </article>
    <article class="home-metric">
      <span class="home-metric__label">代码行数</span>
      <strong>{{{{ codes }}}}</strong>
      <p>适合快速感知内容密度</p>
    </article>
    <article class="home-metric">
      <span class="home-metric__label">导航分组</span>
      <strong>{count_groups(nav_tree)}</strong>
      <p>按导航树自动汇总出的栏目数量</p>
    </article>
  </div>

  <div class="home-shortcuts">
    {shortcuts}
  </div>

  <div class="home-section-grid">
    {card_markup}
  </div>
</section>
""".strip()


def update_index(markup: str) -> None:
    content = INDEX_FILE.read_text(encoding="utf-8")
    block = f"{START_MARKER}\n{markup}\n{END_MARKER}"
    if START_MARKER in content and END_MARKER in content:
        content = re.sub(
            rf"{re.escape(START_MARKER)}.*?{re.escape(END_MARKER)}",
            block,
            content,
            flags=re.S,
        )
    else:
        if not content.endswith("\n"):
            content += "\n"
        content += f"\n{block}\n"

    INDEX_FILE.write_text(content, encoding="utf-8")


def main() -> None:
    nav_tree = parse_nav(load_nav_lines())
    markup = build_home_markup(nav_tree)
    update_index(markup)
    print(f"Updated {INDEX_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
