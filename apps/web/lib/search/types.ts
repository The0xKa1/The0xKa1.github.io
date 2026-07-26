export interface SearchBlock {
  text: string;
  anchorId: string;
  heading: string | null;
  headingId: string | null;
  kind: "heading" | "content";
}

export interface SearchDocument {
  slug: string;
  title: string;
  pageType: string;
  headings: string[];
  blocks?: SearchBlock[];
  content: string;
  summary: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  pageType: string;
  displayPath: string;
  href: string;
  matchedHeading: string | null;
  snippet: string;
}
