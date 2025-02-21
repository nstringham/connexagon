<script lang="ts">
  import type { Snippet } from "svelte";

  type CommonProps = {
    children: Snippet;
  };

  type LinkProps = {
    href: string;
  };

  type ButtonProps = {
    type?: HTMLButtonElement["type"];
    onclick?: () => unknown;
    disabled?: boolean;
  };

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
  <div class="background"></div>
  <div class="children">{@render children()}</div>
{/snippet}

<style>
  .hexagon-button {
    appearance: none;
    border: none;
    text-decoration: none;
    display: inline grid;
    color: var(--primary);
    background-color: transparent;
    height: 40px;

    --background-opacity: 0.125;
  }

  .hexagon-button > * {
    grid-area: 1/2/1/2;
    place-self: stretch;
  }

  .hexagon-button > .background {
    background-color: var(--primary);
    opacity: var(--background-opacity);
    clip-path: polygon(
      calc(40px / 3.4641) 0,
      calc(100% - 40px / 3.4641) 0,
      100% 50%,
      calc(100% - 40px / 3.4641) 100%,
      calc(40px / 3.4641) 100%,
      0 50%
    );
  }

  .hexagon-button > .children {
    align-self: center;
    padding: 0 calc(40px / 2);
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
