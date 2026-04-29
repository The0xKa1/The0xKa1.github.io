import { db } from "@/lib/db";
import { pages, searchIndex } from "@/lib/db/schema";
import { searchContent } from "@/lib/search/engine";
import { formatSearchPath } from "@/lib/search/utils";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 120);

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const indexedResults = await searchContent(q, 20);
    if (indexedResults !== null) {
      return NextResponse.json(indexedResults);
    }
  } catch {
    // Fall through to the DB fallback below.
  }

  try {
    const results = await db
      .select({
        slug: pages.slug,
        title: pages.title,
        pageType: pages.pageType,
        snippet: searchIndex.content,
      })
      .from(searchIndex)
      .innerJoin(pages, sql`${searchIndex.pageId} = ${pages.id}`)
      .where(
        sql`${searchIndex.content} ILIKE ${`%${q}%`} OR ${pages.title} ILIKE ${`%${q}%`}`
      )
      .limit(20);

    return NextResponse.json(
      results.map((result) => ({
        slug: result.slug,
        title: result.title,
        pageType: result.pageType,
        displayPath: formatSearchPath(result.slug),
        matchedHeading: null,
        snippet: result.snippet?.slice(0, 180) ?? "",
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
