import { db } from '$lib/server/db/index.js';
import { urls } from '$lib/server/db/schema.js';
import { cache } from '$lib/server/cache.js';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function DELETE({ locals, params }) {
	const user = locals.user;

	if (!user) {
		return json({ message: 'You need to log in to access this endpoint.' }, { status: 401 });
	}

	try {
		await cache.delete({ key: `slug:${params.id}` });

		await db
			.update(urls)
			.set({
				deletedAt: new Date()
			})
			.where(and(eq(urls.userId, user.id), eq(urls.slug, params.id)));
	} catch (err) {
		return json(
			{
				message:
					'An unexpected error ocurred while trying to delete the URL, please try again later.'
			},
			{ status: 500 }
		);
	}

	return new Response(null, {
		status: 200
	});
}
