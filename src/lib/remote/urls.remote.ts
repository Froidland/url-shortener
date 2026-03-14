import { getRequestEvent, query, command } from '$app/server';
import { db } from '$lib/server/db';
import { cache } from '$lib/server/cache';
import { and, desc, eq, isNull, count, sql, gte } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { clicks, urls } from '$lib/server/db/schema';

import { z } from 'zod/v4';

const schema = z.object({
	limit: z.number().min(1).max(50).default(10),
	offset: z.number().min(0).default(0)
});

export const getUrls = query(schema, async ({ limit, offset }) => {
	const req = getRequestEvent();
	const user = req.locals.user;

	if (!user) {
		redirect(302, '/api/oauth/discord');
	}

	const urlData = db
		.select({
			slug: urls.slug,
			destination: urls.destination,
			createdAt: urls.createdAt,
			clicks:
				sql<number>`(select count(*) from ${clicks} where ${clicks.urlSlug} = ${urls.slug})`.as(
					'clicks'
				)
		})
		.from(urls)
		.where(and(eq(urls.userId, user.id), isNull(urls.deletedAt)))
		.orderBy(desc(urls.createdAt))
		.limit(limit)
		.offset(offset);

	const urlCount = db
		.select({
			count: count()
		})
		.from(urls)
		.where(and(eq(urls.userId, user.id), isNull(urls.deletedAt)));

	return {
		urls: await urlData,
		total: await urlCount,
		limit,
		offset
	};
});

const slugSchema = z.object({ slug: z.string() });

export const getClicksByCountry = query(slugSchema, async ({ slug }) => {
	const req = getRequestEvent();
	const user = req.locals.user;

	if (!user) {
		error(401, 'Unauthorized');
	}

	const url = await db.query.urls.findFirst({
		where: { slug, userId: user.id }
	});

	if (!url) {
		error(404, 'URL not found');
	}

	const rows = await db
		.select({ country: clicks.country, count: count() })
		.from(clicks)
		.where(eq(clicks.urlSlug, slug))
		.groupBy(clicks.country);

	return rows.map((r) => ({
		country: r.country ?? 'unknown',
		count: r.count
	}));
});

export const getUrlStats = query(
	z.object({ slug: z.string(), days: z.number().min(7).max(365).default(30) }),
	async ({ slug, days }) => {
		const req = getRequestEvent();
		const user = req.locals.user;

		if (!user) error(401, 'Unauthorized');

		const url = await db.query.urls.findFirst({ where: { slug, userId: user.id } });
		if (!url) error(404, 'URL not found');

		const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

		const [overTime, byCountry, byHour] = await Promise.all([
			db
				.select({
					date: sql<string>`date_trunc('day', ${clicks.createdAt})::date::text`,
					count: count()
				})
				.from(clicks)
				.where(and(eq(clicks.urlSlug, slug), gte(clicks.createdAt, since)))
				.groupBy(sql`date_trunc('day', ${clicks.createdAt})`)
				.orderBy(sql`date_trunc('day', ${clicks.createdAt})`),

			db
				.select({ country: clicks.country, count: count() })
				.from(clicks)
				.where(and(eq(clicks.urlSlug, slug), gte(clicks.createdAt, since)))
				.groupBy(clicks.country)
				.orderBy(desc(count()))
				.limit(15),

			db
				.select({
					hour: sql<number>`extract(hour from ${clicks.createdAt})::int`,
					count: count()
				})
				.from(clicks)
				.where(and(eq(clicks.urlSlug, slug), gte(clicks.createdAt, since)))
				.groupBy(sql`extract(hour from ${clicks.createdAt})`)
				.orderBy(sql`extract(hour from ${clicks.createdAt})`)
		]);

		const lookup = Object.fromEntries(overTime.map((r) => [r.date, r.count]));
		const filledDays = Array.from({ length: days }, (_, i) => {
			const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
			const key = d.toISOString().slice(0, 10);
			return { date: key, count: lookup[key] ?? 0 };
		});

		const hourLookup = Object.fromEntries(byHour.map((r) => [r.hour, r.count]));
		const filledHours = Array.from({ length: 24 }, (_, h) => ({
			hour: h,
			count: hourLookup[h] ?? 0
		}));

		return {
			url: { slug: url.slug, destination: url.destination },
			overTime: filledDays,
			byCountry: byCountry.map((r) => ({ country: r.country ?? 'Unknown', count: r.count })),
			byHour: filledHours
		};
	}
);

const deleteSchema = slugSchema;

export const deleteUrl = command(deleteSchema, async ({ slug }) => {
	const req = getRequestEvent();
	const user = req.locals.user;

	if (!user) {
		error(401, 'Unauthorized');
	}

	await cache.delete({ key: `slug:${slug}` });

	await db
		.update(urls)
		.set({ deletedAt: new Date() })
		.where(and(eq(urls.userId, user.id), eq(urls.slug, slug)));

	const limit = Number(req.url.searchParams.get('limit')) || 10;
	const offset = Number(req.url.searchParams.get('offset')) || 0;
	getUrls({ limit, offset }).refresh();
});
