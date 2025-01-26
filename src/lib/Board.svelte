<script lang="ts">
	import type { SVGAttributes } from "svelte/elements";
	import { getLayout, getSize, halfSqrt3 } from "./board";
	import type { CompositeTypes } from "./database-types";

	type Cell = CompositeTypes<"cell">;

	const {
		board,
		selection = $bindable([]),
		maxAllowedSelection = 0,
		...restProps
	}: {
		board: Cell[];
		selection?: number[];
		maxAllowedSelection?: number;
	} & SVGAttributes<SVGSVGElement> = $props();

	const size = $derived(getSize(board.length));

	const scale = $derived(1 / (size * 2 - 1) / halfSqrt3);

	const layout = $derived(getLayout(size));

	const allowSelection = $derived(selection.length < maxAllowedSelection);

	function onSelect(event: MouseEvent | KeyboardEvent) {
		if (!(event.target instanceof SVGElement) || event.target.dataset.index == undefined) {
			return;
		}

		const index = parseInt(event.target.dataset.index);

		event.preventDefault();

		const selectedIndex = selection.indexOf(index);

		if (selectedIndex != -1) {
			selection.splice(selectedIndex, 1);
		} else if (allowSelection) {
			selection.push(index);
		}
	}
</script>

<!-- this is ok because we have tabindex on the inner elements -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
	{...restProps}
	viewBox="-1 -1 2 2"
	onclick={(event) => {
		onSelect(event);
	}}
	onkeypress={(event) => {
		if (event.key === "Enter" || event.key === " ") {
			onSelect(event);
		}
	}}
>
	<defs>
		<path id="hex" d="M0,1L{halfSqrt3},.5V-.5L0,-1L-{halfSqrt3},-.5V.5Z" />
		<use id="cell" href="#hex" transform="scale({scale * (11 / 12)})" />
		<use id="tower" href="#cell" transform="scale(.5)" />
	</defs>

	{#each board as cell, i}
		{@const [x, y] = layout[i]}
		{@const selectable = cell.color == null && !cell.tower}
		{@const selected = selection.includes(i)}
		<!-- this is ok because we have event listeners on the outer <svg> element -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<use
			href="#cell"
			{x}
			{y}
			data-index={i}
			fill={cell.tower ? "black" : (cell.color ?? "silver")}
			aria-selected={selected}
			tabindex={(selectable && allowSelection) || selected ? 0 : undefined}
			role={selectable ? "checkbox" : undefined}
			aria-disabled={!allowSelection}
		/>
		{#if cell.tower && cell.color != null}
			<use href="#tower" {x} {y} fill={cell.color} />
		{/if}
	{/each}
</svg>

<style>
	use:focus {
		outline: none;
	}
	use:focus-visible {
		outline: none;
		stroke: pink;
		stroke-width: 0.1px;
	}
	use[aria-selected="true"] {
		fill: lightblue;
	}
</style>
