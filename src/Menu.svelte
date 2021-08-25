<script>
    import { createEventDispatcher } from 'svelte'

    const dispatcher = createEventDispatcher()

    function loadMinecraft() {
        dispatcher("loadGamePage", {
            "game": "minecraft"
        })
    }

    function loadTerraria() {
        dispatcher("loadGamePage", {
            "game": "terraria"
        })
    }
</script>

<nav class="menu">
    <button class="menu-item" on:click={loadMinecraft}>
        <img src="https://cdn.icon-icons.com/icons2/2699/PNG/512/minecraft_logo_icon_168974.png" alt="">
        Minecraft
    </button>

    <button class="menu-item" on:click={loadTerraria}>
        <img src="https://n9y2r3c6.rocketcdn.me/wp-content/uploads/2020/04/terraria-logo.png" alt="">
        Terraria
    </button>

    <button class="menu-item">
        <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/792818ef-699f-40d1-b83e-4ba22fbac972/d6fdhno-8f879b94-02ca-4c88-bf51-e0819597ff13.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzc5MjgxOGVmLTY5OWYtNDBkMS1iODNlLTRiYTIyZmJhYzk3MlwvZDZmZGhuby04Zjg3OWI5NC0wMmNhLTRjODgtYmY1MS1lMDgxOTU5N2ZmMTMucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.KQoE9NUAIl57WGNKeSnUf0pAOculgH7ZuslANTVQsdg"
            alt="">
        Arma 3
    </button>

    <button class="menu-item">More...</button>
</nav>

<style>
    .menu {
        width: 100%;
        align-items: center;
        text-align: center;

        border-radius: 10px;
        background-color: #171717;
    }

    .menu-item {
        height: 3rem;
        width: 22%;
        margin: auto;
        padding: 10px;
        display: inline-block;

        color: #EDEDED;
        background-color: #171717;
        border: none;
        border-right: 1px solid #444444;
    }

    .menu-item:last-of-type {
        border: none;
    }

    .menu-item img {
        width: 24px;
        height: 24px;
        vertical-align: middle;
    }
</style>