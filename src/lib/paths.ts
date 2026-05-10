/** 站内路径生成，避免手写字符串链 */

export const paths = {
	movie: (slug: string) => `/movie/${slug}`,
	review: (slug: string) => `/review/${slug}`,
	/** 影评聚合列表（长文入口索引） */
	reviewsHub: () => '/reviews',
	update: (slug: string) => `/update/${slug}`,
	top: (slug: string) => `/top/${slug}`,
	/** 专题落地页：第一层栏目 `topics`，第二层为 slug（与榜单 `/top/*` 区分） */
	topic: (slug: string) => `/topics/${slug}`,
	/** 专题聚合索引（全部专题入口） */
	topicsIndex: () => '/topics',
	actor: (slug: string) => `/actor/${slug}`,
	tag: (slug: string) => `/tag/${slug}`,
	home: () => '/',
	about: () => '/about',
	contact: () => '/contact',
	privacy: () => '/privacy',
	terms: () => '/terms',
	author: () => '/author',
	publication: () => '/publication',
	editorial: () => '/editorial',
	disclaimer: () => '/disclaimer',
	/** 观影指南（商业入口与二维码集中页，与详情页正文分离） */
	movieGuide: () => '/movie-guide',
	movieNav: () => '/movie-nav',
	movieCommunity: () => '/movie-community',
	resourceRecommend: () => '/resource-recommend',
};
