<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { showToast } from "$lib/Toasts.svelte";

  let message = "";
</script>

<form
  onsubmit={(event) => {
    event.preventDefault();

    showToast({ message });

    message = "";
  }}
>
  <label>Message <input type="text" bind:value={message} required /></label><br />
  <Button type="submit">Show toast</Button>
</form>
