<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>URL Preview | {data.url.slug}</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center">
	<div class="w-full max-w-md border border-zinc-800 bg-zinc-900 p-6">
		<p class="mb-4 text-xs font-medium tracking-widest text-zinc-500 uppercase">Redirect preview</p>
		<p class="mb-3 text-sm text-zinc-400">This short URL redirects to:</p>
		<a
			href={data.url.destination}
			target="_blank"
			class="block text-sm break-all text-green-400 underline underline-offset-2 transition-colors hover:text-green-300"
		>
			{data.url.destination}
		</a>
		<div class="mt-6 border-t border-zinc-800 pt-4">
			<a
				href={data.url.destination}
				target="_blank"
				class="btn btn-primary inline-flex cursor-pointer"
				style="height: 2.25rem; padding: 0 1rem;">Continue &rarr;</a
			>
		</div>
	</div>
</div>
