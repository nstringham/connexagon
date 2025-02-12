<script lang="ts">
  import "modern-normalize";
  import "$lib/themes.css";
  import { invalidate } from "$app/navigation";
  import { PUBLIC_SUPABASE_URL } from "$env/static/public";
  import SignInModal, { openSignInModal } from "$lib/SignInModal.svelte";
  import { onMount } from "svelte";
  import EditNameModal from "$lib/EditNameModal.svelte";

  let { data, children } = $props();
  let { supabase, session, user, profilePromise } = $derived(data);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => void data.subscription.unsubscribe();
  });

  const signOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      throw error;
    }
  };

  let showEditNameModal = $state(false);
</script>

<svelte:head>
  <link rel="preconnect" href={PUBLIC_SUPABASE_URL} />
</svelte:head>

<header>
  <h1><a href="/">Connexagon</a></h1>

  {#if session != null}
    <button onclick={() => (showEditNameModal = true)}>Edit Name</button>
    <button onclick={signOut}>Sign Out</button>
  {:else}
    <button onclick={openSignInModal}>Sign In</button>
  {/if}
</header>

{@render children()}

<SignInModal {supabase} {user} />

{#if user != null}
  {#await profilePromise then profile}
    <EditNameModal bind:open={showEditNameModal} {profile} {supabase} {user} />
  {/await}
{/if}

<style>
  header {
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-flow: column;
    align-items: center;
    gap: 12px;

    h1 {
      margin: 0;
    }
  }
</style>
