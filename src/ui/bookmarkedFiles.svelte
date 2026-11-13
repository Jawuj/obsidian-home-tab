<script lang="ts">
	import { App, Menu, Notice, TFile, View } from "obsidian";
	import type { HomeTabSettings } from "src/settings";
	import { Calendar } from "lucide-svelte";
	import { IconSelectionModal } from "src/iconSelectionModal";
	import FileDisplayItem from "./svelteComponents/fileDisplayItem.svelte";
	import type { bookmarkedFile, bookmarkedFilesManager } from "src/bookmarkedFiles";

    export let view: View
    export let bookmarkedFiles: bookmarkedFile[]
    export let pluginSettings: HomeTabSettings
    export let bookmarkedFileManager: bookmarkedFilesManager
    export let onOpenDailyNote: () => void

    const app: App = view.leaf.app

    let selectedFile: TFile

    const contextualMenu: Menu = new Menu()
            .addItem((item) => item
                .setTitle('Remove bookmark')
                .setIcon('trash-2')
                .onClick(() => bookmarkedFileManager.removeBookmark(selectedFile)))
            .addSeparator()
            .addItem((item) => item
                .setTitle('Set custom icon')
                .setIcon('plus')
                .onClick(() => {
                    const currentBookmark = bookmarkedFiles.find((item) => item.file === selectedFile)
                    let iconId = currentBookmark?.iconId
                    let iconColor = currentBookmark?.iconColor
                    if (iconId && (iconId as string).includes('::')) {
                        const [parsedIcon, parsedColor] = (iconId as string).split('::')
                        iconId = parsedIcon as import('src/utils/lucideIcons').LucideIcon
                        iconColor = iconColor ?? parsedColor
                    }
                    new IconSelectionModal(
                        app,
                        iconId,
                        iconColor,
                        (icon, color) => bookmarkedFileManager.updateFileIcon(selectedFile, icon, color)
                    ).open()
                }))
            .setUseNativeMenu(app.vault?.config?.nativeMenus ?? false)
</script>

<div class="home-tab-bookmarked-files-container"
    class:invertedPyramid={pluginSettings.bookmarkLayout === 'invertedPyramid'}
    style={`--home-tab-bookmark-cell-size: ${Math.max(85, pluginSettings.bookmarkIconSize + 20)}px; --home-tab-max-bookmark-width: ${pluginSettings.maxBookmarkColumns * Math.max(85, pluginSettings.bookmarkIconSize + 20)}px`}>
    {#if pluginSettings.calendarButtonInBookmarks}
        <button
            class="home-tab-file-item home-tab-daily-note-bookmark"
            type="button"
            aria-label="Open today's daily note"
            title="Open today's daily note"
            style={`--home-tab-file-icon-size: ${pluginSettings.bookmarkIconSize}px`}
            on:click={onOpenDailyNote}>
            <span class="home-tab-file-item-preview-icon">
                <Calendar strokeWidth={1}/>
            </span>
            {#if !pluginSettings.hideBookmarkNames}
                <span class="home-tab-file-item-name">Daily note</span>
            {/if}
        </button>
    {/if}
    {#each bookmarkedFiles as item (item.file.path)}
        <FileDisplayItem file={item.file} customIcon={item.iconId} customIconColor={item.iconColor}
            iconSize={pluginSettings.bookmarkIconSize} showFileName={!pluginSettings.hideBookmarkNames}
            {app} {pluginSettings} {contextualMenu}
        on:itemMenu={(e) => selectedFile = e.detail.file}/>
    {/each}
</div>

<style>
    .home-tab-bookmarked-files-container{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--home-tab-bookmark-cell-size), 1fr));
        align-items: start;
        justify-content: center;
        
        width: 90%;
        max-width: var(--home-tab-max-bookmark-width);
        
        padding-top: 30px;
        margin: auto;
    }

    .home-tab-bookmarked-files-container.invertedPyramid{
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .home-tab-bookmarked-files-container.invertedPyramid :global(.home-tab-file-item){
        flex: 0 0 calc(var(--home-tab-bookmark-cell-size) - 10px);
        width: calc(var(--home-tab-bookmark-cell-size) - 10px);
    }

    .home-tab-daily-note-bookmark{
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: relative;
        box-sizing: content-box;
        min-width: 75px;
        max-width: 125px;
        margin: 5px;
        padding: 5px;
        border: 0;
        border-radius: var(--radius-m);
        color: var(--text-normal);
        background: transparent;
        appearance: none;
        box-shadow: none;
        font: inherit;
        text-align: inherit;
        cursor: pointer;
    }

    .home-tab-daily-note-bookmark:hover{
        background-color: var(--background-modifier-hover);
    }

    .home-tab-daily-note-bookmark .home-tab-file-item-preview-icon{
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--size-2-3);
    }

    .home-tab-daily-note-bookmark .home-tab-file-item-preview-icon :global(svg){
        width: var(--home-tab-file-icon-size);
        height: var(--home-tab-file-icon-size);
    }

    .home-tab-daily-note-bookmark .home-tab-file-item-name{
        text-align: center;
        font-size: var(--font-ui-small);
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }
</style>