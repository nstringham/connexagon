<script lang="ts">
  import type { Snippet } from "svelte";

  let dialogElement: HTMLDialogElement;

  let {
    open = $bindable(false),
    onclose,
    children,
  }: {
    open: boolean;
    onclose?: (event: Event) => void;
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
  onclose={(event) => {
    open = false;
    onclose?.(event);
  }}
>
  {@render children()}
</dialog>
