<script lang="ts">
	import { page } from '$app/state';
	import dayJs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import UrlTable from '$lib/components/UrlTable.svelte';
	import { getUrls } from '$lib/remote/urls.remote';
	dayJs.extend(relativeTime);

	let limit = $derived(Number(page.url.searchParams.get('limit')) || 10);
	let offset = $derived(Number(page.url.searchParams.get('offset')) || 0);

	let data = $derived(await getUrls({ limit, offset }));

	let totalPages = $derived(Math.ceil(data.total[0].count / limit));
	let currentPage = $derived((Number(page.url.searchParams.get('offset')) || 0) / limit);
</script>

<svelte:head>
	<title>My profile</title>
</svelte:head>

<div>
	<div class="mb-5 flex items-baseline justify-between">
		<h1 class="text-base font-medium tracking-tight text-zinc-100">Created URLs</h1>
		<p class="text-xs text-zinc-600">Click a slug to copy the short URL.</p>
	</div>

	<UrlTable data={data.urls} />

	{#if totalPages > 1}
		<div class="mt-4 flex items-center gap-1">
			{#each Array(totalPages) as _, index}
				<a
					class="inline-flex h-8 w-8 items-center justify-center border text-xs font-medium transition-colors {currentPage ===
					index
						? 'border-zinc-100 bg-zinc-100 text-zinc-950'
						: 'border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}"
					href="/profile?limit={limit}&offset={limit * index}">{index + 1}</a
				>
			{/each}
		</div>
	{/if}
</div>
