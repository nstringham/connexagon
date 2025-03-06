<script lang="ts">
  import { type Color, cssColors } from "$lib/board.js";

  const { data } = $props();
  const { games } = $derived(data);
</script>

<h2>Joinable Games</h2>
<ul>
  {#each games as game (game.id)}
    <li>
      <a href="/games/{game.id}">
        {#each game.players as player (player.user_id)}
          <span style:color={cssColors[player.color as Color]}>{player.profile.name}</span>
        {/each}
      </a>
    </li>
  {/each}
</ul>
