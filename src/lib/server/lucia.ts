import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from './db';
import { sessions, users } from './db/schema';
import { dev } from '$app/environment';
import { Discord } from 'arctic';
import { env } from '$env/dynamic/private';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			id: attributes.discordId,
			username: attributes.discordUsername,
			isAllowedCustomSlugs: attributes.isAllowedCustomSlugs
		};
	}
});

export const discordAuth = new Discord(
	env.PRIVATE_DISCORD_CLIENT_ID,
	env.PRIVATE_DISCORD_CLIENT_SECRET,
	env.PRIVATE_DISCORD_REDIRECT_URI
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	discordId: string;
	discordUsername: string;
	isAllowedCustomSlugs: boolean;
}
