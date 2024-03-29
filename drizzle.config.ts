import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle/migrations',
	driver: 'mysql2',
	dbCredentials: {
		uri: process.env.PRIVATE_DATABASE_URL
	},
	breakpoints: false
} satisfies Config;
