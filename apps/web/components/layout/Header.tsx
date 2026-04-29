"use client";

import Link from "next/link";
import { normalizeContentHref } from "@/lib/routing";
import { ThemeToggle } from "./ThemeToggle";
import { SearchDialog } from "./SearchDialog";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

interface NavItem {
  id: number;
  label: string;
  slug: string | null;
  icon: string | null;
}

export function Header({ navItems }: { navItems: NavItem[] }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[var(--primary)]">
            <img src="/images/logo.png" alt="logo" className="w-8 h-8 rounded-lg" />
            <span>ka1的笔记本</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={normalizeContentHref(item.slug)}
                className="px-3 py-1.5 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--card)]/30 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <SearchDialog />
          <ThemeToggle />
          <a
            href="https://github.com/The0xKa1"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[var(--card)]/30 transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
