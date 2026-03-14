<script lang="ts">
	import { page } from '$app/state';
	import { Trash2 } from '$lib/components/icons';
	import * as Table from '$lib/components/ui/table';
	import { deleteUrl } from '$lib/remote/urls.remote';
	import { toast } from 'svelte-sonner';

	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

	function fromNow(date: Date): string {
		const seconds = Math.round((date.getTime() - Date.now()) / 1000);
		const units: [Intl.RelativeTimeFormatUnit, number][] = [
			['year', 60 * 60 * 24 * 365],
			['month', 60 * 60 * 24 * 30],
			['week', 60 * 60 * 24 * 7],
			['day', 60 * 60 * 24],
			['hour', 60 * 60],
			['minute', 60],
			['second', 1]
		];
		for (const [unit, threshold] of units) {
			if (Math.abs(seconds) >= threshold) return rtf.format(Math.round(seconds / threshold), unit);
		}
		return 'just now';
	}

	async function deleteEntry(slug: string) {
		toast.promise(deleteUrl({ slug }), {
			loading: 'Deleting URL...',
			success: 'URL deleted!',
			error: 'An error occurred while deleting the URL.'
		});
	}

	async function copyUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			toast.error('An error occurred while copying the URL.');
			return;
		}

		toast.success('URL copied!');
	}

	type Props = {
		data: {
			slug: string;
			destination: string;
			clicks: number;
			createdAt: Date;
		}[];
	};

	let { data }: Props = $props();

	let host = $derived(page.url.origin);
</script>

<Table.Root class="w-full border border-zinc-800">
	<Table.Header>
		<Table.Row class="border-b border-zinc-800 bg-zinc-900">
			<Table.Head
				class="w-52 border-r border-zinc-800 px-4 py-2.5 text-xs font-medium tracking-widest text-zinc-500 uppercase"
				>Slug</Table.Head
			>
			<Table.Head
				class="border-r border-zinc-800 px-4 py-2.5 text-xs font-medium tracking-widest text-zinc-500 uppercase"
				>URL</Table.Head
			>
			<Table.Head
				class="w-36 border-r border-zinc-800 px-4 py-2.5 text-xs font-medium tracking-widest text-zinc-500 uppercase"
				>When</Table.Head
			>
			<Table.Head
				class="w-20 border-r border-zinc-800 px-4 py-2.5 text-center text-xs font-medium tracking-widest text-zinc-500 uppercase"
				>Clicks</Table.Head
			>
			<Table.Head
				class="w-20 px-4 py-2.5 text-center text-xs font-medium tracking-widest text-zinc-500 uppercase"
				>Del</Table.Head
			>
		</Table.Row>
	</Table.Header>
	{#if data.length === 0}
		<Table.Body>
			<Table.Row class="bg-zinc-950">
				<Table.Cell colspan={5} class="px-4 py-8 text-center text-xs text-zinc-600">
					No short URLs yet.
				</Table.Cell>
			</Table.Row>
		</Table.Body>
	{:else}
		<Table.Body>
			{#each data as url, i}
				<Table.Row
					class="border-b border-zinc-800 bg-zinc-950 transition-colors last:border-b-0 hover:bg-zinc-900"
				>
					<Table.Cell class="border-r border-zinc-800 px-4 py-2.5 font-medium">
						<button
							type="button"
							onclick={() => copyUrl(`${host}/${url.slug}`)}
							class="cursor-pointer text-xs font-medium text-green-400 transition-colors select-none hover:text-green-300 active:text-green-500"
						>
							{url.slug}
						</button>
					</Table.Cell>
					<Table.Cell class="border-r border-zinc-800 px-4 py-2.5">
						<a
							href={url.destination}
							target="_blank"
							class="line-clamp-1 text-xs break-all text-zinc-400 transition-colors hover:text-zinc-300"
							>{url.destination}</a
						>
					</Table.Cell>
					<Table.Cell class="border-r border-zinc-800 px-4 py-2.5 text-xs text-zinc-500">
						{fromNow(url.createdAt)}
					</Table.Cell>
					<Table.Cell
						class="border-r border-zinc-800 px-4 py-2.5 text-center text-xs text-zinc-400"
					>
						{url.clicks}
					</Table.Cell>
					<Table.Cell class="px-4 py-2.5 text-center">
						<button
							onclick={() => deleteEntry(url.slug)}
							class="btn btn-destructive group inline-flex h-7 w-7 cursor-pointer items-center justify-center p-0"
							><Trash2
								size="14"
								class="text-red-600 transition-colors group-hover:text-red-400"
							/></button
						>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	{/if}
</Table.Root>
