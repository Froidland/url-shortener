import { invalidateSession, createBlankSessionCookie, SESSION_COOKIE_NAME } from '$lib/server/auth';

export async function GET({ locals, cookies }) {
	const session = locals.session;

	if (!session) {
		return new Response(null, { status: 401 });
	}

	try {
		await invalidateSession(session.id);
	} catch (error) {
		console.error(error);
		return new Response(null, { status: 500 });
	}

	const cookie = createBlankSessionCookie();
	cookies.set(cookie.name, cookie.value, cookie.attributes);

	return new Response(null, {
		status: 302,
		headers: { Location: '/' }
	});
}
