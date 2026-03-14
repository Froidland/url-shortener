<script lang="ts">
	import Charts from './Charts.svelte';
	import ClickMap from '$lib/components/ClickMap.svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { DateRangePicker } from 'bits-ui';
	import { CalendarDate, type DateValue } from '@internationalized/date';
	import type { DateRange } from 'bits-ui';

	let { data } = $props();

	const PRESETS = [
		{ label: '7d', days: 7 },
		{ label: '30d', days: 30 },
		{ label: '90d', days: 90 },
		{ label: 'All', days: null as number | null }
	] as const;

	function toCalendarDate(iso: string): CalendarDate {
		const [y, m, d] = iso.split('-').map(Number);
		return new CalendarDate(y, m, d);
	}

	function toIso(d: DateValue): string {
		return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
	}

	const now = new Date();
	const todayCalendar = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

	function valueFromData(): DateRange {
		return {
			start: data.from === 'all' ? new CalendarDate(2020, 1, 1) : toCalendarDate(data.from),
			end: data.to ? toCalendarDate(data.to) : todayCalendar
		};
	}

	let value = $state<DateRange>(valueFromData());

	$effect(() => {
		value = valueFromData();
	});

	function activePreset(from: string, to: string | null): number | null | undefined {
		if (from === 'all') return null; // "All" preset
		const todayIso = toIso(todayCalendar);
		for (const p of PRESETS) {
			if (p.days === null) continue;
			const expected = new Date(Date.now() - p.days * 24 * 60 * 60 * 1000);
			expected.setHours(0, 0, 0, 0);
			const expectedFrom = expected.toISOString().slice(0, 10);
			if (from === expectedFrom && (to === todayIso || to === null)) return p.days;
		}
		return undefined;
	}

	let currentPreset = $derived(activePreset(data.from, data.to));

	function applyPreset(days: number | null) {
		if (days === null) {
			value = { start: new CalendarDate(2020, 1, 1), end: todayCalendar };
			goto('?from=all');
		} else {
			const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
			from.setHours(0, 0, 0, 0);
			const fromIso = from.toISOString().slice(0, 10);
			const toIso_ = toIso(todayCalendar);
			value = { start: toCalendarDate(fromIso), end: todayCalendar };
			goto(`?from=${fromIso}&to=${toIso_}`);
		}
	}

	function onValueChange(v: DateRange | undefined) {
		if (!v?.start || !v?.end) return;
		goto(`?from=${toIso(v.start)}&to=${toIso(v.end)}`);
	}
</script>

<svelte:head>
	<title>{data.url.slug} — Stats</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8">
	<div class="flex items-start justify-between gap-4">
		<div>
			<a
				href={resolve('/urls')}
				class="mb-2 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
				>← Back</a
			>
			<h1 class="text-base font-medium text-zinc-100">{data.url.slug}</h1>
			<a
				href={data.url.destination}
				target="_blank"
				class="mt-0.5 inline text-xs break-all text-zinc-500 transition-colors hover:text-zinc-300"
				>{data.url.destination}</a
			>
		</div>

		<div class="flex shrink-0 items-center gap-2">
			<div class="flex items-center gap-px">
				{#each PRESETS as p}
					<button
						onclick={() => applyPreset(p.days)}
						class="cursor-pointer border border-zinc-800 px-3 py-1.5 text-xs font-medium transition-colors {currentPreset ===
						p.days
							? 'border-zinc-100 bg-zinc-100 text-zinc-950'
							: 'bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}"
						>{p.label}</button
					>
				{/each}
			</div>

			<DateRangePicker.Root
				bind:value
				{onValueChange}
				locale="en-US"
				weekStartsOn={1}
				maxValue={todayCalendar}
			>
				<div
					class="flex items-center gap-1 border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400"
				>
					{#each ['start', 'end'] as const as type (type)}
						<DateRangePicker.Input {type}>
							{#snippet children({ segments })}
								{#each segments as { part, value: segValue }, i (part + i)}
									{#if part === 'literal'}
										<span class="text-zinc-700">{segValue}</span>
									{:else}
										<DateRangePicker.Segment
											{part}
											class="rounded-none px-0.5 outline-none focus:bg-zinc-800 focus:text-zinc-100 data-placeholder:text-zinc-700"
											>{segValue}</DateRangePicker.Segment
										>
									{/if}
								{/each}
							{/snippet}
						</DateRangePicker.Input>
						{#if type === 'start'}
							<span class="mx-1 text-zinc-700">→</span>
						{/if}
					{/each}
					<DateRangePicker.Trigger
						class="ml-2 cursor-pointer text-zinc-600 transition-colors hover:text-zinc-400"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					</DateRangePicker.Trigger>
				</div>

				<DateRangePicker.Content sideOffset={6} class="z-50">
					<DateRangePicker.Calendar
						class="border border-zinc-800 bg-zinc-950 p-4 shadow-2xl shadow-black/60"
					>
						{#snippet children({ months, weekdays })}
							<DateRangePicker.Header class="mb-3 flex items-center justify-between">
								<DateRangePicker.PrevButton
									class="inline-flex h-6 w-6 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-zinc-200"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg
									>
								</DateRangePicker.PrevButton>
								<DateRangePicker.Heading
									class="text-xs font-medium tracking-widest text-zinc-400 uppercase"
								/>
								<DateRangePicker.NextButton
									class="inline-flex h-6 w-6 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-zinc-200"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
									>
								</DateRangePicker.NextButton>
							</DateRangePicker.Header>

							{#each months as month}
								<DateRangePicker.Grid class="w-full border-collapse">
									<DateRangePicker.GridHead>
										<DateRangePicker.GridRow class="mb-1 flex">
											{#each weekdays as day}
												<DateRangePicker.HeadCell
													class="w-8 text-center text-[10px] font-medium text-zinc-600"
												>
													{day.slice(0, 2)}
												</DateRangePicker.HeadCell>
											{/each}
										</DateRangePicker.GridRow>
									</DateRangePicker.GridHead>
									<DateRangePicker.GridBody>
										{#each month.weeks as weekDates}
											<DateRangePicker.GridRow class="flex">
												{#each weekDates as date}
													<DateRangePicker.Cell {date} month={month.value}>
														<DateRangePicker.Day
															class="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center text-xs text-zinc-400 transition-colors
															hover:bg-zinc-800 hover:text-zinc-100
															focus:ring-1 focus:ring-zinc-700 focus:outline-none
															data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:text-zinc-700
															data-outside-month:pointer-events-none data-outside-month:text-zinc-700
															data-selected:bg-zinc-800 data-selected:text-zinc-100
															data-selection-end:bg-green-400 data-selection-end:text-green-950
															data-selection-start:bg-green-400 data-selection-start:text-green-950
															data-today:text-green-400"
														/>
													</DateRangePicker.Cell>
												{/each}
											</DateRangePicker.GridRow>
										{/each}
									</DateRangePicker.GridBody>
								</DateRangePicker.Grid>
							{/each}
						{/snippet}
					</DateRangePicker.Calendar>
				</DateRangePicker.Content>
			</DateRangePicker.Root>
		</div>
	</div>

	<section>
		<h2 class="mb-3 text-xs font-medium tracking-widest text-zinc-500 uppercase">Click map</h2>
		<div class="border border-zinc-800">
			<ClickMap data={data.byCountry} />
		</div>
	</section>

	<Charts overTime={data.overTime} byCountry={data.byCountry} />
</div>
