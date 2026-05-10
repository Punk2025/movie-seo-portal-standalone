import { getTopicLandingFromJson } from '../data/topic-json-files';
import { allTopicSlugsForStaticPaths, getTopicLandingConfig } from '../data/topic-landings';
import type { NiuniuClientConfig } from './niuniucms-api';
import { fetchAllSeoTopicSlugs, fetchSeoTopicLanding } from './niuniucms-api';
import { mapNiuniuSeoTopicToLandingConfig, mergeTopicLandingConfig } from './seo-topic-mapper';

function localTopicBase(slug: string) {
	const staticCfg = getTopicLandingConfig(slug);
	const jsonCfg = getTopicLandingFromJson(slug);
	return jsonCfg ? mergeTopicLandingConfig(jsonCfg, staticCfg) : staticCfg;
}

export interface TopicIndexCard {
	slug: string;
	title: string;
	description: string;
}

function humanizeSlug(slug: string): string {
	const parts = slug.split('-').filter(Boolean);
	if (parts.length === 0) return slug;
	return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * 构建 `/topics` 列表：合并远端 slug 与静态配置；批量拉详情标题（分块并发）。
 */
export async function loadTopicIndexCards(
	cfg: NiuniuClientConfig | null,
): Promise<TopicIndexCard[]> {
	const remote = cfg ? await fetchAllSeoTopicSlugs(cfg) : [];
	const staticSlugs = allTopicSlugsForStaticPaths();
	const merged = [...new Set([...remote, ...staticSlugs])].sort((a, b) =>
		a.localeCompare(b, 'zh-Hans-CN'),
	);

	if (!cfg) {
		return merged
			.map((slug) => {
				const c = localTopicBase(slug);
				if (!c) return null;
				return {
					slug,
					title: c.pageTitle,
					description: c.metaDescription.slice(0, 160),
				};
			})
			.filter((x): x is TopicIndexCard => x !== null);
	}

	const chunkSize = 12;
	const out: TopicIndexCard[] = [];

	for (let i = 0; i < merged.length; i += chunkSize) {
		const chunk = merged.slice(i, i + chunkSize);
		const batch = await Promise.all(
			chunk.map(async (slug): Promise<TopicIndexCard | null> => {
				const localBase = localTopicBase(slug);
				try {
					const dto = await fetchSeoTopicLanding(cfg, slug);
					if (dto) {
						const mapped = mapNiuniuSeoTopicToLandingConfig(dto, slug);
						if (!mapped) return null;
						return {
							slug,
							title: mapped.pageTitle,
							description: (mapped.metaDescription || '').slice(0, 160),
						};
					}
				} catch {
					/* 接口异常时用静态或占位 */
				}
				if (localBase) {
					return {
						slug,
						title: localBase.pageTitle,
						description: localBase.metaDescription.slice(0, 160),
					};
				}
				return {
					slug,
					title: humanizeSlug(slug),
					description: '专题导读与站内相关收录。',
				};
			}),
		);
		for (const row of batch) {
			if (row) out.push(row);
		}
	}

	return out;
}
