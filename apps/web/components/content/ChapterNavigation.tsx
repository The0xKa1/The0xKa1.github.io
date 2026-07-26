import Link from "next/link";
import type { AdjacentNavigationItems } from "@/lib/content/navigation";
import { normalizeContentHref } from "@/lib/routing";

interface ChapterNavigationProps {
  items: AdjacentNavigationItems;
}

const linkClassName =
  "group min-w-0 border-t border-[var(--border)] py-4 text-[var(--muted)] transition-[color,transform] duration-200 hover:text-[var(--primary)] active:translate-y-px";

export function ChapterNavigation({ items }: ChapterNavigationProps) {
  if (!items.previous && !items.next) return null;

  return (
    <nav
      aria-label="章节翻页"
      className="mt-14 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2"
    >
      {items.previous ? (
        <Link
          href={normalizeContentHref(items.previous.slug)}
          rel="prev"
          className={linkClassName}
        >
          <span className="block text-xs font-medium tracking-wide">← 上一页</span>
          <span className="mt-1 block truncate text-sm font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
            {items.previous.label}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}

      {items.next && (
        <Link
          href={normalizeContentHref(items.next.slug)}
          rel="next"
          className={`${linkClassName} text-right sm:col-start-2`}
        >
          <span className="block text-xs font-medium tracking-wide">下一页 →</span>
          <span className="mt-1 block truncate text-sm font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
            {items.next.label}
          </span>
        </Link>
      )}
    </nav>
  );
}
