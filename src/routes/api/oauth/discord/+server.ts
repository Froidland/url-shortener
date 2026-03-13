import { dev } from '$app/environment';
import { discordAuth } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';

export async function GET({ cookies }) {
	const state = generateState();
	const url = await discordAuth.createAuthorizationURL(state, {
		scopes: ['identify']
	});

	cookies.set('discord_oauth_state', state, {
		httpOnly: true,
		secure: !dev,
		path: '/',
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	redirect(302, url);
}
