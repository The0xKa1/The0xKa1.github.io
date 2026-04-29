export function normalizeContentHref(slug: string | null): string {
  if (!slug) return "#";
  if (slug === "index") return "/";
  if (slug.endsWith("/index")) {
    return `/${slug.slice(0, -"/index".length)}`;
  }
  return `/${slug}`;
}
