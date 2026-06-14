#!/usr/bin/env python3
"""Generate colored Excalidraw source files for compiler notes.

The diagrams are rendered through the Excalidraw MCP before screenshots are
saved as PNG. This script only prepares editable .excalidraw scene JSON.
"""

from __future__ import annotations

import json
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CH11 = ROOT / "chap11"
CH13 = ROOT / "chap13"
UPDATED = 1700000000000
random.seed(20260614)

PALETTE = {
    "blue": ("#1971c2", "#a5d8ff"),
    "green": ("#2b8a3e", "#b2f2bb"),
    "orange": ("#e67700", "#ffd8a8"),
    "purple": ("#7048e8", "#d0bfff"),
    "red": ("#c92a2a", "#ffc9c9"),
    "teal": ("#0c8599", "#c3fae8"),
    "yellow": ("#f08c00", "#fff3bf"),
    "gray": ("#495057", "#f1f3f5"),
}


def rid(prefix: str) -> str:
    return f"{prefix}-{random.randint(100000, 999999)}"


def seed() -> int:
    return random.randint(1, 2**31 - 1)


def base(stroke: str = "#1e1e1e", fill: str = "transparent", *, dashed: bool = False) -> dict:
    return {
        "strokeColor": stroke,
        "backgroundColor": fill,
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeStyle": "dashed" if dashed else "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "seed": seed(),
        "version": 1,
        "versionNonce": seed(),
        "isDeleted": False,
        "updated": UPDATED,
        "link": None,
        "locked": False,
    }


def text(x: int, y: int, value: str, *, size: int = 20, color: str = "#1e1e1e", width: int | None = None) -> dict:
    width = width or max(80, int(max(len(line) for line in value.split("\n")) * size * 0.62) + 12)
    height = int(size * 1.25 * (value.count("\n") + 1))
    return {
        "id": rid("text"),
        "type": "text",
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "angle": 0,
        **base(stroke=color),
        "roundness": None,
        "boundElements": [],
        "text": value,
        "fontSize": size,
        "fontFamily": 1,
        "textAlign": "left",
        "verticalAlign": "top",
        "baseline": int(size * 0.85),
        "originalText": value,
        "lineHeight": 1.25,
        "containerId": None,
    }


def label_for(container_id: str, x: int, y: int, w: int, h: int, value: str, *, size: int = 18, color: str = "#1e1e1e") -> dict:
    del container_id
    return {
        "id": rid("label"),
        "type": "text",
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "angle": 0,
        **base(stroke=color),
        "roundness": None,
        "boundElements": [],
        "containerId": None,
        "text": value,
        "fontSize": size,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle",
        "baseline": int(size * 0.85),
        "originalText": value,
        "lineHeight": 1.25,
    }


def rect(x: int, y: int, w: int, h: int, value: str, color: str = "blue", *, size: int = 18) -> list[dict]:
    stroke, fill = PALETTE[color]
    eid = rid("rect")
    return [
        {
            "id": eid,
            "type": "rectangle",
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "angle": 0,
            **base(stroke=stroke, fill=fill),
            "roundness": {"type": 3},
            "boundElements": [],
        },
        label_for(eid, x, y, w, h, value, size=size),
    ]


def ellipse(x: int, y: int, w: int, h: int, value: str, color: str = "gray", *, size: int = 20) -> list[dict]:
    stroke, fill = PALETTE[color]
    eid = rid("ellipse")
    return [
        {
            "id": eid,
            "type": "ellipse",
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "angle": 0,
            **base(stroke=stroke, fill=fill),
            "roundness": {"type": 2},
            "boundElements": [],
        },
        label_for(eid, x, y, w, h, value, size=size),
    ]


def diamond(x: int, y: int, w: int, h: int, value: str, color: str = "yellow", *, size: int = 16) -> list[dict]:
    stroke, fill = PALETTE[color]
    eid = rid("diamond")
    return [
        {
            "id": eid,
            "type": "diamond",
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "angle": 0,
            **base(stroke=stroke, fill=fill),
            "roundness": {"type": 2},
            "boundElements": [],
        },
        label_for(eid, x, y, w, h, value, size=size),
    ]


def arrow(x: int, y: int, pts: list[tuple[int, int]], *, color: str = "#1e1e1e", dashed: bool = False, label: str | None = None) -> list[dict]:
    max_x = max(abs(px) for px, _ in pts) or 1
    max_y = max(abs(py) for _, py in pts) or 1
    aid = rid("arrow")
    out = [{
        "id": aid,
        "type": "arrow",
        "x": x,
        "y": y,
        "width": max_x,
        "height": max_y,
        "angle": 0,
        **base(stroke=color, dashed=dashed),
        "roundness": {"type": 2},
        "boundElements": [],
        "points": [[float(px), float(py)] for px, py in pts],
        "lastCommittedPoint": None,
        "startBinding": None,
        "endBinding": None,
        "startArrowhead": None,
        "endArrowhead": "arrow",
    }]
    if label:
        mid = pts[len(pts) // 2]
        out.append(text(x + mid[0] + 8, y + mid[1] - 26, label, size=15, color=color))
    return out


def line(x: int, y: int, pts: list[tuple[int, int]], *, color: str = "#1e1e1e", dashed: bool = False) -> dict:
    return {
        "id": rid("line"),
        "type": "line",
        "x": x,
        "y": y,
        "width": max(abs(px) for px, _ in pts) or 1,
        "height": max(abs(py) for _, py in pts) or 1,
        "angle": 0,
        **base(stroke=color, dashed=dashed),
        "roundness": {"type": 2},
        "boundElements": [],
        "points": [[float(px), float(py)] for px, py in pts],
        "lastCommittedPoint": None,
        "startBinding": None,
        "endBinding": None,
        "startArrowhead": None,
        "endArrowhead": None,
    }


def write(path: Path, elements: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = {
        "type": "excalidraw",
        "version": 2,
        "source": "compiler-notes-excalidraw-mcp",
        "elements": elements,
        "appState": {"gridSize": None, "viewBackgroundColor": "#ffffff"},
        "files": {},
    }
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")


def allocation_pipeline() -> list[dict]:
    e: list[dict] = [text(70, 35, "Graph-coloring register allocation", size=30)]
    boxes = [
        (70, 160, "Build\ninterference graph", "blue"),
        (310, 160, "Simplify\nremove degree < K", "green"),
        (550, 160, "Spill\ncandidate node", "orange"),
        (790, 160, "Select\nassign colors", "purple"),
        (790, 390, "Done", "green"),
        (550, 390, "Rewrite\nload/store", "red"),
    ]
    for x, y, label, color in boxes:
        e += rect(x, y, 190, 82, label, color)
    for x in (260, 500, 740):
        e += arrow(x, 201, [(0, 0), (50, 0)])
    e += arrow(885, 242, [(0, 0), (0, 148)], color="#2b8a3e", label="no actual spill")
    e += arrow(790, 245, [(0, 0), (-55, 90), (-145, 145), (-50, 145)], color="#c92a2a", label="actual spill")
    e.append(text(300, 260, "repeat simplify after every removal", size=17, color="#495057"))
    e.append(text(60, 520, "If actual spill occurs, rewrite load/store and rebuild the graph.", size=18, color="#c92a2a"))
    e.append(text(60, 555, "Rule of thumb: low-degree nodes are safe; high-degree nodes may need memory.", size=18, color="#495057"))
    return e


def interference_graph() -> list[dict]:
    e: list[dict] = [text(60, 35, "Interference graph (Graph 11.1)", size=30), text(60, 72, "solid = cannot share a register, dashed = MOVE", size=17, color="#495057")]
    pos = {"f": (420, 135), "e": (300, 240), "b": (540, 240), "m": (700, 240), "j": (300, 370), "k": (540, 370), "d": (300, 505), "c": (700, 505), "h": (430, 600), "g": (570, 600)}
    edges = [("f", "e"), ("f", "b"), ("e", "j"), ("j", "k"), ("b", "k"), ("b", "m"), ("m", "c"), ("j", "d"), ("d", "c"), ("d", "h"), ("h", "g"), ("g", "c")]
    for a, b in edges:
        x1, y1 = pos[a]; x2, y2 = pos[b]
        e.append(line(x1, y1, [(0, 0), (x2 - x1, y2 - y1)], color="#495057"))
    for a, b in [("b", "j"), ("c", "d")]:
        x1, y1 = pos[a]; x2, y2 = pos[b]
        e.append(line(x1, y1, [(0, 0), (x2 - x1, y2 - y1)], color="#e67700", dashed=True))
    low = {"g", "h", "c", "f"}
    move_related = {"b", "j", "c", "d"}
    for name, (x, y) in pos.items():
        color = "green" if name in low else ("orange" if name in move_related else "blue")
        e += ellipse(x - 30, y - 30, 60, 60, name, color, size=23)
    e += rect(805, 160, 230, 190, "K = 4\ninitial low degree:\ng, h, c, f", "green", size=18)
    e += rect(805, 400, 230, 120, "MOVE-related:\nb-j, c-d", "orange", size=18)
    return e


def coalescing_move() -> list[dict]:
    e: list[dict] = [text(70, 35, "Coalescing removes redundant MOVE", size=30)]
    e += ellipse(105, 165, 90, 90, "t1", "blue", size=24)
    e += ellipse(300, 165, 90, 90, "t2", "blue", size=24)
    e.append(line(195, 210, [(0, 0), (105, 0)], color="#e67700", dashed=True))
    e.append(text(155, 275, "MOVE t1 <- t2\nno interference edge", size=18, color="#e67700"))
    e += arrow(430, 210, [(0, 0), (120, 0)], color="#495057")
    e += ellipse(590, 165, 120, 90, "t1/t2", "green", size=24)
    e += rect(800, 145, 260, 135, "Conservative check\nBriggs or George\nbefore merging", "yellow", size=18)
    e += arrow(710, 210, [(0, 0), (90, 0)], color="#f08c00")
    e.append(text(570, 295, "same register\nMOVE deleted", size=18, color="#2b8a3e"))
    return e


def coalescing_workflow() -> list[dict]:
    e: list[dict] = [text(60, 35, "Coloring with coalescing", size=30)]
    top = [
        (60, "Build", "blue"),
        (260, "Simplify", "green"),
        (460, "Coalesce", "orange"),
        (660, "Freeze", "yellow"),
        (860, "Spill", "red"),
    ]
    bottom = [
        (860, "Select", "purple"),
        (660, "Done", "green"),
        (460, "Rewrite", "red"),
    ]
    for x, label, color in top:
        e += rect(x, 165, 150, 70, label, color, size=20)
    for x, label, color in bottom:
        e += rect(x, 365, 150, 70, label, color, size=20)
    for x in (210, 410, 610, 810):
        e += arrow(x, 200, [(0, 0), (50, 0)])
    e += arrow(935, 235, [(0, 0), (0, 130)], color="#7048e8")
    e += arrow(860, 400, [(0, 0), (-50, 0)], color="#2b8a3e", label="no actual spill")
    e += arrow(860, 415, [(0, 0), (-250, 0)], color="#c92a2a", label="actual spill")
    e.append(text(60, 500, "Freeze makes selected MOVE edges non-candidates, then simplification resumes.", size=18, color="#495057"))
    e.append(text(60, 535, "If Select finds actual spills, Rewrite inserts load/store and the allocator starts over.", size=18, color="#c92a2a"))
    return e


def tiger_pipeline() -> list[dict]:
    e: list[dict] = [text(70, 35, "Tiger register-allocation pipeline", size=30)]
    nodes = [
        (60, "AS_instrList\nabstract asm", "blue"),
        (245, "FlowGraph\nFG_AssemFlowGraph", "teal"),
        (430, "Liveness\nLive_liveness", "green"),
        (615, "Live_graph\ninterference + moves", "orange"),
        (800, "Color\nCOL_color", "purple"),
        (985, "Real assembly\nphysical registers", "green"),
    ]
    for x, label, color in nodes:
        e += rect(x, 165, 155, 100, label, color, size=16)
        if x > 60:
            e += arrow(x - 30, 215, [(0, 0), (30, 0)], color="#495057")
    return e


def storage_organization() -> list[dict]:
    e: list[dict] = [text(70, 35, "Storage organization", size=30)]
    blocks = [
        ("Code", "blue"),
        ("Static", "gray"),
        ("Stack", "orange"),
        ("Free space", "yellow"),
        ("Heap", "teal"),
    ]
    y = 115
    for label, color in blocks:
        e += rect(260, y, 260, 78, label, color, size=21)
        y += 78
    e += arrow(560, 330, [(0, 0), (0, -90)], color="#e67700", label="stack grows down")
    e += arrow(560, 430, [(0, 0), (0, 70)], color="#0c8599", label="heap grows up")
    e.append(text(140, 122, "Low", size=21, color="#495057"))
    e.append(text(140, 505, "High", size=21, color="#495057"))
    return e


def copying_collection() -> list[dict]:
    e: list[dict] = [text(70, 35, "Copying collection", size=30)]
    e += rect(90, 145, 320, 245, "from-space\nreachable + garbage", "orange", size=21)
    e += rect(620, 145, 320, 245, "to-space\ncompact reachable copy", "teal", size=21)
    e += arrow(430, 265, [(0, 0), (170, 0)], color="#0c8599", label="copy reachable")
    e += arrow(670, 350, [(0, 0), (220, 0)], color="#2b8a3e")
    e.append(text(655, 322, "scan", size=17, color="#2b8a3e"))
    e.append(text(875, 322, "next", size=17, color="#2b8a3e"))
    e.append(text(105, 430, "After collection: from-space can be discarded.", size=18, color="#495057"))
    e.append(text(625, 430, "Then swap the roles of the two spaces.", size=18, color="#2b8a3e"))
    return e


def main() -> None:
    write(CH11 / "allocation-pipeline.excalidraw", allocation_pipeline())
    write(CH11 / "interference-graph-11-1.excalidraw", interference_graph())
    write(CH11 / "coalescing-move.excalidraw", coalescing_move())
    write(CH11 / "coalescing-workflow.excalidraw", coalescing_workflow())
    write(CH11 / "tiger-regalloc-pipeline.excalidraw", tiger_pipeline())
    write(CH13 / "storage-organization.excalidraw", storage_organization())
    write(CH13 / "copying-collection.excalidraw", copying_collection())


if __name__ == "__main__":
    main()
