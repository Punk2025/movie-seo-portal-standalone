// @ts-check

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const configDir = dirname(fileURLToPath(import.meta.url));

/**
 * 读取 `.env*` 中的 SITE / PUBLIC_SITE_URL（不依赖 `vite` 包，便于本示例作为独立 package 解析配置）。
 * 进程环境变量优先于文件。
 *
 * @param {string} dir
 */
function readSiteFromEnvFiles(dir) {
	/** @type {Record<string, string>} */
	const merged = {};
	for (const name of ['.env', '.env.production', '.env.local']) {
		const p = join(dir, name);
		if (!existsSync(p)) continue;
		const text = readFileSync(p, 'utf8');
		for (const rawLine of text.split('\n')) {
			const line = rawLine.trim();
			if (!line || line.startsWith('#')) continue;
			const eq = line.indexOf('=');
			if (eq <= 0) continue;
			const key = line.slice(0, eq).trim();
			let val = line.slice(eq + 1).trim();
			if (
				(val.startsWith('"') && val.endsWith('"')) ||
				(val.startsWith("'") && val.endsWith("'"))
			) {
				val = val.slice(1, -1);
			}
			if (key === 'SITE' || key === 'PUBLIC_SITE_URL') {
				merged[key] = val;
			}
		}
	}
	return merged.SITE || merged.PUBLIC_SITE_URL || '';
}

function resolveSiteUrl(dir) {
	const fromProcess = process.env.SITE?.trim() || process.env.PUBLIC_SITE_URL?.trim() || '';
	const fromFile = readSiteFromEnvFiles(dir);
	const raw = fromProcess || fromFile || 'https://movie-seo.example.com';
	return raw.replace(/\/$/, '');
}

// https://astro.build/config
// 正式域名：`SITE` / `PUBLIC_SITE_URL`（见 `.env.example`）；未设则 sitemap 与 canonical 会落在占位域上。
const site = resolveSiteUrl(configDir);

export default defineConfig({
	/** Astro 6：`hybrid` 已并入默认静态行为；保留 adapter 即可启用 `/api/*` 等按需服务端路由 */
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	site,
	/** 关闭 `astro dev` 底部浮条（Logo、Report a Bug、Feedback 等） */
	devToolbar: {
		enabled: false,
	},
	/**
	 * `@astrojs/sitemap`：在 `astro build` 结束时根据本次预渲染结果写出 `sitemap-index.xml`（及 `sitemap-0.xml` 等分块）。
	 * 会被收录的 URL = 构建期实际生成的页面（含 `getStaticPaths` 展开的 `/movie/`、`/topics/`、`/tag/`、`/review/`、`/update/`、`/actor/`、`/top/` 等）；不含 404。
	 */
	integrations: [sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
