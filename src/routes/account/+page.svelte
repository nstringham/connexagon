<script lang="ts">
	import { invalidateAll } from "$app/navigation";

	const { data } = $props();
	const { profile, supabase } = $derived(data);

	let name = $state("");

	$effect(() => {
		if (profile?.name) {
			name = profile.name;
		}
	});

	async function save() {
		const { error } = await supabase.rpc("set_name", { name });
		if (error) {
			throw error;
		}
		invalidateAll();
	}
</script>

<label>Name: <input type="text" name="name" bind:value={name} /></label>

<button onclick={save}>Save</button>
