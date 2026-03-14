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
			.orderBy(desc(count())),

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

	const dayLookup = Object.fromEntries(overTime.map((r) => [r.date, r.count]));
	let filledDays: { date: string; count: number }[];

	if (range) {
		filledDays = Array.from({ length: range }, (_, i) => {
			const d = new Date(Date.now() - (range - 1 - i) * 24 * 60 * 60 * 1000);
			const key = d.toISOString().slice(0, 10);
			return { date: key, count: dayLookup[key] ?? 0 };
		});
	} else if (overTime.length > 0) {
		const first = new Date(overTime[0].date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const days = Math.round((today.getTime() - first.getTime()) / (24 * 60 * 60 * 1000)) + 1;
		filledDays = Array.from({ length: days }, (_, i) => {
			const d = new Date(first.getTime() + i * 24 * 60 * 60 * 1000);
			const key = d.toISOString().slice(0, 10);
			return { date: key, count: dayLookup[key] ?? 0 };
		});
	} else {
		filledDays = [];
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
