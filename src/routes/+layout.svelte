<script lang="ts">
  import "modern-normalize";
  import "$lib/themes.css";
  import { invalidate } from "$app/navigation";
  import { PUBLIC_SUPABASE_URL } from "$env/static/public";
  import { onMount } from "svelte";
  import EditNameButton from "$lib/EditNameButton.svelte";
  import { showModal } from "$lib/modal";
  import Button from "$lib/Button.svelte";
  import { MediaQuery } from "svelte/reactivity";

  import svgFavicon from "$lib/logo/favicon.svg";
  import pngFavicon from "$lib/logo/favicon-192.png";
  import appleTouchIcon from "$lib/logo/square-icon-180.png";
  import { unsubscribeFromNotifications } from "$lib/notifications.client.js";

  let { data, children } = $props();
  let { supabase, session, user, profilePromise, lightModeCookie } = $derived(data);

  // svelte-ignore state_referenced_locally
  // this is ok because MediaQuery is already reactive
  const lightMode = new MediaQuery("prefers-color-scheme: light", lightModeCookie);

  $effect(() => {
    document.cookie = `lightMode=${lightMode.current}`;
  });

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => void data.subscription.unsubscribe();
  });

  $effect(() => {
    if (user == null) {
      import("$lib/SignInModal.svelte");
    }
  });

  const signOut = async () => {
    await unsubscribeFromNotifications(supabase);
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      throw error;
    }
  };
</script>

<svelte:head>
  <link rel="manifest" href="/manifest?light-mode={lightMode.current}" />
  <link rel="icon" href={svgFavicon} type="image/svg+xml" sizes="any" />
  <link rel="icon" href={pngFavicon} type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href={appleTouchIcon} />
  <link rel="preconnect" href={PUBLIC_SUPABASE_URL} />
</svelte:head>

<header>
  <h1><a href="/">Connexagon</a></h1>

  {#if user != null}
    <EditNameButton {profilePromise} {supabase} {user} />

    <Button onclick={signOut}>Sign Out</Button>
  {:else}
    <Button onclick={() => showModal(signInForm)}>Sign In</Button>
  {/if}
</header>

{@render children()}

{#snippet signInForm()}
  {#await import("$lib/SignInModal.svelte") then { default: SignInModal }}
    <SignInModal {supabase} {user} />
  {/await}
{/snippet}

<style>
  header {
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-flow: column;
    align-items: center;
    gap: 12px;
  }

  h1 {
    margin: 0;
  }
</style>
