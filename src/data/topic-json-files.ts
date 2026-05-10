import type { TopicLandingConfig } from './topic-landings';

/** 与 `src/data/topics/*.json` 文件形状一致 */
export interface TopicJsonFile {
	slug: string;
	title: string;
	description: string;
	keywords: string[];
	bodyParagraphs: string[];
}

function jsonToLanding(raw: TopicJsonFile): TopicLandingConfig {
	return {
		slug: raw.slug,
		pageTitle: raw.title,
		metaDescription: raw.description,
		bodyParagraphs: [...raw.bodyParagraphs],
		matchKeywords: [...raw.keywords],
	};
}

const modules = import.meta.glob('./topics/*.json', { eager: true }) as Record<
	string,
	{ default?: TopicJsonFile } | TopicJsonFile
>;

function parseModule(mod: unknown): TopicJsonFile | null {
	if (!mod || typeof mod !== 'object') return null;
	const m = mod as Record<string, unknown>;
	const data = (m.default ?? m) as Record<string, unknown>;
	const slug = typeof data.slug === 'string' ? data.slug.trim() : '';
	if (!slug) return null;
	const title = typeof data.title === 'string' ? data.title : '';
	const description = typeof data.description === 'string' ? data.description : '';
	const keywords = Array.isArray(data.keywords)
		? data.keywords.map((x) => String(x).trim()).filter(Boolean)
		: [];
	const bodyParagraphs = Array.isArray(data.bodyParagraphs)
		? data.bodyParagraphs.map((x) => String(x).trim()).filter(Boolean)
		: [];
	return { slug, title, description, keywords, bodyParagraphs };
}

let slugMap: Map<string, TopicLandingConfig> | undefined;

function getMap(): Map<string, TopicLandingConfig> {
	if (!slugMap) {
		slugMap = new Map();
		for (const path of Object.keys(modules)) {
			const raw = parseModule(modules[path]);
			if (!raw) continue;
			slugMap.set(raw.slug, jsonToLanding(raw));
		}
	}
	return slugMap;
}

/** 构建期合并 `getStaticPaths`：所有 JSON 专题的 slug */
export function allTopicJsonSlugs(): string[] {
	return [...getMap().keys()];
}

/** 读取单个 JSON 专题（无则 undefined） */
export function getTopicLandingFromJson(slug: string): TopicLandingConfig | undefined {
	return getMap().get(slug);
}
