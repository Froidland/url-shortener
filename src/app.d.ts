// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('lucia').AuthRequest;
			session: import('lucia').Session | null;
		}
		// interface PageData {}
		// interface Platform {}
	}

	namespace Lucia {
		type Auth = import('$lib/server/lucia').Auth;
		type DatabaseUserAttributes = {
			discord_username: string;
			discord_id: string;
		};
		type DatabaseSessionAttributes = NonNullable<unknown>;
	}
}

export {};
