/**
 * 影片 SEO 开放接口：GET + `X-API-Key`。
 *
 * 环境变量：优先 **`DATA_API_ORIGIN` / `DATA_API_KEY`**（对外文档推荐名）；
 * 兼容 `NIUNIUCMS_ORIGIN`（前台根，勿带 `/admin`）、`NIUNIUCMS_API_ORIGIN`、`CMS_SEO_API_BASE`；
 * 密钥兼容 `NIUNIUCMS_API_KEY`、`CMS_SEO_API_KEY`；`NIUNIUCMS_URL_STYLE=hyphen|path`（对应 url_rewrite_on 0/1 vs 2/3）。
 * 多门户：`SITE_KEY` → 全部 URL 附加 `?site=`，并带请求头 `X-Site-Key`（见《对接方案》§2）。
 *
 * 响应：`{ code, message }`；详情 `message.movie`；列表 `message.page`、`message.items` 等。
 */

import type {
	NiuniuApiEnvelope,
	NiuniuListMessage,
	NiuniuMetaSlugItem,
	NiuniuMovieDetailMessage,
	NiuniuMovieDto,
	NiuniuSeoTopicDetailMessage,
	NiuniuSeoTopicLandingDto,
	NiuniuTopicSlugsMessage,
} from '../types/niuniucms-dto';

export type NiuniuUrlStyle = 'hyphen' | 'path';

export interface NiuniuClientConfig {
	/** 用户看片站点根，例如 https://sesewu3.eu.cc */
	origin: string;
	apiKey: string;
	urlStyle: NiuniuUrlStyle;
	/**
	 * 多门户：与 `vod_site_content.site_key` 一致。
	 * 设置后所有列表/详情 URL 追加 `?site=...`，并附带请求头 `X-Site-Key`（与《对接方案》§2 一致）。
	 */
	siteKey?: string;
}

function stripTrailingSlash(url: string): string {
	return url.replace(/\/+$/, '');
}

/**
 * - `hyphen`：`/api-latest.html`、`/api-movie-12345.html`、`/api-meta-slugs.html`
 * - `path`：`/api/latest`、`/api/movie/12345`、`/api/meta/slugs`
 */
export function buildNiuniuApiUrl(
	style: NiuniuUrlStyle,
	origin: string,
	segments: string[],
	query?: Record<string, string | number | undefined>,
): string {
	const base = stripTrailingSlash(origin);
	const q = new URLSearchParams();
	if (query) {
		for (const [k, v] of Object.entries(query)) {
			if (v !== undefined && v !== '') q.set(k, String(v));
		}
	}
	const qs = q.toString();

	if (style === 'hyphen') {
		const path = `api-${segments.join('-')}.html`;
		return `${base}/${path}${qs ? `?${qs}` : ''}`;
	}

	const path = `/api/${segments.join('/')}`;
	return `${base}${path}${qs ? `?${qs}` : ''}`;
}

/** 多门户：合并 `site` 查询参数 */
export function withNiuniuSiteQuery(
	cfg: NiuniuClientConfig,
	query?: Record<string, string | number | undefined>,
): Record<string, string | number | undefined> | undefined {
	if (!cfg.siteKey) return query;
	return { ...(query ?? {}), site: cfg.siteKey };
}

export async function niuniuFetchMessage<T>(
	url: string,
	cfg: NiuniuClientConfig,
	init?: RequestInit,
): Promise<T> {
	const headers = new Headers(init?.headers);
	headers.set('X-API-Key', cfg.apiKey);
	headers.set('Accept', 'application/json');
	if (cfg.siteKey) headers.set('X-Site-Key', cfg.siteKey);

	const res = await fetch(url, {
		...init,
		headers,
	});

	let body: NiuniuApiEnvelope<T | string>;
	try {
		body = (await res.json()) as NiuniuApiEnvelope<T | string>;
	} catch {
		throw new Error(`Niuniu API: invalid JSON, status ${res.status} ${url}`);
	}

	if (body.code !== 0) {
		const msg = typeof body.message === 'string' ? body.message : JSON.stringify(body.message);
		throw new Error(`Niuniu API: code=${body.code} ${msg}`);
	}

	return body.message as T;
}

function niuniuOriginFromEnv(): string {
	return (
		import.meta.env.DATA_API_ORIGIN ??
		import.meta.env.NIUNIUCMS_ORIGIN ??
		import.meta.env.NIUNIUCMS_API_ORIGIN ??
		import.meta.env.CMS_SEO_API_BASE ??
		''
	)
		.toString()
		.trim();
}

function niuniuApiKeyFromEnv(): string {
	return (
		import.meta.env.DATA_API_KEY ??
		import.meta.env.NIUNIUCMS_API_KEY ??
		import.meta.env.CMS_SEO_API_KEY ??
		''
	)
		.toString()
		.trim();
}

function clientFromEnv(): NiuniuClientConfig {
	const origin = niuniuOriginFromEnv();
	const apiKey = niuniuApiKeyFromEnv();
	const styleRaw =
		import.meta.env.NIUNIUCMS_URL_STYLE ?? import.meta.env.CMS_SEO_URL_MODE ?? 'hyphen';

	const urlStyle: NiuniuUrlStyle = styleRaw === 'path' || styleRaw === 'path23' ? 'path' : 'hyphen';

	if (!origin || !apiKey) {
		throw new Error(
			'Niuniu API: set DATA_API_ORIGIN (or NIUNIUCMS_ORIGIN / CMS_SEO_API_BASE) and DATA_API_KEY (or NIUNIUCMS_API_KEY) in .env for build',
		);
	}

	const siteKeyRaw = import.meta.env.SITE_KEY ?? '';
	const siteKey = siteKeyRaw.toString().trim() || undefined;

	return { origin, apiKey, urlStyle, siteKey };
}

export function getNiuniuClientFromEnv(): NiuniuClientConfig {
	return clientFromEnv();
}

/** 是否已配置（不抛错，用于 Mock 回退） */
export function isNiuniuConfigured(): boolean {
	return Boolean(niuniuOriginFromEnv() && niuniuApiKeyFromEnv());
}

export async function fetchLatest(
	cfg: NiuniuClientConfig,
	page = 1,
	pageSize = 20,
): Promise<NiuniuListMessage> {
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['latest'],
		withNiuniuSiteQuery(cfg, { page, page_size: pageSize }),
	);
	return niuniuFetchMessage<NiuniuListMessage>(url, cfg);
}

export async function fetchUpdateToday(
	cfg: NiuniuClientConfig,
	page = 1,
	pageSize = 30,
): Promise<NiuniuListMessage> {
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['update', 'today'],
		withNiuniuSiteQuery(cfg, { page, page_size: pageSize }),
	);
	return niuniuFetchMessage<NiuniuListMessage>(url, cfg);
}

export async function fetchHot(cfg: NiuniuClientConfig, n = 30): Promise<NiuniuListMessage> {
	const url = buildNiuniuApiUrl(cfg.urlStyle, cfg.origin, ['hot'], withNiuniuSiteQuery(cfg, { n }));
	return niuniuFetchMessage<NiuniuListMessage>(url, cfg);
}

/** 单条 by vid → `message.movie` */
export async function fetchMovieDetailByVid(
	cfg: NiuniuClientConfig,
	vid: number | string,
): Promise<NiuniuMovieDto> {
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['movie', String(vid)],
		withNiuniuSiteQuery(cfg),
	);
	const msg = await niuniuFetchMessage<NiuniuMovieDetailMessage>(url, cfg);
	return msg.movie;
}

/** 单条 by slug → `message.movie`（hyphen 下 slug 含 `-` 可能拆坏，见文档） */
export async function fetchMovieDetailBySlug(
	cfg: NiuniuClientConfig,
	slug: string,
): Promise<NiuniuMovieDto> {
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['movie', 'slug', slug],
		withNiuniuSiteQuery(cfg),
	);
	const msg = await niuniuFetchMessage<NiuniuMovieDetailMessage>(url, cfg);
	return msg.movie;
}

export async function fetchMoviesByTagId(
	cfg: NiuniuClientConfig,
	tagId: number | string,
	page = 1,
	pageSize = 30,
): Promise<NiuniuListMessage> {
	const segment = `tag-${tagId}`;
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['tag', segment],
		withNiuniuSiteQuery(cfg, { page, page_size: pageSize }),
	);
	return niuniuFetchMessage<NiuniuListMessage>(url, cfg);
}

export async function fetchMetaSlugsPage(
	cfg: NiuniuClientConfig,
	page = 1,
	pageSize = 200,
): Promise<NiuniuListMessage<NiuniuMetaSlugItem>> {
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['meta', 'slugs'],
		withNiuniuSiteQuery(cfg, { page, page_size: pageSize }),
	);
	return niuniuFetchMessage<NiuniuListMessage<NiuniuMetaSlugItem>>(url, cfg);
}

export function metaItemSlug(item: NiuniuMetaSlugItem): string | null {
	if (typeof item === 'string') return item;
	if (item?.slug) return String(item.slug);
	return null;
}

/**
 * 专题 slug 分页列表（仅「已发布 + 启用」进列表）。**构建期用于 `getStaticPaths` 拉齐路由**。
 *
 * - hyphen：`GET /api-topic-slugs.html?page=&page_size=`
 * - path：`GET /api/topic/slugs?page=&page_size=`
 */
export async function fetchSeoTopicSlugsPage(
	cfg: NiuniuClientConfig,
	page = 1,
	pageSize = 100,
): Promise<string[]> {
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['topic', 'slugs'],
		withNiuniuSiteQuery(cfg, { page, page_size: pageSize }),
	);
	const msg = await niuniuFetchMessage<NiuniuTopicSlugsMessage>(url, cfg);
	const raw = msg?.slugs;
	if (!Array.isArray(raw)) return [];
	return raw.map((s) => String(s).trim()).filter(Boolean);
}

/** 分页直到最后一页，合并去重（默认每页 100 条）。 */
export async function fetchAllSeoTopicSlugs(
	cfg: NiuniuClientConfig,
	pageSize = 100,
): Promise<string[]> {
	const out: string[] = [];
	let page = 1;
	for (;;) {
		const batch = await fetchSeoTopicSlugsPage(cfg, page, pageSize);
		if (batch.length === 0) break;
		out.push(...batch);
		if (batch.length < pageSize) break;
		page += 1;
	}
	return [...new Set(out)];
}

/**
 * SEO 专题落地页详情。**slug 一律使用查询参数 `slug=`**，勿写入 hyphen 路径分段，
 * 避免含 `-` 的 slug（如 `kuala-lumpur-peripheral-movies`）被伪静态错误拆开。
 *
 * - hyphen：`GET /api-topic.html?slug=...`
 * - path：`GET /api/topic?slug=...`
 */
export async function fetchSeoTopicLanding(
	cfg: NiuniuClientConfig,
	slug: string,
): Promise<NiuniuSeoTopicLandingDto | null> {
	const url = buildNiuniuApiUrl(
		cfg.urlStyle,
		cfg.origin,
		['topic'],
		withNiuniuSiteQuery(cfg, { slug }),
	);
	const msg = await niuniuFetchMessage<
		NiuniuSeoTopicDetailMessage | NiuniuSeoTopicLandingDto | Record<string, unknown>
	>(url, cfg);

	if (msg && typeof msg === 'object') {
		if ('topic' in msg && msg.topic && typeof msg.topic === 'object') {
			return msg.topic as NiuniuSeoTopicLandingDto;
		}
		if ('slug' in msg && typeof (msg as NiuniuSeoTopicLandingDto).slug === 'string') {
			return msg as NiuniuSeoTopicLandingDto;
		}
	}
	return null;
}
