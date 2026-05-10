import type { APIRoute } from 'astro';
import { getSearchGuidePayloadFresh } from '../../../lib/search-guide-payload';

export const prerender = false;

/** 运行期刷新「搜影片」弱引导池，与后台弱引导开关同步 */
export const GET: APIRoute = async () => {
	try {
		const items = await getSearchGuidePayloadFresh();
		return new Response(JSON.stringify(items), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	} catch {
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	}
};
