"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/lib/search/types";

function getBadgeLabel(pageType: string) {
  if (pageType === "blog") return "博客";
  if (pageType === "note") return "笔记";
  if (pageType === "index") return "目录";
  return "页面";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightTerms(query: string) {
  const parts = query.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts : query.trim() ? [query.trim()] : [];
}

function HighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const terms = getHighlightTerms(query);
  if (!text || terms.length === 0) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const segments = text.split(pattern);

  return (
    <>
      {segments.map((segment, index) => {
        const matched = terms.some((term) => segment.toLocaleLowerCase() === term.toLocaleLowerCase());
        if (!matched) {
          return <span key={`${segment}-${index}`}>{segment}</span>;
        }

        return (
          <mark
            key={`${segment}-${index}`}
            className="rounded bg-[var(--primary)]/15 px-1 text-[var(--text)]"
          >
            {segment}
          </mark>
        );
      })}
    </>
  );
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function closeDialog() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
  }

  function openResult(result: SearchResult) {
    closeDialog();
    router.push(result.href);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
        setSelectedIndex(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Search request failed");
        }
        const data = (await res.json()) as SearchResult[];
        setResults(data);
        setSelectedIndex(0);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card)]/30 transition-colors border border-[var(--border)]"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden md:inline-flex ml-1 px-1.5 py-0.5 rounded text-xs bg-[var(--card)]/30">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeDialog} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const nextQuery = e.target.value;
              setQuery(nextQuery);
              if (!nextQuery.trim()) {
                setResults([]);
                setLoading(false);
                setSelectedIndex(0);
                return;
              }
              setLoading(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
              }
              if (e.key === "Enter" && results[selectedIndex]) {
                e.preventDefault();
                openResult(results[selectedIndex]);
              }
            }}
            placeholder="搜索标题、目录、正文..."
            className="flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--muted)] outline-none"
          />
          <button onClick={closeDialog} className="p-1 rounded hover:bg-[var(--card)]/30">
            <X className="w-4 h-4 text-[var(--muted)]" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="px-4 py-6 text-sm text-[var(--muted)]">
              支持多关键词检索，优先匹配标题和目录，再匹配正文内容。
            </div>
          )}

          {loading && (
            <div className="px-4 py-6 text-center text-[var(--muted)] text-sm">搜索中...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="px-4 py-6 text-center text-[var(--muted)] text-sm">未找到结果</div>
          )}

          {results.map((result, index) => (
            <Link
              key={result.slug}
              href={result.href}
              onClick={(e) => {
                e.preventDefault();
                openResult(result);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`block px-4 py-3 transition-colors border-b border-[var(--border)] last:border-0 ${
                index === selectedIndex ? "bg-[var(--card)]/24" : "hover:bg-[var(--card)]/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  {getBadgeLabel(result.pageType)}
                </span>
                <span className="text-[var(--text)] text-sm font-medium truncate">
                  <HighlightText text={result.title} query={query} />
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--muted)] truncate">{result.displayPath}</div>
              {result.matchedHeading && (
                <div className="mt-2 text-xs text-[var(--primary)] truncate">
                  命中目录：
                  <HighlightText text={result.matchedHeading} query={query} />
                </div>
              )}
              {result.snippet && (
                <p className="mt-2 text-sm text-[var(--muted)] leading-6 line-clamp-2">
                  <HighlightText text={result.snippet} query={query} />
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
