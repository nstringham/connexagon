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

	const layout = $derived(getLayout(size));

	function getHexagonPath(scale: number) {
		/** small vertical distance (the vertical distance from one of the top side points to the top point) */
		const sv = (scale / 2).toFixed(5);

		/** small vertical distance (the distance between 2 side points) */
		const lv = scale.toFixed(5);

		/** the horizontal distance between a side point and the center line */
		const h = (scale * halfSqrt3).toFixed(5);

		return `m0,${lv}l${h},-${sv}v-${lv}l-${h},-${sv}l-${h},${sv}v${lv}z`;
	}

	const scale = $derived(1 / (size * 2 - 1) / halfSqrt3);

	const cellScale = $derived(scale * (11 / 12));

	const cellPath = $derived(getHexagonPath(cellScale));

	const towerPath = $derived(getHexagonPath(cellScale / 2));

	const disabled = $derived(maxAllowedSelection <= 0);

	function onSelect(event: MouseEvent | KeyboardEvent) {
		if (disabled) {
			return;
		}

		if (!(event.target instanceof SVGElement) || event.target.dataset.index == undefined) {
			return;
		}

		const index = parseInt(event.target.dataset.index);

		if (board[index].tower || board[index].color != null) {
			return;
		}

		event.preventDefault();

		const selectedIndex = selection.indexOf(index);

		if (selectedIndex != -1) {
			selection.splice(selectedIndex, 1);
		} else {
			selection.push(index);
			while (selection.length > maxAllowedSelection) {
				selection.shift();
			}
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
	{#each board as cell, i}
		{@const [x, y] = layout[i]}
		{@const selectable = cell.color == null && !cell.tower}
		{@const selected = selection.includes(i)}
		<!-- this is ok because we have event listeners on the outer <svg> element -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<path
			class="cell"
			d="M{x},{y}{cellPath}"
			data-index={i}
			fill={cell.tower ? "black" : (cell.color ?? "silver")}
			aria-selected={selectable ? selected : undefined}
			tabindex={(selectable && !disabled) || selected ? 0 : undefined}
			role={selectable ? "checkbox" : undefined}
			aria-disabled={selectable ? disabled : undefined}
		/>
		{#if cell.tower && cell.color != null}
			<path d="M{x},{y}{towerPath}" fill={cell.color} />
		{/if}
	{/each}
</svg>

<style>
	.cell:focus {
		outline: none;
	}
	.cell:focus-visible {
		outline: none;
		stroke: pink;
		stroke-width: 0.1px;
	}
	.cell[aria-selected="true"] {
		fill: lightblue;
	}
</style>
