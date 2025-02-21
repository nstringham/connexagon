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
</script>

<Button onclick={createGame} disabled={user == null}>Create Game</Button>
<Button href="/browse">Join Game</Button>

{#each games as group}
  <h2>{group.name}</h2>
  <ul>
    {#each group.games! as game}
      <li>
        <a href="/games/{game.id}">
          {#each game.players as player}
            <span style:color={cssColors[player.color as Color]}>{player.profile.name}</span>
          {/each}
        </a>
      </li>
    {/each}
  </ul>
{/each}
