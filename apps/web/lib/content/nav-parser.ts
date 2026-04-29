import { readFileSync } from "fs";
import { resolve } from "path";
import matter from "gray-matter";

const ROOT = resolve(__dirname, "../../../..");
const CONTENT_DIR = resolve(ROOT, "content");
const NAV_FILE = resolve(ROOT, "site-nav.yml");

export interface NavNode {
  label?: string;
  path?: string;
  children: NavNode[];
}

export function parseNavConfig(): NavNode[] {
  const text = readFileSync(NAV_FILE, "utf-8");
  const lines = text.split("\n");

  const navStart = lines.findIndex((l) => l.trim() === "nav:");
  if (navStart === -1) {
    throw new Error("Could not find nav: section in site-nav.yml");
  }

  const navLines = lines.slice(navStart + 1);
  return parseNavLines(navLines);
}

function parseNavLines(lines: string[]): NavNode[] {
  const root: NavNode[] = [];
  const stack: Array<{ indent: number; list: NavNode[] }> = [
    { indent: -1, list: root },
  ];

  for (const rawLine of lines) {
    const stripped = rawLine.trim();
    if (!stripped || stripped.startsWith("#")) continue;
    if (!rawLine.lstrip().startsWith("- ")) {
      // End of nav section
      if (stripped && !stripped.startsWith("-")) break;
      continue;
    }

    const indent = rawLine.length - rawLine.lstrip(" ").length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const content = stripped.slice(2).trim();
    let node: NavNode;

    if (content.endsWith(":")) {
      node = { label: content.slice(0, -1).trim(), children: [] };
    } else if (/:\s/.test(content)) {
      const colonIdx = content.indexOf(":");
      const label = content.slice(0, colonIdx).trim();
      const path = content.slice(colonIdx + 1).trim();
      node = { label, path, children: [] };
    } else {
      node = { path: content.trim(), children: [] };
    }

    stack[stack.length - 1].list.push(node);
    if (node.path === undefined) {
      stack.push({ indent, list: node.children });
    }
  }

  return root;
}

// Polyfill for String.prototype.lstrip (Python-like)
declare global {
  interface String {
    lstrip(chars?: string): string;
  }
}
String.prototype.lstrip = function (chars = " ") {
  let i = 0;
  while (i < this.length && chars.includes(this[i])) i++;
  return this.slice(i);
};

export function findNavPathForSlug(
  navTree: NavNode[],
  slug: string
): NavNode[] | null {
  for (const node of navTree) {
    if (node.path) {
      const normalized = node.path.replace(/\\/g, "/").replace(/\.md$/, "");
      if (normalized === slug) return [node];
    }
    if (node.children.length > 0) {
      const found = findNavPathForSlug(node.children, slug);
      if (found) return [node, ...found];
    }
  }
  return null;
}

export function getSiblings(navTree: NavNode[], slug: string): NavNode[] {
  const path = findNavPathForSlug(navTree, slug);
  if (!path || path.length < 2) return [];

  const parent = path[path.length - 2];
  return parent.children.filter((child) => {
    if (!child.path) return true;
    const childSlug = child.path.replace(/\\/g, "/").replace(/\.md$/, "");
    return childSlug !== slug;
  });
}

export function extractTitle(filePath: string): string {
  const fullPath = resolve(CONTENT_DIR, filePath);
  try {
    const text = readFileSync(fullPath, "utf-8");
    const { content } = matter(text);
    const match = content.trim().match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    // fall through
  }
  const basename = filePath.split("/").pop() || "";
  return basename.replace(/\.md$/, "");
}
