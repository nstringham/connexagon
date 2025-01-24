<script>
	let { data } = $props();
	let { games } = $derived(data);
	$inspect(games);
</script>

<h1>Welcome to Supabase!</h1>
<ul>
	{#each games as game}
		<li>
			<a href="/games/{game.id}">
				{#each game.players as player}
					<span style:color={player.color}>{player.profiles.name}</span>
				{/each}
			</a>
		</li>
	{/each}
</ul>
