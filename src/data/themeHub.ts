/**
 * 首页「热门分类与主题榜单」静态配置（对齐 docs/Astro站点对接方案 §7.4）。
 * 可按仓库内 `themeHub.example.ts` 模板复制改名后按需微调。
 *
 * - 每项 **`href`** 为站内路径：可为 **`/top/{slug}`**（走 `topMoviesFromPool`）或 **`/tag/tag-{id}`** 等。
 * - **`TOP_SLUGS`** 仅包含需要预渲染的 **`/top/[slug]`** 路由；与 `href` 中以 `/top/` 开头的 slug 应对齐。
 */
import { paths } from '../lib/paths';

/** 需生成静态页的榜单 slug（含文档示例 `/top/drama-2026` 与兼容旧链 `/top/2026-drama`） */
export const TOP_SLUGS = ['netflix', 'suspense', 'drama-2026', '2026-drama'] as const;

export type TopSlug = (typeof TOP_SLUGS)[number];

export interface ThemeHubEntry {
	/** 卡片主文案 */
	label: string;
	/** 站内路径，如 `/top/netflix`、`/top/drama-2026`、`/tag/tag-12` */
	href: string;
	/** 可选：卡片下方一句说明 */
	subtitle?: string;
}

/**
 * 首页主题卡片；增删后需重新构建。
 */
export const THEME_HUB_ENTRIES: readonly ThemeHubEntry[] = [
	{
		label: 'Netflix 热榜',
		href: paths.top('netflix'),
		subtitle: '奈飞及同类关键词相关热播',
	},
	{
		label: '悬疑精选',
		href: paths.top('suspense'),
		subtitle: '悬疑、推理向佳作',
	},
	{
		label: '2026 剧情精选',
		href: paths.top('drama-2026'),
		subtitle: '2026 年剧情类精选',
	},
] as const;

const TOP_PATH = /^\/top\/([^/]+)\/?$/;

function slugFromTopHref(href: string): string | null {
	const m = TOP_PATH.exec(href.split('?')[0] ?? '');
	return m?.[1]?.trim() || null;
}

const _topSlugs = new Set<string>(TOP_SLUGS);
for (const e of THEME_HUB_ENTRIES) {
	const s = slugFromTopHref(e.href);
	if (s && !_topSlugs.has(s)) {
		throw new Error(`themeHub: href ${e.href} 的 slug 不在 TOP_SLUGS 中，请先加入预渲染列表`);
	}
}

export function topSlugTitle(slug: string): string {
	const row = THEME_HUB_ENTRIES.find((e) => slugFromTopHref(e.href) === slug);
	if (row) return row.label;
	if (slug === '2026-drama') return '2026 剧情精选';
	return slug;
}

export function isTopSlug(s: string): s is TopSlug {
	return (TOP_SLUGS as readonly string[]).includes(s);
}
