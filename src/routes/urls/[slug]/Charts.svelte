<script lang="ts">
	import { BarChart, LineChart } from 'layerchart';

	type Props = {
		overTime: { date: string; count: number }[];
		byCountry: { country: string; count: number }[];
	};

	let { overTime, byCountry }: Props = $props();

	let timeData = $derived(overTime.map((d) => ({ date: new Date(d.date), count: d.count })));

	const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
	function countryLabel(code: string): string {
		if (code === 'Unknown') return 'Unknown';
		try {
			return countryNames.of(code) ?? code;
		} catch {
			return code;
		}
	}

	let countryData = $derived(byCountry.map((d) => ({ ...d, country: countryLabel(d.country) })));

	let countryPaddingLeft = $derived(
		Math.max(60, Math.max(0, ...countryData.map((d) => d.country.length)) * 7 + 16)
	);

	let hasTimeData = $derived(timeData.some((d) => d.count > 0));
	let hasCountryData = $derived(countryData.length > 0);

	const axisProps = {
		tickLabelProps: {
			style:
				'fill: #a1a1aa; font-size: 12px; font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;'
		}
	};

	const gridProps = { style: 'stroke: #27272a;' };

	const tooltipProps = {
		root: {
			variant: 'none' as const,
			props: {
				container: {
					style:
						'background: #09090b; border: 1px solid #3f3f46; border-radius: 2px; font-family: ui-monospace, monospace; font-size: 12px; padding: 8px 12px; box-shadow: none; min-width: 100px;'
				}
			}
		},
		header: {
			style: 'color: #a1a1aa; margin-bottom: 2px; font-weight: normal;'
		},
		item: {
			classes: {
				root: '',
				label: '',
				value: ''
			},
			style: 'color: #4ade80;'
		}
	};
</script>

<div class="space-y-8">
	<section>
		<h2 class="mb-3 text-xs font-medium tracking-widest text-zinc-500 uppercase">
			Clicks over time
		</h2>
		<div class="border border-zinc-800 bg-zinc-950 p-4">
			{#if hasTimeData}
				<div class="h-52">
					<LineChart
						data={timeData}
						x="date"
						y="count"
						series={[{ key: 'count', color: '#4ade80' }]}
						props={{
							spline: { style: 'stroke: #4ade80; stroke-width: 1.5;' },
							xAxis: {
								...axisProps,
								format: (d: Date) =>
									new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })
							},
							yAxis: axisProps,
							grid: gridProps,
							tooltip: tooltipProps
						}}
						rule={false}
						grid
					/>
				</div>
			{:else}
				<div class="flex h-52 items-center justify-center">
					<p class="text-xs text-zinc-600">No clicks in this period.</p>
				</div>
			{/if}
		</div>
	</section>

	<section>
		<h2 class="mb-3 text-xs font-medium tracking-widest text-zinc-500 uppercase">By country</h2>
		<div class="border border-zinc-800 bg-zinc-950 p-4">
			{#if hasCountryData}
				<div style="height: {Math.max(200, countryData.length * 28)}px">
					<BarChart
						data={countryData}
						x="count"
						y="country"
						orientation="horizontal"
						series={[{ key: 'count', color: '#4ade80' }]}
						padding={{ left: countryPaddingLeft, bottom: 24, top: 8, right: 16 }}
						props={{
							xAxis: axisProps,
							yAxis: axisProps,
							tooltip: tooltipProps
						}}
						rule={false}
						grid={false}
					/>
				</div>
			{:else}
				<div class="flex h-32 items-center justify-center">
					<p class="text-xs text-zinc-600">No country data in this period.</p>
				</div>
			{/if}
		</div>
	</section>
</div>
