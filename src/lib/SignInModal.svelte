<script lang="ts" module>
  let modalState: "closed" | "sign-in-options" | "sign-in-with-email" | "enter-otp" =
    $state("closed");

  export function openSignInModal() {
    modalState = "sign-in-options";
  }
</script>

<script lang="ts">
  import type { Provider, SupabaseClient, User } from "@supabase/supabase-js";
  import Modal from "./Modal.svelte";

  const { supabase, user }: { supabase: SupabaseClient; user: User | null } = $props();

  let open = $state(false);

  let email = $state("");
  let token = $state("");

  $effect(() => {
    if (modalState !== "closed" && user != null) {
      modalState = "closed";
    }
  });

  $effect(() => {
    if (modalState !== "closed") {
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
    modalState = "enter-otp";
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
</script>

<Modal bind:open>
  <div class={modalState}>
    {#if modalState === "sign-in-options"}
      <button onclick={() => signInWithOAuth("google")}>Sign in with Google</button>
      <button onclick={() => signInWithOAuth("discord")}>Sign in with Discord</button>
      <button onclick={() => (modalState = "sign-in-with-email")}>Sign in with email</button>
      <button onclick={signInAnonymously}>Continue as guest</button>
    {:else if modalState === "sign-in-with-email"}
      <button onclick={() => (modalState = "sign-in-options")}>Go back</button>
      <form onsubmit={signInWithEmail}>
        <label>
          Email
          <input name="email" type="email" bind:value={email} />
        </label>
        <button type="submit">Send me a code</button>
      </form>
    {:else if modalState === "enter-otp"}
      <button onclick={() => (modalState = "sign-in-with-email")}>Go back</button>
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
