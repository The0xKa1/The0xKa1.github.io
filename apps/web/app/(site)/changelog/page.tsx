import { db } from "@/lib/db";
import { changelogEntries } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "更新日志",
  description: "站点更新记录",
};

export default async function ChangelogPage() {
  let entries: typeof changelogEntries.$inferSelect[] = [];

  try {
    entries = await db
      .select()
      .from(changelogEntries)
      .orderBy(desc(changelogEntries.year), desc(changelogEntries.date));
  } catch {
    entries = [];
  }

  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.year]) acc[entry.year] = [];
    acc[entry.year].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[var(--text)]">更新日志</h1>
      <div className="space-y-8">
        {Object.entries(grouped).map(([year, yearEntries]) => (
          <section key={year}>
            <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">{year}</h2>
            <div className="space-y-3">
              {yearEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)]"
                  style={{ background: "var(--card)" }}
                >
                  <span className="text-sm font-mono text-[var(--muted)] shrink-0">
                    {entry.date}
                  </span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                        entry.type === "newpage"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : "bg-blue-500/20 text-blue-600"
                      }`}
                    >
                      {entry.type === "newpage" ? "新页面" : "更新"}
                    </span>
                    <span className="text-[var(--text)]">{entry.text}</span>
                    {entry.href && (
                      <a
                        href={entry.href}
                        className="ml-2 text-sm text-[var(--primary)] hover:underline"
                      >
                        查看
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {entries.length === 0 && (
          <p className="text-[var(--muted)]">暂无更新日志</p>
        )}
      </div>
    </div>
  );
}
