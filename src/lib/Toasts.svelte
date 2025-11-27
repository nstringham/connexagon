<script lang="ts" module>
  export type Toast = {
    message: string;
    style?: "error";
  };

  export function showToast(toast: Toast) {
    toastQueue.push(toast);
    mainLoop();
  }

  let toastQueue: Toast[] = [];
  let currentToast: Toast | undefined = $state();

  let active = false;
  async function mainLoop() {
    if (active) {
      return;
    }

    active = true;

    while (toastQueue.length > 0) {
      currentToast = toastQueue.shift();
      await wait(5_000);

      currentToast = undefined;
      await wait(1_000);
    }

    active = false;
  }

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
</script>

<script lang="ts">
  import "$lib/hexagons.css";
  import { fade, fly } from "svelte/transition";

  let height: number = $state(48);
</script>

{#if currentToast != undefined}
  <div
    class="toast clip-hexagon {currentToast.style}"
    in:fly={{ y: "100%" }}
    out:fade
    bind:clientHeight={height}
    style:--height="{height}px"
  >
    {currentToast.message}
  </div>
{/if}

<style>
  .toast {
    color: var(--background-color);
    background-color: var(--foreground-color);
    font-size: 14pt;
    font-weight: 400;
    position: fixed;
    left: 0;
    bottom: 0;
    margin: 24px;
    min-height: 48px;
    padding: 12px calc(var(--height) / 3.4641 + 6px);
    display: grid;
    place-content: center;
  }

  .toast.error {
    background-color: var(--red);
    color: white;
  }

  @media (width < 600px) {
    .toast {
      right: 0;
    }
  }
</style>
