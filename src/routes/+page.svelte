<script lang="ts">
	import { goto } from "$app/navigation";

	const { data } = $props();
	const { games, supabase } = $derived(data);

	async function createGame() {
		const { error, data: gameId } = await supabase.rpc("create_game");
		if (error) {
			throw error;
		}
		goto(`/games/${gameId}`);
	}
</script>

<button onclick={createGame}>Create Game</button>

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
