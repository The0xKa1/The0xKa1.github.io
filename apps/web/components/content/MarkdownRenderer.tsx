"use client";

import { useEffect, useRef } from "react";

interface MarkdownRendererProps {
  html: string;
  highlight?: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clearSearchHighlights(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("mark[data-search-highlight]").forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
  });
  root.normalize();
}

function highlightSearchText(target: HTMLElement, query: string) {
  const phrase = query.trim();
  if (!phrase) return;

  const terms = Array.from(new Set([phrase, ...phrase.split(/\s+/)]))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(terms.map(escapeRegExp).join("|"), "giu");
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      if (parent.closest("script, style, mark[data-search-highlight]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  textNodes.forEach((textNode) => {
    const text = textNode.textContent ?? "";
    pattern.lastIndex = 0;
    if (!pattern.test(text)) return;

    pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;

    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index > cursor) fragment.append(text.slice(cursor, index));

      const mark = document.createElement("mark");
      mark.setAttribute("data-search-highlight", "true");
      mark.textContent = match[0];
      fragment.append(mark);
      cursor = index + match[0].length;
    }

    if (cursor < text.length) fragment.append(text.slice(cursor));
    textNode.replaceWith(fragment);
  });
}

export function MarkdownRenderer({ html, highlight }: MarkdownRendererProps) {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const article = articleRef.current;
    let cancelled = false;
    let scrollFrame: number | null = null;

    const getHashTarget = () => {
      if (!window.location.hash) return;
      let id = window.location.hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        // Keep the raw hash if it is not valid percent-encoded text.
      }
      return document.getElementById(id);
    };

    const revealSearchTarget = () => {
      const target = getHashTarget();
      if (!target) return;
      if (article) clearSearchHighlights(article);
      if (highlight) highlightSearchText(target, highlight);
      target.scrollIntoView({ block: "start" });
    };

    const applyImageAlignment = (img: HTMLImageElement) => {
      const align = img.getAttribute("data-align");
      img.style.display = "block";

      if (align === "left") {
        img.style.marginLeft = "0";
        img.style.marginRight = "auto";
      } else if (align === "right") {
        img.style.marginLeft = "auto";
        img.style.marginRight = "0";
      } else {
        img.style.marginLeft = "auto";
        img.style.marginRight = "auto";
      }
    };

    // Normalize deprecated HTML image alignment attributes to data attributes
    // so layout is controlled by CSS instead of legacy presentational markup.
    const legacyAlignedImages = document.querySelectorAll<HTMLImageElement>("img[align]");
    legacyAlignedImages.forEach((img) => {
      const align = img.getAttribute("align");
      if (!align) return;
      img.setAttribute("data-align", align.toLowerCase());
      img.removeAttribute("align");
    });

    const images = document.querySelectorAll<HTMLImageElement>("article.prose img");
    images.forEach(applyImageAlignment);

    // Convert mermaid code blocks to mermaid-compatible pre tags
    const mermaidBlocks = document.querySelectorAll<HTMLElement>("pre code.language-mermaid");
    mermaidBlocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre) return;
      const content = block.textContent || "";
      pre.className = "mermaid";
      pre.textContent = content;
      pre.setAttribute("data-mermaid-source", content);
    });

    function restoreMermaidFallback(pre: HTMLElement, message?: string) {
      const source = pre.getAttribute("data-mermaid-source") || pre.textContent || "";
      const fallbackPre = document.createElement("pre");
      const fallbackCode = document.createElement("code");

      fallbackCode.className = "language-mermaid";
      fallbackCode.textContent = source;
      fallbackPre.appendChild(fallbackCode);
      pre.replaceWith(fallbackPre);

      if (message) {
        console.warn(`Mermaid render skipped: ${message}`);
      }
    }

    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default;
        if (cancelled) return;

        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "default",
        });

        const diagramNodes = Array.from(document.querySelectorAll<HTMLElement>("pre.mermaid"));
        const validNodes: HTMLElement[] = [];

        for (const node of diagramNodes) {
          const source = node.getAttribute("data-mermaid-source") || node.textContent || "";

          try {
            await mermaid.parse(source, { suppressErrors: true });
            validNodes.push(node);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            restoreMermaidFallback(node, message);
          }
        }

        if (validNodes.length > 0) {
          await mermaid.run({ nodes: validNodes });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        document.querySelectorAll<HTMLElement>("pre.mermaid").forEach((node) => {
          restoreMermaidFallback(node, message);
        });
      }
    }

    void renderMermaid().finally(() => {
      if (!cancelled) {
        scrollFrame = window.requestAnimationFrame(revealSearchTarget);
      }
    });

    return () => {
      cancelled = true;
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
      if (article) clearSearchHighlights(article);
    };
  }, [html, highlight]);

  return (
    <article
      ref={articleRef}
      className="prose prose-lg max-w-none"
      style={{
        color: "var(--text)",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
