import assert from "node:assert/strict";
import test from "node:test";
import { createProcessor, createAdmonitionProcessor } from "../lib/markdown/parser";

test("MkDocs heading anchors preserve formatted titles and automatic slugs", async () => {
  const html = String(await createProcessor({ slug: "courses/test" }).process(
    "## **反向传播** {#backprop}\n\n## Automatic title\n\n```markdown\n## Example {#literal}\n```",
  ));
  assert.match(html, /<h2 id="backprop"><strong>反向传播<\/strong><\/h2>/);
  assert.match(html, /<h2 id="automatic-title">Automatic title<\/h2>/);
  assert.match(html, /\{#literal\}/);
  assert.doesNotMatch(html, /id="literal"/);
});

test("explicit heading anchors also work in admonition and tab fragments", async () => {
  const html = String(await createAdmonitionProcessor().process("### 梯度 {#gradient}"));
  assert.match(html, /<h3 id="gradient">梯度<\/h3>/);
});
