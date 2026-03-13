import { getRequestEvent, command } from '$app/server';
import { invalidateSession, createBlankSessionCookie } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const logout = command(async () => {
	const req = getRequestEvent();
	const session = req.locals.session;

	if (!session) {
		error(401, 'Not logged in');
	}

	await invalidateSession(session.id);

	const cookie = createBlankSessionCookie();
	req.cookies.set(cookie.name, cookie.value, cookie.attributes);
});
