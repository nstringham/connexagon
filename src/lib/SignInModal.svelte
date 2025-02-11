<script lang="ts" module>
  // eslint-disable-next-line no-undef -- eslint doesn't know about App
  function setModalState(signInModalState: App.PageState["signInModalState"]) {
    pushState("", { signInModalState });
  }

  export function openSignInModal() {
    setModalState("sign-in-options");
  }

  export function closeSignInModal() {
    setModalState(undefined);
  }
</script>

<script lang="ts">
  import { pushState } from "$app/navigation";

  import { page } from "$app/state";

  import type { SupabaseClient } from "@supabase/supabase-js";

  let dialogElement: HTMLDialogElement;

  const { supabase }: { supabase: SupabaseClient } = $props();

  const signInModalState = $derived(page.state.signInModalState);

  const showSignModal = $derived(signInModalState != undefined);

  let email = $state("");
  let token = $state("");

  $effect(() => {
    if (showSignModal) {
      dialogElement.showModal();
    } else {
      dialogElement.close();
      email = "";
      token = "";
    }
  });

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
</script>

<dialog bind:this={dialogElement} onclose={closeSignInModal}>
  <div class={signInModalState}>
    {#if signInModalState == "sign-in-options"}
      <button disabled>Sign in with Google</button>
      <button disabled>Sign in with Microsoft</button>
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
</dialog>

<style>
  .sign-in-options {
    display: grid;
    gap: 12px;
  }
</style>
