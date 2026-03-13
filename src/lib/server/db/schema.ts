import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: varchar('id', {
		length: 24
	}).primaryKey(),

	discordId: varchar('discord_id', { length: 255 }).notNull(),
	discordUsername: varchar('discord_username', { length: 255 }).notNull(),

	isAllowedCustomSlugs: boolean('is_allowed_custom_slugs').default(false).notNull(),

	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).default(sql`now()`)
});

export const sessions = pgTable('sessions', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 24
	})
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at').notNull()
});

export const urls = pgTable(
	'urls',
	{
		slug: varchar('slug', { length: 255 }).primaryKey(),

		destination: varchar('destination', { length: 2048 }).notNull(),

		userId: varchar('user_id', { length: 24 }).references(() => users.id, {
			onDelete: 'set null'
		}),

		createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
		deletedAt: timestamp('deleted_at', { mode: 'date' })
	},
	(self) => {
		return {
			slugIndex: index('slug_idx').on(self.slug),
			userIdIndex: index('user_id_idx').on(self.userId)
		};
	}
);

export const clicks = pgTable(
	'clicks',
	{
		id: serial('id').primaryKey(),
		urlSlug: varchar('url_slug', { length: 255 }).references(() => urls.slug),
		ip: varchar('ip', { length: 255 }),
		country: varchar('country', { length: 255 }),
		city: varchar('city', { length: 255 }),
		createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow()
	},
	(self) => {
		return {
			urlSlugIndex: index('url_slug_idx').on(self.urlSlug)
		};
	}
);
