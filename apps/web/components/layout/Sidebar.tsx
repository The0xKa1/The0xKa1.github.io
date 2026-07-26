"use client";

import { useState, useEffect, useCallback, useMemo, useRef, type RefObject } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { normalizeContentHref } from "@/lib/routing";
import {
  getActiveNavigationPathIds,
  type NavigationTreeNode,
} from "@/lib/navigation-tree";

interface NavItemProps {
  item: NavigationTreeNode;
  activePathIds: Set<number>;
  currentId: number | null;
  activeItemRef: RefObject<HTMLAnchorElement | null>;
  onNavigate: () => void;
  depth?: number;
}

function NavItem({
  item,
  activePathIds,
  currentId,
  activeItemRef,
  onNavigate,
  depth = 0,
}: NavItemProps) {
  const isOnActivePath = activePathIds.has(item.id);
  const isCurrent = currentId === item.id;
  const [open, setOpen] = useState(depth < 1 || isOnActivePath);
  const expanded = open;
  const hasChildren = Boolean(item.children?.length);
  const href = normalizeContentHref(item.slug);

  const labelClassName = `flex-1 truncate text-left text-sm transition-colors ${
    isCurrent
      ? "font-semibold text-[var(--primary)]"
      : isOnActivePath
        ? "font-medium text-[var(--text)]"
        : "text-[var(--muted)] hover:text-[var(--primary)]"
  }`;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
          isCurrent
            ? "bg-[var(--primary)]/10"
            : "hover:bg-[var(--card)]/20"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={`${expanded ? "收起" : "展开"}${item.label}`}
            aria-expanded={expanded}
            onClick={() => setOpen((value) => !value)}
            className="grid h-5 w-5 shrink-0 place-items-center rounded text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" aria-hidden="true" />
        )}
        {item.slug ? (
          <Link
            ref={isCurrent ? activeItemRef : undefined}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            onClick={onNavigate}
            className={labelClassName}
          >
            {item.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => hasChildren && setOpen((value) => !value)}
            className={labelClassName}
          >
            {item.label}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {item.children?.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              activePathIds={activePathIds}
              currentId={currentId}
              activeItemRef={activeItemRef}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
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

  const closeMobileNavigation = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        aria-label={mobileOpen ? "关闭导航栏" : "打开导航栏"}
        aria-expanded={mobileOpen}
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
          <SidebarNav
            visible={mobileOpen || desktopOpen}
            onNavigate={closeMobileNavigation}
          />
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

function SidebarNav({ visible, onNavigate }: { visible: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const [items, setItems] = useState<NavigationTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  const activePath = useMemo(
    () => getActiveNavigationPathIds(items, pathname),
    [items, pathname]
  );
  const activePathIds = useMemo(() => new Set(activePath), [activePath]);
  const currentId = activePath.at(-1) ?? null;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/nav", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Navigation request failed");
        return response.json() as Promise<NavigationTreeNode[]>;
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!visible || !activeItemRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      activeItemRef.current?.scrollIntoView({ block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visible, currentId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-6 bg-[var(--card)]/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="px-2 py-3 text-sm text-[var(--muted)]">导航暂时不可用</p>;
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavItem
          key={`${item.id}-${pathname}`}
          item={item}
          activePathIds={activePathIds}
          currentId={currentId}
          activeItemRef={activeItemRef}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
