import { Component, Notice, TAbstractFile, TFile, type App, type BookmarkItem, type BookmarksPlugin } from "obsidian";
import { get, type Writable } from "svelte/store";
import type HomeTab from "./main";
import type { LucideIcon } from "./utils/lucideIcons";

export interface bookmarkedFileStore{
    filepath: string
    iconId: LucideIcon | undefined
    iconColor?: string
}
export interface bookmarkedFile{
    file: TFile
    iconId: LucideIcon | undefined
    iconColor?: string
}

export class bookmarkedFilesManager extends Component{
    private app: App
    private plugin: HomeTab
    private bookmarkedFilesStore: Writable<bookmarkedFile[]>

    constructor(app: App, plugin: HomeTab, bookmarkedFilesStore: Writable<bookmarkedFile[]>){
        super()

        this.app = app
        this.plugin = plugin
        this.bookmarkedFilesStore = bookmarkedFilesStore
    }

    onload(): void{
        // Load stored bookmarked files, then check if they've changed
        this.loadStoredBookmarkedFiles()
        this.updateBookmarkedFiles()
        // Update stored bookmarked files list when a file is bookmarked or unbookmarked
        this.registerEvent(this.app.internalPlugins.getPluginById('bookmarks').instance.on('changed', () => this.updateBookmarkedFiles()))
    }

    private updateBookmarkedFiles(): void{
        const bookmarkedFiles = this.getBookmarkedFiles()
        
        this.bookmarkedFilesStore.update((filesArray) => {
            const updatedArray: bookmarkedFile[] = []

            bookmarkedFiles.forEach((bookmarkedFile) => {
                const existingItem = filesArray.find((item) => item.file === bookmarkedFile)
                let iconId = existingItem?.iconId ?? undefined
                let iconColor = existingItem?.iconColor ?? undefined
                if (iconId && (iconId as string).includes('::')) {
                    const [parsedIcon, parsedColor] = (iconId as string).split('::')
                    iconId = parsedIcon as LucideIcon
                    if (!iconColor && parsedColor) {
                        iconColor = parsedColor
                    }
                }
                updatedArray.push({
                    file: bookmarkedFile,
                    // Retrieve icon and color from stored array
                    iconId: iconId,
                    iconColor: iconColor
                })
            })
            
            return updatedArray
        })

        this.storeBookmarkedFiles()
    }

    public updateFileIcon(file: TFile, iconId?: LucideIcon, iconColor?: string): void{
        this.bookmarkedFilesStore.update((filesArray) => {
            const itemIndex = filesArray.findIndex((item) => item.file === file)
            if (itemIndex > -1) {
                if (iconId && (iconId as string).includes('::')) {
                    const [parsedIcon, parsedColor] = (iconId as string).split('::')
                    iconId = parsedIcon as LucideIcon
                    if (!iconColor && parsedColor) {
                        iconColor = parsedColor
                    }
                }
                filesArray[itemIndex].iconId = iconId
                filesArray[itemIndex].iconColor = iconColor
            }
            return filesArray
        })

        this.storeBookmarkedFiles()
    }

    private getBookmarkedFiles(): TFile[]{
        if(this.app.internalPlugins.getPluginById('bookmarks')){
            const bookmarkedItems = app.internalPlugins.plugins.bookmarks.instance.getBookmarks()
            const bookmarkedFiles: TFile[] = []
    
            bookmarkedItems.forEach((item: BookmarkItem) => {
                if (item.type === 'file'){
                    const file = app.vault.getAbstractFileByPath(item.path)
                    if (file instanceof TFile){
                        bookmarkedFiles.push(file)
                    }
                }
            })
            return bookmarkedFiles
        }
        return []
    }

    private async storeBookmarkedFiles(): Promise<void>{
        if(this.app.internalPlugins.getPluginById('bookmarks')){
            let storeObj: bookmarkedFileStore[] = []
            get(this.bookmarkedFilesStore).forEach((item) => {
                let iconId = item.iconId
                let iconColor = item.iconColor
                if (iconId && (iconId as string).includes('::')) {
                    const [parsedIcon, parsedColor] = (iconId as string).split('::')
                    iconId = parsedIcon as LucideIcon
                    if (!iconColor && parsedColor) {
                        iconColor = parsedColor
                    }
                }
                storeObj.push({
                    filepath: item.file.path, // Store only the path instead of the entire TFile instance
                    iconId: iconId,
                    iconColor: iconColor
                })
            })
            this.plugin.settings.bookmarkedFileStore = storeObj
            await this.plugin.saveData(this.plugin.settings)
        }
    }

    private loadStoredBookmarkedFiles(): void{
        if(this.app.internalPlugins.getPluginById('bookmarks')){
            let filesToLoad: bookmarkedFile[] = []
            this.app.workspace.onLayoutReady(() => {
                this.plugin.settings.bookmarkedFileStore.forEach((item) => {
                    let file: TAbstractFile | null = this.app.vault.getAbstractFileByPath(item.filepath)
                    if(file && file instanceof TFile){
                        let iconId = item.iconId
                        let iconColor = item.iconColor
                        if (iconId && (iconId as string).includes('::')) {
                            const [parsedIcon, parsedColor] = (iconId as string).split('::')
                            iconId = parsedIcon as LucideIcon
                            if (!iconColor && parsedColor) {
                                iconColor = parsedColor
                            }
                            item.iconId = iconId
                            item.iconColor = iconColor
                        }
                        filesToLoad.push({
                            file: file,
                            iconId: iconId,
                            iconColor: iconColor
                        })
                    }
                })
                this.bookmarkedFilesStore.set(filesToLoad)   
            })
        }
    }

    public removeBookmark = (file: TFile) => {
        const bookmarksPlugin: BookmarksPlugin | undefined = this.app.internalPlugins.getPluginById('bookmarks')
        if(bookmarksPlugin){
            const item: BookmarkItem | undefined = bookmarksPlugin.instance.getBookmarks().find(item => item.path === file.path)
            if(item) this.app.internalPlugins.plugins.bookmarks.instance.removeItem(item)
        }
        else{
            new Notice("Bookmarks plugin is not enabled")
        }
    }
}