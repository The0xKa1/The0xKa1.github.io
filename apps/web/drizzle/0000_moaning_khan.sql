CREATE TABLE "admonition_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"label" varchar(128),
	"icon_svg" text,
	"border_color" varchar(32),
	"bg_color" varchar(32),
	"icon_color" varchar(32),
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "admonition_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"excerpt" text,
	"published_at" timestamp,
	"cover_image" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"name_en" varchar(256),
	"description" text,
	"icon" varchar(64),
	"sort_order" integer DEFAULT 0,
	"parent_id" integer,
	"page_count" integer DEFAULT 0,
	"total_word_count" integer DEFAULT 0,
	"color" varchar(32),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "changelog_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" varchar(4) NOT NULL,
	"date" varchar(16) NOT NULL,
	"type" varchar(32) NOT NULL,
	"text" text NOT NULL,
	"href" varchar(512),
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "friend_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"url" varchar(512) NOT NULL,
	"description" text,
	"avatar_url" varchar(512),
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "navigation" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(256) NOT NULL,
	"slug" varchar(512),
	"page_id" integer,
	"parent_id" integer,
	"sort_order" integer DEFAULT 0,
	"level" integer DEFAULT 0 NOT NULL,
	"icon" varchar(64),
	"is_visible" boolean DEFAULT true,
	"is_tab" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "page_tags" (
	"page_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "page_tags_page_id_tag_id_pk" PRIMARY KEY("page_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(512) NOT NULL,
	"title" varchar(512) NOT NULL,
	"content" text NOT NULL,
	"html_content" text,
	"page_type" varchar(32) DEFAULT 'note' NOT NULL,
	"comments_enabled" boolean DEFAULT true,
	"statistics_enabled" boolean DEFAULT true,
	"template" varchar(64),
	"category_id" integer,
	"parent_slug" varchar(512),
	"sort_order" integer DEFAULT 0,
	"word_count" integer DEFAULT 0,
	"reading_time" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"file_mtime" timestamp,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "search_index" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"title" varchar(512),
	"content" text,
	"headings" text
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(128) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"color" varchar(32),
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"is_default" boolean DEFAULT false,
	"colors" jsonb NOT NULL,
	"css_overrides" text,
	CONSTRAINT "themes_name_unique" UNIQUE("name")
);
