/** 构建期 slug → vid（ hyphen 路由下 slug 含 `-` 时详情改用 vid 拉 `message.movie`） */

const slugToVid = new Map<string, string>();

export function clearNiuniuSlugVidRegistry(): void {
	slugToVid.clear();
}

export function registerNiuniuSlugVid(slug: string, vid: number | string): void {
	slugToVid.set(slug, String(vid));
}

export function getNiuniuVidForSlug(slug: string): string | undefined {
	return slugToVid.get(slug);
}
