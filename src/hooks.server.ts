import {
	SESSION_COOKIE_NAME,
	validateSession,
	createSessionCookie,
	createBlankSessionCookie
} from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return applySecurityHeaders(await resolve(event));
	}

	const { session, user } = await validateSession(sessionId);

	if (session?.fresh) {
		const cookie = createSessionCookie(session);
		event.cookies.set(cookie.name, cookie.value, cookie.attributes);
	}

	if (!session) {
		const cookie = createBlankSessionCookie();
		event.cookies.set(cookie.name, cookie.value, cookie.attributes);
	}

	event.locals.user = user;
	event.locals.session = session;
	event.request.headers.set(
		'x-forwarded-for',
		event.request.headers.get('x-forwarded-for') || event.getClientAddress()
	);

	const response = await resolve(event);

	return applySecurityHeaders(response);
};

function applySecurityHeaders(response: Response) {
	response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Strict-Transport-Security', 'max-age=604800; includeSubDomains');

	return response;
}
