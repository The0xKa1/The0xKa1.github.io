import type { Plugin } from "unified";

export const remarkMermaid: Plugin = () => {
  // Mermaid blocks are pre-processed to <pre class="mermaid"> before remark parsing.
  // Client-side mermaid.init() handles rendering.
  return () => {};
};
