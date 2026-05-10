import { allTopicJsonSlugs } from './topic-json-files';

/**
 * 专题落地页：长正文优先（利于检索展示），下方再挂影片卡片。
 *
 * - **`src/data/topics/*.json`**：本地专题正文与关键词；构建期自动并入路由与 `/topics` 列表。
 * - **本地兜底**：`BY_SLUG` 用于少量手写合并（可为空）。
 * - **上线后**：可与远端专题列表 + 详情接口合并（远端优先填空）。
 * - **列表数据**：已接数据源时用 `matchKeywords` 在发现池内筛选；无命中则仅展示正文。
 */
export interface TopicLandingConfig {
	slug: string;
	/** 浏览器标签与面包屑 */
	pageTitle: string;
	/** `<meta name="description">`，建议 70～160 字 */
	metaDescription: string;
	/** 正文段落（纯文本，禁止 HTML；每段独立 `<p>`） */
	bodyParagraphs: readonly string[];
	/**
	 * 在影片资料池上匹配的子串（片名、地区、标签名、简介拼接）。
	 * 留空则专题页不展示影片网格。
	 */
	matchKeywords: readonly string[];
}

/** 无内置静态 slug；需要时用环境变量 `NIUNIUCMS_SEO_TOPIC_SLUGS` 或远端分页列表。 */
export const TOPIC_LANDING_SLUGS = [] as const;

export type TopicLandingSlug = (typeof TOPIC_LANDING_SLUGS)[number];

/** 构建 `/topics/[slug]`：远端 slug + 环境变量 + `topics/*.json`。 */
export function allTopicSlugsForStaticPaths(): string[] {
	const extra = (import.meta.env.NIUNIUCMS_SEO_TOPIC_SLUGS ?? '')
		.toString()
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const fromJson = allTopicJsonSlugs();
	return [...new Set<string>([...TOPIC_LANDING_SLUGS, ...extra, ...fromJson])];
}

const BY_SLUG: Record<string, TopicLandingConfig> = {};

export function getTopicLandingConfig(slug: string): TopicLandingConfig | undefined {
	return BY_SLUG[slug];
}
