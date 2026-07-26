import { db } from "@/lib/db";
import { navigation } from "@/lib/db/schema";
import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";

export interface AdjacentNavigationItem {
  id: number;
  label: string;
  slug: string;
}

export interface AdjacentNavigationItems {
  previous: AdjacentNavigationItem | null;
  next: AdjacentNavigationItem | null;
}

export function pickAdjacentNavigationItems(
  items: AdjacentNavigationItem[],
  currentId: number
): AdjacentNavigationItems {
  const currentIndex = items.findIndex((item) => item.id === currentId);
  if (currentIndex === -1) return { previous: null, next: null };

  return {
    previous: currentIndex > 0 ? items[currentIndex - 1] : null,
    next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
  };
}

export async function getAdjacentNavigationItems(
  slug: string
): Promise<AdjacentNavigationItems> {
  const currentRows = await db
    .select({
      id: navigation.id,
      parentId: navigation.parentId,
    })
    .from(navigation)
    .where(eq(navigation.slug, slug))
    .limit(1);

  const current = currentRows[0];
  if (!current) return { previous: null, next: null };

  const parentCondition =
    current.parentId === null
      ? isNull(navigation.parentId)
      : eq(navigation.parentId, current.parentId);

  const rows = await db
    .select({
      id: navigation.id,
      label: navigation.label,
      slug: navigation.slug,
    })
    .from(navigation)
    .where(
      and(
        parentCondition,
        eq(navigation.isVisible, true),
        isNotNull(navigation.slug)
      )
    )
    .orderBy(asc(navigation.sortOrder), asc(navigation.id));

  const items = rows.filter(
    (item): item is AdjacentNavigationItem => typeof item.slug === "string"
  );
  return pickAdjacentNavigationItems(items, current.id);
}
