import { db } from "@/lib/db";
import { pages, searchIndex } from "@/lib/db/schema";
import { findBestSearchBlock, searchContent } from "@/lib/search/engine";
import { indexRenderedHtml } from "@/lib/search/index-html";
import { formatSearchHref, formatSearchPath, summarizeSearchText } from "@/lib/search/utils";
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
        htmlContent: pages.htmlContent,
      })
      .from(searchIndex)
      .innerJoin(pages, sql`${searchIndex.pageId} = ${pages.id}`)
      .where(
        sql`${searchIndex.content} ILIKE ${`%${q}%`} OR ${pages.title} ILIKE ${`%${q}%`}`
      )
      .limit(20);

    return NextResponse.json(
      await Promise.all(results.map(async (result) => {
        const indexedHtml = await indexRenderedHtml(result.htmlContent ?? "", result.slug);
        const matchedBlock = findBestSearchBlock(indexedHtml.blocks, q);
        const displayPath = formatSearchPath(result.slug);
        return {
        slug: result.slug,
        title: result.title,
        pageType: result.pageType,
        displayPath,
        href: formatSearchHref(result.slug, matchedBlock?.anchorId, q),
        matchedHeading: matchedBlock?.heading ?? null,
        snippet: matchedBlock
          ? summarizeSearchText(matchedBlock.text)
          : result.snippet?.slice(0, 180) ?? "",
        };
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
