<script lang="ts" module>
  let promise: Promise<TurnstileObject> | undefined;

  export function loadTurnstileScript() {
    if (promise == undefined) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.body.appendChild(script);

      promise = new Promise((resolve, reject) => {
        script.addEventListener("load", () => resolve(window.turnstile), { once: true });
        script.addEventListener("error", reject, { once: true });
      });
    }

    return promise;
  }
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { TurnstileObject, RenderParameters } from "turnstile-types";

  let element: HTMLDivElement;

  const props: RenderParameters = $props();

  onMount(async () => {
    const turnstile = await loadTurnstileScript();
    turnstile.render(element, props);
  });

  onDestroy(async () => {
    const turnstile = await loadTurnstileScript();
    turnstile.remove(element);
  });
</script>

<div bind:this={element}></div>

<style>
  div {
    display: contents;
  }
</style>
