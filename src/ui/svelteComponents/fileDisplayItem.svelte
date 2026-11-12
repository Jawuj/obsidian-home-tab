<script lang="ts">
    import { File, FilePieChart, FileText, FileAudio, FileImage, FileVideo, X as DeleteIcon, MoreHorizontal} from 'lucide-svelte'
    import { type TFile, Keymap, type PaneType, App, Menu, getIcon } from 'obsidian';
    import { getFileTypeFromExtension } from 'src/utils/getFileTypeUtils';
	import type { HomeTabSettings } from 'src/settings';
	import { createEventDispatcher } from 'svelte';
	import type { LucideIcon } from 'src/utils/lucideIcons';

    export let app: App
    export let file: TFile
    export let pluginSettings: HomeTabSettings
    export let contextualMenu: Menu
    export let customIcon: LucideIcon | undefined = undefined
    export let customIconColor: string | undefined = undefined
    export let iconSize: number = 24
    export let showFileName: boolean = true

    $: resolvedIcon = (customIcon && (customIcon as string).includes('::')) 
        ? ((customIcon as string).split('::')[0] as LucideIcon) 
        : customIcon
    $: resolvedColor = (customIcon && (customIcon as string).includes('::'))
        ? (customIconColor ?? (customIcon as string).split('::')[1])
        : customIconColor

    // Trim filename if too long
    // const filename = file.basename.length > 38 ? file.basename.slice(0,35) + '...' : file.basename
    const filename = file.basename
    const fileType = getFileTypeFromExtension(file.extension)

    const dispatch = createEventDispatcher<{itemMenu:{file: TFile}}>()

    function handleFileOpening(file: TFile, newTab?: boolean | PaneType){
        const leaf = app.workspace.getLeaf(newTab)
        leaf.openFile(file)
    }

    function handleMouseClick(e: MouseEvent, file: TFile): void{
        if ((e.target as HTMLElement).classList.contains('home-tab-file-item-remove_btn')) return
        else if(e.button != 2){
            handleFileOpening(file, Keymap.isModEvent(e))
        }
    }
</script>

<div class="home-tab-file-item" class:use-accent-color="{pluginSettings.selectionHighlight === 'accentColor'}"
    style={`--home-tab-file-icon-size: ${iconSize}px`}
    on:mousedown|preventDefault="{e => handleMouseClick(e, file)}">
    
    <div class="home-tab-file-item-remove_btn" aria-label="File options"
        on:click={(e) => {
            contextualMenu.showAtMouseEvent(e)
            dispatch('itemMenu', {file: file})
            }}>
        <MoreHorizontal strokeWidth={1} width={24} height={24} class='svg-icon lucide-x'/>
    </div>

    <div class="home-tab-file-item-preview-icon">
        {#if resolvedIcon}
            <svg xmlns="http://www.w3.org/2000/svg"  width={iconSize} height={iconSize}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1" stroke-linecap="round" stroke-linejoin="round" 
                        class="lucide-icon lucide lucide-{resolvedIcon}"
                        style={resolvedColor ? `color: ${resolvedColor}` : undefined}>
                            {@html getIcon(resolvedIcon)?.innerHTML}
            </svg>
        {:else}
            {#if fileType === 'markdown'}
                <FileText strokeWidth={1}/>
            {:else if fileType === 'image'}
                <FileImage strokeWidth={1}/>
            {:else if fileType === 'video'}
                <FileVideo strokeWidth={1}/>
            {:else if fileType === 'audio'}
                <FileAudio strokeWidth={1}/>
            {:else if fileType === 'pdf'}
                <FilePieChart strokeWidth={1}/>
            {:else}
                <File strokeWidth={1}/>
            {/if}
        {/if}
    </div>
    {#if showFileName}
        <div class="home-tab-file-item-name">
            {filename}
        </div>
    {/if}
</div>

<style>
    .home-tab-file-item{
        margin: 5px;
        padding: 5px;
        border-radius: var(--radius-m);
        /* height: 100px; */
        min-width: 75px;
        max-width: 125px;

        position: relative;
    }

    .home-tab-file-item:hover{
        background-color: var(--background-modifier-hover);
    }
    .home-tab-file-item.use-accent-color:hover{
        color: white;
        background: var(--interactive-accent);
    }
    .home-tab-file-item-preview-icon{
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--size-2-3);
    }

    .home-tab-file-item-preview-icon :global(svg){
        width: var(--home-tab-file-icon-size);
        height: var(--home-tab-file-icon-size);
    }

    .home-tab-file-item-name{
        /* padding: var(--size-2-3); */
        text-align: center;
        font-size: var(--font-ui-small);

        /* Text trimming */
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }

    .home-tab-file-item-remove_btn{
        opacity: 0;
        position: absolute;
        top: 4px;
        right: 4px;
    }

    .home-tab-file-item-remove_btn:hover{
        opacity: 1;
    }
</style>