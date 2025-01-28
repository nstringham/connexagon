<script lang="ts" module>
	let showSignModal = $state(false);

	export function openSignInModal() {
		showSignModal = true;
	}

	export function closeSignInModal() {
		showSignModal = false;
	}
</script>

<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";

	let dialogElement: HTMLDialogElement;

	const { supabase }: { supabase: SupabaseClient } = $props();

	let email = $state("");

	let password = $state("");

	$effect(() => {
		if (showSignModal) {
			dialogElement.showModal();
		} else {
			dialogElement.close();
		}
	});

	async function signIn() {
		await supabase.auth.signInWithPassword({ email, password });
		email = "";
		password = "";
		showSignModal = false;
	}

	async function signUp() {
		await supabase.auth.signUp({ email, password });
		email = "";
		password = "";
		showSignModal = false;
	}
</script>

<dialog bind:this={dialogElement} onclose={() => (showSignModal = false)}>
	<form method="dialog">
		<label>
			Email
			<input name="email" type="email" bind:value={email} />
		</label>
		<label>
			Password
			<input name="password" type="password" bind:value={password} />
		</label>
		<button type="submit" onclick={signIn}>Sign In</button>
		<button type="submit" onclick={signUp}>Sign up</button>
	</form>
</dialog>
