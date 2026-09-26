import type { Root, Text } from "mdast";
import { visit } from "unist-util-visit";

/** MkDocs attr_list syntax for stable, explicit heading anchors. */
export function remarkHeadingIds() {
  return (tree: Root) => {
    visit(tree, "heading", (node) => {
      const last = node.children.at(-1);
      if (last?.type !== "text") return;
      const match = /\s+\{#([^\s{}]+)\}\s*$/.exec(last.value);
      if (!match) return;
      (last as Text).value = last.value.slice(0, match.index);
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id: match[1] },
      };
    });
  };
}
