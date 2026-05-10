import { mapNiuniuToMovie } from '../lib/niuniucms-mapper';
import {
	fetchHot,
	fetchLatest,
	fetchMetaSlugsPage,
	fetchMovieDetailBySlug,
	fetchMovieDetailByVid,
	fetchMoviesByTagId,
	fetchUpdateToday,
	isNiuniuConfigured,
	getNiuniuClientFromEnv,
	metaItemSlug,
	type NiuniuClientConfig,
} from '../lib/niuniucms-api';
import {
	clearNiuniuSlugVidRegistry,
	getNiuniuVidForSlug,
	registerNiuniuSlugVid,
} from './niuniu-slug-registry';
import type { ActorRef, Movie, TagRef } from '../types/content';

/**
 * §7.2：热门短剧二次筛选（片名 + 标签 slug/name）。
 * 与 `topMoviesFromPool` 中 `suspense` 等规则分离，避免首页与榜单页不一致。
 */
export function movieMatchesShortDramaHeuristic(m: Movie): boolean {
	const hit = (s: string) => {
		const u = s.toLowerCase();
		return (
			s.includes('短剧') ||
			s.includes('短') ||
			u.includes('竖屏') ||
			s.includes('微剧') ||
			s.includes('小程序剧') ||
			s.includes('微短') ||
			s.includes('漫剧') ||
			u.includes('minidrama') ||
			u.includes('mini-drama')
		);
	};
	return hit(m.title) || m.tags.some((t) => hit(t.name) || hit(t.slug));
}

/** §7.2：Netflix 热榜（大小写不敏感 netflix + 奈飞/网飞） */
export function movieMatchesNetflixHeuristic(m: Movie): boolean {
	const hit = (s: string) => {
		const u = s.toLowerCase();
		return u.includes('netflix') || s.includes('奈飞') || s.includes('网飞');
	};
	return hit(m.title) || m.tags.some((t) => hit(t.name) || hit(t.slug));
}

/** 榜单页无数据时说明（热门池二次筛选未命中 vs 接口问题） */
export function topListEmptyHint(slug: string): string {
	switch (slug) {
		case 'netflix':
			return '本榜从「热门池」二次筛选：片名或标签需含 Netflix（不区分大小写）或中文「奈飞」「网飞」。若后台未维护相关标签且片名无关键词，列表会为空——请补充标签或关键词后重新构建站点。';
		case 'suspense':
			return '本榜从热门池筛选：标签或片名需含「悬疑」或英文 suspense。若长期处于空榜，请在后台为相关影片补悬疑类标签并重新构建。';
		case '2026-drama':
		case 'drama-2026':
			return '本榜条件：年份为 2026，且分类名含「剧情」或标签含剧情向类型。若影片年份/分类与运营预期不一致，请在后台修正后重新构建。';
		default:
			return '本榜暂时为空，欢迎返回首页看看其他推荐。';
	}
}

/** `meta`：分页拉全站 slug；`preview`：仅用 latest 首页 + hot 出现的 slug（先跑通） */
export type NiuniuBuildSlugMode = 'meta' | 'preview';

export function getNiuniuBuildSlugMode(): NiuniuBuildSlugMode {
	const v = import.meta.env.NIUNIUCMS_BUILD_SLUGS ?? 'meta';
	return v === 'preview' ? 'preview' : 'meta';
}

async function collectSlugsFromMeta(cfg: NiuniuClientConfig): Promise<string[]> {
	const out = new Set<string>();
	let page = 1;
	const pageSize = 200;

	while (true) {
		const msg = await fetchMetaSlugsPage(cfg, page, pageSize);
		const items = msg.items ?? [];
		if (items.length === 0) break;

		for (const it of items) {
			const slug = metaItemSlug(it);
			if (!slug) continue;
			out.add(slug);
			if (typeof it === 'object' && it !== null && 'vid' in it && it.vid != null) {
				registerNiuniuSlugVid(slug, it.vid as string | number);
			}
		}

		if (items.length < pageSize) break;
		page += 1;
	}

	return [...out];
}

/** 把首页同源接口里的片子并入路径集合，并登记 slug→vid（hyphen 下多段 slug 详情必须用 vid） */
async function mergeLatestHotSlugs(cfg: NiuniuClientConfig, slugSet: Set<string>): Promise<void> {
	const [latest, hot, today] = await Promise.all([
		fetchLatest(cfg, 1, 100),
		fetchHot(cfg, 150),
		fetchUpdateToday(cfg, 1, 100),
	]);
	for (const dto of [...(latest.items ?? []), ...(hot.items ?? []), ...(today.items ?? [])]) {
		if (dto?.slug) {
			slugSet.add(dto.slug);
			if (dto.vid != null) {
				registerNiuniuSlugVid(dto.slug, dto.vid);
			}
		}
	}
}

async function collectSlugsFromPreview(cfg: NiuniuClientConfig): Promise<string[]> {
	clearNiuniuSlugVidRegistry();
	const out = new Set<string>();
	/** 须与首页 `loadHomeMoviesFromNiuniu` 同源：否则「今日更新」里出现的 slug 未进 getStaticPaths，纯静态部署会 404 */
	const [latest, hot, today] = await Promise.all([
		fetchLatest(cfg, 1, 50),
		fetchHot(cfg, 50),
		fetchUpdateToday(cfg, 1, 100),
	]);

	for (const dto of [...(latest.items ?? []), ...(hot.items ?? []), ...(today.items ?? [])]) {
		if (dto?.slug) {
			out.add(dto.slug);
			if (dto.vid != null) {
				registerNiuniuSlugVid(dto.slug, dto.vid);
			}
		}
	}

	return [...out];
}

/** `total === 0` 时返回 `[]`，不抛错 */
export async function collectMovieSlugsForBuild(cfg: NiuniuClientConfig): Promise<string[]> {
	const mode = getNiuniuBuildSlugMode();
	if (mode === 'preview') {
		return collectSlugsFromPreview(cfg);
	}
	clearNiuniuSlugVidRegistry();
	const metaSlugs = await collectSlugsFromMeta(cfg);
	const slugSet = new Set(metaSlugs);
	await mergeLatestHotSlugs(cfg, slugSet);
	return [...slugSet];
}

export async function loadMovieFromNiuniu(
	cfg: NiuniuClientConfig,
	slug: string,
): Promise<Movie | undefined> {
	try {
		let dto;
		const vid = getNiuniuVidForSlug(slug);

		if (vid != null && vid !== '') {
			try {
				dto = await fetchMovieDetailByVid(cfg, vid);
			} catch {
				dto = await fetchMovieDetailBySlug(cfg, slug);
			}
		} else {
			dto = await fetchMovieDetailBySlug(cfg, slug);
		}

		return mapNiuniuToMovie(dto);
	} catch {
		return undefined;
	}
}

export async function loadRelatedMovies(
	cfg: NiuniuClientConfig,
	slugs: string[],
	max = 6,
): Promise<Movie[]> {
	const slice = slugs.slice(0, max);
	const out: Movie[] = [];
	for (const s of slice) {
		const m = await loadMovieFromNiuniu(cfg, s);
		if (m) out.push(m);
	}
	return out;
}

/** 列表接口常不带齐 `actors` / `tags`，用详情补一片段（限条数，避免首页拖慢） */
async function enrichSparseListMovies(
	cfg: NiuniuClientConfig,
	lists: Movie[][],
	maxFetches: number,
): Promise<void> {
	if (maxFetches <= 0) return;
	const seen = new Set<string>();
	const targets: Movie[] = [];
	outer: for (const list of lists) {
		for (const m of list) {
			if (seen.has(m.slug)) continue;
			seen.add(m.slug);
			if (!m.slug) continue;
			if (m.actors.length > 0 && m.tags.length > 0) continue;
			targets.push(m);
			if (targets.length >= maxFetches) break outer;
		}
	}
	if (targets.length === 0) return;
	const fetched = await Promise.all(
		targets.map(async (m) => {
			try {
				const dto =
					m.vid != null && m.vid !== ''
						? await fetchMovieDetailByVid(cfg, m.vid)
						: await fetchMovieDetailBySlug(cfg, m.slug);
				return [m.slug, mapNiuniuToMovie(dto)] as const;
			} catch {
				return null;
			}
		}),
	);
	const bySlug = new Map<string, Movie>();
	for (const row of fetched) {
		if (row) bySlug.set(row[0], row[1]);
	}
	for (const list of lists) {
		for (let i = 0; i < list.length; i++) {
			const repl = bySlug.get(list[i].slug);
			if (repl) list[i] = repl;
		}
	}
}

function homeDetailEnrichCap(): number {
	const raw = import.meta.env.NIUNIUCMS_HOME_DETAIL_ENRICH;
	if (raw === '' || raw === undefined) return 24;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), 60) : 24;
}

export async function loadHomeMoviesFromNiuniu(cfg: NiuniuClientConfig): Promise<{
	todayUpdates: Movie[];
	hotMovies: Movie[];
	hotShortDrama: Movie[];
	netflixHot: Movie[];
	aiPicks: Movie[];
	highScore: Movie[];
	hotActors: ActorRef[];
	hotTags: TagRef[];
}> {
	const [latestMsg, hotMsg, todayMsg] = await Promise.all([
		fetchLatest(cfg, 1, 24),
		/** §7.2：热门池略放大（40→80→100），提高短剧/Netflix 二次筛选命中 */
		fetchHot(cfg, 100),
		fetchUpdateToday(cfg, 1, 24),
	]);

	for (const dto of [
		...(latestMsg.items ?? []),
		...(hotMsg.items ?? []),
		...(todayMsg.items ?? []),
	]) {
		if (dto?.slug && dto.vid != null) {
			registerNiuniuSlugVid(dto.slug, dto.vid);
		}
	}

	let latest = (latestMsg.items ?? []).map(mapNiuniuToMovie);
	let hot = (hotMsg.items ?? []).map(mapNiuniuToMovie);
	let today = (todayMsg.items ?? []).map(mapNiuniuToMovie);

	await enrichSparseListMovies(cfg, [hot, latest, today], homeDetailEnrichCap());

	const hotShortDrama = hot.filter(movieMatchesShortDramaHeuristic);
	const netflixHot = hot.filter(movieMatchesNetflixHeuristic);
	const aiPicks = [...hot].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 6);

	const merged = [...new Map([...latest, ...hot].map((m) => [m.slug, m] as const)).values()];
	const pickHigh = (min: number) =>
		merged
			.filter((m) => m.score != null && m.score >= min)
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 8);

	let highScore = pickHigh(8);
	if (highScore.length === 0) highScore = pickHigh(7);
	if (highScore.length === 0) {
		highScore = merged
			.filter((m) => m.score != null)
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 8);
	}
	if (highScore.length === 0) {
		highScore = [...hot].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0)).slice(0, 8);
	}

	const homePool = [
		...new Map([...hot, ...latest, ...today].map((m) => [m.slug, m] as const)).values(),
	];

	/** §5.1：按 `heat_score`/`views` 等映射后的 `heat` 累加演员热度；无 `actors` 时聚合结果会偏少 */
	const actorHeat = new Map<string, { name: string; slug: string; heat: number }>();
	for (const m of homePool) {
		const apiHeat = m.heat ?? 0;
		const fromScore = m.score != null && m.score > 0 ? m.score * 100 : 0;
		const increment = apiHeat > 0 ? apiHeat : fromScore > 0 ? fromScore : 1;
		for (const a of m.actors) {
			const prev = actorHeat.get(a.slug);
			if (!prev) actorHeat.set(a.slug, { name: a.name, slug: a.slug, heat: increment });
			else prev.heat += increment;
		}
	}
	const hotActors = [...actorHeat.values()]
		.sort((x, y) => y.heat - x.heat)
		.slice(0, 12)
		.map(({ name, slug }) => ({ name, slug }));

	const tagMap = new Map<string, TagRef>();
	for (const m of homePool) {
		for (const t of m.tags) {
			if (!tagMap.has(t.slug)) tagMap.set(t.slug, t);
		}
	}
	const hotTags = [...tagMap.values()].sort((a, b) => a.slug.localeCompare(b.slug));

	let todayUpdates: Movie[];
	if (today.length > 0) todayUpdates = today;
	else if (latest.length > 0) todayUpdates = latest;
	else if (hot.length > 0) {
		todayUpdates = [...hot]
			.sort((a, b) => new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime())
			.slice(0, 24);
	} else todayUpdates = [];

	return {
		todayUpdates,
		hotMovies: hot,
		hotShortDrama,
		netflixHot,
		aiPicks,
		highScore,
		hotActors,
		hotTags,
	};
}

/** 热门池：hot + latest + 今日更新去重，供 tag / actor / top 发现（非全库） */
let discoveryPoolPromise: Promise<Movie[]> | null = null;

export async function getNiuniuDiscoveryPool(cfg: NiuniuClientConfig): Promise<Movie[]> {
	if (!discoveryPoolPromise) {
		discoveryPoolPromise = loadNiuniuDiscoveryPool(cfg);
	}
	return discoveryPoolPromise;
}

async function loadNiuniuDiscoveryPool(cfg: NiuniuClientConfig): Promise<Movie[]> {
	const [hotMsg, latestMsg, todayMsg] = await Promise.all([
		fetchHot(cfg, 120),
		fetchLatest(cfg, 1, 100),
		fetchUpdateToday(cfg, 1, 80),
	]);
	const map = new Map<string, Movie>();
	for (const dto of [
		...(hotMsg.items ?? []),
		...(latestMsg.items ?? []),
		...(todayMsg.items ?? []),
	]) {
		const m = mapNiuniuToMovie(dto);
		map.set(m.slug, m);
	}
	return [...map.values()];
}

export function uniqueTagsFromMovies(movies: Movie[]): TagRef[] {
	const t = new Map<string, TagRef>();
	for (const m of movies) {
		for (const tag of m.tags) {
			t.set(tag.slug, tag);
		}
	}
	return [...t.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function uniqueActorsFromMovies(movies: Movie[]): ActorRef[] {
	const a = new Map<string, ActorRef>();
	for (const m of movies) {
		for (const act of m.actors) {
			a.set(act.slug, act);
		}
	}
	return [...a.values()].sort((x, y) => x.slug.localeCompare(y.slug));
}

export function moviesByActorSlugFromPool(movies: Movie[], actorSlug: string): Movie[] {
	return movies.filter((m) => m.actors.some((a) => a.slug === actorSlug));
}

export function moviesByTagSlugFromPool(movies: Movie[], tagSlug: string): Movie[] {
	return movies.filter((m) => m.tags.some((t) => t.slug === tagSlug));
}

/**
 * 专题页：在发现池内按关键词匹配（片名、地区、标签名、简介）。
 * 关键词区分大小写不敏感；无关键词时返回空数组。
 */
export function moviesMatchingKeywordsFromPool(
	movies: Movie[],
	keywords: readonly string[],
): Movie[] {
	const kws = keywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
	if (kws.length === 0) return [];
	return movies
		.filter((m) => {
			const hay = [
				m.title,
				m.country,
				m.description,
				...m.tags.map((t) => `${t.name} ${t.slug}`),
				...(m.cate_name ? [m.cate_name] : []),
			]
				.join(' ')
				.toLowerCase();
			return kws.some((kw) => hay.includes(kw));
		})
		.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
}

/** 与 mock `getTopMovies` 规则对齐，在发现池上过滤 */
export function topMoviesFromPool(slug: string, pool: Movie[]): Movie[] {
	const tagLabel = (m: Movie, pred: (s: string) => boolean) =>
		m.tags.some((t) => pred(t.name) || pred(t.slug));

	const drama2026 = (m: Movie) => {
		const y = m.year;
		const yearOk = y === 2026 || String(y) === '2026';
		if (!yearOk) return false;
		const cat = (m.cate_name ?? '').trim();
		if (cat.includes('剧情')) return true;
		return m.tags.some(
			(t) =>
				t.slug === 'drama' || t.name.includes('剧情') || t.slug.toLowerCase().includes('drama'),
		);
	};

	switch (slug) {
		case 'netflix': {
			return pool
				.filter(movieMatchesNetflixHeuristic)
				.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
		}
		case 'suspense':
			return pool
				.filter((m) =>
					tagLabel(m, (s) => s.includes('悬疑') || s.toLowerCase().includes('suspense')),
				)
				.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
		case '2026-drama':
		case 'drama-2026':
			return pool.filter(drama2026).sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
		default:
			return [];
	}
}

export async function fetchAllMoviesForTagId(
	cfg: NiuniuClientConfig,
	tagId: string,
	pageSize = 50,
): Promise<Movie[]> {
	const out: Movie[] = [];
	let page = 1;
	while (true) {
		const msg = await fetchMoviesByTagId(cfg, tagId, page, pageSize);
		const items = (msg.items ?? []).map(mapNiuniuToMovie);
		if (items.length === 0) break;
		out.push(...items);
		if (items.length < pageSize) break;
		page += 1;
	}
	return out;
}

/** `tag-{数字}` 走标签接口；否则在发现池内按标签 slug 过滤 */
export async function moviesForTagSlug(
	cfg: NiuniuClientConfig,
	tagSlug: string,
	pool: Movie[],
): Promise<Movie[]> {
	const m = /^tag-(\d+)$/.exec(tagSlug);
	if (m) {
		return fetchAllMoviesForTagId(cfg, m[1]);
	}
	return moviesByTagSlugFromPool(pool, tagSlug);
}

export function splitAiReviewToSections(
	ai: string | null | undefined,
): { heading: string; body: string }[] {
	const t = (ai ?? '').trim();
	if (!t) return [{ heading: '前言', body: '暂无影评正文，欢迎浏览影片页中的剧情与主创信息。' }];
	const paras = t.split(/\n{2,}/).filter(Boolean);
	if (paras.length <= 1) return [{ heading: '影评', body: t }];
	return paras.slice(0, 10).map((p, i) => ({
		heading: i === 0 ? '值得看吗' : `解读 ${i + 1}`,
		body: p.trim(),
	}));
}

export function moviesWithAiReviewFromPool(pool: Movie[], max = 8): Movie[] {
	return pool
		.filter((m) => (m.ai_review ?? '').trim().length > 0)
		.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
		.slice(0, max);
}

/**
 * 首页「最新影评」：优先完整影评正文；若无则用语义/简介片段占位（详情页仍为检索摘要+剧情）。
 */
export function moviesForHomeReviewTeasersFromPool(
	pool: Movie[],
	max = 8,
): { movies: Movie[]; source: 'review' | 'teaser' } {
	const withAi = moviesWithAiReviewFromPool(pool, max);
	if (withAi.length > 0) return { movies: withAi, source: 'review' };
	const byCopy = [...pool]
		.filter((m) => (m.seoDescription ?? m.description ?? '').trim().length >= 40)
		.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
		.slice(0, max);
	if (byCopy.length > 0) return { movies: byCopy, source: 'teaser' };
	return {
		movies: [...pool].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0)).slice(0, max),
		source: 'teaser',
	};
}

/**
 * `/reviews` 聚合页：发现池内**全部**具备长文影评或可摘录文案的条目（含 `ai_review` 字段，或简介描述足够长）。
 * 排序：优先含完整影评正文的条目，再按热度。
 */
export function moviesForReviewsHubFromPool(pool: Movie[]): {
	movies: Movie[];
	source: 'review' | 'teaser';
} {
	const enriched = pool.map((m) => ({
		m,
		hasAi: (m.ai_review ?? '').trim().length > 0,
		copyLen: (m.seoDescription ?? m.description ?? '').trim().length,
	}));

	const filtered = enriched.filter((x) => x.hasAi || x.copyLen >= 40);
	const base = filtered.length > 0 ? filtered : enriched;

	const sorted = [...base].sort((a, b) => {
		if (filtered.length > 0 && a.hasAi !== b.hasAi) {
			return a.hasAi ? -1 : 1;
		}
		return (b.m.heat ?? 0) - (a.m.heat ?? 0);
	});

	const movies = sorted.map((x) => x.m);
	const source = movies.some((m) => (m.ai_review ?? '').trim()) ? 'review' : 'teaser';

	return { movies, source };
}

/** 发现池未覆盖的标签页，如仅长尾影片带 `tag-123`：`.env` 中 `NIUNIUCMS_EXTRA_TAG_SLUGS=tag-1,tag-2` */
export function extraTagSlugsFromEnv(): string[] {
	const raw = import.meta.env.NIUNIUCMS_EXTRA_TAG_SLUGS ?? '';
	return raw
		.split(/[,;\s]+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

export { isNiuniuConfigured, getNiuniuClientFromEnv };
