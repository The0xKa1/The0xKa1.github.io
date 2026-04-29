import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";

export async function GET() {
  const baseUrl = "https://note.the0xka1.cc";

  let slugs: { slug: string; updatedAt: Date | null }[] = [];
  try {
    slugs = await db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages);
  } catch {
    slugs = [];
  }

  const staticRoutes = ["", "blog", "friends", "changelog"];

  const urls = [
    ...staticRoutes.map((route) => ({
      loc: `${baseUrl}${route ? `/${route}` : ""}`,
      lastmod: new Date().toISOString().split("T")[0],
    })),
    ...slugs
      .filter((s) => !staticRoutes.includes(s.slug))
      .map((s) => ({
        loc: `${baseUrl}/${s.slug}`,
        lastmod: s.updatedAt ? s.updatedAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
