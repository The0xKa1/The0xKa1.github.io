import { createHash } from "node:crypto";
import type { Element, Root, RootContent } from "hast";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import type { SearchBlock } from "./types";
import { collapseWhitespace } from "./utils";

const HEADING_TAGS = new Set(["h2", "h3", "h4", "h5", "h6"]);
const CONTENT_TAGS = new Set(["p", "li", "pre", "tr"]);

function getElementId(element: Element): string | null {
  const value = element.properties.id;
  return typeof value === "string" && value ? value : null;
}

function getNodeText(node: RootContent, excludeNestedLists = false): string {
  if (node.type === "text") return node.value;
  if (node.type !== "element") return "";
  if (["script", "style", "annotation"].includes(node.tagName)) return "";
  if (excludeNestedLists && ["ul", "ol"].includes(node.tagName)) return "";
  return node.children.map((child) => getNodeText(child, excludeNestedLists)).join(" ");
}

function walkElements(node: Root | RootContent, visit: (element: Element) => void) {
  if (node.type === "element") visit(node);
  if ("children" in node) {
    for (const child of node.children) walkElements(child, visit);
  }
}

function createStableId(slug: string, text: string, occurrence: number): string {
  const digest = createHash("sha1")
    .update(`${slug}\0${text}`)
    .digest("hex")
    .slice(0, 12);
  return occurrence === 0 ? `search-${digest}` : `search-${digest}-${occurrence + 1}`;
}

export interface IndexedHtml {
  html: string;
  blocks: SearchBlock[];
}

/**
 * Adds stable anchors to rendered, searchable blocks and records the exact
 * heading context for each block. This runs after admonitions and tabs have
 * been expanded, so search results can target the final DOM rather than the
 * preprocessed Markdown.
 */
export async function indexRenderedHtml(html: string, slug: string): Promise<IndexedHtml> {
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(function rehypeSearchAnchors() {
      return (tree: Root, file: { data: Record<string, unknown> }) => {
        const blocks: SearchBlock[] = [];
        const usedIds = new Set<string>();
        const idOccurrences = new Map<string, number>();
        let currentHeading: { text: string; id: string } | null = null;

        walkElements(tree, (element) => {
          const existingId = getElementId(element);
          if (existingId) usedIds.add(existingId);
        });

        const visitNode = (node: Root | RootContent, ancestors: string[]) => {
          if (node.type !== "element") {
            if ("children" in node) {
              for (const child of node.children) visitNode(child, ancestors);
            }
            return;
          }

          const isHeading = HEADING_TAGS.has(node.tagName);
          const isNestedParagraph =
            node.tagName === "p" && ancestors.some((tag) => ["li", "pre", "tr"].includes(tag));
          const isContent = CONTENT_TAGS.has(node.tagName) && !isNestedParagraph;

          if (isHeading || isContent) {
            const text = collapseWhitespace(getNodeText(node, node.tagName === "li"));
            if (text.length >= 2) {
              let anchorId = getElementId(node);
              if (!anchorId) {
                const occurrenceKey = `${slug}\0${text}`;
                let occurrence = idOccurrences.get(occurrenceKey) ?? 0;
                anchorId = createStableId(slug, text, occurrence);
                while (usedIds.has(anchorId)) {
                  occurrence += 1;
                  anchorId = createStableId(slug, text, occurrence);
                }
                idOccurrences.set(occurrenceKey, occurrence + 1);
                node.properties.id = anchorId;
                usedIds.add(anchorId);
              }

              if (isHeading) {
                currentHeading = { text, id: anchorId };
              }

              blocks.push({
                text,
                anchorId,
                heading: isHeading ? text : currentHeading?.text ?? null,
                headingId: isHeading ? anchorId : currentHeading?.id ?? null,
                kind: isHeading ? "heading" : "content",
              });
            }
          }

          if (["pre", "tr"].includes(node.tagName)) return;
          const nextAncestors = [...ancestors, node.tagName];
          for (const child of node.children) visitNode(child, nextAncestors);
        };

        visitNode(tree, []);
        file.data.searchBlocks = blocks;
      };
    })
    .use(rehypeStringify);

  const result = await processor.process(html);
  return {
    html: String(result),
    blocks: (result.data.searchBlocks as SearchBlock[] | undefined) ?? [],
  };
}
