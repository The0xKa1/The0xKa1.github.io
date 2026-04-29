import { nameToEmoji } from "gemoji";
import type { Root, Text } from "mdast";

const EMOJI_RE = /(?<!:):([a-z0-9_+-]+):(?!:)/g;

function replaceEmoji(text: string): string {
  return text.replace(EMOJI_RE, (match, name) => {
    return (nameToEmoji as Record<string, string>)[name] || match;
  });
}

export function remarkEmoji() {
  return (tree: Root) => {
    const walk = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === "text") {
          (node as Text).value = replaceEmoji((node as Text).value);
        } else if (node.children) {
          walk(node.children);
        }
      }
    };
    walk(tree.children);
  };
}
