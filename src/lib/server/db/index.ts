import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { relations } from './relations';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export const db = drizzle({
	connection: env.PRIVATE_DATABASE_URL,
	schema,
	relations,
	logger: dev
});
