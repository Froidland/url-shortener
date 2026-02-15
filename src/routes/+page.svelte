<script lang="ts">
	import { page } from '$app/state';
	import toast from 'svelte-french-toast';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Field, Control, Label, Description, FieldErrors } from 'formsnap';
	import { schema } from './schema';

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

<div class="flex flex-col items-center gap-4 rounded bg-zinc-800 p-6">
	<form class="flex w-full max-w-100 flex-col gap-1" method="post" use:enhance>
		<Field {form} name="destination">
			<Control>
				{#snippet children({ props })}
					<Label class="font-medium">Destination</Label>
					<input
						class="w-full rounded bg-neutral-600 p-2 selection:bg-green-200 selection:text-green-950"
						type="text"
						bind:value={$formData.destination}
						{...props}
					/>
				{/snippet}
			</Control>
			<div>
				<Description class="text-sm italic"
					>The destination where the URL will redirect to.</Description
				>
				<FieldErrors class="font-medium text-red-500 italic" />
			</div>
		</Field>
		{#if data.user.isAllowedCustomSlugs}
			<Field {form} name="slug">
				<Control>
					{#snippet children({ props })}
						<Label class="font-medium">Slug</Label>
						<input
							class="w-full rounded bg-neutral-600 p-2 selection:bg-green-200 selection:text-green-950 disabled:bg-neutral-700"
							type="text"
							disabled={!data.user.isAllowedCustomSlugs}
							bind:value={$formData.slug}
							{...props}
						/>
					{/snippet}
				</Control>
				<div>
					<Description class="text-sm italic"
						>The URL identifier. Randomly generated if not specified.
					</Description>
					<FieldErrors class="font-medium text-red-500 italic" />
				</div>
			</Field>
		{/if}
		<button class="btn-primary cursor-pointer rounded px-4 py-2 font-medium transition-colors"
			>Create</button
		>
		{#if $message}
			<div class="flex justify-center gap-2 pt-3 text-center">
				<button
					type="button"
					class="btn-secondary w-fit cursor-pointer rounded px-4 py-2 font-medium transition-colors"
					onclick={() => copyUrl(`${host}/${$message}`)}
				>
					{host}/{$message}
				</button>
			</div>
		{/if}
	</form>
</div>
