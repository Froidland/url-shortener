import { sql } from 'drizzle-orm';
import { index, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', (t) => ({
	id: t.varchar({ length: 24 }).primaryKey(),
	discordId: t.varchar({ length: 255 }).notNull(),
	discordUsername: t.varchar({ length: 255 }).notNull(),
	isAllowedCustomSlugs: t.boolean().default(false).notNull(),
	createdAt: t.timestamp({ mode: 'date' }).notNull().defaultNow(),
	updatedAt: t.timestamp({ mode: 'date' }).default(sql`now()`)
}));

export const sessions = pgTable('sessions', (t) => ({
	id: t.varchar({ length: 255 }).primaryKey(),
	userId: t
		.varchar({ length: 24 })
		.notNull()
		.references(() => users.id),
	expiresAt: t.timestamp().notNull()
}));

export const urls = pgTable(
	'urls',
	(t) => ({
		slug: t.varchar({ length: 255 }).primaryKey(),
		destination: t.varchar({ length: 2048 }).notNull(),
		userId: t.varchar({ length: 24 }).references(() => users.id, { onDelete: 'set null' }),
		createdAt: t.timestamp({ mode: 'date' }).notNull().defaultNow(),
		deletedAt: t.timestamp({ mode: 'date' })
	}),
	(t) => [index('slug_idx').on(t.slug), index('user_id_idx').on(t.userId)]
);

export const clicks = pgTable(
	'clicks',
	(t) => ({
		id: t.serial().primaryKey(),
		urlSlug: t.varchar({ length: 255 }).references(() => urls.slug),
		ip: t.varchar({ length: 255 }),
		country: t.varchar({ length: 255 }),
		city: t.varchar({ length: 255 }),
		createdAt: t.timestamp({ mode: 'date' }).notNull().defaultNow()
	}),
	(t) => [index('url_slug_idx').on(t.urlSlug)]
);
