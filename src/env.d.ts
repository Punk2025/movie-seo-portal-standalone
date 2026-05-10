/// <reference types="astro/client" />

interface ImportMetaEnv {
	/** 对外文档推荐：用户站点根（无 /admin），与 `seo_api_key` 配对 */
	readonly DATA_API_ORIGIN?: string;
	readonly DATA_API_KEY?: string;
	/** 多门户：与库表 `vod_site_content.site_key` 一致；构建期所有列表/详情请求附加 `?site=` 与头 `X-Site-Key` */
	readonly SITE_KEY?: string;
	/** 兼容：用户站点根（无 /admin），如 https://example.com */
	readonly NIUNIUCMS_ORIGIN?: string;
	readonly NIUNIUCMS_API_ORIGIN?: string;
	/** 与后台「SEO 开放接口」一致的 X-API-Key */
	readonly NIUNIUCMS_API_KEY?: string;
	/** `hyphen`（api-xxx.html，rewrite 0/1）| `path`（/api/xxx，rewrite 2/3） */
	readonly NIUNIUCMS_URL_STYLE?: string;
	/** 构建影片路由：`meta` 全站分页 slug | `preview` 仅 latest+hot（先跑通） */
	readonly NIUNIUCMS_BUILD_SLUGS?: string;
	/** 额外标签路由（逗号分隔），如 `tag-12,tag-34` */
	readonly NIUNIUCMS_EXTRA_TAG_SLUGS?: string;
	/** 「搜影片」弹层额外并入详情的 slug（逗号分隔） */
	readonly NIUNIUCMS_SEARCH_GUIDE_EXTRA_SLUGS?: string;
	/** 额外预渲染 `/topics/[slug]`（逗号分隔）；与 `topic-landings.ts` 内置 slug 合并 */
	readonly NIUNIUCMS_SEO_TOPIC_SLUGS?: string;
	/** 首页列表缺演员/标签时补拉影片详情条数上限（0=关闭），默认 24 */
	readonly NIUNIUCMS_HOME_DETAIL_ENRICH?: string;
	/** 兼容旧示例名（可选） */
	readonly CMS_SEO_API_BASE?: string;
	readonly CMS_SEO_API_KEY?: string;
	readonly CMS_SEO_URL_MODE?: string;
	/** 全站品牌名，用于 og:site_name（对外分享卡顶部显示） */
	readonly PUBLIC_SITE_NAME?: string;
	/** 全站一句话描述：WebSite 结构化数据；不设则用 `SITE_DEFAULT_DESCRIPTION` */
	readonly PUBLIC_SITE_DESCRIPTION?: string;
	/** 运行期弱引导 BFF 根路径（无尾斜杠）。纯静态托管且 API 在外域时设此项；请求 `{base}/portal-cta?slug=`、`{base}/search-guide` */
	readonly PUBLIC_RUNTIME_API_BASE?: string;
	/** 观影指南 / 资源推荐等栏目页可选：合作方落地页完整 URL（https://…），不设则仅展示说明文案与二维码占位 */
	readonly PUBLIC_GUIDE_PORTAL_URL?: string;
	/** 与 `PUBLIC_GUIDE_PORTAL_URL` 配套的展示名，如 `M8ktv.com` */
	readonly PUBLIC_GUIDE_PORTAL_LABEL?: string;
	/** X / Twitter @用户名，无需 @ 也可；写入 twitter:site */
	readonly PUBLIC_TWITTER_HANDLE?: string;
	readonly PUBLIC_SOCIAL_WEIBO?: string;
	readonly PUBLIC_SOCIAL_WECHAT_ARTICLE?: string;
	readonly PUBLIC_SOCIAL_TELEGRAM?: string;
	readonly PUBLIC_SOCIAL_WHATSAPP?: string;
	readonly PUBLIC_SOCIAL_FACEBOOK?: string;
	readonly PUBLIC_SOCIAL_X?: string;
	readonly PUBLIC_SOCIAL_QQ?: string;
	readonly PUBLIC_SOCIAL_BILIBILI?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
