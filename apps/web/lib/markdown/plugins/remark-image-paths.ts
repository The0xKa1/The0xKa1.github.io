import type { Plugin } from "unified";

interface Options {
  slug?: string;
  imageBasePath?: string;
}

export const remarkImagePaths: Plugin = (_options?: Options) => {
  // Image paths are rewritten during pre-processing.
  return () => {};
};
