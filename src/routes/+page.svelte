<script lang="ts">
	const { data } = $props();
	const { games } = $derived(data);
</script>

<ul>
	{#each games as { game }}
		<li>
			<a href="/games/{game.id}">
				{#each game.players as player}
					<span style:color={player.color}>{player.profile.name}</span>
				{/each}
			</a>
		</li>
	{/each}
</ul>
