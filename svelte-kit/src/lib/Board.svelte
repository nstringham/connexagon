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
	<canvas bind:this={canvas} />
</div>

<style>
	.wrapper {
		display: grid;
		place-content: center;
		container: game / size;
	}
	canvas {
		width: 100cqmin;
		height: 100cqmin;
	}
</style>
