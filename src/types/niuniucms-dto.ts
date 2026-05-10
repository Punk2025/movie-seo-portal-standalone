/** 与 SEO 影片 DTO（`api_seo_movie_dto`）对齐的常用字段（可按实际上游返回扩展） */

export interface NiuniuTagDto {
	id: number | string;
	slug: string;
	label: string;
}

export type NiuniuActorItem =
	| string
	| {
			name?: string;
			slug?: string;
			label?: string;
	  };

/** SEO API 解析后的门户弱引导 */
export interface NiuniuPortalCtaLinkDto {
	label?: string;
	url?: string;
	subtitle?: string;
}

export interface NiuniuPortalCtaDto {
	placement?: string;
	links?: NiuniuPortalCtaLinkDto[];
}

export interface NiuniuMovieDto {
	vid: number | string;
	slug: string;
	name: string;
	cover: string;
	blurb?: string;
	content_plain?: string;
	tags?: NiuniuTagDto[];
	seo_title?: string;
	seo_description?: string;
	seo_keywords?: string;
	ai_review?: string;
	/** 推荐理由（可与上游列名对齐） */
	ai_recommend_reason?: string;
	recommend_reason?: string;
	/** 看点分析短文 */
	ai_spotlight?: string;
	ai_analysis_short?: string;
	/** 类似影片区块导语 */
	related_intro?: string;
	/** 演员段落综述 */
	ai_actor_notes?: string;
	related_slugs?: string[];
	heat_score?: number;
	heat?: number;
	views?: number;
	year?: number;
	country?: string;
	/** 结构化演员；或模板里用字符串列表 */
	actors?: NiuniuActorItem[];
	/** 常见：表里 `vod_actor` 顿号/斜杠拼接，API 可能单独给此字段 */
	vod_actor?: string;
	/** 分类展示名；年度剧情等榜单可与 tags 联合判断 */
	cate_name?: string;
	/** 与库 `vod.actor` 一致；列表接口常只返回此键而不返回 `vod_actor` / `actors` */
	actor?: string;
	director?: string;
	score?: number;
	/** 常见别名 */
	douban_score?: number;
	rating?: number;
	uptime?: string;
	create_date?: string;
	/** 门户弱引导摘要；无内容为 null */
	portal_cta?: NiuniuPortalCtaDto | null;
	portal_cta_preset_id?: number | string;
	/** 请求带合法 `site` / `X-Site-Key` 时回显，构建自检用 */
	site_key?: string | null;
}

/** `message()` 统一信封；成功时 `code === 0` */
export interface NiuniuApiEnvelope<T = unknown> {
	code: number;
	message: T;
}

/** 列表类接口 `message`：latest / hot / update/today / tag 等 */
export interface NiuniuListMessage<T = NiuniuMovieDto> {
	page?: number;
	page_size?: number;
	total?: number;
	items: T[];
}

/** 详情接口 `message` */
export interface NiuniuMovieDetailMessage {
	movie: NiuniuMovieDto;
}

/** 专题正文结构化块（常见：`recommendations`、`faq`；形状以线上 JSON 为准） */
export interface NiuniuSeoTopicBodyDto {
	recommendations?: unknown;
	faq?: unknown;
	[key: string]: unknown;
}

/** SEO 专题落地页 DTO（表 `seo_topic_landing` / `message.topic`） */
export interface NiuniuSeoTopicLandingDto {
	slug: string;
	/** 页面标题 / H1 */
	title?: string;
	page_title?: string;
	/** 导语；常与 `body.recommendations` / `body.faq` 并存 */
	intro?: string;
	meta_description?: string;
	/** 结构化正文；PHP 有时返回 JSON 字符串 */
	body?: NiuniuSeoTopicBodyDto | string | Record<string, unknown>;
	/** 后台表单遗留字段：合法 JSON 字符串或对象 */
	body_json?: string | Record<string, unknown>;
	match_keywords?: string | string[];
	/** 启用：未勾选时 PHP 可能不传或为 0 */
	enabled?: boolean | number | string;
}

/** `GET api-topic-slugs` → `message.slugs`（仅已发布且启用的专题） */
export interface NiuniuTopicSlugsMessage {
	slugs?: string[];
	page?: number;
	page_size?: number;
	total?: number;
}

/** 专题详情：`message.topic`（若直接返回 topic 根字段则另做兼容） */
export interface NiuniuSeoTopicDetailMessage {
	topic?: NiuniuSeoTopicLandingDto;
}

/** meta/slugs 单条：以线上实际为准，兼容字符串或带 slug/vid 的对象 */
export type NiuniuMetaSlugItem = string | { slug?: string; vid?: number | string };
