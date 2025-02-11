<script lang="ts" module>
  import { pushState, replaceState } from "$app/navigation";

  // eslint-disable-next-line no-undef -- eslint doesn't know about App
  function setModalState(signInModalState: App.PageState["signInModalState"]) {
    if (page.state.signInModalState !== signInModalState) {
      pushState("", { signInModalState });
    }
  }

  export function openSignInModal() {
    setModalState("sign-in-options");
  }
</script>

<script lang="ts">
  import { page } from "$app/state";
  import type { Provider, SupabaseClient, User } from "@supabase/supabase-js";
  import Modal from "./Modal.svelte";

  const { supabase, user }: { supabase: SupabaseClient; user: User | null } = $props();

  const signInModalState = $derived(page.state.signInModalState);

  let open = $state(false);

  let email = $state("");
  let token = $state("");

  $effect(() => {
    if (signInModalState != undefined && user != null) {
      closeSignInModal();
    }
  });

  $effect(() => {
    if (signInModalState != undefined) {
      open = true;
    } else {
      open = false;
      email = "";
      token = "";
    }
  });

  async function signInWithOAuth(provider: Provider) {
    const redirectUrl = new URL("/auth/callback", location.href);
    redirectUrl.searchParams.set("next", location.href);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl.href },
    });
    if (error) {
      throw error;
    }
  }

  async function signInWithEmail(event: SubmitEvent) {
    event.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      throw error;
    }
    token = "";
    setModalState("enter-otp");
  }

  async function signInWithOtp(event: SubmitEvent) {
    event.preventDefault();
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) {
      throw error;
    }
  }

  async function signInAnonymously() {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw error;
    }
  }

  function closeSignInModal() {
    if (page.state.signInModalState !== undefined) {
      replaceState("", { signInModalState: undefined });
    }
  }
</script>

<Modal {open} onclose={() => closeSignInModal()}>
  <div class={signInModalState}>
    {#if signInModalState == "sign-in-options"}
      <button onclick={() => signInWithOAuth("google")}>Sign in with Google</button>
      <button onclick={() => signInWithOAuth("discord")}>Sign in with Discord</button>
      <button onclick={() => setModalState("sign-in-with-email")}>Sign in with Email</button>
      <button onclick={signInAnonymously}>Continue as Guest</button>
    {:else if signInModalState == "sign-in-with-email"}
      <form onsubmit={signInWithEmail}>
        <label>
          Email
          <input name="email" type="email" bind:value={email} />
        </label>
        <button type="submit">Send me a code</button>
      </form>
    {:else if signInModalState == "enter-otp"}
      <form onsubmit={signInWithOtp}>
        <p>A one time code was sent to {email}</p>
        <label>
          Code
          <input name="token" type="text" minlength="6" maxlength="6" bind:value={token} />
        </label>
        <button type="submit">Submit</button>
      </form>
    {/if}
  </div>
</Modal>

<style>
  .sign-in-options {
    display: grid;
    gap: 12px;
  }
</style>
