import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  htmlContent: text("html_content"),
  pageType: varchar("page_type", { length: 32 }).notNull().default("note"),
  commentsEnabled: boolean("comments_enabled").default(true),
  statisticsEnabled: boolean("statistics_enabled").default(true),
  template: varchar("template", { length: 64 }),
  categoryId: integer("category_id"),
  parentSlug: varchar("parent_slug", { length: 512 }),
  sortOrder: integer("sort_order").default(0),
  wordCount: integer("word_count").default(0),
  readingTime: integer("reading_time").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  fileMtime: timestamp("file_mtime"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  nameEn: varchar("name_en", { length: 256 }),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  sortOrder: integer("sort_order").default(0),
  parentId: integer("parent_id"),
  pageCount: integer("page_count").default(0),
  totalWordCount: integer("total_word_count").default(0),
  color: varchar("color", { length: 32 }),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull(),
  excerpt: text("excerpt"),
  publishedAt: timestamp("published_at"),
  coverImage: varchar("cover_image", { length: 512 }),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  color: varchar("color", { length: 32 }),
});

export const pageTags = pgTable(
  "page_tags",
  {
    pageId: integer("page_id").notNull(),
    tagId: integer("tag_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.pageId, t.tagId] })]
);

export const navigation = pgTable("navigation", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 512 }),
  pageId: integer("page_id"),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").default(0),
  level: integer("level").notNull().default(0),
  icon: varchar("icon", { length: 64 }),
  isVisible: boolean("is_visible").default(true),
  isTab: boolean("is_tab").default(false),
});

export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  isDefault: boolean("is_default").default(false),
  colors: jsonb("colors").notNull(),
  cssOverrides: text("css_overrides"),
});

export const admonitionTypes = pgTable("admonition_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }),
  iconSvg: text("icon_svg"),
  borderColor: varchar("border_color", { length: 32 }),
  bgColor: varchar("bg_color", { length: 32 }),
  iconColor: varchar("icon_color", { length: 32 }),
  sortOrder: integer("sort_order").default(0),
});

export const friendLinks = pgTable("friend_links", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  description: text("description"),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  sortOrder: integer("sort_order").default(0),
  isVisible: boolean("is_visible").default(true),
});

export const changelogEntries = pgTable("changelog_entries", {
  id: serial("id").primaryKey(),
  year: varchar("year", { length: 4 }).notNull(),
  date: varchar("date", { length: 16 }).notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  text: text("text").notNull(),
  href: varchar("href", { length: 512 }),
  sortOrder: integer("sort_order").default(0),
});

export const searchIndex = pgTable("search_index", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull(),
  title: varchar("title", { length: 512 }),
  content: text("content"),
  headings: text("headings"),
});
