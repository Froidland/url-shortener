<script lang="ts">
	import '../app.css';
	import type { LayoutServerData } from './$types';
	import { DiscordIcon, Home, } from '$lib/components/icons';
	import { Toaster } from 'svelte-french-toast';
	import ProfileDropdown from '$lib/components/ProfileDropdown.svelte';

	interface Props {
		data: LayoutServerData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

<Toaster />
<div class="2xl:max-w-350 container mx-auto px-8">
	<nav class="my-3 flex items-center justify-between rounded bg-zinc-800 p-3">
		<div class="flex">
			<a class="btn btn-secondary gap-2" href="/">
				<Home size="18" /> <span class="hidden sm:inline">Home</span>
			</a>
		</div>
		<div class="flex gap-2">
			{#if !data.user.isLoggedIn}
				<a href="/api/oauth/discord" class="btn btn-secondary gap-2">
					<DiscordIcon size="24" />
					Sign in with Discord
				</a>
			{:else}
				<ProfileDropdown />
			{/if}
		</div>
	</nav>
	{@render children?.()}
</div>
