import { existsSync } from "fs";
import { posix, resolve as resolvePath } from "path";

/**
 * Pre-process raw Markdown text before passing to unified/remark.
 * Handles MkDocs-specific syntax that is not standard Markdown.
 */

const ADMONITION_TYPES = new Set([
  "note", "abstract", "info", "tip", "success", "question",
  "warning", "failure", "danger", "bug", "example", "quote",
  "definition", "proof", "property", "summary", "section",
  "key-point", "advice", "not-advice", "eg", "idea", "answer",
]);

const ADMONITION_TYPE_ALIASES: Record<string, string> = {
  def: "definition",
  theorem: "proof",
  lem: "proof",
  lemma: "proof",
  prop: "property",
  keypoint: "key-point",
  key_point: "key-point",
  testcase: "example",
  示例: "example",
  例子: "example",
  定义: "definition",
  定理: "proof",
  证明: "proof",
  性质: "property",
  总结: "summary",
  小结: "summary",
  章节: "section",
  要点: "key-point",
  建议: "advice",
  不建议: "not-advice",
  提示: "tip",
  注意: "warning",
  警告: "warning",
  问题: "question",
  信息: "info",
  摘要: "abstract",
  引用: "quote",
  危险: "danger",
  答案: "answer",
  想法: "idea",
};

export interface AdmonitionData {
  type: string;
  title: string;
  content: string;
  collapsible: boolean;
  expanded: boolean;
}

export interface TabItemData {
  label: string;
  content: string;
}

export interface TabGroupData {
  tabs: TabItemData[];
}

function extractFencedCodeBlocks(md: string): { markdown: string; blocks: string[] } {
  const lines = md.split("\n");
  const blocks: string[] = [];
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const fenceMatch = line.match(/^(\s*)(```|~~~)/);
    if (!fenceMatch) {
      output.push(line);
      i++;
      continue;
    }

    const fence = fenceMatch[2];
    const start = i;
    i++;
    while (i < lines.length && !lines[i].match(new RegExp(`^\\s*${fence}`))) {
      i++;
    }
    if (i < lines.length) i++;

    const block = lines.slice(start, i).join("\n");
    const placeholder = `@@CODEBLOCK_${blocks.length}@@`;
    blocks.push(block);
    output.push(placeholder);
  }

  return { markdown: output.join("\n"), blocks };
}

function restoreFencedCodeBlocks(md: string, blocks: string[]): string {
  return md.replace(/@@CODEBLOCK_(\d+)@@/g, (_, index) => blocks[Number(index)] ?? "");
}

function convertInlineMathDelimiters(segment: string): string {
  let out = "";
  let i = 0;
  let inCodeSpan = false;

  while (i < segment.length) {
    if (segment[i] === "`") {
      inCodeSpan = !inCodeSpan;
      out += segment[i];
      i++;
      continue;
    }

    if (!inCodeSpan && segment.startsWith("\\(", i)) {
      const close = segment.indexOf("\\)", i + 2);
      if (close !== -1) {
        out += `$${segment.slice(i + 2, close)}$`;
        i = close + 2;
        continue;
      }
    }

    out += segment[i];
    i++;
  }

  return out;
}

const MATH_ENVIRONMENTS = new Set([
  "align", "align*", "aligned", "alignedat", "alignedat*",
  "equation", "equation*", "gather", "gather*", "multline", "multline*",
  "split", "array", "matrix", "pmatrix", "bmatrix", "vmatrix", "Vmatrix",
  "Bmatrix", "cases", "dcases", "rcases", "drcases",
]);

function wrapBareLatexEnvironments(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let i = 0;
  let inMathBlock = false;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Track display math blocks ($$ on its own line)
    if (trimmed === "$$") {
      inMathBlock = !inMathBlock;
      result.push(lines[i]);
      i++;
      continue;
    }

    // Skip processing inside an active $$...$$ block
    if (inMathBlock) {
      result.push(lines[i]);
      i++;
      continue;
    }

    const beginMatch = lines[i].match(/^(\s*)\\begin\{(\*?[^}]+)\}(.*)$/);
    if (!beginMatch) {
      result.push(lines[i]);
      i++;
      continue;
    }

    const envName = beginMatch[2].trim();
    if (!MATH_ENVIRONMENTS.has(envName)) {
      result.push(lines[i]);
      i++;
      continue;
    }

    const indent = beginMatch[1];
    const envLines: string[] = [lines[i]];
    let j = i + 1;
    let foundEnd = false;

    for (; j < lines.length; j++) {
      envLines.push(lines[j]);
      const endMatch = lines[j].match(new RegExp(`^(\\s*)\\\\end\\{${envName.replace(/[*]/g, "\\*")}\\}`));
      if (endMatch) {
        foundEnd = true;
        break;
      }
    }

    if (!foundEnd) {
      result.push(lines[i]);
      i++;
      continue;
    }

    result.push(`${indent}$$`);
    result.push(...envLines);
    result.push(`${indent}$$`);
    i = j + 1;
  }

  return result.join("\n");
}

function convertSingleLineDisplayMath(text: string): string {
  return text.replace(/^(\s*)\$\$(.+?)\$\$(\s*)$/gm, "$1$$$\n$1$2\n$1$$$");
}

export function preprocessMathDelimiters(md: string): string {
  const normalized = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const { markdown: withoutCodeBlocks, blocks } = extractFencedCodeBlocks(normalized);
  const lines = withoutCodeBlocks.split("\n");
  const converted: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const openMatch = lines[i].match(/^(\s*)\\\[\s*$/);
    if (!openMatch) {
      converted.push(lines[i]);
      continue;
    }

    const baseIndent = openMatch[1];
    let closeIndex = -1;

    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].match(/^\s*\\\]\s*$/)) {
        closeIndex = j;
        break;
      }
    }

    if (closeIndex === -1) {
      converted.push(lines[i]);
      continue;
    }

    converted.push(`${baseIndent}$$`);
    for (let j = i + 1; j < closeIndex; j++) {
      converted.push(lines[j]);
    }
    converted.push(`${baseIndent}$$`);
    i = closeIndex;
  }

  let result = converted.join("\n");
  result = convertSingleLineDisplayMath(result);
  result = wrapBareLatexEnvironments(result);
  result = convertInlineMathDelimiters(result);
  return restoreFencedCodeBlocks(result, blocks);
}

function titleFromType(type: string): string {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeAdmonitionType(rawType: string): { type: string; fallbackTitle?: string } {
  const trimmed = rawType.trim();
  const lower = trimmed.toLowerCase();

  if (ADMONITION_TYPES.has(lower)) {
    return { type: lower };
  }

  const alias = ADMONITION_TYPE_ALIASES[trimmed] ?? ADMONITION_TYPE_ALIASES[lower];
  if (alias) {
    return { type: alias, fallbackTitle: ADMONITION_TYPES.has(lower) ? undefined : trimmed };
  }

  return { type: "note", fallbackTitle: trimmed };
}

/**
 * Extract MkDocs admonitions and replace them with placeholders.
 * Supports both !!!type (static) and ???type (collapsible) syntax.
 * Syntax: !!!type "title"\n    content...  or  ???type "title"\n    content...
 * Returns the modified markdown plus an array of admonition data.
 * The content of each admonition is kept as raw Markdown so it can
 * be run through the remark/rehype pipeline separately.
 */
export function preprocessAdmonitions(md: string): { markdown: string; admonitions: AdmonitionData[] } {
  // Normalize CRLF to LF
  const normalized = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const result: string[] = [];
  const admonitions: AdmonitionData[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^([!?]{3}\+?)\s*([^\s"]+)(?:\s+"([^"]*)")?(?:\s+(.*\S))?\s*$/);
    if (!match) {
      result.push(line);
      i++;
      continue;
    }

    const [, marker, rawType, quotedTitle, trailingText] = match;
    const { type, fallbackTitle } = normalizeAdmonitionType(rawType);

    const collapsible = marker.startsWith("???");
    const expanded = marker === "???+";
    const admonitionTitle = quotedTitle || trailingText || fallbackTitle || titleFromType(type);
    const contentLines: string[] = [];

    i++;

    // Collect indented content (4 spaces or 1 tab)
    while (i < lines.length) {
      const nextLine = lines[i];
      if (nextLine.startsWith("    ")) {
        contentLines.push(nextLine.slice(4));
        i++;
      } else if (nextLine.startsWith("\t")) {
        contentLines.push(nextLine.slice(1));
        i++;
      } else if (nextLine.trim() === "") {
        // Check if the next non-empty line is also indented
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        if (j < lines.length && (lines[j].startsWith("    ") || lines[j].startsWith("\t"))) {
          contentLines.push("");
          i++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    admonitions.push({
      type,
      title: admonitionTitle,
      content: contentLines.join("\n"),
      collapsible,
      expanded,
    });

    result.push(`<!-- ADMONITION:${admonitions.length - 1} -->`);
  }

  return { markdown: result.join("\n"), admonitions };
}

/**
 * Extract MkDocs Material content tabs (`=== "Label"`) and replace them
 * with placeholders so each tab body can be rendered through the markdown
 * pipeline later.
 */
export function preprocessTabs(md: string): { markdown: string; tabGroups: TabGroupData[] } {
  const normalized = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const result: string[] = [];
  const tabGroups: TabGroupData[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^(\s*)===\s+"([^"]+)"\s*:?\s*$/);
    if (!match) {
      result.push(line);
      i++;
      continue;
    }

    const baseIndent = match[1];
    const tabs: TabItemData[] = [];

    while (i < lines.length) {
      const tabMatch = lines[i].match(/^(\s*)===\s+"([^"]+)"\s*:?\s*$/);
      if (!tabMatch || tabMatch[1] !== baseIndent) {
        break;
      }

      const label = tabMatch[2];
      const contentLines: string[] = [];
      i++;

      while (i < lines.length) {
        const nextLine = lines[i];

        if (nextLine.startsWith(`${baseIndent}    `)) {
          contentLines.push(nextLine.slice(baseIndent.length + 4));
          i++;
          continue;
        }

        if (nextLine.startsWith(`${baseIndent}\t`)) {
          contentLines.push(nextLine.slice(baseIndent.length + 1));
          i++;
          continue;
        }

        if (nextLine.trim() === "") {
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === "") j++;

          if (
            j < lines.length &&
            (lines[j].startsWith(`${baseIndent}    `) || lines[j].startsWith(`${baseIndent}\t`))
          ) {
            contentLines.push("");
            i++;
            continue;
          }
        }

        break;
      }

      tabs.push({
        label,
        content: contentLines.join("\n"),
      });

      let j = i;
      while (j < lines.length && lines[j].trim() === "") j++;
      const nextTabMatch = lines[j]?.match(/^(\s*)===\s+"([^"]+)"\s*:?\s*$/);
      if (nextTabMatch && nextTabMatch[1] === baseIndent) {
        i = j;
        continue;
      }
      break;
    }

    if (tabs.length === 0) {
      result.push(line);
      i++;
      continue;
    }

    tabGroups.push({ tabs });
    result.push(`<!-- TABGROUP:${tabGroups.length - 1} -->`);
  }

  return { markdown: result.join("\n"), tabGroups };
}

/**
 * Convert ::cards:: blocks to HTML.
 */
export function preprocessCards(md: string): string {
  const cardBlockRegex = /::cards::\n([\s\S]*?)\n::\/cards::/g;

  return md.replace(cardBlockRegex, (_, blockContent) => {
    const items: Array<Record<string, string>> = [];
    const entries = blockContent.trim().split(/\n-(?=\s)/);

    for (const entry of entries) {
      const trimmed = entry.trim().replace(/^-/, "").trim();
      if (!trimmed) continue;
      const item: Record<string, string> = {};
      const lines = trimmed.split("\n");
      for (const line of lines) {
        const kv = line.match(/^\s*(\w+):\s*(.*)$/);
        if (kv) {
          item[kv[1]] = kv[2].trim();
        }
      }
      if (Object.keys(item).length > 0) {
        items.push(item);
      }
    }

    if (items.length === 0) return "";

    const cardsHtml = items
      .map(
        (item) => `
      <a href="${item.url || "#"}" class="friend-card" target="_blank" rel="noopener noreferrer">
        <div class="friend-card__avatar">
          <img src="${item.image || ""}" alt="${item.title || ""}" loading="lazy" />
        </div>
        <div class="friend-card__info">
          <h3 class="friend-card__name">${item.title || ""}</h3>
          <p class="friend-card__desc">${item.content || ""}</p>
        </div>
      </a>`
      )
      .join("");

    return `<div class="friend-cards-grid">${cardsHtml}</div>`;
  });
}

/**
 * Replace {{TableOfContents}} with a placeholder that will be
 * replaced server-side during page rendering.
 */
export function preprocessAutoToc(md: string): string {
  return md.replace(/{{TableOfContents}}/g, "<div data-auto-toc=\"true\"></div>");
}

function isExternalAsset(src: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(src) || src.startsWith("/") || src.startsWith("data:") || src.startsWith("#");
}

function decodeWrappedPath(src: string): string {
  const trimmed = src.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function encodeAssetPath(assetPath: string): string {
  return assetPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function contentAssetExists(relativePath: string): boolean {
  const contentRoots = [
    resolvePath(process.cwd(), "content"),
    resolvePath(process.cwd(), "..", "content"),
    resolvePath(process.cwd(), "..", "..", "content"),
  ];

  return contentRoots.some((contentRoot) => existsSync(resolvePath(contentRoot, relativePath)));
}

function resolveAssetRelativePath(src: string, slug: string): string {
  const normalizedSrc = decodeWrappedPath(src).replace(/\\/g, "/");
  const sourceDir = slug.split("/").slice(0, -1).join("/");
  const pageBase = slug.endsWith("/index") ? slug.slice(0, -"/index".length) : slug;

  const candidates = [
    posix.normalize(posix.join(sourceDir, normalizedSrc)),
    posix.normalize(posix.join(pageBase, normalizedSrc)),
  ];

  for (const candidate of candidates) {
    if (contentAssetExists(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function rewriteAssetUrl(src: string, slug: string): string {
  if (isExternalAsset(src)) {
    return src;
  }

  const resolved = resolveAssetRelativePath(src, slug);
  return `/note-images/${encodeAssetPath(resolved)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseImageAttrList(rawAttrs?: string): string {
  if (!rawAttrs) return "";

  const attrs = rawAttrs.trim();
  if (!attrs) return "";

  const htmlAttrs: string[] = [];
  const classNames: string[] = [];
  let idValue: string | null = null;
  const tokenRegex = /([.#][^\s.#=]+)|([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/g;

  for (const match of attrs.matchAll(tokenRegex)) {
    if (match[1]) {
      const shorthand = match[1];
      if (shorthand.startsWith(".")) {
        classNames.push(shorthand.slice(1));
      } else if (shorthand.startsWith("#")) {
        idValue = shorthand.slice(1);
      }
      continue;
    }

    const key = match[2];
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    if (key === "class") {
      classNames.push(...value.split(/\s+/).filter(Boolean));
      continue;
    }
    if (key === "id") {
      idValue = value;
      continue;
    }
    if (key === "align") {
      htmlAttrs.push(`data-align="${escapeHtml(value.toLowerCase())}"`);
      continue;
    }
    htmlAttrs.push(`${key}="${escapeHtml(value)}"`);
  }

  if (classNames.length > 0) {
    htmlAttrs.unshift(`class="${escapeHtml(classNames.join(" "))}"`);
  }
  if (idValue) {
    htmlAttrs.unshift(`id="${escapeHtml(idValue)}"`);
  }

  return htmlAttrs.length > 0 ? ` ${htmlAttrs.join(" ")}` : "";
}

/**
 * Rewrite image paths from relative note paths to public paths.
 * e.g. ./image.png in NOTE/ADS/wk1.md -> /note-images/NOTE/ADS/image.png
 */
export function preprocessImagePaths(md: string, slug: string): string {
  const { markdown: withoutCodeBlocks, blocks } = extractFencedCodeBlocks(md);

  const rewrittenMarkdownImages = withoutCodeBlocks.replace(
    /!\[([^\]]*)\]\(([^)]+)\)(?:\s*\{([^}]*)\})?/g,
    (match, alt, rawSrc, rawAttrs) => {
      const src = rawSrc.trim();
      if (isExternalAsset(src)) {
        if (rawAttrs) {
          return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${parseImageAttrList(rawAttrs)}>`;
        }
        return match;
      }

      const newSrc = rewriteAssetUrl(src, slug);
      if (rawAttrs) {
        return `<img src="${escapeHtml(newSrc)}" alt="${escapeHtml(alt)}"${parseImageAttrList(rawAttrs)}>`;
      }
      return `![${alt}](${newSrc})`;
    }
  );

  const rewrittenHtmlImages = rewrittenMarkdownImages.replace(
    /<img\b([^>]*?)\bsrc=(["'])(.*?)\2([^>]*)>/gi,
    (match, before, quote, src, after) => {
      if (isExternalAsset(src)) {
        return match;
      }

      const newSrc = rewriteAssetUrl(src, slug);
      return `<img${before}src=${quote}${newSrc}${quote}${after}>`;
    }
  );

  return restoreFencedCodeBlocks(rewrittenHtmlImages, blocks);
}

/**
 * Convert fenced mermaid code blocks so remark/rehype can handle them.
 *
 * Problem: mermaid blocks wrapped in <div align="center"> are inside HTML
 * blocks, so CommonMark doesn't parse the ```mermaid fence as a code block.
 *
 * Solution:
 *   1. For mermaid blocks inside <div> wrappers: remove the wrapper and
 *      keep the fenced code block with original indentation so remark
 *      parses it normally.
 *   2. For standalone mermaid blocks: convert to <pre class="mermaid">
 *      raw HTML that remark will pass through.
 */
export function preprocessMermaid(md: string): string {
  const lines = md.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Case 1: <div> wrapping a mermaid block ──────────────────────
    const divOpenMatch = line.match(/^(\s*)<div\b[^>]*>\s*$/i);
    if (divOpenMatch) {
      // Look ahead to see if this <div> contains a mermaid fenced block
      let k = i + 1;
      while (k < lines.length && lines[k].trim() === "") k++;

      const fenceMatch = lines[k]?.match(/^(\s*)(```+)\s*mermaid\s*$/);
      if (fenceMatch) {
        const fence = fenceMatch[2];
        const fenceIdx = k; // remember where the fence is
        k++;
        while (k < lines.length && !lines[k].match(new RegExp(`^\\s*${fence}\\s*$`))) {
          k++;
        }
        const closeFenceIdx = k < lines.length ? k : -1;
        if (closeFenceIdx !== -1) k++;
        while (k < lines.length && lines[k].trim() === "") k++;
        const divCloseMatch = lines[k]?.match(/^(\s*)<\/div>\s*$/i);

        if (divCloseMatch && closeFenceIdx !== -1) {
          // Emit the fenced block (without the <div> wrappers)
          for (let idx = fenceIdx; idx <= closeFenceIdx; idx++) {
            result.push(lines[idx]);
          }
          i = k + 1;
          continue;
        }
      }
    }

    // ── Case 2: standalone mermaid fence ────────────────────────────
    const fenceMatch = line.match(/^(\s*)(```+)\s*mermaid\s*$/);
    if (!fenceMatch) {
      result.push(line);
      i++;
      continue;
    }

    const indent = fenceMatch[1];
    const fence = fenceMatch[2];
    i++;

    const contentLines: string[] = [];
    while (i < lines.length) {
      if (lines[i].match(new RegExp(`^\\s*${fence}\\s*$`))) {
        i++;
        break;
      }
      const stripped = lines[i].startsWith(indent)
        ? lines[i].slice(indent.length)
        : lines[i];
      contentLines.push(stripped);
      i++;
    }

    const content = contentLines.join("\n");
    const escaped = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    result.push(`${indent}<pre class="mermaid">${escaped}</pre>`);
  }

  return result.join("\n");
}

/**
 * Extract excerpt from markdown (content before <!-- more -->).
 */
export function extractExcerpt(md: string): string | null {
  const idx = md.indexOf("<!-- more -->");
  if (idx === -1) return null;
  return md.slice(0, idx).trim();
}

/**
 * Remove excerpt separator from markdown.
 */
export function removeExcerptSeparator(md: string): string {
  return md.replace(/<!-- more -->/g, "");
}

/**
 * Count words: Chinese characters + alphanumeric words.
 */
export function countWords(md: string): number {
  const matches = md.match(/[\u4e00-\u9fff]|[A-Za-z0-9_]+/g);
  return matches ? matches.length : 0;
}

/**
 * Full preprocessing pipeline.
 * Returns the main markdown string (with admonition placeholders) and the
 * extracted admonition data so each admonition can be processed separately.
 */
export function preprocessMarkdown(
  md: string,
  slug: string
): { markdown: string; admonitions: AdmonitionData[]; tabGroups: TabGroupData[] } {
  let result = md;
  // Run image-path rewriting first so admonition contents get correct paths
  result = preprocessImagePaths(result, slug);
  result = preprocessMathDelimiters(result);
  result = preprocessCards(result);
  result = preprocessAutoToc(result);
  result = preprocessMermaid(result);
  result = removeExcerptSeparator(result);

  // Extract admonitions first so nested tab blocks stay inside their parent
  // admonition content and can be rendered recursively later.
  const { markdown: markdownWithAdmonitions, admonitions } = preprocessAdmonitions(result);
  result = markdownWithAdmonitions;

  const { markdown, tabGroups } = preprocessTabs(result);
  return { markdown, admonitions, tabGroups };
}
