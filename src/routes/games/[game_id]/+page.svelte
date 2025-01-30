<script lang="ts">
	import { invalidate } from "$app/navigation";
	import Board from "$lib/Board.svelte";
	import type { Tables } from "$lib/database-types.js";

	const { data } = $props();
	const { supabase, user } = $derived(data);

	let game = $state(data.game);

	const userColor = $derived(game.players.find((player) => player.user_id == user?.id)?.color);

	$effect(() => {
		game = data.game;

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
				({ new: { id, board, turn, winner, started_at } }) => {
					game = {
						id,
						board,
						turn,
						winner,
						started_at,
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
				({ new: { user_id, turn_order, color } }) => {
					const player = game.players.find((player) => player.user_id === user_id);
					if (player == undefined) {
						return invalidate(`supabase:games:${game_id}`);
					}
					player.turn_order = turn_order;
					player.color = color;
				},
			)
			.subscribe();

		return () => channel.unsubscribe();
	});

	async function joinGame() {
		const { error } = await supabase.rpc("join_game", { game_id_to_join: game.id });
		if (error) {
			throw error;
		}
	}
</script>

{#if game.board != null}
	<div style:--user-color={userColor}>
		<Board class="board" board={game.board} maxAllowedSelection={3} />
	</div>
{/if}

{#if userColor == null && game.started_at == null}
	<button onclick={joinGame}>Join Game</button>
{/if}

<code>
	<pre>{JSON.stringify(game, null, 2)}</pre>
</code>

<style>
	* > :global(.board) {
		width: min(100svh, 100svw);
	}
</style>
