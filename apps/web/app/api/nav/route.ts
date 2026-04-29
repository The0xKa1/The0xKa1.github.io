import { db } from "@/lib/db";
import { navigation } from "@/lib/db/schema";
import { asc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allNav = await db.select().from(navigation).orderBy(asc(navigation.sortOrder));

    const buildTree = (parentId: number | null) => {
      return allNav
        .filter((n) => n.parentId === parentId)
        .map((n) => ({
          ...n,
          children: buildTree(n.id),
        }));
    };

    const tree = buildTree(null);
    return NextResponse.json(tree);
  } catch {
    return NextResponse.json([]);
  }
}
