<script lang="ts">
	import Charts from './Charts.svelte';
	import ClickMap from '$lib/components/ClickMap.svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.url.slug} — Stats</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8">
	<div class="flex items-start justify-between gap-4">
		<div>
			<a
				href={resolve('/urls')}
				class="mb-2 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
				>← Back</a
			>
			<h1 class="text-base font-medium text-zinc-100">{data.url.slug}</h1>
			<a
				href={data.url.destination}
				target="_blank"
				class="mt-0.5 inline text-xs break-all text-zinc-500 transition-colors hover:text-zinc-300"
				>{data.url.destination}</a
			>
		</div>

		<div class="flex shrink-0 items-center gap-px">
			{#each data.rangeOptions as r}
				<a
					href="?days={r ?? 'all'}"
					class="border border-zinc-800 px-3 py-1.5 text-xs font-medium transition-colors {data.range ===
					r
						? 'border-zinc-100 bg-zinc-100 text-zinc-950'
						: 'bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}"
					>{r === null ? 'All' : `${r}d`}</a
				>
			{/each}
		</div>
	</div>

	<section>
		<h2 class="mb-3 text-xs font-medium tracking-widest text-zinc-500 uppercase">Click map</h2>
		<div class="border border-zinc-800">
			<ClickMap data={data.byCountry} />
		</div>
	</section>

	<Charts overTime={data.overTime} byCountry={data.byCountry} />
</div>
