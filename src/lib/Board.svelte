<script lang="ts">
	import { getLayout, getSize, halfSqrt3 } from "./board";
	import type { CompositeTypes } from "./database-types";

	type Cell = CompositeTypes<"cell">;

	const { board }: { board: Cell[] } = $props();

	const size = $derived(getSize(board.length));

	$inspect(size);

	const scale = $derived(1 / (size * 2 - 1) / halfSqrt3);

	const layout = $derived(getLayout(size));
</script>

<svg viewBox="-1 -1 2 2">
	<defs>
		<path id="hex" d="M0,1L{halfSqrt3},.5V-.5L0,-1L-{halfSqrt3},-.5V.5Z" />
		<use id="cell" href="#hex" transform="scale({scale * (11 / 12)})" />
		<use id="tower" href="#cell" transform="scale(.5)" />
	</defs>

	{#each board as cell, i}
		{@const [x, y] = layout[i]}
		<use href="#cell" {x} {y} fill={cell.tower ? "black" : (cell.color ?? "silver")} />
		{#if cell.tower}
			<use href="#tower" {x} {y} fill={cell.color} />
		{/if}
	{/each}
</svg>
