"use client";

import Link from "next/link";

interface NavNode {
  id: number;
  label: string;
  slug: string | null;
  children?: NavNode[];
}

interface HomeIndexProps {
  navTree: NavNode[];
}

export function HomeIndex({ navTree }: HomeIndexProps) {
  const studySection = navTree.find((n) => n.label.includes("学习笔记"));
  const topShortcuts = navTree
    .filter((n) => n.label !== "首页" && n.slug)
    .map((n) => ({ label: n.label, slug: n.slug! }));

  const cards = studySection?.children?.filter((c) => c.children && c.children.length > 0) || [];

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
            AUTO ATLAS
          </p>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-3">站点目录</h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            首页目录由配置自动生成，顺序和站点导航保持一致。
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Tag label={`${cards.length} 大分区`} />
            <Tag label={`${countTopics(cards)} 个专题`} />
            <Tag label={`134 个页面`} />
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Link
            href="/NOTE/"
            className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
          >
            总览入口
          </Link>
          {topShortcuts.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="px-4 py-2 rounded-full text-sm border border-[var(--border)] text-[var(--text)] hover:bg-[var(--card)]/20 transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <SectionCard key={card.id} card={card} index={idx + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--card)]/30 text-[var(--muted)] border border-[var(--border)]">
      {label}
    </span>
  );
}

function countTopics(cards: NavNode[]): number {
  return cards.reduce((sum, card) => {
    const topics = card.children?.filter((c) => c.children && c.children.length > 0) || [];
    return sum + topics.length;
  }, 0);
}

function SectionCard({ card, index }: { card: NavNode; index: number }) {
  const groups = card.children?.filter((c) => c.children && c.children.length > 0) || [];
  const directLinks = card.children?.filter((c) => c.slug && !c.children?.length) || [];
  const pageCount = countPages(card);

  return (
    <article
      className="rounded-2xl border border-[var(--border)] overflow-hidden"
      style={{ background: "var(--card)" }}
    >
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-[var(--primary)] opacity-30">
            {String(index).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-bold text-[var(--text)]">{card.label}</h3>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {groups.length} 个专题 · {pageCount} 个页面
        </p>
      </div>
      <div className="p-4 space-y-2">
        {directLinks.map((link) => (
          <Link
            key={link.id}
            href={`/${link.slug}`}
            className="block px-3 py-2 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--bg)]/50 transition-colors"
          >
            {link.label}
          </Link>
        ))}
        {groups.map((group) => (
          <details key={group.id} className="group" open>
            <summary className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm font-medium text-[var(--text)] hover:bg-[var(--bg)]/50 transition-colors list-none">
              <span>{group.label}</span>
              <span className="text-xs text-[var(--muted)]">{countPages(group)} 页</span>
            </summary>
            <div className="mt-1 ml-4 space-y-1">
              {group.children?.map((child) => (
                <Link
                  key={child.id}
                  href={`/${child.slug || ""}`}
                  className="block px-3 py-1.5 rounded-md text-sm text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--bg)]/30 transition-colors"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </details>
        ))}
      </div>
    </article>
  );
}

function countPages(node: NavNode): number {
  let count = node.slug ? 1 : 0;
  if (node.children) {
    for (const child of node.children) {
      count += countPages(child);
    }
  }
  return count;
}
