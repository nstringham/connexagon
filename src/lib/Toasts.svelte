<script lang="ts" module>
  export type Toast = {
    message: string;
    style?: "error";
  };

  let toasts: (Toast & { expiration: number })[] = $state([]);

  export function showToast(toast: Toast) {
    const expiration = Date.now() + 5_000;

    toasts.push({ ...toast, expiration });
    setTimeout(() => {
      toasts = toasts.filter((toast) => toast.expiration > Date.now());
    }, 5_000);
  }
</script>

<script lang="ts">
  import "$lib/hexagons.css";
</script>

<div class="wrapper">
  {#each toasts as toast, i (i)}
    <div class="toast {toast.style}">
      <div class="background clip-hexagon"></div>
      <span class="message">{toast.message}</span>
    </div>
  {/each}
</div>

<style>
  .wrapper {
    position: fixed;
    bottom: 0;
  }

  .toast.error {
    color: red;
  }
</style>
