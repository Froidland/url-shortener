<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import type { Snippet } from 'svelte';

	type Props = {
		text: string;
		children: Snippet;
		sideOffset?: number;
	};

	let { text, children, sideOffset = 6 }: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class="cursor-default">{@render children()}</Tooltip.Trigger>
	<Tooltip.Content
		class="border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-zinc-300"
		{sideOffset}
	>
		{text}
	</Tooltip.Content>
</Tooltip.Root>
