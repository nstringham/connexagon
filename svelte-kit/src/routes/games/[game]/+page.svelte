<script lang="ts">
	import Board from '$lib/Board.svelte';

	export let data;
	const { game$ } = data;
</script>

{#if $game$ == undefined}
	Loading...
{:else if $game$ == '404'}
	404
{:else}
	<Board game={$game$} />
{/if}
