import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remarkAdmonitions } from "./plugins/remark-admonitions";
import { remarkCards } from "./plugins/remark-cards";
import { remarkAutoToc } from "./plugins/remark-auto-toc";
import { remarkMermaid } from "./plugins/remark-mermaid";
import { remarkImagePaths } from "./plugins/remark-image-paths";
import { remarkEmoji } from "./plugins/remark-emoji";

export interface ParseOptions {
  slug: string;
  navTree?: NavNode[];
  imageBasePath?: string;
}

export interface NavNode {
  label?: string;
  path?: string;
  children: NavNode[];
}

const HIGHLIGHT_SUBSET = [
  "python",
  "javascript",
  "typescript",
  "rust",
  "c",
  "cpp",
  "java",
  "bash",
  "yaml",
  "json",
  "markdown",
  "nasm",
  "armasm",
];

export function createProcessor(options: ParseOptions) {
  return unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkMath)
    .use(remarkAdmonitions)
    .use(remarkCards)
    .use(remarkMermaid)
    .use(remarkAutoToc, {
      navTree: options.navTree,
      slug: options.slug,
    })
    .use(remarkImagePaths, {
      slug: options.slug,
      imageBasePath: options.imageBasePath,
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: true, subset: HIGHLIGHT_SUBSET })
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true });
}

/**
 * Lightweight processor for admonition fragments.
 * Omits remarkAdmonitions (to avoid recursion) and remarkAutoToc/ remarkImagePaths
 * since those are already handled or irrelevant for admonition bodies.
 */
export function createAdmonitionProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: true, subset: HIGHLIGHT_SUBSET })
    .use(rehypeStringify, { allowDangerousHtml: true });
}
