import posthog from 'posthog-js';
import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';

export const load = async ({ data }) => {
	if (browser && !dev) {
		posthog.init(env.PUBLIC_POSTHOG_WRITE_API_KEY, {
			api_host: env.PUBLIC_POSTHOG_API_HOST,
			person_profiles: 'always'
		});
	}

	return {
		...data
	};
};
