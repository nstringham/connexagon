<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { showToast } from "$lib/Toasts.svelte";

  let message = "";
  let error = false;
</script>

<form
  onsubmit={(event) => {
    event.preventDefault();

    showToast({ message, style: error ? "error" : undefined });

    message = "";
  }}
>
  <label>Message <input type="text" bind:value={message} required /></label><br />
  <label>Error <input type="checkbox" bind:checked={error} /></label><br />
  <Button type="submit">Show toast</Button>
</form>
