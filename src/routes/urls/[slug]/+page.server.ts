import { db } from '$lib/server/db';
import { clicks, urls } from '$lib/server/db/schema';
import { and, desc, eq, gte, lte, count, sql } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

async function buildStats(slug: string, from: Date | null, to: Date | null) {
	const base = eq(clicks.urlSlug, slug);
	const conditions = [base];
	if (from) conditions.push(gte(clicks.createdAt, from));
	if (to) conditions.push(lte(clicks.createdAt, to));
	const where = and(...conditions);

	const [overTime, byCountry] = await Promise.all([
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
	]);

	const dayLookup = Object.fromEntries(overTime.map((r) => [r.date, r.count]));
	let filledDays: { date: string; count: number }[];

	if (from && to) {
		const days = Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
		filledDays = Array.from({ length: days }, (_, i) => {
			const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
			const key = d.toISOString().slice(0, 10);
			return { date: key, count: dayLookup[key] ?? 0 };
		});
	} else if (from) {
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		const days = Math.round((today.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
		filledDays = Array.from({ length: days }, (_, i) => {
			const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
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

	return {
		overTime: filledDays,
		byCountry: byCountry.map((r) => ({ country: r.country ?? 'Unknown', count: r.count }))
	};
}

function parseDate(str: string | null): Date | null {
	if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
	const d = new Date(str + 'T00:00:00.000Z');
	return isNaN(d.getTime()) ? null : d;
}

export async function load({ locals, params, url }) {
	if (!locals.user) redirect(302, '/api/oauth/discord');

	const urlRow = await db.query.urls.findFirst({
		where: { slug: params.slug, userId: locals.user.id }
	});

	if (!urlRow) error(404, 'URL not found');

	const rawFrom = url.searchParams.get('from');
	const allTime = rawFrom === 'all';
	const from = allTime ? null : parseDate(rawFrom);
	// Default: last 30 days (only when no from param at all)
	const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	defaultFrom.setHours(0, 0, 0, 0);
	const effectiveFrom = allTime ? null : (from ?? defaultFrom);

	const to = parseDate(url.searchParams.get('to'));
	const effectiveTo = to ? new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1) : null;

	const stats = await buildStats(params.slug, effectiveFrom, effectiveTo);

	return {
		url: { slug: urlRow.slug, destination: urlRow.destination },
		from: allTime ? 'all' : effectiveFrom!.toISOString().slice(0, 10),
		to: effectiveTo ? effectiveTo.toISOString().slice(0, 10) : null,
		...stats
	};
}
