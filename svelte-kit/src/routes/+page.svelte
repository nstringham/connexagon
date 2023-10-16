<script lang="ts">
	import { games$ } from '$lib/firebase/firestore';
	import '$lib/hexagon-button';
</script>

<div class="container">
	<h1>Connexagon</h1>

	{#each $games$ as game}
		<a href="/games/{game.id}">
			{#each game.data().players as player}
				<span class="player">{player.nickname}</span>
			{/each}
		</a><br />
	{/each}
</div>

<style>
	.container {
		padding-block: var(--spacing-xl);
		overflow-y: auto;
		scrollbar-color: var(--md-sys-color-primary) transparent;

		& h1 {
			text-align: center;
			font-size: var(--display-l-font-size);
		}
	}

	.player:has(+ .player)::after {
		content: ', ';
	}
</style>
