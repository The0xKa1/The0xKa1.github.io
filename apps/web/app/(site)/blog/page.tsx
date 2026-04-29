import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts, pageTags, pages, tags } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

interface PostTag {
  name: string;
  slug: string;
}

interface BlogPostSummary {
  pageId: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  publishedAt: Date | null;
  wordCount: number;
  readingTime: number;
  tags: PostTag[];
}

function formatDate(date: Date | null) {
  if (!date) return "Draft";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatMonth(date: Date | null) {
  if (!date) return "未发布";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date);
}

function formatDay(date: Date | null) {
  if (!date) return "--";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
  }).format(date);
}

function formatYear(date: Date | null) {
  if (!date) return "Drafts";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
  }).format(date);
}

function excerptText(post: BlogPostSummary) {
  const excerpt = post.excerpt?.trim();
  if (excerpt) return excerpt;
  return createPreview(post.content);
}

function clampStyle(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

function createPreview(markdown: string) {
  const plain = markdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[\^.+?\]:.*$/gm, " ")
    .replace(/\[\^.+?\]/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "一篇还没有摘要的长文，点进去看正文。";
  return plain.length > 180 ? `${plain.slice(0, 180).trim()}...` : plain;
}

async function getBlogPosts(): Promise<BlogPostSummary[]> {
  const rows = await db
    .select({
      pageId: pages.id,
      title: pages.title,
      slug: pages.slug,
      content: pages.content,
      excerpt: blogPosts.excerpt,
      publishedAt: blogPosts.publishedAt,
      wordCount: pages.wordCount,
      readingTime: pages.readingTime,
    })
    .from(pages)
    .innerJoin(blogPosts, eq(pages.id, blogPosts.pageId))
    .where(eq(pages.pageType, "blog"))
    .orderBy(desc(blogPosts.publishedAt), desc(pages.updatedAt));

  if (rows.length === 0) return [];

  const pageIds = rows.map((row) => row.pageId);
  const tagRows = await db
    .select({
      pageId: pageTags.pageId,
      name: tags.name,
      slug: tags.slug,
    })
    .from(pageTags)
    .innerJoin(tags, eq(pageTags.tagId, tags.id))
    .where(inArray(pageTags.pageId, pageIds));

  const tagsByPageId = new Map<number, PostTag[]>();
  for (const tagRow of tagRows) {
    const current = tagsByPageId.get(tagRow.pageId) ?? [];
    current.push({ name: tagRow.name, slug: tagRow.slug });
    tagsByPageId.set(tagRow.pageId, current);
  }

  return rows.map((row) => ({
    ...row,
    tags: tagsByPageId.get(row.pageId) ?? [],
  }));
}

export default async function BlogPage() {
  let posts: BlogPostSummary[] = [];

  try {
    posts = await getBlogPosts();
  } catch {
    posts = [];
  }

  const featuredPost = posts[0] ?? null;
  const archivePosts = posts.slice(1);
  const totalWords = posts.reduce((sum, post) => sum + post.wordCount, 0);
  const uniqueTags = Array.from(
    new Map(
      posts.flatMap((post) => post.tags).map((tag) => [tag.slug, tag])
    ).values()
  );
  const postsByYear = posts.reduce<Record<string, BlogPostSummary[]>>((acc, post) => {
    const year = formatYear(post.publishedAt);
    acc[year] ??= [];
    acc[year].push(post);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 md:px-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--card) 88%, white 12%), color-mix(in srgb, var(--bg) 92%, var(--card) 8%))",
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Blog
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--text)] md:text-4xl">
              群星遂在未曾发生的潮汐里
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Published" value={String(posts.length).padStart(2, "0")} />
            <MetricCard label="Tag Families" value={String(uniqueTags.length).padStart(2, "0")} />
            <MetricCard label="Words" value={new Intl.NumberFormat("en-US").format(totalWords)} />
          </div>
        </div>
      </section>

      {featuredPost ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <article
            className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] p-6 md:p-8"
            style={{
              background:
                "linear-gradient(145deg, color-mix(in srgb, var(--primary) 9%, var(--card) 91%), color-mix(in srgb, var(--bg) 82%, var(--card) 18%))",
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--accent) 40%, transparent)",
                filter: "blur(24px)",
                opacity: 0.4,
              }}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Latest Story
            </p>
            <div className="mt-5 flex items-start gap-5">
              <div className="min-w-[72px] rounded-2xl border border-[var(--border)] px-3 py-4 text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  {formatMonth(featuredPost.publishedAt)}
                </div>
                <div className="mt-2 text-3xl font-bold text-[var(--text)]">
                  {formatDay(featuredPost.publishedAt)}
                </div>
              </div>

              <div className="min-w-0">
                <Link href={`/${featuredPost.slug}`} className="group block">
                  <h2 className="text-3xl font-bold leading-tight text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
                    {featuredPost.title}
                  </h2>
                </Link>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {formatDate(featuredPost.publishedAt)} · {featuredPost.readingTime} 分钟阅读 · {featuredPost.wordCount} 字
                </p>
                <p className="mt-5 text-base leading-8 text-[var(--muted)]" style={clampStyle(5)}>
                  {excerptText(featuredPost)}
                </p>
                {featuredPost.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {featuredPost.tags.map((tag) => (
                      <TagPill key={tag.slug} tag={tag} prominent />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>

          <aside className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <InfoPanel
              title="Tag Radar"
              eyebrow="Themes"
              body={
                uniqueTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uniqueTags.map((tag) => (
                      <TagPill key={tag.slug} tag={tag} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-[var(--muted)]">标签会在文章继续增多后更有意义。</p>
                )
              }
            />
            <InfoPanel
              title="Archive"
              eyebrow="Timeline"
              body={
                <div className="space-y-4">
                  {Object.entries(postsByYear).map(([year, yearPosts]) => (
                    <div key={year}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        {year}
                      </div>
                      <div className="space-y-2">
                        {yearPosts.map((post) => (
                          <Link
                            key={post.slug}
                            href={`/${post.slug}`}
                            className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3 text-sm transition-colors hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
                          >
                            <span className="min-w-0 truncate text-[var(--text)]">{post.title}</span>
                            <span className="ml-3 shrink-0 text-[var(--muted)]">{formatMonth(post.publishedAt)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          </aside>
        </section>
      ) : (
        <section
          className="mt-8 rounded-[2rem] border border-dashed border-[var(--border)] px-6 py-16 text-center"
          style={{ background: "color-mix(in srgb, var(--card) 38%, transparent)" }}
        >
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">No Dispatch Yet</p>
          <h2 className="mt-3 text-2xl font-bold text-[var(--text)]">博客区还是空的</h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
            内容导入成功后，这里会自动列出所有 `content/blog/posts` 下的文章。
          </p>
        </section>
      )}

      {archivePosts.length > 0 && (
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Reading Shelf
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">更多文章</h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {archivePosts.map((post, index) => (
              <article
                key={post.slug}
                className="group overflow-hidden rounded-[1.75rem] border border-[var(--border)] p-5 transition-transform duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)]/35"
                style={{
                  background:
                    index % 2 === 0
                      ? "linear-gradient(180deg, color-mix(in srgb, var(--card) 88%, white 12%), color-mix(in srgb, var(--bg) 92%, var(--card) 8%))"
                      : "linear-gradient(180deg, color-mix(in srgb, var(--bg) 90%, var(--card) 10%), color-mix(in srgb, var(--card) 82%, transparent))",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    {formatYear(post.publishedAt)}
                  </p>
                  <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                    {post.readingTime} min
                  </div>
                </div>

                <Link href={`/${post.slug}`} className="mt-5 block">
                  <h3 className="text-2xl font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
                    {post.title}
                  </h3>
                </Link>

                <p className="mt-3 text-sm text-[var(--muted)]">
                  {formatDate(post.publishedAt)} · {post.wordCount} 字
                </p>

                <p className="mt-5 text-sm leading-7 text-[var(--muted)]" style={clampStyle(4)}>
                  {excerptText(post)}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <TagPill key={tag.slug} tag={tag} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[1.5rem] border border-[var(--border)] px-4 py-4"
      style={{ background: "color-mix(in srgb, var(--bg) 55%, transparent)" }}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-3 text-2xl font-bold text-[var(--text)]">{value}</div>
    </div>
  );
}

function InfoPanel({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <section
      className="rounded-[1.75rem] border border-[var(--border)] p-5"
      style={{ background: "color-mix(in srgb, var(--card) 82%, transparent)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold text-[var(--text)]">{title}</h3>
      <div className="mt-4">{body}</div>
    </section>
  );
}

function TagPill({ tag, prominent = false }: { tag: PostTag; prominent?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
      style={{
        borderColor: "color-mix(in srgb, var(--primary) 18%, var(--border))",
        color: prominent ? "var(--primary)" : "var(--muted)",
        background: prominent
          ? "color-mix(in srgb, var(--primary) 11%, transparent)"
          : "color-mix(in srgb, var(--bg) 64%, transparent)",
      }}
    >
      {tag.name}
    </span>
  );
}
