/**
 * 全站 WebSite + Organization，供搜索引擎与社交爬虫理解站点实体（不出现在页面上）。
 */

export interface SiteGraphOptions {
	origin: string;
	siteName: string;
	description: string;
	/** 页脚已配置的社交主页 URL，写入 Organization.sameAs */
	sameAs: string[];
}

export function buildSiteGraphJsonLd(opts: SiteGraphOptions): Record<string, unknown> {
	const base = opts.origin.replace(/\/+$/, '');
	const sameAs = opts.sameAs.filter(Boolean);
	const org: Record<string, unknown> = {
		'@type': 'Organization',
		'@id': `${base}/#organization`,
		name: opts.siteName,
		url: `${base}/`,
		logo: {
			'@type': 'ImageObject',
			url: `${base}/favicon.svg`,
		},
	};
	if (sameAs.length > 0) org.sameAs = sameAs;

	const website: Record<string, unknown> = {
		'@type': 'WebSite',
		'@id': `${base}/#website`,
		url: `${base}/`,
		name: opts.siteName,
		description: opts.description,
		inLanguage: 'zh-CN',
		publisher: { '@id': `${base}/#organization` },
	};

	return {
		'@context': 'https://schema.org',
		'@graph': [website, org],
	};
}
