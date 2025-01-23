<script lang="ts">
	import type { Tables } from "$lib/database-types.js";
	import type { RealtimeChannel } from "@supabase/supabase-js";
	import { onDestroy, onMount } from "svelte";
	import type { EventHandler } from "svelte/elements";

	let { data } = $props();
	let { supabase, user } = $derived(data);

	const notes = $state(data.notes);

	let notes_channel: RealtimeChannel | undefined;

	onMount(() => {
		notes_channel = supabase
			.channel("schema-db-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					table: "notes",
					schema: "public",
				},
				({ eventType, old: before, new: after }) => {
					if (eventType == "INSERT") {
						notes.push(after as Tables<"notes">);
					} else if (eventType == "UPDATE") {
						const index = notes.findIndex((note) => note.id == before.id);
						notes.splice(index, 1, after as Tables<"notes">);
					} else if (eventType == "DELETE") {
						const index = notes.findIndex((note) => note.id == before.id);
						notes.splice(index, 1);
					}
				},
			)
			.subscribe();
	});

	onDestroy(() => {
		notes_channel?.unsubscribe();
	});

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (evt) => {
		evt.preventDefault();
		if (!evt.target) return;

		const form = evt.target as HTMLFormElement;

		const note = (new FormData(form).get("note") ?? "") as string;
		if (!note) return;

		const { error } = await supabase.from("notes").insert({ note });
		if (error) console.error(error);

		form.reset();
	};
</script>

<h1>Private page for user: {user?.email}</h1>
<h2>Notes</h2>
<ul>
	{#each notes as note}
		<li>{note.note}</li>
	{/each}
</ul>
<form onsubmit={handleSubmit}>
	<label>
		Add a note
		<input name="note" type="text" />
	</label>
</form>
