"use client";

import { useEffect } from "react";

interface MarkdownRendererProps {
  html: string;
}

export function MarkdownRenderer({ html }: MarkdownRendererProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

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

    void renderMermaid();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <article
      className="prose prose-lg max-w-none"
      style={{
        color: "var(--text)",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
