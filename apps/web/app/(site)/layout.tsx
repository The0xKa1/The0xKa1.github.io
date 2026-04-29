import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { navigation } from "@/lib/db/schema";
import { asc, isNull } from "drizzle-orm";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let navItems: { id: number; label: string; slug: string | null }[] = [];
  try {
    navItems = await db
      .select()
      .from(navigation)
      .where(isNull(navigation.parentId))
      .orderBy(asc(navigation.sortOrder));
  } catch {
    navItems = [];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header navItems={navItems} />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 min-w-0 px-6 py-8">
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
