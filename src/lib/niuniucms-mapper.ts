import type { Movie } from '../types/content';
import type {
	NiuniuActorItem,
	NiuniuMovieDto,
	NiuniuPortalCtaLinkDto,
} from '../types/niuniucms-dto';

/** 与 vid 无关的稳定演员 slug，便于跨片聚合「热门演员」 */
function actorSlugForName(name: string): string {
	const n = name.trim();
	if (!n) return 'actor-unknown';
	const ascii = n
		.replace(/[A-Za-z0-9]+/g, (m) => m.toLowerCase())
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/\s+/g, '-');
	if (ascii.length >= 2) return `actor-${ascii.slice(0, 64)}`;
	let h = 2166136261;
	for (let i = 0; i < n.length; i++) {
		h ^= n.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return `actor-${(h >>> 0).toString(36)}`;
}

function splitVodActorField(raw: string | undefined): string[] {
	if (!raw?.trim()) return [];
	return raw
		.split(/[,，|\/、]+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/** 接口常传 `""`；转成「未设置」后 `??` / 回退链才能落到 `name`、`blurb` */
function strOptional(s: string | null | undefined): string | undefined {
	const t = (s ?? '').trim();
	return t ? t : undefined;
}

/** 上游链接键名可能与文档示例不完全一致，在此做兼容 */
function portalCtaLinkFields(item: NiuniuPortalCtaLinkDto & Record<string, unknown>): {
	label?: string;
	url?: string;
	subtitle?: string;
} {
	const rec = item as Record<string, unknown>;
	const label = strOptional(
		item.label ??
			item.text ??
			(typeof rec.title === 'string' ? rec.title : undefined) ??
			(typeof rec['文案'] === 'string' ? rec['文案'] : undefined),
	);
	const url = strOptional(
		item.url ?? item.href ?? (typeof rec.link === 'string' ? rec.link : undefined),
	);
	const subtitle = strOptional(
		item.subtitle ??
			(typeof rec.sub_title === 'string' ? rec.sub_title : undefined) ??
			(typeof rec['副标题'] === 'string' ? rec['副标题'] : undefined),
	);
	return { label, url, subtitle };
}

function mapPortalCtaFromDto(dto: NiuniuMovieDto): Movie['portal_cta'] {
	let raw = dto.portal_cta;
	if (typeof raw === 'string' && raw.trim()) {
		try {
			raw = JSON.parse(raw) as NiuniuMovieDto['portal_cta'];
		} catch {
			return null;
		}
	}
	if (raw == null || typeof raw !== 'object') return null;

	const linksRaw = (raw as { links?: unknown }).links;
	const links = Array.isArray(linksRaw) ? linksRaw : [];
	const normalized: NonNullable<Movie['portal_cta']>['links'] = [];
	for (const item of links) {
		if (!item || typeof item !== 'object') continue;
		const { label, url, subtitle } = portalCtaLinkFields(
			item as NiuniuPortalCtaLinkDto & Record<string, unknown>,
		);
		if (!label || !url) continue;
		normalized.push(subtitle ? { label, url, subtitle } : { label, url });
	}
	if (normalized.length === 0) return null;
	const placement = strOptional((raw as { placement?: string }).placement);
	return placement ? { placement, links: normalized } : { links: normalized };
}

function portalCtaPresetIdFromDto(dto: NiuniuMovieDto): number | string | undefined {
	const v = dto.portal_cta_preset_id;
	if (v == null || v === '') return undefined;
	const n = typeof v === 'number' ? v : Number(v);
	if (Number.isFinite(n) && n === 0) return undefined;
	return v;
}

export function hasPortalCta(movie: Movie): boolean {
	return Boolean(movie.portal_cta?.links?.length);
}

/** 列表接口常省略结构化 `tags`，用 SEO 关键词补齐类型入口（去重后并入） */
function tagRefsFromSeoKeywords(
	seo_keywords: string | undefined,
): { name: string; slug: string }[] {
	const raw = strOptional(seo_keywords);
	if (!raw) return [];
	const parts = raw
		.split(/[,，;；|｜/\s]+/)
		.map((s) => s.trim())
		.filter(Boolean);
	const out: { name: string; slug: string }[] = [];
	const seen = new Set<string>();
	for (const label of parts.slice(0, 14)) {
		const n = label.trim();
		if (!n) continue;
		const ascii = n
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
		let slug: string;
		if (ascii.length >= 2) slug = `kw-${ascii.slice(0, 48)}`;
		else {
			let h = 2166136261;
			for (let i = 0; i < n.length; i++) {
				h ^= n.charCodeAt(i);
				h = Math.imul(h, 16777619);
			}
			slug = `kw-${(h >>> 0).toString(36)}`;
		}
		if (seen.has(slug)) continue;
		seen.add(slug);
		out.push({ name: n, slug });
	}
	return out;
}

function mergeTagRefs(
	a: { name: string; slug: string }[],
	b: { name: string; slug: string }[],
): { name: string; slug: string }[] {
	const map = new Map<string, { name: string; slug: string }>();
	for (const t of [...a, ...b]) {
		if (!map.has(t.slug)) map.set(t.slug, t);
	}
	return [...map.values()];
}

function mapActorsFromDto(dto: NiuniuMovieDto): { name: string; slug: string }[] {
	const fromList = dto.actors;
	if (Array.isArray(fromList) && fromList.length > 0) {
		return fromList.map((item: NiuniuActorItem, i: number) => {
			if (typeof item === 'string') {
				const name = item.trim() || `演员 ${i + 1}`;
				return { name, slug: actorSlugForName(name) };
			}
			const name = (item.name ?? item.label ?? '').trim() || `演员 ${i + 1}`;
			const slug = item.slug?.trim() ? item.slug.trim() : actorSlugForName(name);
			return { name, slug };
		});
	}
	const pipe = splitVodActorField(dto.vod_actor);
	if (pipe.length > 0) {
		return pipe.map((name, i) => ({
			name: name || `演员 ${i + 1}`,
			slug: actorSlugForName(name || `n${i}`),
		}));
	}
	const fromVodActor = splitVodActorField(dto.actor);
	if (fromVodActor.length > 0) {
		return fromVodActor.map((name, i) => ({
			name: name || `演员 ${i + 1}`,
			slug: actorSlugForName(name || `n${i}`),
		}));
	}
	return [];
}

function firstFiniteScore(...vals: (number | string | null | undefined)[]): number | null {
	for (const v of vals) {
		if (v == null || v === '') continue;
		const n = typeof v === 'number' ? v : Number(v);
		if (Number.isFinite(n) && n > 0) return n;
	}
	return null;
}

function numOrNull(v: unknown): number | null {
	if (v == null || v === '') return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}

/** 将上游 DTO 转为站点 `Movie`（字段名不一致时只改这一层） */
export function mapNiuniuToMovie(dto: NiuniuMovieDto): Movie {
	const baseTags =
		dto.tags?.map((t) => ({
			name: t.label,
			slug: t.slug,
		})) ?? [];
	const tags = mergeTagRefs(baseTags, tagRefsFromSeoKeywords(dto.seo_keywords));

	const actors = mapActorsFromDto(dto);

	const description = (dto.content_plain ?? dto.blurb ?? '').trim() || '（暂无简介）';

	return {
		title: dto.name,
		slug: dto.slug,
		cover: dto.cover,
		year: dto.year ?? 0,
		country: dto.country ?? '',
		actors,
		director: dto.director ?? '',
		tags,
		score: firstFiniteScore(dto.score, dto.douban_score, dto.rating),
		heat: numOrNull(dto.heat_score) ?? numOrNull(dto.heat) ?? numOrNull(dto.views),
		update_status: dto.uptime
			? `最近更新：${dto.uptime}`
			: dto.create_date
				? `收录：${dto.create_date}`
				: '',
		description,
		ai_review: strOptional(dto.ai_review) ?? null,
		ai_recommend_reason: strOptional(dto.ai_recommend_reason ?? dto.recommend_reason) ?? null,
		ai_spotlight: strOptional(dto.ai_spotlight ?? dto.ai_analysis_short) ?? null,
		related_intro: strOptional(dto.related_intro) ?? null,
		ai_actor_notes: strOptional(dto.ai_actor_notes) ?? null,
		publish_time: dto.uptime ?? dto.create_date ?? new Date().toISOString(),
		related_movies: dto.related_slugs ?? [],
		seoTitle: strOptional(dto.seo_title),
		seoDescription: strOptional(dto.seo_description),
		vid: dto.vid,
		portal_cta: mapPortalCtaFromDto(dto),
		portal_cta_preset_id: portalCtaPresetIdFromDto(dto),
		cate_name: strOptional(dto.cate_name) ?? '',
	};
}
