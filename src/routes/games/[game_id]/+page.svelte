<script lang="ts">
	import { invalidate } from "$app/navigation";
	import type { Tables } from "$lib/database-types.js";

	const { data } = $props();
	const { supabase } = $derived(data);

	let game = $state(data.game);

	$effect(() => {
		game = data.game;

		console.log("effect");

		const game_id = data.game.id;

		const channel = supabase
			.channel("schema-db-changes")
			.on<Tables<"games">>(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "games",
					filter: `id=eq.${game_id}`,
				},
				({ new: { id, board, turn, winner_player_number } }) => {
					game = {
						id,
						board,
						turn,
						winner_player_number,
						players: game.players,
					};
				},
			)
			.on<Tables<"players">>(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "players",
					filter: `game_id=eq.${game_id}`,
				},
				() => invalidate(`supabase:games:${game_id}`),
			)
			.on<Tables<"players">>(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "players",
					filter: `game_id=eq.${game_id}`,
				},
				({ new: { user_id, player_number, color } }) => {
					const player = game.players.find((player) => player.user_id === user_id);
					if (player == undefined) {
						return invalidate(`supabase:games:${game_id}`);
					}
					player.player_number = player_number;
					player.color = color;
				},
			)
			.subscribe();

		return () => channel.unsubscribe();
	});
</script>

<code>
	<pre>{JSON.stringify(game, null, 2)}</pre>
</code>
