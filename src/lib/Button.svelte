<script lang="ts">
  import "$lib/hexagons.css";
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

  type CommonProps = {
    children: Snippet;
  };

  type LinkProps = { href: string } & HTMLAnchorAttributes;

  type ButtonProps = HTMLButtonAttributes;

  const { children, ...restProps }: CommonProps & (LinkProps | ButtonProps) = $props();
</script>

{#if "href" in restProps}
  <a class="hexagon-button" {...restProps}>
    {@render insides()}
  </a>
{:else}
  <button class="hexagon-button" {...restProps}>
    {@render insides()}
  </button>
{/if}

{#snippet insides()}
  <div class="background clip-hexagon"></div>
  <div class="children">{@render children()}</div>
{/snippet}

<style>
  .hexagon-button {
    appearance: none;
    border: none;
    padding: 0;
    text-decoration: none;
    display: inline grid;
    color: var(--primary);
    background-color: transparent;
    height: var(--height);

    --background-opacity: 0.125;
    --height: 40px;
  }

  .hexagon-button > * {
    grid-area: 1 / 1 / 1 / 1;
    place-self: stretch;
  }

  .hexagon-button > .background {
    z-index: -1;
    background-color: var(--primary);
    opacity: var(--background-opacity);
  }

  .hexagon-button > .children {
    align-self: center;
    padding: 0 calc(var(--height) / 2);
    font-size: 14pt;
    font-weight: 500;
  }

  .hexagon-button:hover,
  .hexagon-button:focus-visible {
    --background-opacity: 0.25;
  }

  .hexagon-button:active {
    --background-opacity: 0.375;
  }

  .hexagon-button:disabled {
    opacity: 0.5;

    --background-opacity: 0.125;
  }
</style>
