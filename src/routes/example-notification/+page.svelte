<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { enhance } from "$app/forms";
</script>

<p>This demo shows how to register for push notifications and how to send them.</p>

<form method="POST" action="?/sendNotification" use:enhance>
  Notification Message:<input type="text" name="title" value="It's Your Turn" /> <br />
  Notification delay: <input type="number" name="delay" value="5" /> seconds <br />
  <Button type="submit">Send Push Notification</Button>
</form>
