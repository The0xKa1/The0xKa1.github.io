export interface SearchDocument {
  slug: string;
  title: string;
  pageType: string;
  headings: string[];
  content: string;
  summary: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  pageType: string;
  displayPath: string;
  matchedHeading: string | null;
  snippet: string;
}
