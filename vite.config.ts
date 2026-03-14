import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
	return {
		plugins: [tailwindcss(), sveltekit()],
		optimizeDeps: {
			include: ['@internationalized/date']
		},
		resolve: {
			dedupe: ['@internationalized/date']
		}
	};
});
