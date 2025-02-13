<script lang="ts">
  import { onDestroy, onMount, setContext, type Snippet } from "svelte";

  let dialogElement: HTMLDialogElement;

  let {
    preventCancel = false,
    onclose,
    children,
  }: {
    preventCancel?: boolean;
    onclose?: (event: Event & { currentTarget: EventTarget & HTMLDialogElement }) => void;
    children: Snippet;
  } = $props();

  onMount(() => {
    dialogElement.showModal();
    setContext("modal", dialogElement);
  });

  onDestroy(() => {
    dialogElement.close();
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
  {onclose}
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
