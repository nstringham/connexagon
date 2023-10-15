<script lang="ts">
	import Board from '$lib/Board.svelte';
	import { auth$ } from '$lib/firebase/index.js';

	export let data;
	const { game$ } = data;

	$: if (typeof $game$ == 'object' && $auth$ != null) {
		const player = $game$.players[$game$.uids.indexOf($auth$.uid)];
		if (player != undefined) {
			document.documentElement.setAttribute('data-color', player.color);
			sessionStorage.setItem('color', player.color);
		}
	}
</script>

{#if $game$ == undefined}
	Loading...
{:else if $game$ == '404'}
	404
{:else}
	<Board game={$game$} />
{/if}
