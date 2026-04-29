import { HeroSection } from "@/components/home/HeroSection";
import { HomeIndex } from "@/components/home/HomeIndex";
import { db } from "@/lib/db";
import { navigation } from "@/lib/db/schema";
import { asc, eq, isNull } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "人生苦短，纵情燃烧 - 个人笔记与博客",
  openGraph: {
    description: "人生苦短，纵情燃烧 - 个人笔记与博客",
    type: "website",
  },
};

export default async function HomePage() {
  let navItems: { id: number; label: string; slug: string | null; children?: any[] }[] = [];

  try {
    const topLevel = await db
      .select()
      .from(navigation)
      .where(isNull(navigation.parentId))
      .orderBy(asc(navigation.sortOrder));

    for (const item of topLevel) {
      const children = await db
        .select()
        .from(navigation)
        .where(eq(navigation.parentId, item.id))
        .orderBy(asc(navigation.sortOrder));

      const itemWithChildren = { ...item, children: [] as any[] };
      for (const child of children) {
        const grandchildren = await db
          .select()
          .from(navigation)
          .where(eq(navigation.parentId, child.id))
          .orderBy(asc(navigation.sortOrder));
        itemWithChildren.children.push({ ...child, children: grandchildren });
      }
      navItems.push(itemWithChildren);
    }
  } catch {
    // Fallback: navigation not available yet
    navItems = [];
  }

  return (
    <div>
      <HeroSection />
      <HomeIndex navTree={navItems} />
    </div>
  );
}
