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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
  onclick={(event) => {
    if (preventCancel) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    if (
      rect.left > event.clientX ||
      rect.right < event.clientX ||
      rect.top > event.clientY ||
      rect.bottom < event.clientY
    ) {
      dialogElement.close();
    }
  }}
>
  {@render children()}
</dialog>
