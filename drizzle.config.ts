import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.PRIVATE_DATABASE_URL!
	},
	schema: './src/lib/server/db/schema.ts',
	migrations: {
		table: 'migrations',
		schema: './src/lib/server/db/schema.ts'
	},
	out: './src/lib/server/db/migrations/',
	strict: true,
	verbose: true
});
