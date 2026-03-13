import { db } from '$lib/server/db';
import { clicks } from '$lib/server/db/schema.js';
import { cache } from '$lib/server/cache';
import { error } from '@sveltejs/kit';

export async function GET({ params, request }) {
	const destination = await cache.getOrSet({
		key: `slug:${params.slug}`,
		ttl: '1h',
		factory: async () => {
			const url = await db.query.urls.findFirst({
				where: {
					slug: params.slug,
					deletedAt: { isNull: true }
				}
			});

			if (!url) return null;

			return url.destination;
		}
	});

	if (!destination) {
		error(404, {
			message: 'The URL you are looking for does not exist.'
		});
	}

	db.insert(clicks)
		.values({
			urlSlug: params.slug,
			ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null,
			country: request.headers.get('cf-ipcountry') || request.headers.get('geoip-country') || null,
			city: request.headers.get('cf-ipcity') || request.headers.get('geoip-city') || null
		})
		.execute()
		.catch(console.error);

	return new Response(null, {
		status: 302,
		headers: {
			Location: destination
		}
	});
}
