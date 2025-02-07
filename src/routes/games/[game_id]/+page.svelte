<script lang="ts">
  import { dev } from "$app/environment";
  import { invalidate } from "$app/navigation";
  import { Color, colors, getMaxTurnSize, countTowers, decodeHex, cssColors } from "$lib/board";
  import Board from "$lib/Board.svelte";
  import type { Tables } from "$lib/database-types";

  const { data } = $props();
  const { origin, supabase, user } = $derived(data);

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
        ({ new: { id, host_user_id, towers, cell_colors, turn, winner, completed_at } }) => {
          game = {
            id,
            host_user_id,
            towers,
            cell_colors: "\\x" + new TextDecoder("ascii").decode(decodeHex(cell_colors)), // workaround for https://github.com/supabase/realtime-js/issues/453
            turn,
            winner,
            completed_at,
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

    return () => void channel.unsubscribe();
  });

  $effect(() => {
    if (game.turn != null) {
      game.players.sort((a, b) => a.turn_order! - b.turn_order!);
    }
  });

  const userColor = $derived(game.players.find((player) => player.user_id == user?.id)?.color);

  const isGameOver = $derived(game.completed_at != null);

  const isTurn = $derived(
    game.turn == null ? false : game.players[game.turn % game.players.length].color == userColor,
  );

  const towers = $derived(new Set(game.towers));

  const cells = $derived(decodeHex(game.cell_colors));

  const towersByColor = $derived(countTowers({ towers, cells }));

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

  async function joinGame() {
    const { error } = await supabase.rpc("join_game", { game_id_to_join: game.id });
    if (error) {
      throw error;
    }
  }

  const colorOptions = $derived(
    colors.map((color) => ({
      color,
      available: !game.players.some(
        (player) => player.color == color && player.user_id != user?.id,
      ),
    })),
  );

  async function changeColor(color: Color) {
    if (user == null) {
      throw new Error("cannot set color because user is not logged in");
    }
    const { error } = await supabase
      .from("players")
      .update({ color })
      .eq("game_id", game.id)
      .eq("user_id", user.id);
    if (error) {
      throw error;
    }
  }
</script>

<svelte:head>
  <meta property="og:image" content="{origin}/games/{game.id}/preview?width=1200&height=630" />
</svelte:head>

{#if cells.length === 0}
  {#if userColor != null}
    <label>
      Color:
      <select
        name="color"
        value={userColor}
        onchange={({ currentTarget }) => changeColor(parseInt(currentTarget.value) as Color)}
      >
        {#each colorOptions as { color, available }}
          {#if color !== Color.UNCLAIMED}
            <option value={color} disabled={!available}>{Color[color]}</option>
          {/if}
        {/each}
      </select>
    </label>
    {#if user?.id === game.host_user_id}
      <button onclick={startGame} disabled={game.players.length < 2}>Start game</button>
    {/if}
  {:else}
    <button onclick={joinGame}>Join Game</button>
  {/if}
{:else}
  <div style:--user-color={cssColors[userColor as Color]}>
    <Board class="board" {towers} {cells} bind:selection {maxAllowedSelection} />
  </div>
  {#if isGameOver}
    <h1 style:color={cssColors[game.winner as Color]}>
      {game.players.find((player) => player.color === game.winner)?.profile.name ?? "nobody"} won!
    </h1>
  {:else if isTurn}
    <button onclick={makeTurn} disabled={selection.length === 0}>Make turn</button>
  {/if}
{/if}

{#if dev}
  <pre>{JSON.stringify(game, null, 2)}</pre>
{/if}

<style>
  * > :global(.board) {
    width: min(100svh, 100svw);
  }
</style>
