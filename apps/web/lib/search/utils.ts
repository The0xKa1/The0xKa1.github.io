const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
};

export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (_, entity: string) => {
    return HTML_ENTITY_MAP[entity] ?? " ";
  });
}

export function htmlToPlainText(html: string): string {
  return collapseWhitespace(
    decodeHtmlEntities(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    )
  );
}

export function extractSearchHeadings(markdown: string): string[] {
  return Array.from(markdown.matchAll(/^#{1,4}\s+(.+)$/gm), (match) =>
    collapseWhitespace(match[1].replace(/\s+#+\s*$/, ""))
  ).filter(Boolean);
}

export function summarizeSearchText(text: string, maxLength: number = 180): string {
  const cleaned = collapseWhitespace(text);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

export function normalizeSearchText(text: string): string {
  return collapseWhitespace(
    text
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/[_/\\|.-]+/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
  );
}

export function tokenizeSearchQuery(query: string): {
  normalized: string;
  terms: string[];
} {
  const normalized = normalizeSearchText(query);
  const parts = normalized.split(" ").filter(Boolean);

  return {
    normalized,
    terms: Array.from(new Set(parts)),
  };
}

export function formatSearchPath(slug: string): string {
  if (slug === "index") {
    return "/";
  }

  const cleanSlug = slug.endsWith("/index") ? slug.slice(0, -6) : slug;
  return `/${cleanSlug}`;
}

export function formatSearchHref(
  slug: string,
  anchorId?: string | null,
  highlight?: string | null
): string {
  const path = formatSearchPath(slug);
  if (!anchorId) return path;

  const query = highlight?.trim()
    ? `?highlight=${encodeURIComponent(highlight.trim())}`
    : "";
  return `${path}${query}#${encodeURIComponent(anchorId)}`;
}
