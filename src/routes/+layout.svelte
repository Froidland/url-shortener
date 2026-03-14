<script lang="ts">
	import '../app.css';
	import type { LayoutServerData } from './$types';
	import { DiscordIcon, Home } from '$lib/components/icons';
	import { Toaster } from 'svelte-sonner';
	import { Tooltip } from 'bits-ui';
	import ProfileDropdown from '$lib/components/ProfileDropdown.svelte';
	import { navigating } from '$app/state';

	interface Props {
		data: LayoutServerData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

<Tooltip.Provider>
	{#if navigating.to}
		<div class="fixed inset-x-0 top-0 z-50 h-px overflow-hidden bg-zinc-800">
			<div class="h-full w-1/3 animate-[progress_1s_ease-in-out_infinite] bg-green-400"></div>
		</div>
	{/if}
	<Toaster
		position="top-center"
		theme="dark"
		toastOptions={{
			style:
				'background: #09090b; color: #f4f4f5; border: 1px solid #27272a; border-radius: 2px; font-family: ui-monospace, monospace; font-size: 0.8rem;'
		}}
	/>
	<div class="flex min-h-screen flex-col">
		<nav class="border-b border-zinc-800 bg-zinc-950">
			<div class="container mx-auto flex h-12 items-center justify-between px-6 2xl:max-w-350">
				<div class="flex items-center gap-4">
					<a
						class="flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
						href="/"
					>
						<Home size="14" /> <span class="hidden sm:inline">Home</span>
					</a>
				</div>
				<div class="flex items-center gap-2">
					{#if !data.user.isLoggedIn}
						<a href="/api/oauth/discord" class="btn btn-secondary gap-2 text-xs">
							<DiscordIcon size="16" />
							<span class="hidden sm:inline">Sign in with Discord</span>
							<span class="sm:hidden">Sign in</span>
						</a>
					{:else}
						<ProfileDropdown />
					{/if}
				</div>
			</div>
		</nav>
		<main class="container mx-auto flex-1 px-6 py-8 2xl:max-w-350">
			{@render children?.()}
		</main>
	</div>
</Tooltip.Provider>
