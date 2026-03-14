import { db } from '$lib/server/db';
import { clicks, urls } from '$lib/server/db/schema';
import { and, desc, eq, gte, count, sql } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

const RANGE_OPTIONS = [7, 30, 90, null] as const;
type Range = (typeof RANGE_OPTIONS)[number]; // null = all time

async function buildStats(slug: string, range: Range) {
	const since = range ? new Date(Date.now() - range * 24 * 60 * 60 * 1000) : null;
	const base = eq(clicks.urlSlug, slug);
	const where = since ? and(base, gte(clicks.createdAt, since)) : base;

	const [overTime, byCountry, byHour] = await Promise.all([
		db
			.select({
				date: sql<string>`date_trunc('day', ${clicks.createdAt})::date::text`,
				count: count()
			})
			.from(clicks)
			.where(where)
			.groupBy(sql`date_trunc('day', ${clicks.createdAt})`)
			.orderBy(sql`date_trunc('day', ${clicks.createdAt})`),

		db
			.select({ country: clicks.country, count: count() })
			.from(clicks)
			.where(where)
			.groupBy(clicks.country)
			.orderBy(desc(count()))
			.limit(15),

		db
			.select({
				hour: sql<number>`extract(hour from ${clicks.createdAt})::int`,
				count: count()
			})
			.from(clicks)
			.where(where)
			.groupBy(sql`extract(hour from ${clicks.createdAt})`)
			.orderBy(sql`extract(hour from ${clicks.createdAt})`)
	]);

	// For all time, use the actual date range from the data rather than filling gaps
	let filledDays: { date: string; count: number }[];
	if (range) {
		const dayLookup = Object.fromEntries(overTime.map((r) => [r.date, r.count]));
		filledDays = Array.from({ length: range }, (_, i) => {
			const d = new Date(Date.now() - (range - 1 - i) * 24 * 60 * 60 * 1000);
			const key = d.toISOString().slice(0, 10);
			return { date: key, count: dayLookup[key] ?? 0 };
		});
	} else {
		filledDays = overTime.map((r) => ({ date: r.date, count: r.count }));
	}

	const hourLookup = Object.fromEntries(byHour.map((r) => [r.hour, r.count]));

	return {
		overTime: filledDays,
		byCountry: byCountry.map((r) => ({ country: r.country ?? 'Unknown', count: r.count })),
		byHour: Array.from({ length: 24 }, (_, h) => ({ hour: h, count: hourLookup[h] ?? 0 }))
	};
}

export async function load({ locals, params, url }) {
	if (!locals.user) redirect(302, '/api/oauth/discord');

	const urlRow = await db.query.urls.findFirst({
		where: { slug: params.slug, userId: locals.user.id }
	});

	if (!urlRow) error(404, 'URL not found');

	const rawDays = url.searchParams.get('days');
	const range: Range =
		rawDays === 'all'
			? null
			: [7, 30, 90].includes(Number(rawDays))
				? (Number(rawDays) as Range)
				: 30;

	const stats = await buildStats(params.slug, range);

	return {
		url: { slug: urlRow.slug, destination: urlRow.destination },
		range,
		rangeOptions: RANGE_OPTIONS,
		...stats
	};
}
