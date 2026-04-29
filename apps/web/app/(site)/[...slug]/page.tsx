import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pages, navigation } from "@/lib/db/schema";
import { eq, and, ne, asc } from "drizzle-orm";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { GiscusComments } from "@/components/content/GiscusComments";
import { TableOfContents, type TocHeading } from "@/components/layout/TableOfContents";
import type { Metadata } from "next";

interface NavTreeNode {
  item: typeof navigation.$inferSelect;
  children: NavTreeNode[];
}

async function buildNavTree(
  items: typeof navigation.$inferSelect[]
): Promise<NavTreeNode[]> {
  const result: NavTreeNode[] = [];
  for (const item of items) {
    const childRows = await db
      .select()
      .from(navigation)
      .where(
        and(
          eq(navigation.parentId, item.id),
          eq(navigation.isVisible, true)
        )
      )
      .orderBy(asc(navigation.sortOrder));
    result.push({
      item,
      children: childRows.length > 0 ? await buildNavTree(childRows) : [],
    });
  }
  return result;
}

function preferredUrl(node: NavTreeNode): string | null {
  if (node.item.slug) return `/${node.item.slug}`;
  for (const child of node.children) {
    const url = preferredUrl(child);
    if (url) return url;
  }
  return null;
}

function collectLeafCount(nodes: NavTreeNode[]): number {
  let total = 0;
  for (const node of nodes) {
    if (node.item.slug) total += 1;
    total += collectLeafCount(node.children);
  }
  return total;
}

function collectGroupCount(nodes: NavTreeNode[]): number {
  let total = 0;
  for (const node of nodes) {
    if (node.children.length > 0) total += 1;
    total += collectGroupCount(node.children);
  }
  return total;
}

function renderFlatLinks(nodes: NavTreeNode[], prefix: string = ""): string {
  const parts: string[] = [];
  for (const node of nodes) {
    const label = prefix ? `${prefix} · ${node.item.label}` : node.item.label;
    if (node.item.slug) {
      parts.push(
        `<a class="auto-toc__link" href="/${node.item.slug}">${label}</a>`
      );
    }
    if (node.children.length > 0) {
      const nextPrefix = prefix ? `${prefix} · ${node.item.label}` : node.item.label;
      parts.push(renderFlatLinks(node.children, nextPrefix));
    }
  }
  return parts.join("");
}

function renderGroupLinks(node: NavTreeNode, flat: boolean): string {
  if (flat) {
    return renderFlatLinks(node.children);
  }
  const links: string[] = [];
  for (const child of node.children) {
    const href = preferredUrl(child) || "javascript:;";
    links.push(
      `<a class="auto-toc__link" href="${href}">${child.item.label}</a>`
    );
  }
  return links.join("");
}

function renderItem(node: NavTreeNode, index: number, flat: boolean): string {
  if (!node.children.length) {
    const href = node.item.slug ? `/${node.item.slug}` : "javascript:;";
    return `<a class="auto-toc__link auto-toc__link--solo" href="${href}">${node.item.label}</a>`;
  }

  const openAttr = index === 0 ? " open" : "";
  const header = node.item.slug
    ? `<a href="/${node.item.slug}">${node.item.label}</a>`
    : node.item.label;
  const childCount = flat
    ? collectLeafCount(node.children)
    : node.children.length;

  return (
    `<details class="auto-toc__group"${openAttr}>` +
    `<summary>${header}<span>${childCount} 项</span></summary>` +
    `<div class="auto-toc__links">${renderGroupLinks(node, flat)}</div>` +
    `</details>`
  );
}

async function generateAutoToc(slug: string): Promise<string> {
  const currentNav = await db
    .select()
    .from(navigation)
    .where(eq(navigation.slug, slug))
    .limit(1);

  if (!currentNav[0]) return "";

  let rootItems: typeof navigation.$inferSelect[] = [];

  const children = await db
    .select()
    .from(navigation)
    .where(
      and(
        eq(navigation.parentId, currentNav[0].id),
        eq(navigation.isVisible, true)
      )
    )
    .orderBy(asc(navigation.sortOrder));

  if (children.length > 0) {
    rootItems = children;
  } else if (currentNav[0].parentId) {
    rootItems = await db
      .select()
      .from(navigation)
      .where(
        and(
          eq(navigation.parentId, currentNav[0].parentId),
          ne(navigation.id, currentNav[0].id),
          eq(navigation.isVisible, true)
        )
      )
      .orderBy(asc(navigation.sortOrder));
  }

  if (rootItems.length === 0) return "";

  const tree = await buildNavTree(rootItems);
  const flat = slug !== "NOTE/index";

  const leafCount = collectLeafCount(tree);
  const groupCount = collectGroupCount(tree);
  const body = tree.map((node, i) => renderItem(node, i, flat)).join("");

  return `
    <section class="auto-toc">
      <div class="auto-toc__intro">
        <p class="auto-toc__eyebrow">AUTO GENERATED</p>
        <h2>目录</h2>
        <p class="auto-toc__desc">基于当前页面所在栏目自动生成，顺序默认跟随站点导航。</p>
      </div>
      <div class="auto-toc__stats">
        <div class="auto-toc__stat"><span>条目</span><strong>${leafCount}</strong></div>
        <div class="auto-toc__stat"><span>分组</span><strong>${groupCount}</strong></div>
      </div>
      <div class="auto-toc__body">${body}</div>
    </section>
  `.trim();
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

function normalizeHeadingIds(html: string): string {
  const seen = new Map<string, number>();

  return html.replace(
    /<h([2-6])(\b[^>]*\bid=")([^"]+)(".*?>)([\s\S]*?)<\/h\1>/gi,
    (_, level: string, beforeId: string, id: string, afterId: string, content: string) => {
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);

      const normalizedId = count === 0 ? id : `${id}-${count + 1}`;
      return `<h${level}${beforeId}${normalizedId}${afterId}${content}</h${level}>`;
    }
  );
}

function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /<h([2-6])\b[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    headings.push({ id, text, level });
  }
  return headings;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.join("/");

  let page: typeof pages.$inferSelect | null = null;
  try {
    const results = await db.select().from(pages).where(eq(pages.slug, slugStr)).limit(1);
    page = results[0] || null;
  } catch {
    page = null;
  }

  if (!page && !slugStr.endsWith("/index")) {
    try {
      const results = await db.select().from(pages).where(eq(pages.slug, slugStr + "/index")).limit(1);
      page = results[0] || null;
    } catch {
      page = null;
    }
  }

  if (!page) {
    return { title: "Not Found" };
  }

  return {
    title: page.title,
    description: `${page.title} - ka1的笔记本`,
    openGraph: {
      title: page.title,
      description: `${page.title} - ka1的笔记本`,
      type: "article",
    },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.join("/");

  let page: typeof pages.$inferSelect | null = null;

  try {
    const results = await db.select().from(pages).where(eq(pages.slug, slugStr)).limit(1);
    page = results[0] || null;
  } catch {
    page = null;
  }

  // Try index.md fallback: e.g. "NOTE/ADS" -> "NOTE/ADS/index"
  if (!page && !slugStr.endsWith("/index")) {
    try {
      const results = await db.select().from(pages).where(eq(pages.slug, slugStr + "/index")).limit(1);
      page = results[0] || null;
    } catch {
      page = null;
    }
  }

  if (!page) {
    notFound();
  }

  const resolvedSlug = page.slug;

  if (resolvedSlug === "index") {
    redirect("/");
  }

  if (resolvedSlug.endsWith("/index") && slugStr.endsWith("/index")) {
    redirect(`/${resolvedSlug.slice(0, -"/index".length)}`);
  }

  let renderedHtml = page.htmlContent || "";
  // Remove the first <h1> from markdown content since we render our own title
  renderedHtml = renderedHtml.replace(/^<h1\b[^>]*>.*?<\/h1>\s*/i, "");
  renderedHtml = normalizeHeadingIds(renderedHtml);

  const headings = extractHeadings(renderedHtml);

  if (renderedHtml.includes('data-auto-toc="true"')) {
    try {
      const tocHtml = await generateAutoToc(resolvedSlug);
      if (tocHtml) {
        renderedHtml = renderedHtml.replace(
          /<div\s+data-auto-toc="true"\s*><\/div>/g,
          tocHtml
        );
      } else {
        renderedHtml = renderedHtml.replace(/<div\s+data-auto-toc="true"\s*><\/div>/g, "");
      }
    } catch {
      renderedHtml = renderedHtml.replace(/<div\s+data-auto-toc="true"\s*><\/div>/g, "");
    }
  }

  return (
    <div className="w-full flex justify-center gap-8">
      <div className="flex-1 min-w-0 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-[var(--text)]">{page.title}</h1>

        {page.statisticsEnabled && (
          <div className="flex gap-4 text-sm text-[var(--muted)] mb-6 pb-4 border-b border-[var(--border)]">
            <span>{page.wordCount} 字</span>
            <span>{page.readingTime} 分钟阅读</span>
          </div>
        )}

        <MarkdownRenderer html={renderedHtml} />

        {page.commentsEnabled && (
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <GiscusComments
              repo="The0xKa1/The0xKa1.github.io"
              repoId=""
              category="Announcements"
              categoryId=""
              mapping="pathname"
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              theme="preferred_color_scheme"
              lang="zh-CN"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {headings.length > 0 && (
        <aside className="hidden lg:block w-48 xl:w-56 shrink-0">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      )}
    </div>
  );
}
