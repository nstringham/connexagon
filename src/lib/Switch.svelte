<script lang="ts">
  import "$lib/hexagons.css";
  import type { HTMLInputAttributes } from "svelte/elements";

  let { checked = $bindable(false), ...restProps }: HTMLInputAttributes = $props();

  function onKeypress(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
    if (event.key == "Enter") {
      event.currentTarget.click();
      event.preventDefault();
    }
  }
</script>

<span class="wrapper">
  <input type="checkbox" role="switch" onkeypress={onKeypress} bind:checked {...restProps} />
  <span class="track clip-hexagon"></span>
  <span class="thumb clip-hexagon"></span>
</span>

<style>
  .wrapper {
    width: var(--track-length);
    height: var(--track-height);
    display: inline grid;

    --track-length: 56px;
    --track-height: 32px;
  }

  .wrapper:has(input:disabled) {
    opacity: 0.5;
  }

  .wrapper > * {
    grid-area: 1 / 1 / 1 / 1;
    place-self: stretch;
  }

  .track {
    z-index: -1;
    background-color: var(--primary);
    opacity: 0.25;
    filter: grayscale(100%);
    transition:
      opacity 0.125s ease-in,
      filter 0.125s ease-in;

    --height: var(--track-height);
  }

  input:checked ~ .track {
    filter: grayscale(0%);
    opacity: 1;
  }

  .thumb {
    z-index: -1;
    width: calc(24px / 0.866);
    height: 24px;
    background-color: white;
    place-self: center;
    translate: calc(-0.5 * var(--thumb-travel));
    transition: translate 0.125s ease-in;

    --height: 24px;
    --thumb-travel: calc(var(--track-length) - var(--track-height) / 0.866);
  }

  input:checked ~ .thumb {
    translate: calc(0.5 * var(--thumb-travel));
  }

  input {
    appearance: none;
    margin: -4px;
  }
</style>
