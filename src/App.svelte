<script>
	let GameContent
	let gameEvent
	import Menu from "./Menu.svelte"
	
	function loadPage(event) {
		let response = event.detail.game
		if(response == "minecraft") {
			import('./Game.svelte').then(res => GameContent = res.default)
			gameEvent = "minecraft"
		} else if(response == "terraria") {
			import('./Game.svelte').then(res => GameContent = res.default)
			gameEvent = "terraria"
		}
	}

</script>

<main>
	<Menu on:loadGamePage={loadPage} />

	<svelte:component this={GameContent} Game={gameEvent} />
</main>