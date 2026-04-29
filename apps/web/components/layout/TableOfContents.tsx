"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TocHeading[];
}

/**
 * Build a tree from flat headings.
 * A child belongs to the nearest preceding heading with a lower level.
 */
function buildTree(headings: TocHeading[]): Array<TocHeading & { children: TocHeading[] }> {
  const root: Array<TocHeading & { children: TocHeading[] }> = [];
  let currentH2: (TocHeading & { children: TocHeading[] }) | null = null;

  for (const h of headings) {
    if (h.level === 2) {
      currentH2 = { ...h, children: [] };
      root.push(currentH2);
    } else if (currentH2 && h.level >= 3) {
      currentH2.children.push(h);
    }
  }
  return root;
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const tree = useMemo(() => buildTree(headings), [headings]);

  // Default-expand the first section so the TOC isn't empty on load
  const [expandedH2s, setExpandedH2s] = useState<Set<string>>(() => {
    if (tree.length > 0) return new Set([tree[0].id]);
    return new Set();
  });

  // Intersection Observer: track which heading is currently in view
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  // Auto-expand the active section and collapse others
  useEffect(() => {
    if (!activeId || tree.length === 0) return;

    // Find which h2 section the activeId belongs to
    let activeH2Id: string | null = null;
    for (const section of tree) {
      if (section.id === activeId) {
        activeH2Id = section.id;
        break;
      }
      if (section.children.some((c) => c.id === activeId)) {
        activeH2Id = section.id;
        break;
      }
    }

    if (activeH2Id) {
      setExpandedH2s(new Set([activeH2Id]));
    }
  }, [activeId, tree]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleH2 = (id: string) => {
    setExpandedH2s((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (tree.length === 0) return null;

  return (
    <nav className="pl-4 py-6">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
        目录
      </p>
      <div className="space-y-1">
        {tree.map((section) => {
          const isExpanded = expandedH2s.has(section.id);
          const isActiveH2 = activeId === section.id;
          const hasChildren = section.children.length > 0;
          const hasActiveChild = section.children.some((c) => c.id === activeId);
          const sectionActive = isActiveH2 || hasActiveChild;

          return (
            <div key={section.id}>
              {/* H2 item */}
              <div
                className={`flex items-center gap-1 py-1 pr-2 rounded-md cursor-pointer transition-colors ${
                  sectionActive
                    ? "text-[var(--primary)] font-medium"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                onClick={() => {
                  if (hasChildren) {
                    toggleH2(section.id);
                  }
                  handleClick(section.id);
                }}
              >
                {hasChildren && (
                  <ChevronRight
                    className={`w-3 h-3 shrink-0 transition-transform duration-300 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                )}
                {!hasChildren && <span className="w-3 shrink-0" />}
                <span className="text-sm truncate">{section.text}</span>
              </div>

              {/* H3+ children with fade transition */}
              <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  maxHeight: isExpanded ? "600px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <div className="mt-1 space-y-1 border-l border-[var(--border)] ml-[5px] pl-3">
                  {section.children.map((child) => {
                    const isActive = activeId === child.id;
                    const indent = (child.level - 3) * 12;

                    return (
                      <div
                        key={child.id}
                        className={`flex items-center py-0.5 pr-2 rounded-md cursor-pointer transition-colors text-sm ${
                          isActive
                            ? "text-[var(--primary)] font-medium"
                            : "text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                        style={{ paddingLeft: `${indent}px` }}
                        onClick={() => handleClick(child.id)}
                      >
                        <span className="truncate">{child.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
