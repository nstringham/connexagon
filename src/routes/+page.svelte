<script lang="ts">
  import { goto } from "$app/navigation";
  import { type Color, cssColors } from "$lib/board.js";
  import Button from "$lib/Button.svelte";

  const { data } = $props();
  const { games, supabase, user } = $derived(data);

  async function createGame() {
    const { error, data: gameId } = await supabase.rpc("create_game");
    if (error) {
      throw error;
    }
    await goto(`/games/${gameId}`);
  }

  function sortPlayers<Player extends { turn_order: number | null }>(game: {
    players: Player[];
    turn: number | null;
  }): Player[] {
    if (game.turn == null) {
      return game.players;
    }

    const playerCount = game.players.length;
    const offset = game.turn + playerCount - 1;
    return game.players.toSorted(
      (a, b) => ((a.turn_order! - offset) % playerCount) - ((b.turn_order! - offset) % playerCount),
    );
  }
</script>

<Button onclick={createGame} disabled={user == null}>Create Game</Button>
<Button href="/browse">Join Game</Button>

{#each games as group (group.name)}
  <h2>{group.name}</h2>
  <ul>
    {#each group.games! as game (game.id)}
      <li>
        <a href="/games/{game.id}">
          {#each sortPlayers(game) as player (player.user_id)}
            <span style:color={cssColors[player.color as Color]}>{player.profile.name}</span>
          {/each}
        </a>
      </li>
    {/each}
  </ul>
{/each}
