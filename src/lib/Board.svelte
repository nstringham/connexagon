<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { Color, cssColors, getLayout, getSize } from "./board";
  import { getHexagonSvgPath, halfSqrt3 } from "./hexagon";
  import { dev } from "$app/environment";

  const {
    towers,
    cells,
    selection = $bindable([]),
    maxAllowedSelection = 0,
    ...restProps
  }: {
    towers: Set<number>;
    cells: Uint8Array;
    selection?: number[];
    maxAllowedSelection?: number;
  } & SVGAttributes<SVGSVGElement> = $props();

  const size = $derived(getSize(cells.length));

  const layout = $derived(getLayout(size));

  const viewBoxSize = $derived((size * 2 - 1) * halfSqrt3);

  const strokeWidth = 1 - halfSqrt3;

  const cellPath = getHexagonSvgPath(halfSqrt3);

  const towerPath = getHexagonSvgPath(halfSqrt3 / 2);

  const haloPath = getHexagonSvgPath(halfSqrt3 - strokeWidth / 2);

  const disabled = $derived(maxAllowedSelection <= 0);

  function onSelect(event: MouseEvent | KeyboardEvent) {
    if (disabled || !(event.target instanceof SVGElement)) {
      return;
    }

    const target = event.target.closest<SVGGElement>("g[data-index]");

    if (target == null) {
      return;
    }

    const cellIndex = parseInt(target.dataset.index!);

    if (towers.has(cellIndex) || cells[cellIndex] !== Color.UNCLAIMED) {
      return;
    }

    event.preventDefault();

    const selectionIndex = selection.indexOf(cellIndex);

    if (selectionIndex != -1) {
      selection.splice(selectionIndex, 1);
    } else {
      selection.push(cellIndex);
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
  viewBox="-{viewBoxSize} -{viewBoxSize} {viewBoxSize * 2} {viewBoxSize * 2}"
  stroke-width={strokeWidth}
  onclick={(event) => {
    onSelect(event);
  }}
  onkeypress={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      onSelect(event);
    }
  }}
>
  {#each cells as color, i}
    {@const [x, y] = layout[i]}
    {@const tower = towers.has(i)}
    {@const selectable = color === Color.UNCLAIMED && !tower}
    {@const selected = selection.includes(i)}
    <!-- this is ok because we have event listeners on the outer <svg> element -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <g
      data-index={i}
      aria-checked={selectable ? selected : undefined}
      tabindex={selectable && !disabled ? 0 : undefined}
      role={selectable ? "checkbox" : undefined}
      aria-disabled={selectable ? disabled : undefined}
    >
      <path
        class="cell"
        d="M{x},{y}{cellPath}"
        fill={tower
          ? "currentcolor"
          : (cssColors[color as Color] ?? "light-dark(#ebebeb, #181818)")}
        stroke-width={strokeWidth * 2}
      />
      {#if selected}
        <path d="M{x},{y}{haloPath}" fill="none" stroke="var(--user-color)" />
      {/if}
      {#if tower && color !== 0}
        <path d="M{x},{y}{towerPath}" fill={cssColors[color as Color]} />
      {/if}
      {#if dev}
        <text class="debug-info" {x} {y} font-size={strokeWidth * 3}>{i}</text>
      {/if}
    </g>
  {/each}
</svg>

<style>
  g:focus {
    outline: none;
  }

  g:focus-visible .cell {
    paint-order: stroke;
    stroke: currentcolor;
  }

  .debug-info {
    text-anchor: middle;
    dominant-baseline: central;
    fill: white;
    mix-blend-mode: exclusion;
    pointer-events: none;
    user-select: none;
  }
</style>
