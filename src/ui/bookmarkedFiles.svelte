<script lang="ts">
	import { App, Menu, Notice, TFile, View } from "obsidian";
	import type { HomeTabSettings } from "src/settings";
	import { IconSelectionModal } from "src/iconSelectionModal";
	import FileDisplayItem from "./svelteComponents/fileDisplayItem.svelte";
	import type { bookmarkedFile, bookmarkedFilesManager } from "src/bookmarkedFiles";

    export let view: View
    export let bookmarkedFiles: bookmarkedFile[]
    export let pluginSettings: HomeTabSettings
    export let bookmarkedFileManager: bookmarkedFilesManager

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
</style>