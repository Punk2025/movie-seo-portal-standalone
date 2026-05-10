/** 页脚「社交媒体」：配置 `PUBLIC_SOCIAL_*` 完整 https URL 后才展示（分享到微信/QQ 等时便于用户找到主页） */

const SOCIAL_ENV_KEYS: Record<string, string> = {
	微博: 'PUBLIC_SOCIAL_WEIBO',
	微信公众号: 'PUBLIC_SOCIAL_WECHAT_ARTICLE',
	Telegram: 'PUBLIC_SOCIAL_TELEGRAM',
	WhatsApp: 'PUBLIC_SOCIAL_WHATSAPP',
	Facebook: 'PUBLIC_SOCIAL_FACEBOOK',
	'X（Twitter）': 'PUBLIC_SOCIAL_X',
	'QQ 频道': 'PUBLIC_SOCIAL_QQ',
	哔哩哔哩: 'PUBLIC_SOCIAL_BILIBILI',
};

export interface PublicSocialLink {
	label: string;
	href: string;
}

export function getPublicSocialLinks(): PublicSocialLink[] {
	const env = import.meta.env as Record<string, string | undefined>;
	const out: PublicSocialLink[] = [];
	for (const [label, varName] of Object.entries(SOCIAL_ENV_KEYS)) {
		const href = env[varName];
		if (typeof href === 'string' && /^https?:\/\//i.test(href.trim())) {
			out.push({ label, href: href.trim() });
		}
	}
	return out;
}
