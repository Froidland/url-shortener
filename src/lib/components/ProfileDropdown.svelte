<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { LogOut, UserCircle } from './icons';
	import FormatListBulletedIcon from './icons/FormatListBulletedIcon.svelte';
	import { resolve } from '$app/paths';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<button class="btn btn-secondary cursor-pointer gap-2">
			<UserCircle size="18" /> <span class="hidden sm:inline">Profile</span>
		</button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-57.5 z-10 mt-2 items-center rounded bg-zinc-700 p-2 shadow-xl">
		<a href={resolve('/profile')}
			><DropdownMenu.Item
				class="mb-2 flex items-center gap-2 rounded-[6px] bg-zinc-800 px-4 py-3 transition-colors hover:bg-zinc-900"
				><FormatListBulletedIcon /> <span class="font-bold">My URLs</span></DropdownMenu.Item
			></a
		>
		<a href={resolve('/api/auth/logout')}>
			<DropdownMenu.Item
				class="flex items-center gap-2 rounded-[6px] bg-zinc-800 px-4 py-3 transition-colors hover:bg-zinc-900"
				><LogOut size="18" /> <span class="font-bold">Log out</span></DropdownMenu.Item
			>
		</a>
	</DropdownMenu.Content>
</DropdownMenu.Root>
