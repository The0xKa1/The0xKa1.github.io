#!/usr/bin/env python3
"""Generate excalidraw files for chap10 dataflow diagrams.

Style follows content/NOTE/CompilerPrinciple/img/chap8/cfg-example.excalidraw:
hachure fill, roughness=1, fontFamily=1 (Virgil), strokeWidth=2.
"""
import json
import os
import random
import sys

random.seed(20260527)

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ----- helpers ---------------------------------------------------------------
def _seed():
    return random.randint(1, 2**31 - 1)

def _id(prefix):
    return f"{prefix}-{random.randint(100000, 999999)}"

UPDATED = 1700000000000

def base_style(stroke="#1e1e1e", bg="transparent", fill="hachure", sw=2):
    return {
        "strokeColor": stroke,
        "backgroundColor": bg,
        "fillStyle": fill,
        "strokeWidth": sw,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "seed": _seed(),
        "version": 1,
        "versionNonce": _seed(),
        "isDeleted": False,
        "updated": UPDATED,
        "link": None,
        "locked": False,
    }

def rect(x, y, w, h, text, *, font_size=18, rounded=True, bg="transparent", stroke="#1e1e1e"):
    rid = _id("rectangle")
    tid = _id("text")
    r = {
        "id": rid,
        "type": "rectangle",
        "x": x, "y": y, "width": w, "height": h, "angle": 0,
        **base_style(stroke=stroke, bg=bg),
        "roundness": {"type": 3} if rounded else None,
        "boundElements": [{"id": tid, "type": "text"}],
    }
    t = {
        "id": tid,
        "type": "text",
        "x": x, "y": y, "width": w, "height": h, "angle": 0,
        **base_style(stroke=stroke),
        "roundness": None,
        "boundElements": [],
        "containerId": rid,
        "text": text,
        "fontSize": font_size,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle",
        "baseline": int(font_size * 0.85),
        "originalText": text,
        "lineHeight": 1.25,
    }
    # rectangles' style sub-dict already exposed; harmonize fillStyle
    r["fillStyle"] = "hachure"
    t["fillStyle"] = "hachure"
    return r, t, rid

def ellipse(x, y, w, h, text, *, font_size=18, stroke="#1e1e1e", bg="transparent"):
    eid = _id("ellipse")
    tid = _id("text")
    e = {
        "id": eid,
        "type": "ellipse",
        "x": x, "y": y, "width": w, "height": h, "angle": 0,
        **base_style(stroke=stroke, bg=bg),
        "roundness": {"type": 2},
        "boundElements": [{"id": tid, "type": "text"}],
    }
    t = {
        "id": tid,
        "type": "text",
        "x": x, "y": y, "width": w, "height": h, "angle": 0,
        **base_style(stroke=stroke),
        "roundness": None,
        "boundElements": [],
        "containerId": eid,
        "text": text,
        "fontSize": font_size,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle",
        "baseline": int(font_size * 0.85),
        "originalText": text,
        "lineHeight": 1.25,
    }
    return e, t, eid

def diamond(x, y, w, h, text, *, font_size=18, stroke="#1e1e1e", bg="transparent"):
    did = _id("diamond")
    tid = _id("text")
    d = {
        "id": did,
        "type": "diamond",
        "x": x, "y": y, "width": w, "height": h, "angle": 0,
        **base_style(stroke=stroke, bg=bg),
        "roundness": {"type": 2},
        "boundElements": [{"id": tid, "type": "text"}],
    }
    t = {
        "id": tid,
        "type": "text",
        "x": x, "y": y, "width": w, "height": h, "angle": 0,
        **base_style(stroke=stroke),
        "roundness": None,
        "boundElements": [],
        "containerId": did,
        "text": text,
        "fontSize": font_size,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle",
        "baseline": int(font_size * 0.85),
        "originalText": text,
        "lineHeight": 1.25,
    }
    return d, t, did

def free_text(x, y, text, *, font_size=16, stroke="#1e1e1e", text_align="left", width=None):
    tid = _id("text")
    # rough width estimate
    if width is None:
        max_line = max(len(line) for line in text.split("\n"))
        width = int(max_line * font_size * 0.62) + 4
    height = int(font_size * 1.25 * (text.count("\n") + 1))
    return {
        "id": tid,
        "type": "text",
        "x": x, "y": y, "width": width, "height": height, "angle": 0,
        **base_style(stroke=stroke),
        "roundness": None,
        "boundElements": [],
        "text": text,
        "fontSize": font_size,
        "fontFamily": 1,
        "textAlign": text_align,
        "verticalAlign": "top",
        "baseline": int(font_size * 0.85),
        "originalText": text,
        "lineHeight": 1.25,
        "containerId": None,
    }

def arrow(x, y, points, *, start_id=None, end_id=None, stroke="#1e1e1e",
          stroke_style="solid", dashed=False, label=None, label_offset=(0, -14),
          kind="arrow"):
    aid = _id(kind)
    style = base_style(stroke=stroke)
    if dashed:
        style["strokeStyle"] = "dashed"
    a = {
        "id": aid,
        "type": kind,
        "x": x, "y": y,
        "width": max(abs(p[0]) for p in points) or 1,
        "height": max(abs(p[1]) for p in points) or 1,
        "angle": 0,
        **style,
        "roundness": {"type": 2},
        "boundElements": [],
        "points": [[float(px), float(py)] for px, py in points],
        "lastCommittedPoint": None,
        "startBinding": ({"elementId": start_id, "focus": 0, "gap": 1} if start_id else None),
        "endBinding":   ({"elementId": end_id,   "focus": 0, "gap": 1} if end_id else None),
        "startArrowhead": None,
        "endArrowhead": ("arrow" if kind == "arrow" else None),
    }
    extras = []
    if label is not None:
        # midpoint of polyline (rough)
        midx = x + sum(p[0] for p in points) / len(points)
        midy = y + sum(p[1] for p in points) / len(points)
        lx = midx + label_offset[0]
        ly = midy + label_offset[1]
        extras.append(free_text(int(lx), int(ly), label, font_size=14))
    return a, extras

# ----- writer ----------------------------------------------------------------
def write_excalidraw(path, elements, source="chap10-notes"):
    doc = {
        "type": "excalidraw",
        "version": 2,
        "source": source,
        "elements": elements,
        "appState": {"gridSize": None, "viewBackgroundColor": "#ffffff"},
        "files": {},
    }
    with open(path, "w") as f:
        json.dump(doc, f, indent=2)
    print("wrote", path)

# =========================================================================
# Diagram 1: control flow graph for the running example
# =========================================================================
def cfg_example():
    elements = []
    nodes = {}

    # 6 nodes laid out vertically with a back-edge from 5 to 2
    layout = [
        ("n1", 280, 30,  240, 56, "1:  a := 0"),
        ("n2", 280, 130, 240, 56, "2:  b := a + 1"),
        ("n3", 280, 230, 240, 56, "3:  c := c + b"),
        ("n4", 280, 330, 240, 56, "4:  a := b * 2"),
        ("n5", 280, 430, 240, 64, "5:  a < N ?"),
        ("n6", 280, 560, 240, 56, "6:  return c"),
    ]
    for name, x, y, w, h, text in layout:
        if name == "n5":
            d, t, did = diamond(x, y, w, h, text)
            elements.extend([d, t]); nodes[name] = did
        else:
            r, t, rid = rect(x, y, w, h, text)
            elements.extend([r, t]); nodes[name] = rid

    # straight-down arrows 1->2->3->4->5
    a, _ = arrow(400, 86,  [[0, 0], [0, 44]], start_id=nodes["n1"], end_id=nodes["n2"])
    elements.append(a)
    a, _ = arrow(400, 186, [[0, 0], [0, 44]], start_id=nodes["n2"], end_id=nodes["n3"])
    elements.append(a)
    a, _ = arrow(400, 286, [[0, 0], [0, 44]], start_id=nodes["n3"], end_id=nodes["n4"])
    elements.append(a)
    a, _ = arrow(400, 386, [[0, 0], [0, 44]], start_id=nodes["n4"], end_id=nodes["n5"])
    elements.append(a)
    # 5 -> 6 (false branch, straight down)
    a, _ = arrow(400, 494, [[0, 0], [0, 66]], start_id=nodes["n5"], end_id=nodes["n6"], label="false")
    elements.append(a)

    # 5 -> 2 back edge (true branch, sweeping right)
    a, extras = arrow(520, 462,
                      [[0, 0], [180, 0], [180, -300], [0, -300]],
                      start_id=nodes["n5"], end_id=nodes["n2"],
                      label="true", label_offset=(0, -10))
    elements.append(a); elements.extend(extras)

    # title
    elements.append(free_text(80, 30,
                              "Control-Flow Graph\nrunning example",
                              font_size=18))
    return elements

# =========================================================================
# Diagram 2: liveness rules (R1/R2/R3) schematic
# =========================================================================
def liveness_rules():
    elements = []

    # ---- panel R1 ----------------------------------------------------------
    px, py = 60, 80
    elements.append(free_text(px, py - 40,
                              "R1:  v ∈ in[m]  ∧  m ∈ succ[n]   ⇒   v ∈ out[n]",
                              font_size=18))
    n_r, n_t, n_id = rect(px + 60, py + 0, 180, 56, "n")
    elements.extend([n_r, n_t])
    m_r, m_t, m_id = rect(px + 60, py + 160, 180, 56, "m")
    elements.extend([m_r, m_t])
    a, _ = arrow(px + 150, py + 56, [[0, 0], [0, 104]], start_id=n_id, end_id=m_id)
    elements.append(a)
    elements.append(free_text(px + 250, py + 6,   "out[n] ⊇ {v}", font_size=15))
    elements.append(free_text(px + 250, py + 168, "in[m]  ∋ v",   font_size=15))

    # ---- panel R2 ----------------------------------------------------------
    px, py = 540, 80
    elements.append(free_text(px, py - 40,
                              "R2:  v ∈ use[n]   ⇒   v ∈ in[n]",
                              font_size=18))
    nr, nt, nid = rect(px + 80, py + 60, 200, 70, "n\nuse(n) ∋ v")
    elements.extend([nr, nt])
    elements.append(free_text(px + 80, py + 8,  "in[n] ∋ v", font_size=15))

    # ---- panel R3 ----------------------------------------------------------
    px, py = 60, 380
    elements.append(free_text(px, py - 40,
                              "R3:  v ∈ out[n]  ∧  v ∉ def[n]   ⇒   v ∈ in[n]",
                              font_size=18))
    nr, nt, nid = rect(px + 80, py + 60, 240, 100, "n\ndef(n) ∌ v")
    elements.extend([nr, nt])
    elements.append(free_text(px + 80, py + 8,   "in[n]  ⊇ {v}", font_size=15))
    elements.append(free_text(px + 80, py + 172, "out[n] ⊇ {v}", font_size=15))
    a, _ = arrow(px + 200, py + 60, [[0, 0], [0, -38]], stroke="#0b8043")
    elements.append(a)
    a, _ = arrow(px + 200, py + 162, [[0, 0], [0, 8]], stroke="#0b8043", dashed=True)
    elements.append(a)

    # ---- summary panel -----------------------------------------------------
    px, py = 540, 380
    elements.append(free_text(px, py - 40, "Combined equation", font_size=18))
    elements.append(free_text(px, py + 0,
        "in[n]  =  use[n]  ∪  ( out[n]  −  def[n] )\n\n"
        "out[n] =  ⋃  in[s]    where  s ∈ succ[n]",
        font_size=16))

    return elements

# =========================================================================
# Diagram 3: CFG annotated with final liveness sets
# =========================================================================
def liveness_annotated():
    elements = []
    nodes = {}

    layout = [
        ("n1", 280, 30,  240, 60, "1:  a := 0\nuse=∅   def={a}"),
        ("n2", 280, 150, 240, 60, "2:  b := a+1\nuse={a}  def={b}"),
        ("n3", 280, 270, 240, 60, "3:  c := c+b\nuse={b,c}  def={c}"),
        ("n4", 280, 390, 240, 60, "4:  a := b*2\nuse={b}  def={a}"),
        ("n5", 280, 510, 240, 76, "5:  a < N ?\nuse={a}  def=∅"),
        ("n6", 280, 640, 240, 60, "6:  return c\nuse={c}  def=∅"),
    ]
    for name, x, y, w, h, text in layout:
        font = 14
        if name == "n5":
            d, t, did = diamond(x, y, w, h, text)
            t["fontSize"] = font; t["baseline"] = int(font * 0.85)
            elements.extend([d, t]); nodes[name] = did
        else:
            r, t, rid = rect(x, y, w, h, text)
            t["fontSize"] = font; t["baseline"] = int(font * 0.85)
            elements.extend([r, t]); nodes[name] = rid

    # arrows 1->2->3->4->5
    a, _ = arrow(400, 90,  [[0, 0], [0, 60]], start_id=nodes["n1"], end_id=nodes["n2"])
    elements.append(a)
    a, _ = arrow(400, 210, [[0, 0], [0, 60]], start_id=nodes["n2"], end_id=nodes["n3"])
    elements.append(a)
    a, _ = arrow(400, 330, [[0, 0], [0, 60]], start_id=nodes["n3"], end_id=nodes["n4"])
    elements.append(a)
    a, _ = arrow(400, 450, [[0, 0], [0, 60]], start_id=nodes["n4"], end_id=nodes["n5"])
    elements.append(a)
    a, _ = arrow(400, 586, [[0, 0], [0, 54]], start_id=nodes["n5"], end_id=nodes["n6"], label="false")
    elements.append(a)
    # back edge 5 -> 2
    a, extras = arrow(520, 548,
                      [[0, 0], [200, 0], [200, -368], [0, -368]],
                      start_id=nodes["n5"], end_id=nodes["n2"],
                      label="true", label_offset=(8, -10))
    elements.append(a); elements.extend(extras)

    # left-side in/out annotations (red for in, blue for out, like a code reviewer's pen)
    info = [
        # x_in,  text
        ((130,  30, "in  = {c}",     "#c00f0c"), (130,  60, "out = {a,c}",  "#1e6fff")),
        ((130, 150, "in  = {a,c}",   "#c00f0c"), (130, 180, "out = {b,c}",  "#1e6fff")),
        ((130, 270, "in  = {b,c}",   "#c00f0c"), (130, 300, "out = {b,c}",  "#1e6fff")),
        ((130, 390, "in  = {b,c}",   "#c00f0c"), (130, 420, "out = {a,c}",  "#1e6fff")),
        ((130, 522, "in  = {a,c}",   "#c00f0c"), (130, 552, "out = {a,c}",  "#1e6fff")),
        ((130, 640, "in  = {c}",     "#c00f0c"), (130, 670, "out = ∅",      "#1e6fff")),
    ]
    for (xi, yi, ti, ci), (xo, yo, to, co) in info:
        elements.append(free_text(xi, yi, ti, font_size=14, stroke=ci))
        elements.append(free_text(xo, yo, to, font_size=14, stroke=co))

    # title + legend
    elements.append(free_text(60, 740,
        "Observation: a and b are never live at the same time  ⇒  they can share a register.",
        font_size=16, stroke="#0b8043"))
    return elements

# =========================================================================
# Diagram 4: Interference graph from the running example
# =========================================================================
def interference_graph():
    elements = []
    # three nodes: a, b, c. Edges: a-c overlap, b-c overlap; a-b never.
    a_e, a_t, a_id = ellipse(80, 120, 90, 90, "a", font_size=24)
    b_e, b_t, b_id = ellipse(440, 120, 90, 90, "b", font_size=24)
    c_e, c_t, c_id = ellipse(260, 320, 90, 90, "c", font_size=24)
    elements.extend([a_e, a_t, b_e, b_t, c_e, c_t])

    # circle radius 45, centers a=(125,165), b=(485,165), c=(305,365).
    # Edge a—c: from a's edge toward c's edge along the line.
    elements.append(_line(155, 198, 275 - 155, 332 - 198))
    # Edge b—c
    elements.append(_line(455, 198, 335 - 455, 332 - 198))
    # Non-edge a—b: dashed grey
    elements.append(_line(170, 165, 270, 0, stroke="#bbbbbb", dashed=True))

    # red X over the dashed line
    elements.append(free_text(290, 138, "✗", font_size=28, stroke="#c00f0c"))
    elements.append(free_text(220, 92, "no interference\n(a, b never simultaneously live)",
                              font_size=13, stroke="#c00f0c"))

    # title
    elements.append(free_text(60, 30, "Interference Graph", font_size=22))
    elements.append(free_text(60, 60, "nodes = temps,  edges = pairs that cannot share a register",
                              font_size=14))

    # implication
    elements.append(free_text(60, 460,
        "A 2-coloring exists:   { a, b } → R1     { c } → R2.",
        font_size=16, stroke="#0b8043"))
    return elements


def _line(x, y, dx, dy, *, stroke="#1e1e1e", dashed=False):
    style = base_style(stroke=stroke)
    if dashed:
        style["strokeStyle"] = "dashed"
    return {
        "id": _id("line"),
        "type": "line",
        "x": float(x), "y": float(y),
        "width": abs(dx) or 1, "height": abs(dy) or 1, "angle": 0,
        **style,
        "roundness": {"type": 2},
        "boundElements": [],
        "points": [[0.0, 0.0], [float(dx), float(dy)]],
        "lastCommittedPoint": None,
        "startBinding": None,
        "endBinding": None,
        "startArrowhead": None,
        "endArrowhead": None,
    }


# =========================================================================
def main():
    diagrams = {
        "cfg-example.excalidraw":      cfg_example(),
        "liveness-rules.excalidraw":   liveness_rules(),
        "liveness-annotated.excalidraw": liveness_annotated(),
        "interference-graph.excalidraw": interference_graph(),
    }
    for name, els in diagrams.items():
        write_excalidraw(os.path.join(OUT_DIR, name), els)


if __name__ == "__main__":
    main()
