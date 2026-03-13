import { db } from './db';
import { sessions, users } from './db/schema';
import { eq } from 'drizzle-orm';
import { dev } from '$app/environment';
import { randomBytes } from 'crypto';
import { Discord } from 'arctic';
import { env } from '$env/dynamic/private';

export const SESSION_COOKIE_NAME = 'auth_session';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_REFRESH_MS = SESSION_TTL_MS / 2;

export type SessionUser = {
	id: string;
	discordId: string;
	discordUsername: string;
	isAllowedCustomSlugs: boolean;
};

export type Session = {
	id: string;
	expiresAt: Date;
	fresh: boolean;
};

function generateSessionId(): string {
	return randomBytes(18).toString('base64url');
}

function cookieAttributes(expiresAt: Date) {
	return {
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax' as const,
		path: '/',
		expires: expiresAt
	};
}

export async function createSession(userId: string): Promise<Session> {
	const id = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
	await db.insert(sessions).values({ id, userId, expiresAt });
	return { id, expiresAt, fresh: false };
}

export async function validateSession(
	sessionId: string
): Promise<{ session: Session; user: SessionUser } | { session: null; user: null }> {
	const session = await db.query.sessions.findFirst({
		where: { id: sessionId }
	});

	if (!session || session.expiresAt < new Date()) {
		if (session) await db.delete(sessions).where(eq(sessions.id, sessionId));
		return { session: null, user: null };
	}

	const user = await db.query.users.findFirst({ where: { id: session.userId } });
	if (!user) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return { session: null, user: null };
	}

	let fresh = false;
	if (session.expiresAt.getTime() - Date.now() < SESSION_REFRESH_MS) {
		const newExpiry = new Date(Date.now() + SESSION_TTL_MS);
		await db.update(sessions).set({ expiresAt: newExpiry }).where(eq(sessions.id, sessionId));
		session.expiresAt = newExpiry;
		fresh = true;
	}

	return {
		session: { id: session.id, expiresAt: session.expiresAt, fresh },
		user: {
			id: user.id,
			discordId: user.discordId,
			discordUsername: user.discordUsername,
			isAllowedCustomSlugs: user.isAllowedCustomSlugs
		}
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function createSessionCookie(session: Session) {
	return {
		name: SESSION_COOKIE_NAME,
		value: session.id,
		attributes: cookieAttributes(session.expiresAt)
	};
}

export function createBlankSessionCookie() {
	return {
		name: SESSION_COOKIE_NAME,
		value: '',
		attributes: cookieAttributes(new Date(0))
	};
}

export const discordAuth = new Discord(
	env.PRIVATE_DISCORD_CLIENT_ID,
	env.PRIVATE_DISCORD_CLIENT_SECRET,
	env.PRIVATE_DISCORD_REDIRECT_URI
);
