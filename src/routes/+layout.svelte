<script lang="ts">
	import "modern-normalize";
	import "$lib/themes.css";
	import { invalidate } from "$app/navigation";
	import { PUBLIC_SUPABASE_URL } from "$env/static/public";
	import SignInModal, { openSignInModal } from "$lib/SignInModal.svelte";
	import { onMount } from "svelte";

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth");
			}
		});

		return () => data.subscription.unsubscribe();
	});

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}
	};
</script>

<svelte:head>
	<link rel="preconnect" href={PUBLIC_SUPABASE_URL} />
</svelte:head>

<header>
	<h1><a href="/">Connexagon</a></h1>

	{#if session != null}
		<button onclick={signOut}>Sign Out</button>
	{:else}
		<button onclick={openSignInModal}>Sign In</button>
	{/if}
</header>

{@render children()}

<SignInModal {supabase} />

<style>
	header {
		padding: 12px;
		display: grid;
		grid-template-columns: auto auto;
		align-items: center;
		justify-content: space-between;

		h1 {
			margin: 0;
		}
	}
</style>
