<script lang="ts">
	import { BoardGraphics } from './webgl/board-graphics';
	import type { Game } from './firebase/firestore';
	import { onDestroy, onMount } from 'svelte';

	export let game: Game;

	let canvas: HTMLCanvasElement;

	let boardGraphics: BoardGraphics;

	$: if ((game, boardGraphics != undefined)) {
		boardGraphics.game = game;
	}

	onMount(() => {
		boardGraphics = new BoardGraphics(canvas);
	});

	onDestroy(() => {
		boardGraphics.destroy();
	});
</script>

<div class="wrapper">
	<canvas
		bind:this={canvas}
		on:click={(event) => console.log(boardGraphics.getClickedCell(event))}
	/>
</div>

<style>
	.wrapper {
		padding: 4vmin;
		display: grid;
		place-content: center;
		container: game / size;
		contain: strict;

		@media (width > 1000px) {
			padding: 6vmin;
		}
	}
	canvas {
		width: min(100cqw, 115.47cqh);
		height: min(100cqw, 115.47cqh);
	}
</style>
