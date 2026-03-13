import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { discordAuth, createSession, createSessionCookie } from '$lib/server/auth.js';
import { error, redirect } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { randomBytes } from 'crypto';

export async function GET({ url, cookies }) {
	const storedState = cookies.get('discord_oauth_state');
	const state = url.searchParams.get('state');
	const code = url.searchParams.get('code');

	if (!storedState || !state || storedState !== state || !code) {
		error(400, 'Invalid state or code. Please try logging in again.');
	}

	let discordTokens;
	try {
		discordTokens = await discordAuth.validateAuthorizationCode(code);
	} catch (e) {
		console.error(e);
		if (e instanceof OAuth2RequestError) error(400, e.message);
		error(500, 'Unexpected error.');
	}

	const res = await fetch('https://discord.com/api/users/@me', {
		headers: { Authorization: `Bearer ${discordTokens.accessToken}` }
	});

	if (!res.ok) error(500, "Couldn't fetch user data from Discord.");

	const discordUser = (await res.json()) as DiscordUser;

	let existingUser = await db.query.users.findFirst({
		where: { discordId: discordUser.id }
	});

	if (!existingUser) {
		const id = randomBytes(18).toString('base64url');
		await db.insert(users).values({
			id,
			discordId: discordUser.id,
			discordUsername: discordUser.username
		});
		existingUser = await db.query.users.findFirst({ where: { id } });
	}

	if (!existingUser) error(500, 'Failed to create or retrieve user.');

	const session = await createSession(existingUser.id);
	const cookie = createSessionCookie(session);
	cookies.set(cookie.name, cookie.value, cookie.attributes);

	redirect(302, '/');
}

type DiscordUser = {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	public_flags: number;
	premium_type: number;
	flags: number;
	banner: string | null;
	accent_color: number;
	global_name: string | null;
	avatar_decoration_data: unknown;
	banner_color: string;
	mfa_enabled: boolean;
	locale: string;
};
