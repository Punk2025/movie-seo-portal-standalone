import { movies } from '../data/mock';
import {
	getNiuniuClientFromEnv,
	getNiuniuDiscoveryPool,
	isNiuniuConfigured,
	loadMovieFromNiuniu,
} from '../data/niuniu-build';
import type { Movie, PortalCtaLink } from '../types/content';

export interface SearchGuideItem {
	slug: string;
	title: string;
	links: PortalCtaLink[] | null;
}

let cache: SearchGuideItem[] | null = null;

function searchGuideExtraSlugsFromEnv(): string[] {
	const raw = import.meta.env.NIUNIUCMS_SEARCH_GUIDE_EXTRA_SLUGS ?? '';
	return raw
		.split(/[,;\s]+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

async function niuniuSearchGuideItems(): Promise<SearchGuideItem[]> {
	const cfg = getNiuniuClientFromEnv();
	const pool = await getNiuniuDiscoveryPool(cfg);
	/** 放大池子，减少「站内有片、弹层搜不到」；冷门片可在 `.env` 里加 `NIUNIUCMS_SEARCH_GUIDE_EXTRA_SLUGS=slug-a,slug-b` */
	const slice = pool.slice(0, 72);
	const detailBySlug = new Map<string, Movie>();
	for (let i = 0; i < slice.length; i += 6) {
		const chunk = slice.slice(i, i + 6);
		const resolved = await Promise.all(chunk.map((m) => loadMovieFromNiuniu(cfg, m.slug)));
		for (let j = 0; j < chunk.length; j++) {
			const full = resolved[j];
			if (full) detailBySlug.set(full.slug, full);
		}
	}
	const base: SearchGuideItem[] = slice.map((m) => {
		const full = detailBySlug.get(m.slug);
		const links =
			full?.portal_cta?.links && full.portal_cta.links.length > 0 ? full.portal_cta.links : null;
		return {
			slug: m.slug,
			title: full?.title ?? m.title,
			links,
		};
	});
	const seen = new Set(base.map((x) => x.slug));
	for (const slug of searchGuideExtraSlugsFromEnv()) {
		if (seen.has(slug)) continue;
		const full = await loadMovieFromNiuniu(cfg, slug);
		if (!full) continue;
		seen.add(full.slug);
		base.push({
			slug: full.slug,
			title: full.title,
			links:
				full.portal_cta?.links && full.portal_cta.links.length > 0 ? full.portal_cta.links : null,
		});
	}
	return base;
}

function mockSearchGuideItems(): SearchGuideItem[] {
	return movies.map((m) => ({
		slug: m.slug,
		title: m.title,
		links: m.portal_cta?.links?.length ? m.portal_cta.links : null,
	}));
}

/** 全站「搜影片 → 弱引导」浮层数据：构建期缓存，含片名与（若有）portal_cta */
export async function getSearchGuidePayload(): Promise<SearchGuideItem[]> {
	if (cache) return cache;
	if (!isNiuniuConfigured()) {
		cache = mockSearchGuideItems();
		return cache;
	}
	cache = await niuniuSearchGuideItems();
	return cache;
}

/** 运行期 API 使用：每次请求重新拉取，与后台当前方案一致 */
export async function getSearchGuidePayloadFresh(): Promise<SearchGuideItem[]> {
	if (!isNiuniuConfigured()) {
		return mockSearchGuideItems();
	}
	return niuniuSearchGuideItems();
}
