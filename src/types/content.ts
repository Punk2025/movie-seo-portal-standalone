export interface ActorRef {
	name: string;
	slug: string;
}

export interface TagRef {
	name: string;
	slug: string;
}

export interface PortalCtaLink {
	label: string;
	url: string;
	subtitle?: string;
}

/** 门户弱引导区块；仅有有效 links 时由 mapper 保留 */
export interface PortalCta {
	placement?: string;
	links: PortalCtaLink[];
}

/** 与开发文档对齐的核心影视实体 */
export interface Movie {
	title: string;
	slug: string;
	cover: string;
	year: number;
	country: string;
	actors: ActorRef[];
	director: string;
	tags: TagRef[];
	score: number | null;
	heat: number | null;
	update_status: string;
	description: string;
	ai_review: string | null;
	/** 推荐理由短正文（检索摘要优先展示） */
	ai_recommend_reason?: string | null;
	/** 看点分析短文（优先于模板生成的看点段落） */
	ai_spotlight?: string | null;
	/** 「类似推荐」区块上方导读 */
	related_intro?: string | null;
	/** 演员综述段落 */
	ai_actor_notes?: string | null;
	publish_time: string;
	related_movies: string[];
	/** `seo_title` / `seo_description`，用于 <title> 与 meta */
	seoTitle?: string;
	seoDescription?: string;
	/** 详情接口用 vid 拉片时保留，slug 含 `-` 且 hyphen URL 时可用 */
	vid?: string | number;
	/** 弱引导文案链；null/undefined 时不展示区块 */
	portal_cta?: PortalCta | null;
	portal_cta_preset_id?: number | string;
	/** 分类展示名 `cate_name`，用于年度剧情等榜单 */
	cate_name?: string;
}

export interface ReviewRecord {
	slug: string;
	movie_slug: string;
	meta_title: string;
	meta_description: string;
	sections: { heading: string; body: string }[];
}

export interface UpdateRecord {
	slug: string;
	movie_slug: string;
	season: number;
	episode: number;
	updated_at: string;
	ai_summary: string;
	watch_reason: string;
}
