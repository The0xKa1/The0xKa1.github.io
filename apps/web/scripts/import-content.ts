import { readFileSync, existsSync, readdirSync, statSync, copyFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname, basename } from "path";
import matter from "gray-matter";
import { db } from "../lib/db";
import {
  pages,
  blogPosts,
  tags,
  pageTags,
  navigation,
  siteConfig,
  themes,
  admonitionTypes,
  friendLinks,
  changelogEntries,
  searchIndex,
} from "../lib/db/schema";
import {
  preprocessMarkdown,
  preprocessAdmonitions,
  preprocessMathDelimiters,
  preprocessTabs,
  extractExcerpt,
  countWords,
  type TabGroupData,
} from "../lib/markdown/preprocess";
import { createProcessor, createAdmonitionProcessor } from "../lib/markdown/parser";
import { parseNavConfig, NavNode, extractTitle } from "../lib/content/nav-parser";
import { buildSearchDocument } from "../lib/search/build";
import type { SearchDocument } from "../lib/search/types";
import type { AdmonitionData } from "../lib/markdown/preprocess";

const ROOT = resolve(__dirname, "../../..");
const CONTENT_DIR = resolve(ROOT, "content");
const PUBLIC_DIR = resolve(ROOT, "apps/web/public");
const SEARCH_INDEX_OUTPUT = resolve(PUBLIC_DIR, "search-index.json");

interface PageRecord {
  slug: string;
  title: string;
  content: string;
  htmlContent: string;
  pageType: string;
  commentsEnabled: boolean;
  statisticsEnabled: boolean;
  template: string | null;
  wordCount: number;
  readingTime: number;
  fileMtime: Date | null;
  excerpt: string | null;
  tags: string[];
  publishedAt: Date | null;
}

interface RenderContext {
  nextTabGroupId: number;
}

function discoverMarkdownFiles(dir: string, base = ""): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip hidden dirs, node_modules equivalents
      if (entry.name.startsWith(".")) continue;
      if (entry.name === "__pycache__") continue;
      results.push(...discoverMarkdownFiles(fullPath, relPath));
    } else if (entry.name.endsWith(".md")) {
      results.push(relPath);
    }
  }

  return results;
}

function getPageType(relPath: string): string {
  if (relPath.startsWith("blog/")) return "blog";
  if (relPath === "index.md") return "home";
  if (relPath === "friends.md") return "page";
  if (relPath === "changelog.md") return "page";
  if (relPath.startsWith("NOTE/")) {
    if (basename(relPath) === "index.md") return "index";
    return "note";
  }
  return "page";
}

function slugFromPath(relPath: string): string {
  return relPath.replace(/\.md$/, "").replace(/\\/g, "/");
}

function getFileMtime(relPath: string): Date | null {
  try {
    const stat = statSync(resolve(CONTENT_DIR, relPath));
    return stat.mtime;
  } catch {
    return null;
  }
}

async function processMarkdownFile(
  relPath: string,
  navTree: NavNode[]
): Promise<PageRecord | null> {
  const fullPath = resolve(CONTENT_DIR, relPath);
  const raw = readFileSync(fullPath, "utf-8");
  const { data: frontmatter, content: rawContent } = matter(raw);
  const slug = slugFromPath(relPath);

  const { markdown, admonitions, tabGroups } = preprocessMarkdown(rawContent, slug);
  const processor = createProcessor({ slug, navTree });
  const result = await processor.process(markdown);
  let htmlContent = String(result);
  const renderContext: RenderContext = { nextTabGroupId: 0 };

  htmlContent = await renderAdmonitions(htmlContent, admonitions, renderContext);
  htmlContent = await renderTabGroups(htmlContent, tabGroups, renderContext);

  const wordCount = countWords(rawContent);
  const readingTime = Math.ceil(wordCount / 290);

  const pageType = getPageType(relPath);

  let commentsEnabled = true;
  if (frontmatter.comments === false) commentsEnabled = false;

  let statisticsEnabled = true;
  if (frontmatter.statistics === false || frontmatter.nonstatistics === true) {
    statisticsEnabled = false;
  }

  let excerpt: string | null = null;
  let publishedAt: Date | null = null;
  let tagList: string[] = [];

  if (pageType === "blog") {
    excerpt = extractExcerpt(rawContent);
    if (frontmatter.date) {
      publishedAt = new Date(frontmatter.date);
    }
    if (Array.isArray(frontmatter.tags)) {
      tagList = frontmatter.tags;
    }
  }

  let title = frontmatter.title || "";
  if (!title) {
    const headingMatch = rawContent.match(/^#\s+(.+)$/m);
    title = headingMatch ? headingMatch[1].trim() : slug;
  }

  return {
    slug,
    title,
    content: rawContent,
    htmlContent,
    pageType,
    commentsEnabled,
    statisticsEnabled,
    template: frontmatter.template || null,
    wordCount,
    readingTime,
    fileMtime: getFileMtime(relPath),
    excerpt,
    tags: tagList,
    publishedAt,
  };
}

async function renderMarkdownFragment(markdown: string, context: RenderContext): Promise<string> {
  const normalizedMarkdown = preprocessMathDelimiters(markdown);
  const { markdown: markdownWithAdmonitions, admonitions } = preprocessAdmonitions(normalizedMarkdown);
  const { markdown: processedMarkdown, tabGroups } = preprocessTabs(markdownWithAdmonitions);
  const admProcessor = createAdmonitionProcessor();
  const result = await admProcessor.process(processedMarkdown);
  let html = String(result);
  html = await renderAdmonitions(html, admonitions, context);
  html = await renderTabGroups(html, tabGroups, context);
  return html;
}

async function renderAdmonitionTitle(title: string): Promise<string> {
  const normalizedTitle = preprocessMathDelimiters(title);
  const admProcessor = createAdmonitionProcessor();
  const result = await admProcessor.process(normalizedTitle);
  const html = String(result).trim();
  return html.replace(/^<p>([\s\S]*)<\/p>$/, "$1");
}

async function renderAdmonitions(
  htmlContent: string,
  admonitions: AdmonitionData[],
  context: RenderContext
): Promise<string> {
  let output = htmlContent;

  for (let i = 0; i < admonitions.length; i++) {
    const adm = admonitions[i];
    const admHtml = await renderMarkdownFragment(adm.content, context);
    const admTitleHtml = await renderAdmonitionTitle(adm.title);
    const placeholder = `<!-- ADMONITION:${i} -->`;

    if (adm.collapsible) {
      output = output.replace(
        placeholder,
        `<details class="admonition admonition--${adm.type} admonition--collapsible" data-type="${adm.type}"${adm.expanded ? " open" : ""}>` +
          `<summary class="admonition__header"><span class="admonition__title">${admTitleHtml}</span></summary>` +
          `<div class="admonition__content">${admHtml}</div>` +
          `</details>`
      );
    } else {
      output = output.replace(
        placeholder,
        `<div class="admonition admonition--${adm.type}" data-type="${adm.type}">` +
          `<div class="admonition__header"><span class="admonition__title">${admTitleHtml}</span></div>` +
          `<div class="admonition__content">${admHtml}</div>` +
          `</div>`
      );
    }
  }

  return output;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function renderTabGroups(
  htmlContent: string,
  tabGroups: TabGroupData[],
  context: RenderContext
): Promise<string> {
  let output = htmlContent;

  for (let i = 0; i < tabGroups.length; i++) {
    const placeholder = `<!-- TABGROUP:${i} -->`;
    const group = tabGroups[i];
    const tabsHtml: string[] = [];
    const groupId = context.nextTabGroupId++;
    const groupName = `content-tabs-${groupId}`;

    for (let j = 0; j < group.tabs.length; j++) {
      const tab = group.tabs[j];
      const panelId = `${groupName}-${j}`;
      const checked = j === 0 ? " checked" : "";
      const panelHtml = await renderMarkdownFragment(tab.content, context);
      const labelHtml = await renderAdmonitionTitle(tab.label);

      tabsHtml.push(
        `<input class="content-tabs__control" type="radio" name="${groupName}" id="${panelId}"${checked}>` +
          `<label class="content-tabs__label" for="${panelId}">${labelHtml}</label>` +
          `<div class="content-tabs__panel">${panelHtml}</div>`
      );
    }

    output = output.replace(
      placeholder,
      `<section class="content-tabs" data-tab-count="${group.tabs.length}">${tabsHtml.join("")}</section>`
    );
  }

  return output;
}

function copyImages() {
  const imageExts = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"]);
  const destDir = resolve(PUBLIC_DIR, "note-images");
  mkdirSync(destDir, { recursive: true });

  function walk(dir: string, base = "") {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = base ? `${base}/${entry.name}` : entry.name;
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "__pycache__") continue;
        walk(fullPath, relPath);
      } else {
        const ext = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
        if (imageExts.has(ext)) {
          const destPath = resolve(destDir, relPath);
          mkdirSync(dirname(destPath), { recursive: true });
          copyFileSync(fullPath, destPath);
        }
      }
    }
  }

  walk(CONTENT_DIR);
}

async function seedDefaultConfig() {
  await db.insert(themes).values([
    {
      name: "light",
      isDefault: true,
      colors: {
        primary: "#dd6236",
        primaryBg: "#ffffff",
        card: "#ffd299",
        bg: "#F7eedd",
        admonitionBg: "#F7eedd",
        sidebar: "#dd6236",
        accent: "#f78fb3",
        text: "#1f2937",
        muted: "rgba(31, 41, 55, 0.62)",
        border: "rgba(36, 42, 56, 0.1)",
        glassBg: "rgba(255, 255, 255, 0.1)",
        glassBorder: "rgba(255, 255, 255, 0.2)",
      },
    },
    {
      name: "dark",
      isDefault: false,
      colors: {
        primary: "#acc2ef",
        primaryBg: "#0F1C2E",
        card: "#374357",
        bg: "#0F1C2E",
        sidebar: "#acc2ef",
        accent: "#ff9a6c",
        text: "#edf2f7",
        muted: "rgba(237, 242, 247, 0.62)",
        border: "rgba(255, 255, 255, 0.09)",
      },
    },
    {
      name: "simple",
      isDefault: false,
      colors: {
        primary: "#52616B",
        primaryBg: "#F0F5F9",
        card: "#C9D6DF",
        bg: "#F0F5F9",
        admonitionBg: "#F0F5F9",
        sidebar: "#52616B",
        accent: "#00ADB5",
        text: "#1f2937",
      },
    },
  ]).onConflictDoNothing();

  await db.insert(admonitionTypes).values([
    { name: "definition", label: "定义", borderColor: "#4ade80", bgColor: "#f0fdf4", iconColor: "#22c55e" },
    { name: "proof", label: "证明", borderColor: "#a78bfa", bgColor: "#f5f3ff", iconColor: "#8b5cf6" },
    { name: "property", label: "性质", borderColor: "#60a5fa", bgColor: "#eff6ff", iconColor: "#3b82f6" },
    { name: "summary", label: "总结", borderColor: "#fbbf24", bgColor: "#fffbeb", iconColor: "#f59e0b" },
    { name: "key-point", label: "要点", borderColor: "#f87171", bgColor: "#fef2f2", iconColor: "#ef4444" },
    { name: "advice", label: "建议", borderColor: "#34d399", bgColor: "#ecfdf5", iconColor: "#10b981" },
    { name: "not-advice", label: "不建议", borderColor: "#94a3b8", bgColor: "#f8fafc", iconColor: "#64748b" },
    { name: "eg", label: "示例", borderColor: "#818cf8", bgColor: "#eef2ff", iconColor: "#6366f1" },
    { name: "idea", label: "想法", borderColor: "#fb923c", bgColor: "#fff7ed", iconColor: "#f97316" },
    { name: "answer", label: "答案", borderColor: "#2dd4bf", bgColor: "#f0fdfa", iconColor: "#14b8a6" },
    { name: "note", label: "备注", borderColor: "#38bdf8", bgColor: "#f0f9ff", iconColor: "#0ea5e9" },
  ]).onConflictDoNothing();

  await db.insert(siteConfig).values([
    { key: "site_name", value: "ka1的笔记本" },
    { key: "site_description", value: "人生苦短，纵情燃烧" },
    { key: "site_url", value: "https://note.the0xka1.cc" },
    { key: "author", value: "The0xKa1" },
    { key: "copyright", value: "Copyright \u00a9 2023 ~ now | The0xKa1" },
  ]).onConflictDoNothing();
}

async function importNavigation(navTree: NavNode[]) {
  await db.delete(navigation);

  async function insertNode(node: NavNode, parentId: number | null, level: number, sortOrder: number) {
    let label = node.label;
    if (!label && node.path) {
      label = extractTitle(node.path);
    }
    let slug = node.path ? slugFromPath(node.path) : null;
    let skipFirstChild = false;

    // If this is a group (no direct path) and its first child is an index.md,
    // treat the group as the index page so clicking it navigates there.
    // Skip the index child so it doesn't appear twice in the nav.
    if (!slug && node.children.length > 0) {
      const firstChild = node.children[0];
      if (firstChild.path && firstChild.path.replace(/\\/g, "/").endsWith("/index.md")) {
        slug = slugFromPath(firstChild.path);
        skipFirstChild = true;
      }
    }

    const [inserted] = await db.insert(navigation).values({
      label: label || "未命名",
      slug,
      parentId,
      sortOrder,
      level,
      isTab: level === 0,
    }).returning({ id: navigation.id });

    const childrenToInsert = skipFirstChild ? node.children.slice(1) : node.children;
    for (let i = 0; i < childrenToInsert.length; i++) {
      await insertNode(childrenToInsert[i], inserted.id, level + 1, i);
    }
  }

  for (let i = 0; i < navTree.length; i++) {
    await insertNode(navTree[i], null, 0, i);
  }
}

async function importChangelog() {
  const changelogPath = resolve(CONTENT_DIR, "changelog.yml");
  if (!existsSync(changelogPath)) return;

  const yaml = readFileSync(changelogPath, "utf-8");
  // Simple YAML parsing for changelog
  const lines = yaml.split("\n");
  let currentYear = "";
  let currentDate = "";
  let sortOrder = 0;

  await db.delete(changelogEntries);

  for (const line of lines) {
    const yearMatch = line.match(/^-\s*"(\d{4})"/);
    if (yearMatch) {
      currentYear = yearMatch[1];
      continue;
    }

    const dateMatch = line.match(/^\s+-\s*"([\d.]+)"/);
    if (dateMatch) {
      currentDate = dateMatch[1];
      continue;
    }

    const eventMatch = line.match(/^\s+-\s*(\w+):\s*(.*)$/);
    if (eventMatch) {
      const type = eventMatch[1];
      const rest = eventMatch[2].trim();
      let text = rest;
      let href: string | null = null;

      const hrefMatch = rest.match(/href:\s*(\S+)/);
      if (hrefMatch) {
        const hrefIdx = rest.indexOf("href:");
        text = rest.slice(0, hrefIdx).replace(/text:\s*/, "").trim();
        href = hrefMatch[1];
      }

      await db.insert(changelogEntries).values({
        year: currentYear,
        date: currentDate,
        type,
        text,
        href,
        sortOrder: sortOrder++,
      });
    }
  }
}

async function importFriendLinks() {
  const friendsPath = resolve(CONTENT_DIR, "friends.md");
  if (!existsSync(friendsPath)) return;

  const raw = readFileSync(friendsPath, "utf-8").replace(/\r\n/g, "\n");
  const cardsMatch = raw.match(/::cards::\n([\s\S]*?)\n::\/cards::/);
  if (!cardsMatch) return;

  const block = cardsMatch[1];
  const entries = block.trim().split(/\n-(?=\s)/);
  const values: Array<{
    name: string;
    url: string;
    description: string | null;
    avatarUrl: string | null;
    sortOrder: number;
  }> = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i].trim().replace(/^-/, "").trim();
    if (!entry) continue;

    const titleMatch = entry.match(/^\s*title:\s*(.+)$/m);
    const contentMatch = entry.match(/^\s*content:\s*(.+)$/m);
    const imageMatch = entry.match(/^\s*image:\s*(.+)$/m);
    const urlMatch = entry.match(/^\s*url:\s*(.+)$/m);

    if (!titleMatch || !urlMatch) continue;

    const name = titleMatch[1].trim();
    const url = urlMatch[1].trim();
    const description = contentMatch ? contentMatch[1].trim() : null;
    let avatarUrl = imageMatch ? imageMatch[1].trim() : null;

    if (avatarUrl && !avatarUrl.startsWith("http") && !avatarUrl.startsWith("/")) {
      avatarUrl = `/note-images/${avatarUrl}`;
    }

    values.push({ name, url, description, avatarUrl, sortOrder: i });
  }

  if (values.length === 0) return;

  await db.delete(friendLinks);
  await db.insert(friendLinks).values(values);
  console.log(`Imported ${values.length} friend links`);
}

async function main() {
  console.log("Starting content import...");

  // 1. Discover files
  const mdFiles = discoverMarkdownFiles(CONTENT_DIR);
  console.log(`Found ${mdFiles.length} markdown files`);

  // 2. Parse navigation
  const navTree = parseNavConfig();
  console.log("Parsed navigation tree");

  // 3. Clear existing data
  await db.delete(searchIndex);
  await db.delete(pageTags);
  await db.delete(tags);
  await db.delete(blogPosts);
  await db.delete(pages);

  // 4. Seed defaults
  await seedDefaultConfig();

  // 5. Process each file
  const allTags = new Set<string>();
  const pageRecords: PageRecord[] = [];
  const searchDocuments: SearchDocument[] = [];

  for (const relPath of mdFiles) {
    try {
      const record = await processMarkdownFile(relPath, navTree);
      if (!record) continue;
      pageRecords.push(record);
      record.tags.forEach((t) => allTags.add(t));
    } catch (err) {
      console.error(`Failed to process ${relPath}:`, err);
    }
  }

  // 6. Insert pages
  const pageIdMap = new Map<string, number>();
  for (const record of pageRecords) {
    const [inserted] = await db.insert(pages).values({
      slug: record.slug,
      title: record.title,
      content: record.content,
      htmlContent: record.htmlContent,
      pageType: record.pageType,
      commentsEnabled: record.commentsEnabled,
      statisticsEnabled: record.statisticsEnabled,
      template: record.template,
      wordCount: record.wordCount,
      readingTime: record.readingTime,
      fileMtime: record.fileMtime,
    }).returning({ id: pages.id });

    pageIdMap.set(record.slug, inserted.id);

    const searchDocument = buildSearchDocument(record);
    searchDocuments.push(searchDocument);

    // Blog posts
    if (record.pageType === "blog" && record.slug !== "blog/index") {
      await db.insert(blogPosts).values({
        pageId: inserted.id,
        excerpt: record.excerpt,
        publishedAt: record.publishedAt,
      });
    }

    // Search index
    await db.insert(searchIndex).values({
      pageId: inserted.id,
      title: searchDocument.title,
      content: searchDocument.content,
      headings: searchDocument.headings.join("\n"),
    });
  }

  // 7. Insert tags
  const tagIdMap = new Map<string, number>();
  for (const tagName of allTags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, "-");
    const [inserted] = await db.insert(tags).values({
      name: tagName,
      slug,
    }).onConflictDoUpdate({
      target: tags.slug,
      set: { name: tagName },
    }).returning({ id: tags.id });
    tagIdMap.set(tagName, inserted.id);
  }

  // 8. Link page tags
  for (const record of pageRecords) {
    const pageId = pageIdMap.get(record.slug);
    if (!pageId) continue;
    for (const tagName of record.tags) {
      const tagId = tagIdMap.get(tagName);
      if (tagId) {
        await db.insert(pageTags).values({ pageId, tagId }).onConflictDoNothing();
      }
    }
  }

  // 9. Import navigation
  await importNavigation(navTree);

  // 10. Import changelog
  await importChangelog();

  // 11. Import friend links
  await importFriendLinks();

  // 12. Copy images
  console.log("Copying images...");
  copyImages();

  // 13. Write search index
  writeFileSync(SEARCH_INDEX_OUTPUT, JSON.stringify(searchDocuments, null, 2));
  console.log(`Wrote search index: ${searchDocuments.length} documents`);

  console.log(`Import complete: ${pageRecords.length} pages, ${allTags.size} tags`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
