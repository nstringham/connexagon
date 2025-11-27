<script lang="ts">
  import "modern-normalize";
  import "$lib/themes.css";
  import { invalidate } from "$app/navigation";
  import { PUBLIC_SUPABASE_URL } from "$env/static/public";
  import { onMount } from "svelte";
  import Button from "$lib/Button.svelte";
  import { MediaQuery } from "svelte/reactivity";

  import svgFavicon from "$lib/logo/favicon.svg";
  import pngFavicon from "$lib/logo/favicon-192.png";
  import appleTouchIcon from "$lib/logo/square-icon-180.png";
  import Modal from "$lib/Modal.svelte";
  import EditNameForm from "$lib/EditNameForm.svelte";
  import AccountModal from "$lib/AccountModal.svelte";
  import Toasts from "$lib/Toasts.svelte";
  import { toastError } from "$lib/errors.js";

  let { data, children } = $props();
  let { supabase, session, user, profilePromise, lightModeCookie } = $derived(data);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => void data.subscription.unsubscribe();
  });

  // svelte-ignore state_referenced_locally
  // this is ok because MediaQuery is already reactive
  const lightMode = new MediaQuery("prefers-color-scheme: light", lightModeCookie);

  $effect(() => {
    document.cookie = `lightMode=${lightMode.current}`;
  });

  let showSignInModal = $state(false);
  let showChooseNameModal = $state(false);
  let showAccountModal = $state(false);

  $effect(() => {
    profilePromise.then((profile) => {
      showChooseNameModal = profile == null;
    });
  });
</script>

<svelte:head>
  <link rel="manifest" href="/manifest?light-mode={lightMode.current}" />
  <link rel="icon" href={svgFavicon} type="image/svg+xml" sizes="any" />
  <link rel="icon" href={pngFavicon} type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href={appleTouchIcon} />
  <link rel="preconnect" href={PUBLIC_SUPABASE_URL} />
</svelte:head>

<svelte:window
  onerror={(event) => toastError(event instanceof ErrorEvent ? event.error : event)}
  onunhandledrejection={(event) => toastError(event.reason)}
/>

<header>
  <h1><a href="/">Connexagon</a></h1>

  {#if user == null}
    <Button onclick={() => (showSignInModal = true)}>Sign In</Button>
  {:else}
    <Button onclick={() => (showAccountModal = true)}>Account</Button>
  {/if}
</header>

{@render children()}

{#if user == null}
  {#await import("$lib/SignInModal.svelte") then { default: SignInModal }}
    <SignInModal {supabase} {user} bind:open={showSignInModal} />
  {/await}
{:else}
  <Modal bind:open={showChooseNameModal}>
    <EditNameForm {supabase} {user} {profilePromise} />
  </Modal>

  <AccountModal {supabase} {user} {profilePromise} bind:open={showAccountModal} />
{/if}

<Toasts />

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
