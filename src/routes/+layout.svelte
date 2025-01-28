<script lang="ts">
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

{#if session != null}
	<button onclick={signOut}>Sign Out</button>
{:else}
	<button onclick={openSignInModal}>Sign In</button>
{/if}

{@render children()}

<SignInModal {supabase} />
