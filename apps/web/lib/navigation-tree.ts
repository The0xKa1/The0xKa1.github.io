import { normalizeContentHref } from "@/lib/routing";

export interface NavigationTreeNode {
  id: number;
  label: string;
  slug: string | null;
  children?: NavigationTreeNode[];
}

function normalizePath(value: string): string {
  const pathOnly = value.split(/[?#]/, 1)[0] || "/";
  let decoded = pathOnly;
  try {
    decoded = decodeURIComponent(pathOnly);
  } catch {
    // Compare the raw path when malformed percent encoding is encountered.
  }
  if (decoded === "/") return decoded;
  return decoded.replace(/\/+$/, "");
}

export function getActiveNavigationPathIds(
  items: NavigationTreeNode[],
  pathname: string
): number[] {
  const currentPath = normalizePath(pathname);

  const findPath = (nodes: NavigationTreeNode[]): number[] | null => {
    for (const node of nodes) {
      if (node.slug && normalizePath(normalizeContentHref(node.slug)) === currentPath) {
        return [node.id];
      }

      const childPath = findPath(node.children ?? []);
      if (childPath) return [node.id, ...childPath];
    }
    return null;
  };

  return findPath(items) ?? [];
}
