import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import matter from "gray-matter";
import { createProcessor } from "../lib/markdown/parser";
import { preprocessMarkdown } from "../lib/markdown/preprocess";
import { resolveContentLink } from "../lib/markdown/plugins/rehype-content-links";
import { indexRenderedHtml } from "../lib/search/index-html";

test("document links resolve from source directories and use canonical routes", () => {
  const cases = [
    ["./wk1", "NOTE/ADS/index", "/NOTE/ADS/wk1"],
    ["wk2.md?highlight=tree#balance", "NOTE/ADS/index", "/NOTE/ADS/wk2?highlight=tree#balance"],
    ["./wk2.md", "NOTE/ADS/wk1", "/NOTE/ADS/wk2"],
    ["../GIT/index.md", "NOTE/CS/TMS/index", "/NOTE/CS/GIT"],
    ["./index.md", "NOTE/ADS/wk1", "/NOTE/ADS"],
    ["../index.md#courses", "NOTE/ADS/index", "/NOTE#courses"],
    ["NOTE/ADS/", "index", "/NOTE/ADS"],
    ["/NOTE/ADS/index.md", "NOTE/DB/index", "/NOTE/ADS"],
    ["./前置知识.md", "NOTE/LA/linear-algebra", "/NOTE/LA/前置知识"],
    ["../../index.md", "NOTE/ADS/index", "/"],
  ];
  for (const [href, slug, expected] of cases) {
    assert.equal(resolveContentLink(href, slug), expected);
  }
});

test("external URLs, anchors, queries and asset links are preserved", () => {
  for (const href of [
    "", "#目录", "?highlight=tree", "https://example.com/a.md#b",
    "//example.com/a.md", "mailto:me@example.com", "tel:123",
    "javascript:;", "data:text/plain,hello", "./img/exam.pdf", "/note-images/a.png",
  ]) {
    assert.equal(resolveContentLink(href, "NOTE/ADS/index"), href);
  }
});

test("final HTML rewrites Markdown, raw cards and expanded fragments, but not code examples", async () => {
  const markdown = '[Next](./wk2.md#tree)\n\n<a class="ADS_card" href="./wk1">Card</a>';
  const rendered = String(await createProcessor({ slug: "NOTE/ADS/index" }).process(markdown));
  const html = rendered + '<details><a href="../DB/index.md">DB</a></details>'
    + '<div class="tab-content"><a href="./wk3_1">Tab</a></div>'
    + '<pre><code>&lt;a href="./wk1"&gt;</code></pre>';
  const result = await indexRenderedHtml(html, "NOTE/ADS/index");
  assert.match(result.html, /href="\/NOTE\/ADS\/wk2#tree"/);
  assert.match(result.html, /href="\/NOTE\/ADS\/wk1"/);
  assert.match(result.html, /href="\/NOTE\/DB"/);
  assert.match(result.html, /href="\/NOTE\/ADS\/wk3_1"/);
  assert.match(result.html, /&#x3C;a href="\.\/wk1">/);
  assert.equal((await indexRenderedHtml(result.html, "NOTE/ADS/index")).html, result.html);
});

test("all 15 actual ADS course cards link to existing chapters", async () => {
  const contentRoot = resolve(__dirname, "../../../content");
  const { content } = matter(readFileSync(resolve(contentRoot, "NOTE/ADS/index.md"), "utf8"));
  const { markdown } = preprocessMarkdown(content, "NOTE/ADS/index");
  const rendered = String(await createProcessor({ slug: "NOTE/ADS/index" }).process(markdown));
  const { html } = await indexRenderedHtml(rendered, "NOTE/ADS/index");
  const links = [...html.matchAll(/href="(\/NOTE\/ADS\/wk[\d_]+)"/g)];
  assert.equal(links.length, 15);
  for (const [, href] of links) {
    assert.ok(existsSync(resolve(contentRoot, `${href.slice(1)}.md`)), href);
  }
  assert.doesNotMatch(html, /href="\.\/wk/);
});
