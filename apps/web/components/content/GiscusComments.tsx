"use client";

import Giscus from "@giscus/react";

interface GiscusCommentsProps {
  repo: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  mapping?: string;
  reactionsEnabled?: string;
  emitMetadata?: string;
  inputPosition?: string;
  theme?: string;
  lang?: string;
  loading?: string;
}

export function GiscusComments(props: GiscusCommentsProps) {
  return <Giscus {...props} />;
}
