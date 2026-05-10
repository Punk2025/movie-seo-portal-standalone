# 影视 SEO 门户 — 实施进度

用于对照开发文档；已完成项勾选。

## 示例站点（`examples/movie-seo-portal`）

- [x] 工程骨架：`package.json`、`astro.config.mjs`、`tsconfig.json`
- [x] Tailwind CSS v4（`@tailwindcss/vite`）
- [x] `@astrojs/sitemap` + `site` 配置
- [x] `public/robots.txt`、`favicon.svg`
- [x] 类型定义 `src/types/content.ts`（Movie / Review / Update）
- [x] Mock 数据 `src/data/mock.ts`（可替换为 REST）
- [x] **牛牛 CMS**：对接说明见 [docs/牛牛CMS-SEO-API与Webhook对接说明.md](../../docs/牛牛CMS-SEO-API与Webhook对接说明.md)；`niuniucms-api.ts`、`niuniu-build.ts`（发现池、`tag-{id}` 全量分页、vid↔slug）；配置 `NIUNIUCMS_*` 时首页与 `movie` / `review` / `update` / `tag` / `actor` / `top` 走 API，否则 Mock
- [x] 内链工具 `src/lib/paths.ts`
- [x] SEO 组件 `SeoHead.astro`（description、canonical、OG/Twitter、JSON-LD）
- [x] 布局 `BaseLayout.astro`
- [x] 首页门户模块（今日更新、热门、短剧、Netflix、精选推荐、影评、高分、演员、标签）
- [x] `/movie/[slug]`（海报、元信息、简介、影评摘录、更新链接、推荐区块）
- [x] `/review/[slug]`（CMS 下 slug=影片 slug，影评 DTO 分段；Mock 下仍为多章节 slug）
- [x] `/update/[slug]`（CMS 下 slug=影片 slug，占位更新说明；Mock 仍为分集示例）
- [x] `/top/[slug]`（netflix、suspense、2026-drama）
- [x] `/actor/[slug]`、`/tag/[slug]`
- [x] 未使用 `/posts/` 博客结构

## 尚未在本示例中实现（需业务仓库接续）

- [ ] 全库演员 / 标签 / 榜单（当前依赖「发现池」hot+latest+today，非全站）
- [ ] 接入其他 REST / MySQL 只读层（非牛牛 CMS 时）
- [ ] `update/{slug}` 与 CMS 分集字段对齐（现为用影片 slug 生成「更新说明」占位页）
- [ ] Python Webhook → 内容生成 → 写入数据库
- [ ] Cloudflare Pages 生产域名与 `astro.config` `site` 对齐
- [ ] SSR / 按需 ISR（现为纯 SSG）
- [ ] 分页、海量 slug 的增量构建策略
- [ ] 404 / 重定向策略与站长工具改版备案

## 在本仓库内构建示例

示例依赖 workspace 中的 `astro` 包。若在源码仓库根目录尚未执行完整构建，`pnpm --filter @example/movie-seo-portal run build` 可能失败。可先按仓库根目录说明执行 `pnpm build`，或将 `examples/movie-seo-portal` **复制到独立项目**后改用 npm 上的 `astro` 运行（仅用于预览模板）。

**对外环境**：必须 `build` 后部署 **`dist/`**；**勿**以 `astro dev` 作为线上入口（见示例 [README.md](./README.md)「生产部署」）。

---

**上次更新：** 与仓库内示例代码同步维护。
