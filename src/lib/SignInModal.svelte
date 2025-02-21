<script lang="ts">
  import type { Provider, SupabaseClient, User } from "@supabase/supabase-js";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
  import Turnstile from "./Turnstile.svelte";
  import { getContext } from "svelte";
  import Button from "./Button.svelte";

  const { supabase, user }: { supabase: SupabaseClient; user: User | null } = $props();

  let modalState: "sign-in-options" | "sign-in-with-email" | "enter-otp" | "anonymous-captcha" =
    $state("sign-in-options");

  let email = $state("");
  let captchaToken = $state("");
  let token = $state("");

  $effect(() => {
    if (user != null) {
      const modal = getContext("modal");
      if (modal instanceof HTMLDialogElement) {
        modal.close();
      }
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

<div class={modalState}>
  {#if modalState === "sign-in-options"}
    <Button onclick={() => signInWithOAuth("google")}>Sign in with Google</Button>
    <Button onclick={() => signInWithOAuth("discord")}>Sign in with Discord</Button>
    <Button onclick={() => (modalState = "sign-in-with-email")}>Sign in with Email</Button>
    <Button onclick={() => (modalState = "anonymous-captcha")}>Continue as Guest</Button>
  {:else if modalState === "sign-in-with-email"}
    <Button onclick={() => (modalState = "sign-in-options")}>Go back</Button>
    <form onsubmit={signInWithEmail}>
      <label>
        Email
        <!-- svelte-ignore a11y_autofocus -->
        <input autofocus name="email" type="email" bind:value={email} />
      </label>
      <Turnstile sitekey={PUBLIC_TURNSTILE_SITE_KEY} callback={(token) => (captchaToken = token)} />
      <Button type="submit" disabled={captchaToken === ""}>Send me a code</Button>
    </form>
  {:else if modalState === "enter-otp"}
    <Button onclick={() => (modalState = "sign-in-with-email")}>Go back</Button>
    <form onsubmit={signInWithOtp}>
      <p>A one time code was sent to {email}</p>
      <label>
        Code
        <!-- svelte-ignore a11y_autofocus -->
        <input autofocus name="token" type="text" minlength="6" maxlength="6" bind:value={token} />
      </label>
      <Button type="submit">Submit</Button>
    </form>
  {:else if modalState === "anonymous-captcha"}
    <Turnstile sitekey={PUBLIC_TURNSTILE_SITE_KEY} callback={(token) => signInAnonymously(token)} />
  {/if}
</div>

<style>
  .sign-in-options {
    display: grid;
    gap: 12px;
  }
</style>
