<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import dayJs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { invalidateAll } from '$app/navigation';
	import { Trash2 } from '$lib/components/icons';
	import toast from 'svelte-french-toast';
	dayJs.extend(relativeTime);

	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let host = $derived(page.url.origin);
	let limit = $derived(Number(page.url.searchParams.get('limit')) || 10);
	let totalPages = $derived(Math.ceil(data.total[0].count / limit));
	let currentPage = $derived((Number(page.url.searchParams.get('skip')) || 0) / limit);

	async function deleteEntry(slug: string) {
		toast.promise(
			(async () => {
				const res = await fetch(`/api/url/${slug}`, {
					method: 'DELETE'
				});

				if (!res.ok) {
					throw new Error('An error occurred while deleting the URL.');
				}

				await invalidateAll();
			})(),
			{
				loading: 'Deleting URL...',
				success: 'URL deleted!',
				error: 'An error occurred while deleting the URL.'
			},
			{
				style: 'background: #18181B; color: #fff;'
			}
		);
	}

	async function copyUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
		} catch (error) {
			toast.error('An error occurred while copying the URL.', {
				style: 'background: #18181B; color: #fff;'
			});

			return;
		}

		toast.success('URL copied!', {
			style: 'background: #18181B; color: #fff;'
		});
	}
</script>

<svelte:head>
	<title>My profile</title>
</svelte:head>

<!-- Add limit dropdown -->
<div class="rounded bg-zinc-800 p-3">
	<h1 class="mb-4 text-center text-4xl font-light">Created URLs</h1>
	<Table.Root class="w-full">
		<Table.Header class="bg-zinc-700">
			<Table.Row>
				<Table.Head class="w-62.5 rounded-tl border-r border-dotted border-zinc-500 px-4 py-2"
					>Slug</Table.Head
				>
				<Table.Head class="border-r border-dotted border-zinc-500 px-4 py-2">URL</Table.Head>
				<Table.Head class="w-43.75 border-r border-dotted border-zinc-500 px-4 py-2"
					>When</Table.Head
				>
				<Table.Head class="w-18.75 border-r border-dotted border-zinc-500 px-4 py-2">
					Clicks
				</Table.Head>
				<Table.Head class="w-37.5 rounded-tr border-dotted border-zinc-500 px-4 py-2 text-center"
					>Actions</Table.Head
				>
			</Table.Row>
		</Table.Header>
		{#if data.urls.length === 0}
			<Table.Body class="bg-zinc-900">
				<Table.Row>
					<Table.Cell colspan={5} class="rounded-b text-center font-medium">
						<p>You haven't created any short URLs yet.</p>
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		{:else}
			<Table.Body class="bg-zinc-900">
				{#each data.urls as url, i}
					<Table.Row>
						<Table.Cell
							class="border-r border-dotted border-zinc-500 px-4 py-2 font-medium {i ===
							data.urls.length - 1
								? 'rounded-bl'
								: ''}"
							><button
								type="button"
								onclick={() => copyUrl(`${host}/${url.slug}`)}
								class="cursor-pointer transition-colors select-none hover:text-blue-400 active:text-green-400"
							>
								{url.slug}
							</button></Table.Cell
						>
						<Table.Cell class="border-r border-dotted border-zinc-500 px-4 py-2 font-medium"
							><a
								href={url.destination}
								target="_blank"
								class="line-clamp-1 break-all transition-colors hover:text-blue-400"
								>{url.destination}</a
							></Table.Cell
						>
						<Table.Cell class="border-r border-dotted border-zinc-500 px-4 py-2"
							><span class="font-medium">
								{dayJs(url.createdAt).fromNow()}
							</span></Table.Cell
						>
						<Table.Cell class="border-r border-dotted border-zinc-500 px-4 py-2 text-center">
							<span>
								{url.clicks}
							</span>
						</Table.Cell>
						<Table.Cell
							class="flex items-center justify-center gap-2 px-4 py-2 {i === data.urls.length - 1
								? 'rounded-br'
								: ''}"
						>
							<button
								onclick={() => deleteEntry(url.slug)}
								class="cursor-pointer rounded bg-red-400 px-2 py-2 transition-colors hover:bg-red-300"
								><Trash2 size="18" class="text-red-950" /></button
							>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		{/if}
	</Table.Root>
	<p class="mt-2 text-center text-sm font-medium text-zinc-600">
		Hint: click on the slug cell content to copy the short URL for that item.
	</p>
	{#if totalPages > 0}
		<ul class="mt-4 mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-6">
			{#each Array(totalPages) as _, index}
				<li class="">
					<a
						class="rounded px-4 py-2 font-medium {currentPage === index
							? 'bg-white text-black'
							: 'bg-zinc-600 text-white'}"
						href="/profile?limit={limit}&skip={limit * index}">{index + 1}</a
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>
