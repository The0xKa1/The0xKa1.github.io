import type { Plugin } from "unified";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";

const ADMONITION_TYPES = new Set([
  "note", "abstract", "info", "tip", "success", "question",
  "warning", "failure", "danger", "bug", "example", "quote",
  "definition", "proof", "property", "summary", "section",
  "key-point", "advice", "not-advice", "eg", "idea", "answer",
]);

interface ParagraphNode extends Parent {
  type: "paragraph";
  children: Node[];
}

function isParagraph(node: Node): node is ParagraphNode {
  return node.type === "paragraph";
}

export const remarkAdmonitions: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "paragraph", (node: ParagraphNode, index, parent) => {
      if (!parent || typeof index !== "number" || node.children.length === 0) return;

      const firstChild = node.children[0];
      if (firstChild.type !== "text") return;

      const text = firstChild.value;
      const match = text.match(/^!!!(\w+)(?:\s+"([^"]*)")?/);
      if (!match) return;

      const [, type, title] = match;
      if (!ADMONITION_TYPES.has(type)) return;

      // Find the end of this admonition (next non-indented block)
      const siblings = parent.children as Node[];
      const admonitionChildren: Node[] = [];
      let endIndex = index;

      // Remove the marker from first text
      const remainingText = text.slice(match[0].length).trim();
      if (remainingText) {
        firstChild.value = remainingText;
        admonitionChildren.push(...node.children);
      } else {
        // Check subsequent indented blocks
        for (let i = index + 1; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling.type === "paragraph" || sibling.type === "code" || sibling.type === "list" || sibling.type === "heading") {
            // Check if indented (in markdown, indentation becomes part of the tree structure)
            // For remark, indented content under an admonition marker is typically parsed as
            // separate top-level nodes. We need to look for a pattern.
            // Actually in raw markdown, admonition content is indented 4 spaces.
            // But remark-parse may not preserve this. Let's handle simple case:
            // All nodes until next !!! or non-indented paragraph are part of this admonition.
            break;
          }
        }
      }

      // For now, a simple implementation: the admonition only contains the first paragraph
      // A more robust implementation would track indentation in the raw markdown.
      // Let's use a simpler approach: process the raw markdown before remark-parse.

      // Actually, let's transform this node into an HTML node
      const admonitionTitle = title || type.charAt(0).toUpperCase() + type.slice(1);

      const htmlNode: any = {
        type: "html",
        value: `<div class="admonition admonition--${type}" data-type="${type}">` +
               `<div class="admonition__header">` +
               `<span class="admonition__title">${admonitionTitle}</span>` +
               `</div>` +
               `<div class="admonition__content">`,
      };

      const closeNode: any = {
        type: "html",
        value: `</div></div>`,
      };

      // Replace the paragraph with the admonition wrapper + its content + close
      // But we need the content to be processed by rehype, not just raw HTML.
      // Better approach: wrap in a custom element that rehype can handle.

      // Alternative: use a div wrapper with data attribute, let rehype process children
      const wrapperOpen: any = {
        type: "html",
        value: `<div class="admonition admonition--${type}" data-type="${type}">` +
               `<div class="admonition__header"><span class="admonition__title">${admonitionTitle}</span></div>` +
               `<div class="admonition__content">`,
      };

      const wrapperClose: any = {
        type: "html",
        value: `</div></div>`,
      };

      // Remove the marker text from first child
      firstChild.value = "";
      const nonEmptyChildren = node.children.filter(
        (c: any) => c.type !== "text" || c.value.trim() !== ""
      );

      if (nonEmptyChildren.length > 0) {
        node.children = nonEmptyChildren;
        siblings.splice(index, 1, wrapperOpen, node, wrapperClose);
      } else {
        siblings.splice(index, 1, wrapperOpen, wrapperClose);
      }
    });
  };
};
