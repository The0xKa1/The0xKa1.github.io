import assert from "node:assert/strict";
import test from "node:test";
import { pickAdjacentNavigationItems } from "../lib/content/navigation";
import { getActiveNavigationPathIds } from "../lib/navigation-tree";
import { findBestSearchBlock } from "../lib/search/engine";
import { indexRenderedHtml } from "../lib/search/index-html";
import { formatSearchHref } from "../lib/search/utils";

test("search anchors identify the exact block under duplicate headings", async () => {
  const indexed = await indexRenderedHtml(
    [
      '<h2 id="问题">问题</h2>',
      "<p>第一处内容。</p>",
      '<h2 id="问题-1">问题</h2>',
      "<p>第二处包含精确定位短语。</p>",
    ].join(""),
    "NOTE/example"
  );

  const match = findBestSearchBlock(indexed.blocks, "精确定位短语");
  assert.ok(match);
  assert.equal(match.heading, "问题");
  assert.match(match.anchorId, /^search-/);
  assert.match(indexed.html, new RegExp(`id="${match.anchorId}"`));
  assert.equal(
    formatSearchHref("NOTE/example", match.anchorId, "精确定位短语"),
    `/NOTE/example?highlight=${encodeURIComponent("精确定位短语")}#${match.anchorId}`
  );
});

test("sidebar path lookup expands every ancestor and normalizes index routes", () => {
  const tree = [
    {
      id: 1,
      label: "学习笔记",
      slug: "NOTE/index",
      children: [
        {
          id: 2,
          label: "编译原理",
          slug: "NOTE/CompilerPrinciple/index",
          children: [
            {
              id: 3,
              label: "Liveness Analysis",
              slug: "NOTE/CompilerPrinciple/chap10",
            },
          ],
        },
      ],
    },
  ];

  assert.deepEqual(
    getActiveNavigationPathIds(tree, "/NOTE/CompilerPrinciple/chap10"),
    [1, 2, 3]
  );
  assert.deepEqual(getActiveNavigationPathIds(tree, "/NOTE/CompilerPrinciple"), [1, 2]);
});

test("adjacent chapter selection handles first, middle and last items", () => {
  const items = [
    { id: 1, label: "Chapter 1", slug: "chapter-1" },
    { id: 2, label: "Chapter 2", slug: "chapter-2" },
    { id: 3, label: "Chapter 3", slug: "chapter-3" },
  ];

  assert.deepEqual(pickAdjacentNavigationItems(items, 1), {
    previous: null,
    next: items[1],
  });
  assert.deepEqual(pickAdjacentNavigationItems(items, 2), {
    previous: items[0],
    next: items[2],
  });
  assert.deepEqual(pickAdjacentNavigationItems(items, 3), {
    previous: items[1],
    next: null,
  });
});
