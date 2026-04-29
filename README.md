# ka1 的笔记本

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

个人笔记与博客站点，基于 Next.js + PostgreSQL 构建。

**线上地址**: [https://note.the0xka1.cc](https://note.the0xka1.cc)

---

## 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Markdown 引擎**: [unified](https://unifiedjs.com/) / remark / rehype
  - 数学公式: [KaTeX](https://katex.org/)
  - 代码高亮: [highlight.js](https://highlightjs.org/)
  - 图表: [Mermaid](https://mermaid.js.org/)
- **评论**: [Giscus](https://giscus.app/)
- **部署**: [Vercel](https://vercel.com/)

## 功能特性

- 基于文件系统的 Markdown 内容管理（`content/` 目录）
- MkDocs 风格 Admonition 提示块（`!!! note` / `??? tip` 等）
- LaTeX 数学公式支持（`$...$` 与 `$$...$$`）
- 自动目录生成（`{{TableOfContents}}`）
- 全文搜索（基于 PostgreSQL）
- 响应式布局 / 深色模式
- 友链页面 / 更新日志
- 动态 Sitemap 与 robots.txt

## 项目结构

```
.
├── apps/web/                 # Next.js 应用
│   ├── app/                  # App Router 页面
│   ├── components/           # React 组件
│   ├── lib/
│   │   ├── db/               # Drizzle ORM 数据库层
│   │   ├── markdown/         # Markdown 解析管线
│   │   └── content/          # 内容处理工具
│   ├── scripts/
│   │   └── import-content.ts # Markdown 导入脚本
│   └── public/note-images/   # 笔记图片资源
├── content/                  # Markdown 内容源（站点内容根目录）
├── site-nav.yml              # 站点导航配置
├── docker-compose.yml        # 本地 PostgreSQL 容器
└── README.md
```

## 本地开发

### 1. 启动数据库

```bash
docker compose up -d postgres
```

数据库默认运行在 `localhost:5432`，连接串见 `apps/web/.env.local`。

### 2. 安装依赖并导入内容

```bash
cd apps/web
npm install
npm run db:migrate   # 执行数据库迁移
npm run import       # 将 content/ 下的 Markdown 导入数据库
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建（含迁移 + 导入 + 构建） |
| `npm run import` | 重新导入 Markdown 内容 |
| `npm run db:migrate` | 执行 Drizzle 数据库迁移 |
| `npm run db:studio` | 打开 Drizzle Studio |
| `npm run lint` | 运行 ESLint |

## 部署到 Vercel

1. Fork / 推送本仓库到 GitHub
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 新建项目，导入该仓库
3. **关键配置**:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: `Next.js`
4. 在 Environment Variables 中添加 `DATABASE_URL`（推荐使用 [Neon](https://neon.tech/) 等 Serverless Postgres）
5. Deploy

> 构建时会自动执行 `npm run build`，即先跑数据库迁移、再导入 Markdown 内容、最后构建 Next.js。

## 内容管理

站点内容以 Markdown 文件形式保存在 `content/` 目录，通过 `site-nav.yml` 定义导航结构。修改内容后，在 `apps/web/` 下执行 `npm run import` 即可同步到数据库。

Frontmatter 支持的字段：
- `title`: 页面标题
- `date`: 发布日期
- `tags`: 标签列表
- `template`: 页面模板
- `comments`: 是否启用评论
- `statistics` / `nonstatistics`: 统计开关

---

> 人生苦短，纵情燃烧。
>
> 2026.4.29 从 mkdocs + gh-pages 重构
