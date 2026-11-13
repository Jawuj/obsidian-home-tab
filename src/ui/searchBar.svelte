<script lang="ts">
	import { Platform } from "obsidian";
    import { Calendar } from "lucide-svelte";
    import { fade } from "svelte/transition";
	import { filterKeys, type FilterKey, type SearchBarFilterType } from "src/homeTabSearchbar";
    import type HomeTabSearchBar from "src/homeTabSearchbar";
    
    export let HomeTabSearchBar: HomeTabSearchBar
    export let embedded: boolean = false
    const searchBarEl = HomeTabSearchBar.searchBarEl
    const activeExtEl = HomeTabSearchBar.activeExtEl
    const container = HomeTabSearchBar.suggestionContainerEl
    // @ts-ignore
    const isPhone = Platform.isPhone

    let inputValue = ''

    function handleKeydown(e: KeyboardEvent): void{
        // If the input field is empty and a filter is active remove it
        if(e.key === 'Backspace'){
            if(inputValue != '') return
            if(HomeTabSearchBar.activeFilter){
                HomeTabSearchBar.updateActiveSuggester('default')
                // this.fileSuggester = new HomeTabFileSuggester(this.plugin.app, this.plugin, this.view, this)
                // this.fuzzySearch.updateSearchArray(this.files)
                // this.activeFilterEl.toggleClass('hide', true)
            }
        }

        if(e.key === 'Tab'){
            e.preventDefault()
            const key = inputValue.toLowerCase()
            // Activate search filter with tab
            if(filterKeys.find(item => item === key)){
                HomeTabSearchBar.updateActiveSuggester(key as FilterKey)
            }
        }
    }

</script>

<div class="home-tab-searchbar-container">
    <div class="home-tab-searchbar"
        class:embedded={embedded}
        bind:this={$container}
        style:width={embedded || isPhone ? "calc(90% - 56px)" : "50%"}>
        <div class='nav-file-tag home-tab-suggestion-file-tag hide' bind:this={$activeExtEl}></div>
        <input type="search" spellcheck="false" placeholder="Type to start search..." bind:value={inputValue} bind:this={$searchBarEl}
        on:keydown={(e) => handleKeydown(e)}>
    </div>
    <div class="home-tab-daily-note-slot">
        {#if inputValue.length === 0}
            <button
                class="home-tab-daily-note-button"
                type="button"
                aria-label="Open today's daily note"
                title="Open today's daily note"
                style="background: var(--home-tab-searchbar-background) !important; border: var(--input-border-width) solid var(--background-modifier-border) !important; border-radius: var(--input-radius) !important; box-shadow: none !important;"
                transition:fade={{ duration: 160 }}
                on:click={() => HomeTabSearchBar.openTodayDailyNote()}>
                <Calendar size={20} strokeWidth={1.75} />
            </button>
        {/if}
    </div>
</div>

<style>
    .home-tab-searchbar-container{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        --home-tab-searchbar-background: var(--background-modifier-form-field);
    }
    
    .home-tab-searchbar{
        position: relative;
        display: flex;
        flex: 0 1 auto;
        min-width: 250px;
        max-width: 700px;
        margin: 0;

        height: calc(var(--input-height)*1.25);

        background-color: var(--home-tab-searchbar-background);
        border: var(--input-border-width) solid var(--background-modifier-border);
        padding: var(--size-2-3);
        border-radius: var(--input-radius);
        outline: none;
    }

    .home-tab-searchbar input{
        width: 100%;
        height: 100%;
        box-shadow: none;
        color: var(--text-normal);
        font-family: var(--font-interface);
        font-size: var(--font-ui-medium);
        background: none;
        border: none;
        padding-left: 12px;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        outline: none;
    }
    .home-tab-searchbar input:hover{
        background: none;
        border: none;
    }
    .home-tab-searchbar input::-webkit-search-cancel-button,
    .home-tab-searchbar input::-webkit-search-decoration {
        -webkit-appearance: none;
        appearance: none;
    }

    .home-tab-daily-note-slot{
        flex: 0 0 44px;
        width: 44px;
        height: calc(var(--input-height)*1.25);
    }

    .home-tab-daily-note-button{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0;
        color: var(--text-muted);
        appearance: none;
        cursor: pointer;
    }
    .home-tab-daily-note-button:hover{
        color: var(--text-normal);
    }

    .home-tab-suggestion-file-tag.hide{
        display: none;
    }
</style>

<!--     .home-tab-searchbar{
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(var(--input-height)*1.25);
    }

    .home-tab-searchbar input{
        width: 50%;
        min-width: 250px;
        max-width: 700px;
        display: inline-block;
        margin: 0 auto;
        height: 100%;
        box-shadow: none;
        padding: 6px 18px;
        font-size: var(--font-ui-medium);
    }

    .home-tab-searchbar input:focus, .home-tab-searchbar input:active{
        border-color: var(--background-modifier-border);
    }
 -->