<script lang="ts">
	import "modern-normalize";
	import { invalidate } from "$app/navigation";
	import { PUBLIC_SUPABASE_URL } from "$env/static/public";
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
</script>

<svelte:head>
	<link rel="preconnect" href={PUBLIC_SUPABASE_URL} />
</svelte:head>

{@render children()}
