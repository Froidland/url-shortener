import { fail, message, superValidate } from 'sveltekit-superforms';
import { randomInt } from 'crypto';
import { db } from '$lib/server/db';
import { urls } from '$lib/server/db/schema';
import { schema } from './schema.js';
import { zod4 } from 'sveltekit-superforms/adapters';

const SLUG_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DISALLOWED_SLUGS = ['api', 'profile'];

function generateRandomString(length: number, alphabet: string): string {
	return Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('');
}

export async function load() {
	return {
		form: await superValidate(zod4(schema))
	};
}

export const actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!locals.user?.isAllowedCustomSlugs && form.data.slug !== '') {
			return fail(403, {
				form: { ...form, errors: { slug: ['Your account is not allowed to use custom slugs.'] } }
			});
		}

		if (DISALLOWED_SLUGS.includes(form.data.slug)) {
			return fail(400, {
				form: { ...form, errors: { slug: ['This slug is reserved.'] } }
			});
		}

		const slug = form.data.slug || generateRandomString(12, SLUG_ALPHABET);

		try {
			await db.insert(urls).values({
				slug,
				destination: form.data.destination,
				userId: locals.user?.id
			});
		} catch (err) {
			// @ts-expect-error yes yes I know err is of type unknown
			if (err.code === 'ER_DUP_ENTRY') {
				return fail(400, {
					form: { ...form, errors: { slug: ['This slug is already in use.'] } }
				});
			}

			console.log(err);
			return fail(500, { form });
		}

		return message(form, slug);
	}
};
