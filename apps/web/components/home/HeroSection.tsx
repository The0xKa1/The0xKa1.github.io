"use client";

import Link from "next/link";
import { BookOpen, Pen, House } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "85vh" }}>
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))",
        }}
      >
        {/* Animated orbs */}
        <div
          className="absolute w-[45vmax] h-[45vmax] rounded-full"
          style={{
            background: "var(--accent)",
            filter: "blur(80px)",
            opacity: 0.35,
            top: "-10%",
            left: "-10%",
            animation: "move 20s infinite alternate",
          }}
        />
        <div
          className="absolute w-[45vmax] h-[45vmax] rounded-full"
          style={{
            background: "#a29bfe",
            filter: "blur(80px)",
            opacity: 0.35,
            right: "-5%",
            bottom: "-5%",
            animation: "move 15s infinite alternate-reverse",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20" style={{ minHeight: "85vh" }}>
        {/* Morphing logo */}
        <div
          className="w-[130px] h-[130px] mb-8 p-3"
          style={{
            background: "var(--glass-bg)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            animation: "morph 8s ease-in-out infinite",
          }}
        >
          <img
            src="/images/logo.png"
            alt="logo"
            className="w-full h-full object-cover"
            style={{ borderRadius: "inherit" }}
          />
        </div>

        <h2 className="text-white text-2xl md:text-3xl font-medium mb-6">
          人生苦短，纵情燃烧
        </h2>

        {/* Stats bar */}
        <div
          className="flex items-center gap-4 px-5 py-2 rounded-full mb-10 text-white/90 text-sm"
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="relative w-2 h-2 bg-emerald-400 rounded-full">
            <div
              className="absolute inset-0 bg-emerald-400 rounded-full"
              style={{ animation: "pulse 2.5s infinite" }}
            />
          </div>
          <span>134 Notes</span>
          <span className="opacity-50">|</span>
          <span>2026 Updated</span>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap justify-center gap-4">
          <HeroLink href="https://the0xka1.cc" icon={<House className="w-4 h-4" />} label="Home" />
          <HeroLink href="/NOTE/" icon={<BookOpen className="w-4 h-4" />} label="Notes" />
          <HeroLink href="/blog/" icon={<Pen className="w-4 h-4" />} label="Blog" />
          <HeroLink href="https://github.com/The0xKa1" icon={<GithubIcon className="w-4 h-4" />} label="Github" />
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full leading-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: "95px", transform: "scale(1.1)" }}
        >
          <path
            d="M0,20 C150,80 300,0 450,40 C600,80 750,0 900,40 C1050,80 1200,20 1200,20 V150 H0 Z"
            style={{ fill: "var(--bg)" }}
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes move {
          from { transform: translate(-10%, -10%) rotate(0deg); }
          to { transform: translate(10%, 10%) rotate(40deg); }
        }
        @keyframes morph {
          0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
          100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

function HeroLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const isExternal = href.startsWith("http");
  const props = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      {...props}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-white/85 text-sm transition-all duration-300 hover:text-white hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
