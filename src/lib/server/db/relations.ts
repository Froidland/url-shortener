import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
	urls: {
		clicks: r.many.clicks({
			from: r.urls.slug,
			to: r.clicks.urlSlug
		})
	},
	clicks: {
		url: r.one.urls({
			from: r.clicks.urlSlug,
			to: r.urls.slug
		})
	}
}));
