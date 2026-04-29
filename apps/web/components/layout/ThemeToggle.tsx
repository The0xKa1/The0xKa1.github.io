"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const THEMES = [
  { name: "light", icon: Sun, label: "万籁俱寂" },
  { name: "dark", icon: Moon, label: "萧瑟凌晨" },
  { name: "simple", icon: Monitor, label: "烈日灼心" },
] as const;

type Theme = (typeof THEMES)[number]["name"];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved && THEMES.some((t) => t.name === saved)) {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    // Sync Giscus theme
    const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    if (iframe) {
      iframe.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: theme === "dark" ? "dark" : "light" } } },
        "https://giscus.app"
      );
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  const currentIndex = THEMES.findIndex((t) => t.name === theme);
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
  const Icon = nextTheme.icon;

  return (
    <button
      onClick={() => setTheme(nextTheme.name)}
      className="p-2 rounded-lg hover:bg-[var(--card)]/30 transition-colors"
      title={`切换到 ${nextTheme.label}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
