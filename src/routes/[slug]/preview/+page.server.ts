import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	let url;
	try {
		url = await db.query.urls.findFirst({
			where: {
				slug: params.slug,
				deletedAt: { isNull: true }
			}
		});
	} catch (err) {
		console.log(err);

		error(500, {
			message: 'An error occurred while trying to fetch the URL.'
		});
	}

	if (!url) {
		error(404, {
			message: 'The URL you are looking for does not exist.'
		});
	}

	return {
		url
	};
}
