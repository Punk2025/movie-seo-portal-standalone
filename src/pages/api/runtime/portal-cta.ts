import type { APIRoute } from 'astro';
import {
	getNiuniuClientFromEnv,
	isNiuniuConfigured,
	loadMovieFromNiuniu,
} from '../../../data/niuniu-build';

export const prerender = false;

/** 运行期拉取弱引导区块（用查询参数避免 `/[slug]` 触发的 getStaticPaths 校验） */
export const GET: APIRoute = async ({ url }) => {
	const slug = url.searchParams.get('slug');
	if (!slug || typeof slug !== 'string') {
		return new Response(JSON.stringify({ links: null }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (!isNiuniuConfigured()) {
		return new Response(JSON.stringify({ links: null }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	}

	try {
		const cfg = getNiuniuClientFromEnv();
		const movie = await loadMovieFromNiuniu(cfg, slug);
		const raw = movie?.portal_cta?.links;
		const links = Array.isArray(raw) && raw.length > 0 ? raw : null;
		return new Response(JSON.stringify({ links }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	} catch {
		return new Response(JSON.stringify({ links: null }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	}
};
