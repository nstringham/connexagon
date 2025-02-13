<script lang="ts" module>
  let modalState:
    | "closed"
    | "sign-in-options"
    | "sign-in-with-email"
    | "enter-otp"
    | "anonymous-captcha" = $state("closed");

  export function openSignInModal() {
    modalState = "sign-in-options";
  }
</script>

<script lang="ts">
  import type { Provider, SupabaseClient, User } from "@supabase/supabase-js";
  import Modal from "./Modal.svelte";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
  import Turnstile, { loadTurnstileScript } from "./Turnstile.svelte";

  const { supabase, user }: { supabase: SupabaseClient; user: User | null } = $props();

  let email = $state("");
  let captchaToken = $state("");
  let token = $state("");

  $effect(() => {
    if (modalState !== "closed" && user != null) {
      modalState = "closed";
    }
  });

  $effect(() => {
    if (modalState !== "closed") {
      loadTurnstileScript();
    } else {
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
    if (captchaToken == "") {
      throw new Error("cannot sign in without completing CAPTCHA");
    }
    event.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { captchaToken } });
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

  async function signInAnonymously(captchaToken: string) {
    const { error } = await supabase.auth.signInAnonymously({ options: { captchaToken } });
    if (error) {
      throw error;
    }
  }
</script>

{#if modalState !== "closed"}
  <Modal onclose={() => (modalState = "closed")}>
    <div class={modalState}>
      {#if modalState === "sign-in-options"}
        <button onclick={() => signInWithOAuth("google")}>Sign in with Google</button>
        <button onclick={() => signInWithOAuth("discord")}>Sign in with Discord</button>
        <button onclick={() => (modalState = "sign-in-with-email")}>Sign in with email</button>
        <button onclick={() => (modalState = "anonymous-captcha")}>Continue as guest</button>
      {:else if modalState === "sign-in-with-email"}
        <button onclick={() => (modalState = "sign-in-options")}>Go back</button>
        <form onsubmit={signInWithEmail}>
          <label>
            Email
            <!-- svelte-ignore a11y_autofocus -->
            <input autofocus name="email" type="email" bind:value={email} />
          </label>
          <Turnstile
            sitekey={PUBLIC_TURNSTILE_SITE_KEY}
            callback={(token) => (captchaToken = token)}
          />
          <button type="submit" disabled={captchaToken === ""}>Send me a code</button>
        </form>
      {:else if modalState === "enter-otp"}
        <button onclick={() => (modalState = "sign-in-with-email")}>Go back</button>
        <form onsubmit={signInWithOtp}>
          <p>A one time code was sent to {email}</p>
          <label>
            Code
            <!-- svelte-ignore a11y_autofocus -->
            <input
              autofocus
              name="token"
              type="text"
              minlength="6"
              maxlength="6"
              bind:value={token}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      {:else if modalState === "anonymous-captcha"}
        <Turnstile
          sitekey={PUBLIC_TURNSTILE_SITE_KEY}
          callback={(token) => signInAnonymously(token)}
        />
      {/if}
    </div>
  </Modal>
{/if}

<style>
  .sign-in-options {
    display: grid;
    gap: 12px;
  }
</style>
