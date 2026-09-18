import { posix } from "node:path";
import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { normalizeContentHref } from "../../routing";

export function resolveContentLink(href: string, slug: string): string {
  // Anchors, query-only links, external URLs and protocol-relative URLs keep
  // their original meaning. Only document links belong to the content router.
  if (!href || /^(?:[#?]|\/\/|[a-z][a-z\d+.-]*:)/i.test(href)) return href;

  const suffixStart = href.search(/[?#]/);
  const path = suffixStart === -1 ? href : href.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : href.slice(suffixStart);
  const extension = posix.extname(path);
  if (extension && extension !== ".md") return href;

  // The stored slug retains /index, unlike the public URL. Resolve against
  // that source directory so ./wk1 on NOTE/ADS/index stays inside ADS.
  const resolved = posix.resolve("/", posix.dirname(slug), path);
  const targetSlug = resolved.replace(/^\//, "").replace(/\.md$/, "").replace(/\/$/, "");
  return normalizeContentHref(targetSlug || "index") + suffix;
}

export const rehypeContentLinks: Plugin<[{ slug: string }], Root> = ({ slug }) => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "a" && typeof node.properties.href === "string") {
        node.properties.href = resolveContentLink(node.properties.href, slug);
      }
    });
  };
};
