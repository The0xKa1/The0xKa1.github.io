"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { normalizeContentHref } from "@/lib/routing";

interface NavNode {
  id: number;
  label: string;
  slug: string | null;
  children?: NavNode[];
}

function NavItem({ item, depth = 0 }: { item: NavNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = item.children && item.children.length > 0;
  const href = normalizeContentHref(item.slug);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 py-1 px-2 rounded-md hover:bg-[var(--card)]/20 transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren && (
          <ChevronRight
            className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform ${open ? "rotate-90" : ""}`}
          />
        )}
        {!hasChildren && <span className="w-3.5" />}
        {item.slug ? (
          <Link href={href} className="flex-1 text-sm truncate text-[var(--text)] hover:text-[var(--primary)]">
            {item.label}
          </Link>
        ) : (
          <span className="flex-1 text-sm truncate text-[var(--muted)]">{item.label}</span>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {item.children!.map((child) => (
            <NavItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [hoverTriggerActive, setHoverTriggerActive] = useState(false);

  // Close desktop sidebar when pressing Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDesktopOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSidebarEnter = useCallback(() => {
    setDesktopOpen(true);
    setHoverTriggerActive(false);
  }, []);

  const handleSidebarLeave = useCallback(() => {
    setDesktopOpen(false);
  }, []);

  const handleTriggerEnter = useCallback(() => {
    setHoverTriggerActive(true);
    setDesktopOpen(true);
  }, []);

  const handleTriggerLeave = useCallback(() => {
    setHoverTriggerActive(false);
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[var(--primary)] text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop hover trigger strip — the subtle cue on the left edge */}
      <div
        className="hidden lg:flex fixed top-16 left-0 z-40 w-3 h-[calc(100vh-4rem)] flex-col items-center justify-center cursor-pointer group"
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={handleTriggerLeave}
        aria-label="展开导航栏"
      >
        {/* Main indicator line */}
        <div
          className={`w-[2px] rounded-full transition-all duration-500 ease-out ${
            hoverTriggerActive
              ? "h-24 bg-[var(--primary)] opacity-80"
              : "h-10 bg-[var(--border)] opacity-60 group-hover:h-16 group-hover:opacity-100"
          }`}
        />
        {/* Tiny chevron hint */}
        <ChevronRight
          className={`w-3 h-3 mt-2 transition-all duration-300 ${
            hoverTriggerActive
              ? "text-[var(--primary)] translate-x-0 opacity-100"
              : "text-[var(--muted)] -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
          }`}
        />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] overflow-y-auto border-r border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm shadow-2xl transition-transform duration-300 ease-out lg:shadow-none lg:bg-[var(--bg)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="p-4">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3 px-2">
            导航
          </p>
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop backdrop — dims content slightly when sidebar is open */}
      {desktopOpen && (
        <div
          className="hidden lg:block fixed inset-0 z-30 bg-black/5 transition-opacity duration-300"
          onClick={() => setDesktopOpen(false)}
        />
      )}
    </>
  );
}

function SidebarNav() {
  const [items, setItems] = useState<NavNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/nav")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-6 bg-[var(--card)]/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </div>
  );
}
