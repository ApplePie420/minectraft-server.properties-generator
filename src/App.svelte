<script>
	let GameContent
	import Menu from "./Menu.svelte"
	// TODO(N3tt): Create a parser that parses arbitrary game setting file and creates content dynamically
	// EVENTUALLY, move this in some sort of database or file or whatever, just not like this (it hurts even me and I can take a lot of bs)
	
	function loadPage(event) {
		if(event.detail.game == "minecraft") {
			import('./Game.svelte').then(res => GameContent = res.default)
		}
	}

</script>

<main>
	<Menu on:loadGamePage={loadPage} />

	<svelte:component this="{GameContent}" />
</main>