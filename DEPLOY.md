# 本目录说明（独立部署副本）

由 `examples/movie-seo-portal` 同步而来，用于单独打包、上传或与主线并行迭代。

## 已包含（可提交 Git）

- `src/`、`public/`、`scripts/`、`astro.config.mjs`、`package.json`、`pnpm-lock.yaml`、`tsconfig.json`
- `.env.example`、`README.md`、`PROGRESS.md`

## 刻意未复制（请在本目录自行生成）

- **`node_modules/`**：在 monorepo 根执行 `pnpm install` 后自动生成。
- **`dist/`**：执行 `pnpm build` 后生成。
- **`.astro/`**：构建缓存，不必拷贝。
- **`.env`**：含密钥，请把 `.env.example` 复制为 `.env` 后填写（勿提交 `.env`）。

## 构建（在仓库根目录）

```bash
pnpm install
pnpm -C examples/movie-seo-portal-standalone build
```

## 部署静态站点

将 **`dist/client/`** 整目录内容上传到站点 **Web 根目录**。

上线前在 `.env` 中配置 **`SITE=https://你的域名`**（无尾斜杠），再构建，否则 sitemap/canonical 域名可能不对。

## Node 运行（含 `/api/runtime/*`）

本示例使用 `@astrojs/node`：构建产物包含服务端入口，按需保留 **`dist/`** 中非 `client` 部分并按 Astro Node 适配器文档部署。
