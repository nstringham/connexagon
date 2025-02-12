<script lang="ts">
  import type { Snippet } from "svelte";

  let dialogElement: HTMLDialogElement;

  let {
    open = $bindable(false),
    preventCancel,
    children,
  }: {
    open: boolean;
    preventCancel?: boolean;
    children: Snippet;
  } = $props();

  $effect(() => {
    if (open) {
      dialogElement.showModal();
    } else {
      dialogElement.close();
    }
  });
</script>

<dialog
  bind:this={dialogElement}
  oncancel={(event) => {
    if (preventCancel) {
      event.preventDefault();
    }
  }}
  onclose={() => {
    open = false;
  }}
>
  {@render children()}
</dialog>
