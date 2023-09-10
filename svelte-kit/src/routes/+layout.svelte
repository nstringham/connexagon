<script lang="ts">
	import '$lib/variables.css';
	import '@material/web/focus/md-focus-ring';
	import { browser } from '$app/environment';
	import AccountButton from '$lib/AccountButton.svelte';

	import hexagonPaintWorkletUrl from '$lib/hexagon-paint-worklet?url';

	if (browser) {
		CSS.paintWorklet.addModule(hexagonPaintWorkletUrl);
	}
</script>

<header>
	<a href="/" id="home-link">Connexagon<md-focus-ring for="home-link" aria-hidden="true" /></a>
	<AccountButton />
</header>

<main><slot /></main>

<style>
	:root {
		font-family: var(--md-ref-typeface-plain);

		background-color: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);

		height: 100%;

		& ::selection {
			background-color: var(--md-sys-color-primary-container);
			color: var(--md-sys-color-on-primary-container);
		}
	}

	:global(body) {
		height: 100%;
		margin: 0;
		display: grid;
		grid-template-rows: auto 1fr;
	}

	header {
		display: grid;
		grid-template-columns: auto auto;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
	}

	#home-link {
		font-size: var(--title-l-font-size);
		position: relative;
		outline: none;
	}

	main {
		display: grid;
		gap: 16px;

		@media (width > 1000px) {
			grid-auto-flow: column;
			padding-bottom: 16px;
			padding-inline: 16px;
		}

		& > * {
			background-color: var(--md-sys-color-surface);
			margin: 0;
		}
	}

	:global(md-focus-ring) {
		--md-focus-ring-shape: 0px;
	}

	:global(a) {
		color: var(--md-sys-color-primary);
		text-decoration: none;
	}
</style>
