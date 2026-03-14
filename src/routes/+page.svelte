<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Field, Control, Label, Description, FieldErrors } from 'formsnap';
	import { schema } from './schema';

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
		data: PageData;
	};

	let { data }: Props = $props();
	let host = $derived(page.url.origin);
	// svelte-ignore state_referenced_locally Intentional
	const form = superForm(data.form, {
		validators: zod4Client(schema)
	});
	const { form: formData, enhance, message } = form;
</script>

<svelte:head>
	<title>URL Shortener</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center">
	<div class="w-full max-w-md">
		<div class="mb-6">
			<h1 class="text-lg font-medium tracking-tight text-zinc-100">Shorten a URL</h1>
			<p class="mt-1 text-xs text-zinc-500">Paste any URL and get a short link instantly.</p>
		</div>

		<div class="border border-zinc-800 bg-zinc-900 p-6">
			<form class="flex flex-col gap-4" method="post" use:enhance>
				<Field {form} name="destination">
					<Control>
						{#snippet children({ props })}
							<Label class="mb-1 block text-xs font-medium tracking-widest text-zinc-400 uppercase"
								>Destination</Label
							>
							<input
								class="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors outline-none placeholder:text-zinc-700 focus:border-zinc-600"
								type="text"
								placeholder="https://example.com/long/path"
								bind:value={$formData.destination}
								{...props}
							/>
						{/snippet}
					</Control>
					<div class="mt-1">
						<Description class="text-xs text-zinc-600"
							>The destination the short URL will redirect to.</Description
						>
						<FieldErrors class="mt-0.5 text-xs text-red-400" />
					</div>
				</Field>

				{#if data.user.isAllowedCustomSlugs}
					<Field {form} name="slug">
						<Control>
							{#snippet children({ props })}
								<Label
									class="mb-1 block text-xs font-medium tracking-widest text-zinc-400 uppercase"
									>Slug <span class="tracking-normal text-zinc-600 normal-case">(optional)</span
									></Label
								>
								<input
									class="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors outline-none placeholder:text-zinc-700 focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
									type="text"
									placeholder="my-custom-slug"
									disabled={!data.user.isAllowedCustomSlugs}
									bind:value={$formData.slug}
									{...props}
								/>
							{/snippet}
						</Control>
						<div class="mt-1">
							<Description class="text-xs text-zinc-600"
								>Randomly generated if left empty.</Description
							>
							<FieldErrors class="mt-0.5 text-xs text-red-400" />
						</div>
					</Field>
				{/if}

				<button class="btn btn-primary mt-2 w-full cursor-pointer" style="height: 2.25rem;"
					>Create short URL</button
				>
			</form>
		</div>

		{#if $message}
			<div
				class="mt-3 flex items-center justify-between gap-3 border border-zinc-800 bg-zinc-900 px-4 py-3"
			>
				<span class="truncate text-xs font-medium text-green-400">{host}/{$message}</span>
				<button
					type="button"
					class="btn btn-primary shrink-0 cursor-pointer text-xs"
					onclick={() => copyUrl(`${host}/${$message}`)}
				>
					Copy
				</button>
			</div>
		{/if}
	</div>
</div>
