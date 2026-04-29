import type { SearchDocument } from "./types";
import {
  collapseWhitespace,
  extractSearchHeadings,
  htmlToPlainText,
  summarizeSearchText,
} from "./utils";

interface SearchSource {
  slug: string;
  title: string;
  pageType: string;
  content: string;
  htmlContent: string;
  excerpt?: string | null;
}

export function buildSearchDocument(page: SearchSource): SearchDocument {
  const plainText = htmlToPlainText(page.htmlContent);
  const summarySource = page.excerpt ? collapseWhitespace(page.excerpt) : plainText;

  return {
    slug: page.slug,
    title: collapseWhitespace(page.title),
    pageType: page.pageType,
    headings: extractSearchHeadings(page.content),
    content: plainText,
    summary: summarizeSearchText(summarySource),
  };
}
