<script>
	let { data } = $props();
	let { countries } = $derived(data);
</script>

<h1>Welcome to Supabase!</h1>
<ul>
	{#each countries as country}
		<li>{country.name}</li>
	{/each}
</ul>
