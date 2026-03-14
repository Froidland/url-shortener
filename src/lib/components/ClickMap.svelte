<script lang="ts">
	import {
		MapLibre,
		GeoJSONSource,
		FillLayer,
		LineLayer,
		Popup,
		FeatureState
	} from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';
	import { getClicksByCountry } from '$lib/remote/urls.remote';

	type CountryClick = { country: string; count: number };

	type Props = { slug: string; data?: never } | { data: CountryClick[]; slug?: never };

	let { slug, data: dataProp }: Props = $props();

	let remoteClicks = $derived(slug ? await getClicksByCountry({ slug }) : null);
	let clicks = $derived(dataProp ?? remoteClicks ?? []);

	let countsByCountry = $derived(
		Object.fromEntries(clicks.map((r: CountryClick) => [r.country.toUpperCase(), r.count]))
	);

	type CountryCollection = GeoJSON.FeatureCollection<
		GeoJSON.Geometry,
		{ iso: string; name: string; clicks?: number }
	>;

	let baseGeoJSON: Promise<CountryCollection> | null = null;

	let geojson: CountryCollection | null = $state(null);

	$effect(() => {
		const counts = countsByCountry;
		if (!baseGeoJSON) {
			baseGeoJSON = fetch('/countries.geojson').then((r) => r.json());
		}
		baseGeoJSON.then((base) => {
			geojson = {
				...base,
				features: base.features.map((f, i) => ({
					...f,
					id: i,
					properties: {
						...f.properties,
						clicks: counts[f.properties.iso] ?? 0
					}
				}))
			};
		});
	});

	let hoveredFeature = $state.raw<maplibregl.MapGeoJSONFeature | undefined>(undefined);
	let popupLngLat = $state.raw(new maplibregl.LngLat(0, 0));

	let sourceId = $derived(slug ?? 'stats-map');
</script>

<div class="border-t border-zinc-800">
	{#if !geojson}
		<div
			class="relative flex h-[32rem] w-full items-center justify-center overflow-hidden bg-zinc-950"
		>
			<div
				class="absolute inset-0 opacity-5"
				style="background-image: linear-gradient(#71717a 1px, transparent 1px), linear-gradient(90deg, #71717a 1px, transparent 1px); background-size: 40px 40px;"
			></div>
			<div class="flex flex-col items-center gap-3">
				<div class="flex gap-1">
					{#each [0, 1, 2] as i}
						<div
							class="h-1 w-6 animate-pulse rounded-full bg-zinc-700"
							style="animation-delay: {i * 150}ms"
						></div>
					{/each}
				</div>
				<span class="font-mono text-xs text-zinc-600">Loading map…</span>
			</div>
		</div>
	{:else}
		<MapLibre
			class="h-[32rem] w-full"
			style="https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"
			zoom={1.2}
			center={{ lng: 10, lat: 20 }}
			attributionControl={false}
		>
			<GeoJSONSource id="countries-{sourceId}" data={geojson}>
				<FillLayer
					paint={{
						'fill-color': [
							'interpolate',
							['linear'],
							['coalesce', ['get', 'clicks'], 0],
							0,
							'rgba(0,0,0,0)',
							1,
							'#14532d',
							5,
							'#166534',
							20,
							'#15803d',
							100,
							'#16a34a',
							500,
							'#4ade80'
						],
						'fill-opacity': ['case', ['>', ['coalesce', ['get', 'clicks'], 0], 0], 0.85, 0]
					}}
					onmousemove={(e) => {
						hoveredFeature = e.features?.[0];
						popupLngLat = e.lngLat;
					}}
					onmouseleave={() => (hoveredFeature = undefined)}
				/>
				<LineLayer
					paint={{
						'line-color': '#27272a',
						'line-width': 0.5
					}}
				/>
				{#if hoveredFeature}
					<FeatureState id={hoveredFeature.id} state={{ hover: true }} />
					<Popup lnglat={popupLngLat} closeButton={false} offset={20} class="click-map-popup">
						<div class="px-3 py-2 font-mono text-xs">
							<div class="text-zinc-400">{hoveredFeature.properties.name}</div>
							<div class="font-medium text-green-400">
								{hoveredFeature.properties.clicks ?? 0} click{hoveredFeature.properties.clicks === 1
									? ''
									: 's'}
							</div>
						</div>
					</Popup>
				{/if}
			</GeoJSONSource>
		</MapLibre>
	{/if}
</div>
