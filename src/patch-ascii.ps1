$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)

# ---------- settings.ts ----------
$settingsPath = Join-Path (Get-Location) 'settings.ts'
$s = [System.IO.File]::ReadAllText($settingsPath)

if ($s -notmatch 'asciiArt') {

    # 1) interfaz: despues de "wordmark: string"
    $reIface = [regex]'(?m)^(?<i>[ \t]*)wordmark:\s*string[^\r\n]*'
    if (-not $reIface.IsMatch($s)) { throw 'No encontre "wordmark: string" en la interfaz' }
    $s = $reIface.Replace($s, { param($m)
        $i = $m.Groups['i'].Value
        $m.Value + "`r`n" + $i + "asciiArt: string`r`n" + $i + "asciiArtFontSize: string"
    }, 1)

    # 2) DEFAULT_SETTINGS: despues de "wordmark: '...'"
    $reDef = [regex]'(?m)^(?<i>[ \t]*)wordmark:\s*[''"][^\r\n]*'
    if (-not $reDef.IsMatch($s)) { throw 'No encontre "wordmark: ..." en DEFAULT_SETTINGS' }
    $s = $reDef.Replace($s, { param($m)
        $i = $m.Groups['i'].Value
        $val = $m.Value.TrimEnd()
        if (-not $val.EndsWith(',')) { $val = $val + ',' }
        $val + "`r`n" + $i + "asciiArt: '',`r`n" + $i + "asciiArtFontSize: '12px',"
    }, 1)

    # 3) pantalla de ajustes: despues del setting "Title"
    $anchor = ".then((settingEl) => this.addResetButton(settingEl, 'wordmark'))"
    $idx = $s.IndexOf($anchor)
    if ($idx -lt 0) { throw 'No encontre el addResetButton de wordmark' }

    $block = @'


        new Setting(containerEl)
            .setName('ASCII art')
            .setDesc('Si no esta vacio, reemplaza al titulo. Pega aqui tu arte (braille o ASCII).')
            .addTextArea((text) => {
                text
                    .setValue(this.plugin.settings.asciiArt)
                    .onChange((value) => {
                        this.plugin.settings.asciiArt = value
                        this.plugin.saveSettings()
                    })
                text.inputEl.rows = 10
                text.inputEl.cols = 40
                text.inputEl.wrap = 'off'
                text.inputEl.style.whiteSpace = 'pre'
                text.inputEl.style.fontFamily = 'var(--font-monospace)'
            })
            .then((settingEl) => this.addResetButton(settingEl, 'asciiArt'))

        new Setting(containerEl)
            .setName('ASCII art font size')
            .setDesc('Tamano del arte. Accepts any CSS font-size value (ej. 10px, 0.8em).')
            .addText((text) => text
                .setValue(this.plugin.settings.asciiArtFontSize)
                .onChange((value) => {
                    if(cssUnitValidator(value)){
                        this.plugin.settings.asciiArtFontSize = value
                        this.plugin.saveSettings()
                    }
                }))
            .then((settingEl) => this.addResetButton(settingEl, 'asciiArtFontSize'))
'@
    $s = $s.Insert($idx + $anchor.Length, $block)
    [System.IO.File]::WriteAllText($settingsPath, $s, $utf8)
    Write-Host 'settings.ts OK'
} else { Write-Host 'settings.ts ya estaba parcheado' }

# ---------- ui/homepage.svelte ----------
$sveltePath = Join-Path (Get-Location) 'ui\homepage.svelte'
$v = [System.IO.File]::ReadAllText($sveltePath)

if ($v -notmatch 'home-tab-ascii') {

    $reWm = [regex]'(?s)<div class=home-tab-wordmark>.*?</h1>\s*</div>'
    if (-not $reWm.IsMatch($v)) { throw 'No encontre el bloque del wordmark en homepage.svelte' }

    $newWm = @'
<div class="home-tab-wordmark">
                {#if pluginSettings.asciiArt && pluginSettings.asciiArt.trim() !== ''}
                    <pre class="home-tab-ascii" style="font-family: {pluginSettings.customFont === 'interfaceFont' ? 'var(--interface-font)' : pluginSettings.customFont === 'textFont' ? 'var(--font-text)' : pluginSettings.customFont === 'monospaceFont' ? 'var(--font-monospace)' : pluginSettings.font};
                                font-size: {pluginSettings.asciiArtFontSize};
                                color: {pluginSettings.fontColorType === 'default' ? '' : pluginSettings.fontColorType === 'accentColor' ? 'var(--interactive-accent)' : pluginSettings.fontColor };">{pluginSettings.asciiArt}</pre>
                {:else}
                    <h1 style="font-family: {pluginSettings.customFont === 'interfaceFont' ? 'var(--interface-font)' : pluginSettings.customFont === 'textFont' ? 'var(--font-text)' : pluginSettings.customFont === 'monospaceFont' ? 'var(--font-monospace)' : pluginSettings.font};
                                font-size: {pluginSettings.fontSize};
                                font-weight: {pluginSettings.fontWeight.toString()};
                                color: {pluginSettings.fontColorType === 'default' ? '' : pluginSettings.fontColorType === 'accentColor' ? 'var(--interactive-accent)' : pluginSettings.fontColor };">
                        {pluginSettings.wordmark}
                    </h1>
                {/if}
            </div>
'@.TrimEnd()
    $v = $reWm.Replace($v, { param($m) $newWm }, 1)

    $css = @'

    .home-tab-ascii{
        margin: 0;
        padding: 0;
        background: none;
        border: none;
        white-space: pre;
        text-align: left;
        line-height: 1;
        letter-spacing: 0;
        overflow-x: auto;
        max-width: 100%;
        user-select: text;
    }
    .home-tab-wordmark{
        max-width: 100%;
    }
'@
    $end = $v.LastIndexOf('</style>')
    if ($end -lt 0) { throw 'No encontre </style>' }
    $v = $v.Insert($end, $css)
    [System.IO.File]::WriteAllText($sveltePath, $v, $utf8)
    Write-Host 'homepage.svelte OK'
} else { Write-Host 'homepage.svelte ya estaba parcheado' }