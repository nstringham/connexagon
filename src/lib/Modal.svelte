<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Action } from "svelte/action";

  let {
    preventCancel = false,
    open = $bindable(true),
    children,
  }: {
    preventCancel?: boolean;
    open?: boolean;
    children: Snippet;
  } = $props();

  const showModal: Action<HTMLDialogElement> = (dialog) => {
    dialog.showModal();
  };
</script>

{#if open}
  <dialog
    use:showModal
    oncancel={(event) => {
      if (preventCancel) {
        event.preventDefault();
      }
    }}
    onclose={() => {
      open = false;
    }}
    onclick={(event) => {
      if (preventCancel) {
        return;
      }

      if (event.clientX == 0 && event.clientY == 0) {
        // fake click event
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        open = false;
      }
    }}
  >
    {@render children()}
  </dialog>
{/if}
