import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--primary)] mb-4">404</h1>
        <p className="text-xl text-[var(--text)] mb-2">页面不存在</p>
        <p className="text-[var(--muted)] mb-8">你访问的页面可能已被移动或删除</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ background: "var(--primary)" }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
