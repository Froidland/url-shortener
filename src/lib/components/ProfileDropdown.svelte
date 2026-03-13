<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { LogOut, UserCircle } from './icons';
	import FormatListBulletedIcon from './icons/FormatListBulletedIcon.svelte';
	import { resolve } from '$app/paths';
	import { logout } from '$lib/remote/auth.remote';

	async function handleLogout() {
		await logout();
		window.location.href = resolve('/');
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="btn btn-secondary cursor-pointer gap-1.5 text-xs">
		<UserCircle size="14" /> <span class="hidden sm:inline">Profile</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="z-10 mt-1 w-48 border border-zinc-800 bg-zinc-950 p-0 shadow-2xl shadow-black/60"
	>
		<a href={resolve('/profile')}>
			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-2.5 border-b border-zinc-800 px-3 py-2.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
				><FormatListBulletedIcon /> <span class="font-medium">My URLs</span></DropdownMenu.Item
			>
		</a>
		<DropdownMenu.Item
			onclick={handleLogout}
			class="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-red-400"
			><LogOut size="14" /> <span class="font-medium">Log out</span></DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
