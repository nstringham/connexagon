<script lang="ts">
	import { invalidate } from "$app/navigation";
	import { getMaxTurnSize, getTowers, type Cell } from "$lib/board.js";
	import Board from "$lib/Board.svelte";
	import type { Tables } from "$lib/database-types.js";

	const { data } = $props();
	const { supabase, user } = $derived(data);

	let game = $state(data.game);

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
				({ new: { id, host_user_id, board, turn, winner } }) => {
					game = {
						id,
						host_user_id,
						board,
						turn,
						winner,
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

	const userColor = $derived(game.players.find((player) => player.user_id == user?.id)?.color);

	const isTurn = $derived(
		game.turn == null ? false : game.players[game.turn % game.players.length].color == userColor,
	);

	const board = $derived(game.board as Cell[] | null);

	const { towersByColor } = $derived(getTowers(board ?? []));

	const maxAllowedSelection = $derived(
		!isTurn || userColor == undefined ? 0 : getMaxTurnSize(game.turn!, towersByColor[userColor]),
	);

	let selection: number[] = $state([]);

	async function startGame() {
		await fetch(`/games/${game.id}/start`, { method: "POST" });
	}

	async function makeTurn() {
		await fetch(`/games/${game.id}/turns`, { method: "POST", body: JSON.stringify(selection) });
		selection = [];
	}
</script>

{#if board != null}
	<div style:--user-color={userColor}>
		<Board class="board" {board} bind:selection {maxAllowedSelection} />
	</div>
{:else if user?.id === game.host_user_id}
	<button onclick={startGame}>Start game</button>
{/if}

{#if isTurn}
	<button onclick={makeTurn}>Make turn</button>
{/if}

<code>
	<pre>{JSON.stringify(game, null, 2)}</pre>
</code>

<style>
	* > :global(.board) {
		width: min(100svh, 100svw);
	}
</style>
