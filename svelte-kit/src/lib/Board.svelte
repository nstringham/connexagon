<script lang="ts">
	import { BoardGraphics } from './webgl/board-graphics';
	import type { Game } from './firebase/firestore';
	import { onDestroy, onMount } from 'svelte';

	export let game: Game;

	let selected: number[] = [];

	let canvas: HTMLCanvasElement;

	let boardGraphics: BoardGraphics;

	$: boardGraphics?.setGame(game);

	$: boardGraphics?.setSelected(selected);

	onMount(() => {
		boardGraphics = new BoardGraphics(canvas);
	});

	onDestroy(() => {
		boardGraphics.destroy();
	});

	function onBoardClick(event: MouseEvent) {
		const index = boardGraphics.getClickedCell(event);
		if (index == undefined || game.board[index].tower || game.board[index].owner != -1) {
			return;
		}

		if (selected.includes(index)) {
			selected = selected.filter((selection) => selection != index);
		} else if (selected.length < 4) {
			selected = [...selected, index];
		}
	}
</script>

<div class="wrapper">
	<canvas bind:this={canvas} on:click={onBoardClick} />
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
