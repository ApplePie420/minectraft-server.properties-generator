<script>
	export let Game = ""
	import Minecraft from "./Games/Minecraft.json"
	import Terraria from "./Games/Terraria.json"
	
	let GameSettings = "i"
	
	if(Game == "minecraft") {
		GameSettings = Minecraft
	} else if(Game == "terraria") {
		GameSettings = Terraria
	}
</script> 

<h1>Define your configs:</h1>
<div class="settings">
    {#each GameSettings as setting}
        <div class="setting">
            <div class="settings-header">
                {setting.name}
            </div>

            <div class="settings-input">
                {#if setting.type == "int"}
                    <input type="number" bind:value={setting.value}>
                {:else if setting.type == "str"}
                    <input type="text" bind:value={setting.value}>
                {:else if setting.type == "bool"}
                    <input type="checkbox" bind:value={setting.value} bind:checked={setting.value}>
                    <span class="checkboxState">({setting.value})</span>
                {:else if setting.type == "dropdown"}
                    <select bind:value={setting.value}>
                        {#each setting.selectOf as additionalSetting}
                            <option value={additionalSetting}>{additionalSetting}</option>
                        {/each}
                    </select>
                {/if}
            </div>

            <div class="settings-tooltip">
                {setting.tooltip}					
            </div>
        </div>
    {/each}
</div>
		
<h1>Resulting config file:</h1>
    <pre>
        {#each GameSettings as setting}
            <code>{setting.name}={setting.value}</code><br>
        {/each}
    </pre>

<style>
	/* Black: #171717 */
	/* Gray: #444444 */
	/* Accent: #DA0037 */
	/* Text: #EDEDED */

	h1 {
		color: white;
		font-weight: bold;
	}

	pre {
		counter-reset: line;
		background-color: #171717;
		padding: 1.5rem;
		color: white;
		border-radius: 10px;
	}

	code {
		counter-increment: line;
	}

	code:before {
		content: counter(line, decimal-leading-zero);
		display: inline-block;
		border-right: 1px solid #ddd;
		padding: 0 0.5rem;
		margin-right: 0.5em;
		color: #888;
		-webkit-user-select: none;
	}

	.settings {
		border: 0;
		border-radius: 10px;
		background-color: #171717;
		color: #EDEDED;
	}

	.setting {
		padding: 1.5rem;
		border-bottom: 1px solid #444444;
		text-align: center;
	}

	.settings-header {
		font-size: xx-large;
		font-family: monospace;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.settings-input input[type="text"],input[type="number"] {
		width: 20%;
		height: 2em;
		text-align: center;
	}

	.settings-input input[type="checkbox"] {
		width: 1.5em;
		height: 1.5em;
	}

	.checkboxState {
		font-family: 'Share Tech Mono', monospace;
		font-size: small;
		padding-left: 1%;
	}
</style>