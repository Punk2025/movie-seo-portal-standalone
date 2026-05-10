import type { APIRoute } from 'astro';

/** 与 `astro.config` 的 `site` 一致，避免 `public/robots.txt` 写死域名与 sitemap 不一致 */
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
	const origin =
		site instanceof URL
			? site.origin
			: site
				? new URL(site).origin
				: 'https://movie-seo.example.com';
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
