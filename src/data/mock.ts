import type { ActorRef, Movie, ReviewRecord, TagRef, UpdateRecord } from '../types/content';

const actors = {
	reeves: { name: '基努·里维斯', slug: 'keanu-reeves' } satisfies ActorRef,
	jung: { name: '李政宰', slug: 'lee-jung-jae' } satisfies ActorRef,
	park: { name: '朴珪瑛', slug: 'park-gyu-young' } satisfies ActorRef,
	zhou: { name: '周澄奥', slug: 'zhou-chengao' } satisfies ActorRef,
};

const tags = {
	action: { name: '动作', slug: 'action' } satisfies TagRef,
	netflix: { name: 'Netflix', slug: 'netflix' } satisfies TagRef,
	suspense: { name: '悬疑', slug: 'suspense' } satisfies TagRef,
	drama: { name: '剧情', slug: 'drama' } satisfies TagRef,
	short: { name: '短剧', slug: 'short-drama' } satisfies TagRef,
};

/** Mock：后续替换为 REST / DB */
export const movies: Movie[] = [
	{
		title: '疾速追杀 5',
		slug: 'john-wick-chapter-5',
		cover: 'https://picsum.photos/seed/jw5/480/720',
		year: 2025,
		country: '美国',
		actors: [actors.reeves],
		director: '查德·斯塔赫斯基',
		tags: [tags.action],
		score: 8.2,
		heat: 9850,
		update_status: '院线热映',
		description: '约翰·威克再次卷入地下世界的纷争，旧怨与新敌交织，动作场面全面升级。',
		ai_recommend_reason:
			'系列第五部在场面设计与长线角色恩怨上继续加码，适合一贯喜爱「械斗美学」与地下世界规则的观众；若你只想找一部周末解压爽片，本片节奏与视觉密度都能满足期待。',
		ai_spotlight:
			'本片延续「高概念动作」路线：追车、枪战与近身格斗层层递进，叙事服务于冲突升级而非人物心理深挖。基努·里维斯的表演重心放在肢体语言与疲惫感，整体更像一部献给动作迷的长镜头狂欢。',
		ai_actor_notes:
			'基努·里维斯长期扮演约翰·威克这一角色，表演上以克制与耐力感见长；本片演员阵容围绕主角对抗的多方势力展开，配角多以功能性 antagonist 出现，服务于连环对决的节奏。',
		related_intro:
			'若你喜欢高强度动作调度、地下规则与复仇母题，可以从下列影片中延续相近观感；部分作品在叙事尺度或暴力呈现上各有侧重，适合对比观看。',
		ai_review: '节奏紧凑、场面硬核，适合系列粉丝；若追求叙事深度可放低预期，当作视听爽片更佳。',
		publish_time: '2025-03-21T00:00:00.000Z',
		related_movies: ['squid-game-season-3', 'silent-trap'],
	},
	{
		title: '鱿鱼游戏 第三季',
		slug: 'squid-game-season-3',
		cover: 'https://picsum.photos/seed/sg3/480/720',
		year: 2026,
		country: '韩国',
		actors: [actors.jung, actors.park],
		director: '黄东赫',
		tags: [tags.netflix, tags.suspense, tags.drama],
		score: 7.9,
		heat: 11200,
		update_status: '连载 · 更新至第 10 集',
		description: '生存游戏再度开局，旧参与者与新势力博弈，真相逐步浮出水面。',
		ai_recommend_reason:
			'第三季在保留残酷生存赛制的同时，把人物动机与社会隐喻往前推了一步；适合关注韩国悬疑高峰戏剧、以及愿意接受血腥与高压情节的观众。',
		ai_spotlight:
			'剧情延续「游戏即秩序」的寓言结构：规则一再改写，旧角色的复仇线与新人试探交织，紧张感来自信息不对称与制度暴力。李政宰等主演的对手戏，仍是观感焦点。',
		ai_actor_notes:
			'李政宰饰演的主角承载着系列最核心的伦理撕裂；朴珪瑛等演员在不同章节承担推动悬念的任务。下列影人链接便于在同一站点内延伸浏览其其它代表作。',
		related_intro:
			'以下作品在悬疑张力、群像博弈或流媒体话题度上与《鱿鱼游戏 第三季》相近，可用于延伸阅读与对比选片。',
		ai_review: '反转密集、议题尖锐；延续了系列的残酷寓言风格，适合喜欢高压悬疑的观众。',
		publish_time: '2026-04-01T00:00:00.000Z',
		related_movies: ['john-wick-chapter-5', 'diagnosis'],
		portal_cta: {
			links: [
				{
					label: '豆瓣 · 查评分与简介',
					url: 'https://movie.douban.com/',
					subtitle: '示例：合作方可用于提供更完整的影片资料入口',
				},
				{
					label: '延伸阅读 · 维基百科',
					url: 'https://zh.wikipedia.org/',
					subtitle: '适合了解系列背景与制作信息',
				},
			],
		},
	},
	{
		title: '沉默的骗局',
		slug: 'silent-trap',
		cover: 'https://picsum.photos/seed/st/480/720',
		year: 2026,
		country: '中国',
		actors: [actors.zhou],
		director: '陈芯宜',
		tags: [tags.suspense, tags.drama],
		score: 8.5,
		heat: 6230,
		update_status: '全剧完结',
		description: '一桩离奇失踪牵出金融骗局，记者与刑警双线追查，结局出人意料。',
		ai_review: '叙事工整、伏笔回收干净；结局解读空间大，适合爱看「细思极恐」类反转的观众。',
		publish_time: '2026-01-10T00:00:00.000Z',
		related_movies: ['urban-sketch-love-2026', 'squid-game-season-3'],
		portal_cta: {
			links: [
				{
					label: '影片讨论与资讯聚合',
					url: 'https://www.google.com/search?q=%E7%94%B5%E5%BD%B1',
					subtitle: '示例外链，线上可替换为合作站点',
				},
			],
		},
	},
	{
		title: '都市速写爱情',
		slug: 'urban-sketch-love-2026',
		cover: 'https://picsum.photos/seed/usl/480/720',
		year: 2026,
		country: '中国',
		actors: [actors.zhou, actors.park],
		director: '林小树',
		tags: [tags.short, tags.drama],
		score: 7.4,
		heat: 9100,
		update_status: '连载 · 更新至第 24 集',
		description: '职场与市井交错的爱情故事，每集一个都市截面，轻松下饭。',
		ai_review: '人设讨喜、单集体量轻；不适合追求强剧情的人群，当作甜点短剧很合适。',
		publish_time: '2026-02-14T00:00:00.000Z',
		related_movies: ['silent-trap', 'squid-game-season-3'],
	},
	{
		title: '诊断风云',
		slug: 'diagnosis',
		cover: 'https://picsum.photos/seed/dia/480/720',
		year: 2025,
		country: '韩国',
		actors: [actors.park],
		director: '金泰勋',
		tags: [tags.netflix, tags.drama],
		score: 8.0,
		heat: 7400,
		update_status: '第三季连载 · 更新至第 10 集',
		description: '天才法医与刑警组队，以解剖与线索拼图揭开连环谜案。',
		ai_review: '单元案件扎实，长线伏笔贯穿三季；医学细节偏戏剧化，勿当纪录片观看。',
		publish_time: '2025-09-01T00:00:00.000Z',
		related_movies: ['squid-game-season-3', 'silent-trap'],
	},
	{
		title: '双子城夜行（吉隆坡篇）',
		slug: 'twin-city-night-kl',
		cover: 'https://picsum.photos/seed/kl1/480/720',
		year: 2026,
		country: '马来西亚',
		actors: [actors.zhou],
		director: '示例导演',
		tags: [tags.drama, tags.suspense],
		score: 7.6,
		heat: 3100,
		update_status: '全剧完结',
		description:
			'以吉隆坡都市圈为背景的双主角悬疑短剧，通勤线与旧街区构成叙事舞台；示例条目用于专题页关键词演示。',
		ai_review: null,
		publish_time: '2026-03-01T00:00:00.000Z',
		related_movies: ['silent-trap'],
	},
];

export const reviews: ReviewRecord[] = [
	{
		slug: 'john-wick-chapter-5-worth-it',
		movie_slug: 'john-wick-chapter-5',
		meta_title: '疾速追杀5值得看吗？动作场面与观影建议',
		meta_description: '《疾速追杀5》是否值得进影院？从节奏、动作设计到系列粉丝向取舍，一文看懂。',
		sections: [
			{
				heading: '值得看吗',
				body: '若你喜欢枪械格斗与长线世界观，本片是值得买票的大银幕体验；若更看重人物内心戏，可酌情期待。',
			},
			{
				heading: '剧情解析（无关键剧透）',
				body: '本作延续「债务—复仇」链条，把势力版图再次扩张，核心仍是约翰如何在规则内破局。',
			},
			{
				heading: '彩蛋与致敬',
				body: '多处打斗编排致敬经典功夫片；字幕后可留意短暂彩蛋镜头（以实际上映为准）。',
			},
		],
	},
	{
		slug: 'silent-trap-ending-explained',
		movie_slug: 'silent-trap',
		meta_title: '沉默的结局什么意思？关键反转梳理',
		meta_description: '《沉默的骗局》结局多层反转意味着什么？按时间线梳理伏笔与角色动机。',
		sections: [
			{
				heading: '结局什么意思',
				body: '表面结案背后仍有「谁是操盘手」的第二层答案，记者手里的备份名单是关键道具。',
			},
			{
				heading: '剧情解析',
				body: '双线叙事在第六章汇合；注意第二次新闻发布会台词与前五分钟细节的呼应。',
			},
		],
	},
];

export const updates: UpdateRecord[] = [
	{
		slug: 'diagnosis-season3-episode10',
		movie_slug: 'diagnosis',
		season: 3,
		episode: 10,
		updated_at: '2026-05-08T18:00:00.000Z',
		ai_summary:
			'本集主线切入第三季核心阴谋：法医组锁定伪造鉴定链条，反派开始对内线施压，结尾留置悬念引向季终对峙。',
		watch_reason: '喜欢看「证据链翻盘」的观众不可错过；节奏比前两集更快，适合连续追看。',
	},
	{
		slug: 'squid-game-season3-episode10',
		movie_slug: 'squid-game-season-3',
		season: 3,
		episode: 10,
		updated_at: '2026-05-07T12:00:00.000Z',
		ai_summary: '新一轮游戏规则曝光，旧角色立场松动；本集侧重心理博弈，血腥度略降但张力更高。',
		watch_reason: '适合从本集一口气补到最新，便于理解后续联盟重组。',
	},
];

export { TOP_SLUGS, type TopSlug, topSlugTitle } from './themeHub';

export function getMovieBySlug(slug: string): Movie | undefined {
	return movies.find((m) => m.slug === slug);
}

export function getMoviesBySlug(slugs: string[]): Movie[] {
	const set = new Set(slugs);
	return movies.filter((m) => set.has(m.slug));
}

export function getMoviesByTag(tagSlug: string): Movie[] {
	return movies.filter((m) => m.tags.some((t) => t.slug === tagSlug));
}

export function getMoviesByActor(actorSlug: string): Movie[] {
	return movies.filter((m) => m.actors.some((a) => a.slug === actorSlug));
}

export function getTopMovies(slug: string): Movie[] {
	switch (slug) {
		case 'netflix':
			return getMoviesByTag('netflix').sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
		case 'suspense':
			return getMoviesByTag('suspense').sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
		case '2026-drama':
		case 'drama-2026':
			return movies
				.filter((m) => {
					if (m.year !== 2026) return false;
					const cat = (m.cate_name ?? '').trim();
					if (cat.includes('剧情')) return true;
					return m.tags.some((t) => t.slug === 'drama' || t.name.includes('剧情'));
				})
				.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
		default:
			return [];
	}
}

export function getReviewBySlug(slug: string): ReviewRecord | undefined {
	return reviews.find((r) => r.slug === slug);
}

export function findReviewForMovie(movieSlug: string): ReviewRecord | undefined {
	return reviews.find((r) => r.movie_slug === movieSlug);
}

export function getUpdateBySlug(slug: string): UpdateRecord | undefined {
	return updates.find((u) => u.slug === slug);
}

export function getUpdatesForMovie(movieSlug: string): UpdateRecord[] {
	return updates.filter((u) => u.movie_slug === movieSlug);
}

export function getAllActors(): ActorRef[] {
	const map = new Map<string, ActorRef>();
	for (const m of movies) {
		for (const a of m.actors) {
			map.set(a.slug, a);
		}
	}
	return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getAllTags(): TagRef[] {
	const map = new Map<string, TagRef>();
	for (const m of movies) {
		for (const t of m.tags) {
			map.set(t.slug, t);
		}
	}
	return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getTodayUpdates(): Movie[] {
	return [...movies]
		.sort((a, b) => new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime())
		.slice(0, 4);
}

export function getHotMovies(): Movie[] {
	return [...movies].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0)).slice(0, 6);
}

export function getHotShortDrama(): Movie[] {
	return getMoviesByTag('short-drama')
		.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
		.slice(0, 6);
}

export function getNetflixHot(): Movie[] {
	return getMoviesByTag('netflix')
		.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
		.slice(0, 6);
}

export function getAiPicks(): Movie[] {
	return [...movies].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 4);
}

export function getLatestReviews(): ReviewRecord[] {
	return [...reviews];
}

export function getHighScorePicks(): Movie[] {
	return [...movies]
		.filter((m) => m.score != null && m.score >= 8)
		.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
		.slice(0, 6);
}

export function getHotActors(): ActorRef[] {
	const heatByActor = new Map<string, { actor: ActorRef; heat: number }>();
	for (const m of movies) {
		for (const a of m.actors) {
			const prev = heatByActor.get(a.slug);
			const add = m.heat ?? 0;
			if (!prev) heatByActor.set(a.slug, { actor: a, heat: add });
			else prev.heat += add;
		}
	}
	return [...heatByActor.values()]
		.sort((x, y) => y.heat - x.heat)
		.map((x) => x.actor)
		.slice(0, 8);
}
