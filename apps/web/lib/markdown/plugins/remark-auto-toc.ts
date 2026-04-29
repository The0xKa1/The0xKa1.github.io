import type { Plugin } from "unified";

interface Options {
  navTree?: any[];
  slug?: string;
}

export const remarkAutoToc: Plugin = (_options?: Options) => {
  // Auto-TOC placeholder is inserted during pre-processing.
  // The actual TOC rendering happens server-side in the page component.
  return () => {};
};
