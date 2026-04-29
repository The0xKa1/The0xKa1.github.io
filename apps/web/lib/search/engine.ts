import { readFile, stat } from "fs/promises";
import { join } from "path";
import type { SearchDocument, SearchResult } from "./types";
import {
  collapseWhitespace,
  formatSearchPath,
  normalizeSearchText,
  tokenizeSearchQuery,
} from "./utils";

interface PreparedSearchDocument extends SearchDocument {
  normalizedSlug: string;
  normalizedTitle: string;
  normalizedHeadings: string;
  normalizedHeadingsList: string[];
  normalizedContent: string;
}

const SEARCH_INDEX_PATH = join(process.cwd(), "public", "search-index.json");

let cachedIndex:
  | {
      mtimeMs: number;
      documents: PreparedSearchDocument[];
    }
  | null = null;

function prepareDocument(doc: SearchDocument): PreparedSearchDocument {
  return {
    ...doc,
    normalizedSlug: normalizeSearchText(doc.slug),
    normalizedTitle: normalizeSearchText(doc.title),
    normalizedHeadings: normalizeSearchText(doc.headings.join(" ")),
    normalizedHeadingsList: doc.headings.map((heading) => normalizeSearchText(heading)),
    normalizedContent: normalizeSearchText(doc.content),
  };
}

async function loadSearchDocuments(): Promise<PreparedSearchDocument[] | null> {
  try {
    const metadata = await stat(SEARCH_INDEX_PATH);
    if (cachedIndex && cachedIndex.mtimeMs === metadata.mtimeMs) {
      return cachedIndex.documents;
    }

    const raw = await readFile(SEARCH_INDEX_PATH, "utf-8");
    const parsed = JSON.parse(raw) as SearchDocument[];
    const documents = Array.isArray(parsed) ? parsed.map(prepareDocument) : [];

    cachedIndex = {
      mtimeMs: metadata.mtimeMs,
      documents,
    };

    return documents;
  } catch {
    return null;
  }
}

function scoreField(field: string, needle: string, weight: number): [number, number] {
  const index = field.indexOf(needle);
  if (index === -1) {
    return [0, -1];
  }

  const positionBoost = Math.max(weight * 0.35 - index / 20, 0);
  return [weight + positionBoost, index];
}

function findMatchedHeading(
  doc: PreparedSearchDocument,
  normalizedQuery: string,
  terms: string[]
): string | null {
  for (let i = 0; i < doc.headings.length; i++) {
    const normalizedHeading = doc.normalizedHeadingsList[i];
    if (normalizedHeading.includes(normalizedQuery)) {
      return doc.headings[i];
    }
  }

  for (const term of terms) {
    for (let i = 0; i < doc.headings.length; i++) {
      const normalizedHeading = doc.normalizedHeadingsList[i];
      if (normalizedHeading.includes(term)) {
        return doc.headings[i];
      }
    }
  }

  return null;
}

function buildSnippet(doc: SearchDocument, rawQuery: string, terms: string[]): string {
  const source = collapseWhitespace(doc.content || doc.summary || doc.title);
  if (!source) {
    return "";
  }

  const candidates = Array.from(
    new Set([rawQuery.trim(), ...terms].map((item) => item.trim()).filter(Boolean))
  );
  const lowerSource = source.toLocaleLowerCase();

  let bestIndex = -1;
  let bestTerm = "";

  for (const candidate of candidates) {
    const index = lowerSource.indexOf(candidate.toLocaleLowerCase());
    if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
      bestTerm = candidate;
    }
  }

  if (bestIndex === -1) {
    return doc.summary || source.slice(0, 180);
  }

  const radius = 78;
  const start = Math.max(0, bestIndex - radius);
  const end = Math.min(source.length, bestIndex + bestTerm.length + radius);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < source.length ? "..." : "";

  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}

export async function searchContent(
  query: string,
  limit: number = 20
): Promise<SearchResult[] | null> {
  const documents = await loadSearchDocuments();
  if (documents === null) {
    return null;
  }

  const { normalized, terms } = tokenizeSearchQuery(query);
  if (!normalized || terms.length === 0) {
    return [];
  }

  const scoredResults = documents
    .map((doc) => {
      let score = 0;
      let matchedTerms = 0;
      let earliestMatch = Number.POSITIVE_INFINITY;

      if (doc.normalizedTitle === normalized) {
        score += 260;
      }

      const phraseFields: Array<[string, number]> = [
        [doc.normalizedTitle, 150],
        [doc.normalizedHeadings, 110],
        [doc.normalizedSlug, 90],
        [doc.normalizedContent, 70],
      ];

      for (const [field, weight] of phraseFields) {
        const [fieldScore, index] = scoreField(field, normalized, weight);
        score += fieldScore;
        if (index !== -1) {
          earliestMatch = Math.min(earliestMatch, index);
        }
      }

      for (const term of terms) {
        let termMatched = false;

        const termFields: Array<[string, number]> = [
          [doc.normalizedTitle, 72],
          [doc.normalizedHeadings, 48],
          [doc.normalizedSlug, 42],
          [doc.normalizedContent, 18],
        ];

        for (const [field, weight] of termFields) {
          const [fieldScore, index] = scoreField(field, term, weight);
          if (fieldScore > 0) {
            termMatched = true;
            score += fieldScore;
            earliestMatch = Math.min(earliestMatch, index);
          }
        }

        if (termMatched) {
          matchedTerms += 1;
        }
      }

      if (matchedTerms === 0 && score === 0) {
        return null;
      }

      const coverage = matchedTerms / terms.length;
      score += coverage * 90;

      if (matchedTerms === terms.length && terms.length > 1) {
        score += 48;
      }

      if (Number.isFinite(earliestMatch)) {
        score += Math.max(0, 18 - earliestMatch / 35);
      }

      const matchedHeading = findMatchedHeading(doc, normalized, terms);
      if (matchedHeading) {
        score += 16;
      }

      return {
        score,
        result: {
          slug: doc.slug,
          title: doc.title,
          pageType: doc.pageType,
          displayPath: formatSearchPath(doc.slug),
          matchedHeading,
          snippet: buildSnippet(doc, query, terms),
        } satisfies SearchResult,
      };
    })
    .filter((item): item is { score: number; result: SearchResult } => item !== null)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.result.title.length - b.result.title.length;
    })
    .slice(0, limit)
    .map((item) => item.result);

  return scoredResults;
}
