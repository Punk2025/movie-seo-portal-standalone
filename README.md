# 影视 SEO 门户示例（Movie SEO Portal）

本目录是 Astro monorepo 中的示例站点：演示影视类 **SEO 内容站** 的页面结构、内链、sitemap、SEO 元数据（canonical / Open Graph / JSON-LD），以及与 **牛牛 CMS SEO 开放接口**的对接方式。

示例聚焦前台 Astro 站点本身，**不包含** Python 侧内容生成流水线或其它业务后端。

---

## 项目做什么

| 能力 | 说明 |
|------|------|
| **内容接入** | 配置 `DATA_API_*` / `NIUNIUCMS_*` 等变量后，列表与详情从 CMS 拉取；未配置时回退内置 Mock，便于先看版式。 |
| **多门户** | 通过 `SITE_KEY` 等与 CMS `site_key` 对齐，请求自动带 `?site=` 与头 `X-Site-Key`。 |
| **门户弱引导（portal_cta）** | 与后台「弱引导方案」对应：开启则展示延伸阅读/合作方入口，关闭则无链接。示例在 **运行期** 再次请求 CMS，使开发与 **打包部署后的 Node 服务** 都能跟随后台开关，而不只靠构建快照。 |
| **搜影片浮层** | 全站「搜影片 → 弱引导」在已接 CMS 时可请求运行期接口刷新指引池，与详情页弱引导逻辑一致。 |
| **SEO 专题 `/topics/[slug]`** | 前台路径为第二层目录 **`/topics/<slug>`**（与 **`/top/*`** 榜单区分）。构建期 **`DATA_API_*`** 与影片一致；分页拉 **`/api-topic-slugs.html`**，详情 **`/api-topic.html?slug=`**。文案变更后需重新 build。详见 [Astro 站点对接方案 §9](../../docs/Astro站点对接方案-牛牛CMS-SEO-API.md)。 |

详细字段与路径约定见仓库文档：

- [影视 SEO 内容站 · 开发文档](../../docs/影视SEO内容站-开发文档.md)
- [牛牛 CMS · SEO API 与 Webhook](../../docs/牛牛CMS-SEO-API与Webhook对接说明.md)
- [Astro 站点对接方案 · 牛牛 CMS SEO API](../../docs/Astro站点对接方案-牛牛CMS-SEO-API.md)
- [开发文档 · Astro 门户与牛牛 CMS 全链路](../../docs/开发文档-Astro门户与牛牛CMS全链路.md)

---

## 技术栈与运行模式（简述）

- **Astro + Tailwind**：页面以静态预渲染为主，利于 SEO 与 CDN。
- **静态输出 + `@astrojs/node`（Astro 6）**：默认 `output: 'static'` 与按需服务端路由并存；构建期生成页面，同时提供 **服务端路由** `/api/runtime/*`，在服务器上用密钥调用牛牛 API，**密钥不暴露给浏览器**。
- **运行期弱引导 API（契约）**
  - `GET /api/runtime/portal-cta?slug=<slug>` → JSON：`{ "links": [...] | null }`
  - `GET /api/runtime/search-guide` → JSON：与站内搜索浮层一致的条目数组（含各片的 `portal_cta.links` 等）。
- **纯静态托管（无 Node）**：可将浏览器请求指到外置 BFF，与本站契约一致即可。设置公共环境变量 **`PUBLIC_RUNTIME_API_BASE`**（无尾斜杠），前端将请求 `{PUBLIC_RUNTIME_API_BASE}/portal-cta?slug=`、`{PUBLIC_RUNTIME_API_BASE}/search-guide`。

配置说明见 [`.env.example`](./.env.example)（复制为 `.env` 使用）。

### Sitemap（Google Search Console）

- 已在 **`astro.config.mjs`** 启用 **`@astrojs/sitemap`**；必须配置 **`site`**（最终用户访问的域名，用于生成绝对 URL）。
- 每次 **`pnpm -C examples/movie-seo-portal build`** 结束后会写入 **`/sitemap-index.xml`**（条目极多时会再生成 **`sitemap-0.xml`** 等）；构建脚本会把索引再复制一份为 **`/sitemap.xml`**（与 **`robots.txt`**、站长习惯一致，纯静态托管可直接访问）。
- **收录范围** = 本次构建实际预渲染出来的路由（影片详情 **`/movie/`**、专题 **`/topics/`** 与聚合 **`/topics`**、标签 **`/tag/`**、影评长文 **`/review/`**、追剧/更新说明 **`/update/`**、演员 **`/actor/`**、榜单 **`/top/`**、影评列表 **`/reviews`** 等）。数据源新增 slug 后需 **重新构建并部署**，sitemap 才会出现新 URL。
- **`/robots.txt`** 由 `src/pages/robots.txt.ts` 预渲染生成，其中的 **`Sitemap:`** 自动使用本次构建的 **`site`**（无需再手写静态 `public/robots.txt`）。

---

## 命令（在 monorepo 根目录）

```bash
pnpm install
# 本地开发
pnpm -C examples/movie-seo-portal dev
# 生产构建（产出含服务端入口，用于 Node 部署）
pnpm -C examples/movie-seo-portal build
# 本地预览构建结果（Node）
pnpm -C examples/movie-seo-portal preview
```

---

## 生产部署（必须）

- **上线**：执行 **`pnpm -C examples/movie-seo-portal build`**，按 Astro Node 适配器文档部署 **`dist/`**（含服务端）。运行环境需配置与构建一致的 **`DATA_API_ORIGIN` / `DATA_API_KEY`**（及 **`SITE_KEY`** 等多门户变量）。
- **禁止**在公网或可暴露地址长期运行 **`astro dev`**：缓存、安全模型与 SEO API 行为与生产不一致。
- 若仅上传静态文件到对象存储/CDN 且无 Node：需自建或使用 **`PUBLIC_RUNTIME_API_BASE`** 指向实现上述 JSON 契约的 BFF（例如边缘函数）。

---

## 仓库内代码索引（便于排查）

| 主题 | 位置 |
|------|------|
| SEO API 封装（URL、鉴权、多门户；专题列表/详情） | `src/lib/niuniucms-api.ts` |
| 构建期拉片、映射 DTO → 前台模型 | `src/data/niuniu-build.ts`、`src/lib/niuniucms-mapper.ts` |
| 运行期 portal_cta / 搜索指引 API | `src/pages/api/runtime/portal-cta.ts`、`src/pages/api/runtime/search-guide.ts` |
| 详情页运行期弱引导区块 | `src/components/PortalCtaRuntime.astro` |
| 全站搜索浮层 | `src/components/SiteSearchGuide.astro` |
| 观影指南 / 导航 / 社区 / 资源推荐栏目（正文与商业入口分区） | `src/pages/movie-guide.astro` 等、`src/components/GuidePortalCallout.astro`、`public/guide-qr.png` |
| 可选：脚本生成 SVG 二维码（无设计稿时） | `pnpm -C examples/movie-seo-portal run generate:guide-qr` → `public/guide-qr.svg`，若使用 PNG 物料则无需执行 |
| Astro 配置（`site`、static + Node adapter、`@astrojs/sitemap`） | `astro.config.mjs` |
| SEO 专题落地页（构建期 slug 列表 + 正文映射） | `src/pages/topics/[slug].astro`、`src/lib/seo-topic-mapper.ts`、`src/data/topic-landings.ts` |
| 影评聚合列表 `/reviews`（顶栏「观看影评」） | `src/pages/reviews/index.astro`、`moviesForReviewsHubFromPool`（`niuniu-build.ts`） |
| 专题聚合 `/topics`（顶栏「专题」、首页「查看全部专题」） | `src/pages/topics/index.astro`、`loadTopicIndexCards`（`topic-index-cards.ts`） |

**注意**：`astro.config.mjs` 里的 **`site`** 应填最终用户访问的 SEO 站域名，不要填 CMS 域名。

### 给 Astro 同事的对接摘要（复制即用）

以下为转发任务说明用摘要（把占位符换成真实域名与密钥）：

- **数据来源**：专题在 CMS 表维护，前台通过 **SEO API** 读取（非后台 URL）。构建期 **`HTTPS GET` + 请求头 `X-API-Key`**（与 `config.php` 的 `seo_api_key` 一致）。  
- **环境变量**：与影片接口相同——**`DATA_API_ORIGIN`**（站点根，勿带 `/admin`）、**`DATA_API_KEY`**；多门户静态站再加 **`SITE_KEY`**（`?site=` / `X-Site-Key`）。  
- **接口（伪静态以线上为准）**：分页 slug **`GET /api-topic-slugs.html?page=1&page_size=100`**（`message.slugs`）；详情 **`GET /api-topic.html?slug=专题slug`**（`message.topic`，含 `title`、`intro`、`body.recommendations`、`body.faq` 等）。**slug 含 `-` 时必须用 `?slug=`**，勿用路径分段拼 slug。  
- **实现**：`getStaticPaths` 先分页拉齐 slug，再为每个 slug 请求详情；前台路径 **`/topics/<slug>`**。推荐位若要海报/片名，用现有 **`api-movie-*.`** 按 vid/slug 补影片信息。若历史上使用过 **`/topic/<slug>`**，请在 CDN / Nginx 做 **`/topic/*` → `/topics/*`** 301。  
- **文档**：仓库内 [Astro站点对接方案-牛牛CMS-SEO-API.md §9](../../docs/Astro站点对接方案-牛牛CMS-SEO-API.md)、[SEO-API与Webhook-对接使用说明.md](../../docs/SEO-API与Webhook-对接使用说明.md)（接口表）。

### Cloudflare Pages（或其它纯静态托管）常见 404

1. **静态资源根目录**：使用 `@astrojs/node` 构建后，可托管的 HTML/CSS/JS 在 **`dist/client/`**。请勿把整个 **`dist/`** 当成站点根（否则可能没有顶层 `index.html`）；应在托管面板把「构建输出目录」设为 **`dist/client`**（若项目在 monorepo 子目录，路径按 CI 工作目录拼完整）。
2. **首页能开、点进 `/movie/xxx` 才 404**：说明 **`getStaticPaths` 里没有生成该 slug 的页面**。纯静态站不会在运行时凭空多出 HTML。常见原因：`NIUNIUCMS_BUILD_SLUGS=preview` 时历史上未把「今日更新」并入预览 slug（已在示例代码中修复）；或 CMS 新上了片子但**尚未重新 build**。使用 **`meta`** 模式会分页拉全站 slug，覆盖面更大；无论哪种模式，内容有重大增减后都应 **重新构建并部署**。
3. **关了弱引导方案后整页 404 / 像「详情没了」**：前台详情依赖 SEO API **仍能返回完整影片字段**；若 CMS 在关闭弱引导时把 **详情接口整条片子撤掉**（或返回错误），重新构建会导致该 slug **无法生成静态页**，访问即 404——需在 CMS 侧保留详情输出，仅清空 `portal_cta` / links。运行期弱引导脚本只隐藏「观看与延伸阅读」占位，**不应删除剧情、演员等正文**（纯静态托管且 `/api/runtime/*` 不可用时，只会看不到外链区块）。

---

## 进度勾选

详见同目录 [PROGRESS.md](./PROGRESS.md)。
