import type { TopicLandingConfig } from '../data/topic-landings';
import type { NiuniuSeoTopicLandingDto } from '../types/niuniucms-dto';

function isTopicEnabled(dto: NiuniuSeoTopicLandingDto): boolean {
	if (dto.enabled === undefined || dto.enabled === null) return true;
	if (typeof dto.enabled === 'boolean') return dto.enabled;
	const n = Number(dto.enabled);
	if (Number.isFinite(n)) return n !== 0;
	const s = String(dto.enabled).toLowerCase();
	return s === '1' || s === 'true' || s === 'yes';
}

function parseBodyJson(body: NiuniuSeoTopicLandingDto['body_json']): Record<string, unknown> {
	if (body == null) return {};
	if (typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
	const raw = String(body).trim();
	if (!raw) return {};
	try {
		const o = JSON.parse(raw) as unknown;
		return typeof o === 'object' && o !== null && !Array.isArray(o)
			? (o as Record<string, unknown>)
			: {};
	} catch {
		return {};
	}
}

function normalizeStructuredBody(
	body: NiuniuSeoTopicLandingDto['body'],
): Record<string, unknown> | undefined {
	if (body == null) return undefined;
	if (typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
	const raw = String(body).trim();
	if (!raw) return undefined;
	try {
		const o = JSON.parse(raw) as unknown;
		return typeof o === 'object' && o !== null && !Array.isArray(o)
			? (o as Record<string, unknown>)
			: undefined;
	} catch {
		return undefined;
	}
}

function splitBlocks(text: string | undefined): string[] {
	if (!text?.trim()) return [];
	return text
		.split(/\n{2,}/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/** `body.recommendations`：字符串、文案数组或带 title/text 的对象数组 */
function paragraphsFromRecommendations(v: unknown): string[] {
	if (v == null) return [];
	if (typeof v === 'string') return v.trim() ? [v.trim()] : [];
	if (!Array.isArray(v)) return [];
	const out: string[] = [];
	for (const item of v) {
		if (typeof item === 'string') {
			if (item.trim()) out.push(item.trim());
			continue;
		}
		if (item && typeof item === 'object') {
			const o = item as Record<string, unknown>;
			const line = [o.title, o.name, o.text, o.content, o.blurb, o.intro].find(
				(x) => typeof x === 'string' && String(x).trim(),
			);
			if (line) out.push(String(line).trim());
		}
	}
	return out;
}

/** `body.faq`：问答对象数组或纯文本 */
function paragraphsFromFaq(v: unknown): string[] {
	if (v == null) return [];
	if (typeof v === 'string') return v.trim() ? [v.trim()] : [];
	if (!Array.isArray(v)) return [];
	const out: string[] = [];
	for (const item of v) {
		if (typeof item === 'string') {
			if (item.trim()) out.push(item.trim());
			continue;
		}
		if (item && typeof item === 'object') {
			const o = item as Record<string, unknown>;
			const q = o.question ?? o.q;
			const a = o.answer ?? o.a;
			const parts = [q, a].filter((x) => typeof x === 'string' && String(x).trim()) as string[];
			if (parts.length > 0) out.push(parts.join('\n'));
		}
	}
	return out;
}

/**
 * 远端专题 DTO → 站点 `TopicLandingConfig`。
 * - `enabled` 为假时返回 **null**（详情页应 404）。
 * - 正文优先级：`body_json.bodyParagraphs`（若有）→ `intro` + `body.recommendations` + `body.faq` → legacy `body_json`/`body` 字符串。
 */
export function mapNiuniuSeoTopicToLandingConfig(
	dto: NiuniuSeoTopicLandingDto,
	fallbackSlug: string,
): TopicLandingConfig | null {
	if (!isTopicEnabled(dto)) return null;

	const parsed = parseBodyJson(dto.body_json);
	const struct = normalizeStructuredBody(dto.body);

	const pageTitle =
		(typeof parsed.pageTitle === 'string' && parsed.pageTitle.trim()) ||
		dto.page_title?.trim() ||
		dto.title?.trim() ||
		fallbackSlug;

	const metaDescription =
		(typeof parsed.metaDescription === 'string' && parsed.metaDescription.trim()) ||
		dto.meta_description?.trim() ||
		dto.intro?.trim()?.slice(0, 200) ||
		'';

	let bodyParagraphs: string[] = [];
	if (Array.isArray(parsed.bodyParagraphs)) {
		bodyParagraphs = parsed.bodyParagraphs.map((x) => String(x).trim()).filter(Boolean);
	}

	if (bodyParagraphs.length === 0) {
		const introParts = splitBlocks(dto.intro);
		const rec = paragraphsFromRecommendations(struct?.recommendations);
		const faq = paragraphsFromFaq(struct?.faq);
		bodyParagraphs = [...introParts, ...rec, ...faq];
	}

	if (bodyParagraphs.length === 0 && typeof parsed.body === 'string' && parsed.body.trim()) {
		bodyParagraphs = parsed.body
			.split(/\n{2,}/)
			.map((s) => s.trim())
			.filter(Boolean);
	}

	let matchKeywords: string[] = [];
	if (Array.isArray(parsed.matchKeywords)) {
		matchKeywords = parsed.matchKeywords.map((x) => String(x).trim()).filter(Boolean);
	}
	if (matchKeywords.length === 0 && dto.match_keywords != null) {
		const mk = dto.match_keywords;
		matchKeywords = Array.isArray(mk)
			? mk.map((x) => String(x).trim()).filter(Boolean)
			: String(mk)
					.split(/[,，;；|]/)
					.map((s) => s.trim())
					.filter(Boolean);
	}

	const slug = dto.slug?.trim() || fallbackSlug;

	return {
		slug,
		pageTitle,
		metaDescription,
		bodyParagraphs,
		matchKeywords,
	};
}

/** 远端配置优先；缺段落或关键词时用静态配置补齐（便于渐进迁移）。 */
export function mergeTopicLandingConfig(
	cms: TopicLandingConfig,
	staticCfg: TopicLandingConfig | undefined,
): TopicLandingConfig {
	return {
		slug: cms.slug,
		pageTitle: cms.pageTitle || staticCfg?.pageTitle || cms.slug,
		metaDescription: cms.metaDescription?.trim()
			? cms.metaDescription
			: (staticCfg?.metaDescription ?? ''),
		bodyParagraphs:
			cms.bodyParagraphs.length > 0 ? cms.bodyParagraphs : [...(staticCfg?.bodyParagraphs ?? [])],
		matchKeywords:
			cms.matchKeywords.length > 0 ? cms.matchKeywords : [...(staticCfg?.matchKeywords ?? [])],
	};
}
