<script lang="ts">
	import { auth$ } from '$lib/firebase';
	import '$lib/hexagon-button';
</script>

<div class="container">
	<h1>Connexagon</h1>

	{#if $auth$ != null}
		<p>Welcome back {$auth$.displayName}</p>
	{/if}
</div>

<style>
	.container {
		padding-block: var(--spacing-xl);

		& h1 {
			text-align: center;
			font-size: var(--display-l-font-size);
		}
	}
</style>
