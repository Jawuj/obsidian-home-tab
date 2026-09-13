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
            .setUseNativeMenu(app.vault.config.nativeMenus)  
</script>

<div class="home-tab-bookmarked-files-container">
    {#each bookmarkedFiles as item (item.file.path)}
        <FileDisplayItem file={item.file} customIcon={item.iconId} customIconColor={item.iconColor} {app} {pluginSettings} {contextualMenu}
        on:itemMenu={(e) => selectedFile = e.detail.file}/>
    {/each}
</div>

<style>
    .home-tab-bookmarked-files-container{
        display: flex;
        align-items: baseline;
        justify-content: center;
        flex-wrap: wrap;
        
        width: 65%;
        /* min-width: 150px; */
        max-width: 900px;
        
        padding-top: 30px;
        margin: auto;
    }
</style>