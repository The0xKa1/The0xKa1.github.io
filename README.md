# ka1 的笔记站

线上地址：`https://note.the0xka1.cc`

这个仓库现在承载的是一套 `Next.js + PostgreSQL` 的笔记站。Markdown 内容保存在根目录 `content/`，导航结构保存在 `site-nav.yml`，站点应用位于 `apps/web/`。

## 本地运行

1. 克隆仓库：

   ```bash
   git clone https://github.com/The0xKa1/The0xKa1.github.io.git
   cd The0xKa1.github.io
   ```

2. 启动本地 PostgreSQL：

   ```bash
   docker compose up -d postgres
   ```

3. 安装前端依赖并导入内容：

   ```bash
   cd apps/web
   npm install
   DATABASE_URL='postgresql://ka1:ka1notes@localhost:5432/ka1notes' npm run import
   ```

4. 启动开发服务器：

   ```bash
   npm run dev
   ```

5. 打开 `http://localhost:3000`

## 部署

推荐部署到 Vercel，`Root Directory` 设为 `apps/web`，并配置 `DATABASE_URL` 环境变量。构建时会自动执行数据库迁移和内容导入。


