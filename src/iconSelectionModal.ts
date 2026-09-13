import { App, Modal, Setting, type ColorComponent, type TextComponent } from 'obsidian'
import iconSuggester from './suggester/iconSuggester'
import { lucideIcons, type LucideIcon } from './utils/lucideIcons'

export class IconSelectionModal extends Modal{
    icon: LucideIcon | undefined
    color: string | undefined
    onSubmit: (icon: LucideIcon, color?: string) => void

    constructor(
        app: App, 
        defaultIcon: LucideIcon | undefined, 
        defaultColor: string | undefined, 
        onSubmit: (icon: LucideIcon, color?: string) => void
    ){
        super(app)

        if (defaultIcon && (defaultIcon as string).includes('::')) {
            const [parsedIcon, parsedColor] = (defaultIcon as string).split('::')
            this.icon = parsedIcon as LucideIcon
            this.color = defaultColor ?? parsedColor
        } else {
            this.icon = defaultIcon
            this.color = defaultColor
        }
        this.onSubmit = onSubmit
    }

    onOpen(): void{
        const { contentEl } = this

        contentEl.createEl('h1', {text: 'Set a custom icon'})

        const iconSetting = new Setting(contentEl)
            .setName('Choose an icon')
            .setDesc('Accepts any lucide icon id.')

        let invalidInputIcon: HTMLElement
        iconSetting
            .addExtraButton((button) => {button
                .setIcon('alert-circle')
                .setTooltip('The icon id is not valid.')
                invalidInputIcon = button.extraSettingsEl
                invalidInputIcon.toggleVisibility(false)
                invalidInputIcon.addClass('mod-warning')})

        const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
        const expandHex = (hex: string): string => {
            if (hex.length === 4) {
                return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
            }
            return hex
        }

        iconSetting
            .addSearch((text) => {
                new iconSuggester(this.app, text.inputEl, {
                    isScrollable: true,
                    style: `max-height: 200px`}, 
                    true)

                text
                .setPlaceholder('Type to start search...')
                .setValue(this.icon ?? '')
                .onChange(value => {
                    let iconValue = value
                    if (value.includes('::')) {
                        const [parsedIcon, parsedColor] = value.split('::')
                        iconValue = parsedIcon
                        if (parsedColor && hexRegex.test(parsedColor)) {
                            this.color = parsedColor
                            if (textComp) textComp.setValue(parsedColor)
                            if (colorPickerComp) colorPickerComp.setValue(expandHex(parsedColor))
                            if (invalidColorIcon) invalidColorIcon.toggleVisibility(false)
                        }
                    }
                    if(lucideIcons.includes(iconValue as LucideIcon)){
                        this.icon = iconValue as LucideIcon
                        invalidInputIcon.toggleVisibility(false)
                    }
                    else{
                        invalidInputIcon.toggleVisibility(true)
                    }
                })
                .inputEl.parentElement?.addClass('wide-input-container')
        })

        const colorSetting = new Setting(contentEl)
            .setName('Icon color')
            .setDesc('Optional. Choose a color for the icon, or leave empty to use the default color.')

        let invalidColorIcon: HTMLElement
        colorSetting
            .addExtraButton((button) => {
                button
                    .setIcon('alert-circle')
                    .setTooltip('The color hex is not valid.')
                invalidColorIcon = button.extraSettingsEl
                invalidColorIcon.toggleVisibility(false)
                invalidColorIcon.addClass('mod-warning')
            })

        let colorPickerComp: ColorComponent
        let textComp: TextComponent

        colorSetting
            .addColorPicker((colorPicker) => {
                colorPickerComp = colorPicker
                if (this.color && hexRegex.test(this.color)) {
                    colorPicker.setValue(expandHex(this.color))
                } else {
                    colorPicker.setValue('#000000')
                }
                colorPicker.onChange((value) => {
                    this.color = value
                    if (textComp) {
                        textComp.setValue(value)
                    }
                    if (invalidColorIcon) {
                        invalidColorIcon.toggleVisibility(false)
                    }
                })
            })
            .addText((text) => {
                textComp = text
                text
                    .setPlaceholder('#rrggbb')
                    .setValue(this.color ?? '')
                    .onChange((value) => {
                        const trimmed = value.trim()
                        if (trimmed === '') {
                            this.color = undefined
                            invalidColorIcon.toggleVisibility(false)
                        } else if (hexRegex.test(trimmed)) {
                            this.color = trimmed
                            invalidColorIcon.toggleVisibility(false)
                            if (colorPickerComp) {
                                colorPickerComp.setValue(expandHex(trimmed))
                            }
                        } else {
                            this.color = undefined
                            invalidColorIcon.toggleVisibility(true)
                        }
                    })
            })

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                .setButtonText("Close modal")
                // .setCta()
                .onClick(() => {
                    this.close();
                }))
            .addButton((btn) =>
                btn
                .setButtonText("Set icon")
                .setCta()
                .onClick(() => {
                    this.icon ? this.onSubmit(this.icon, this.color) : null
                    this.close()
                }))
    }

    onClose(): void {
        this.icon = undefined
        this.color = undefined
        let { contentEl } = this;
        contentEl.empty();
    }
}