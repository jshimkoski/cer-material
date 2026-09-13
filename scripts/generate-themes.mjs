import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const outputDirectory = resolve(scriptDirectory, '../src/themes')
const materialUtilitiesDirectory = dirname(fileURLToPath(
  import.meta.resolve('@material/material-color-utilities'),
))
const { themeFromSourceColor } = await import(pathToFileURL(
  resolve(materialUtilitiesDirectory, 'utils/theme_utils.js'),
))
const { argbFromHex, hexFromArgb } = await import(pathToFileURL(
  resolve(materialUtilitiesDirectory, 'utils/string_utils.js'),
))

// The 500 step of each CER extended family is the Material source color.
// Four neutral families use OKLCH because that is their canonical CER value.
const familySeeds = {
  mauve: 'oklch(54.2% 0.034 322.5)',
  olive: 'oklch(58% 0.031 107.3)',
  mist: 'oklch(56% 0.021 213.5)',
  taupe: 'oklch(54.7% 0.021 43.1)',
  slate: '#64748b',
  gray: '#6b7280',
  zinc: '#71717a',
  stone: '#78716c',
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
}

const shadeTones = {
  50: 98,
  100: 95,
  200: 90,
  300: 80,
  400: 70,
  500: 60,
  600: 50,
  700: 40,
  800: 30,
  900: 20,
  950: 10,
}

const roleOrder = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'background', 'onBackground', 'surface', 'onSurface',
  'surfaceVariant', 'onSurfaceVariant', 'outline', 'outlineVariant',
  'shadow', 'scrim', 'inverseSurface', 'inverseOnSurface', 'inversePrimary',
]

function linearToSrgb(channel) {
  const value = channel <= 0.0031308
    ? 12.92 * channel
    : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, value)) * 255)
}

function oklchToHex(value) {
  const match = /^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/.exec(value)
  if (!match) throw new Error(`Invalid OKLCH source color: ${value}`)

  const lightness = Number(match[1]) / 100
  const chroma = Number(match[2])
  const hue = Number(match[3]) * Math.PI / 180
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)

  const l = Math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3)
  const m = Math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3)
  const s = Math.pow(lightness - 0.0894841775 * a - 1.2914855480 * b, 3)

  const channels = [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]

  return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`
}

function toKebabCase(value) {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function systemDeclarations(theme, dark) {
  const scheme = (dark ? theme.schemes.dark : theme.schemes.light).toJSON()
  const declarations = roleOrder.map(role =>
    `  --md-sys-color-${toKebabCase(role)}: ${hexFromArgb(scheme[role])};`,
  )
  const neutral = theme.palettes.neutral
  const surfaceTones = dark
    ? { lowest: 4, low: 10, DEFAULT: 12, high: 17, highest: 22 }
    : { lowest: 100, low: 96, DEFAULT: 94, high: 92, highest: 90 }

  for (const [name, tone] of Object.entries(surfaceTones)) {
    const suffix = name === 'DEFAULT' ? '' : `-${name}`
    declarations.push(`  --md-sys-color-surface-container${suffix}: ${hexFromArgb(neutral.tone(tone))};`)
  }
  declarations.push(`  --md-sys-color-surface-tint: ${hexFromArgb(scheme.primary)};`)
  return declarations
}

function cerPaletteDeclarations(theme) {
  const palettes = {
    primary: theme.palettes.primary,
    secondary: theme.palettes.secondary,
    neutral: theme.palettes.neutral,
    error: theme.palettes.error,
  }
  const declarations = []
  for (const [name, palette] of Object.entries(palettes)) {
    for (const [shade, tone] of Object.entries(shadeTones)) {
      declarations.push(`  --cer-color-${name}-${shade}: ${hexFromArgb(palette.tone(tone))};`)
    }
  }
  return declarations
}

const sharedRoot = [
  "  --md-sys-typescale-font: 'Roboto', 'Google Sans', sans-serif;",
  '  --md-sys-shape-corner-none: 0px;',
  '  --md-sys-shape-corner-extra-small: 4px;',
  '  --md-sys-shape-corner-small: 8px;',
  '  --md-sys-shape-corner-medium: 12px;',
  '  --md-sys-shape-corner-large: 16px;',
  '  --md-sys-shape-corner-extra-large: 28px;',
  '  --md-sys-shape-corner-full: 9999px;',
  '  --md-sys-elevation-1: 0 1px 2px rgba(0,0,0,.3), 0 1px 3px 1px rgba(0,0,0,.15);',
  '  --md-sys-elevation-2: 0 1px 2px rgba(0,0,0,.3), 0 2px 6px 2px rgba(0,0,0,.15);',
  '  --md-sys-elevation-3: 0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.3);',
  '  --md-sys-elevation-4: 0 6px 10px 4px rgba(0,0,0,.15), 0 2px 3px rgba(0,0,0,.3);',
]

const darkElevation = [
  '    --md-sys-elevation-1: 0 1px 2px rgba(0,0,0,.6), 0 1px 3px 1px rgba(0,0,0,.4);',
  '    --md-sys-elevation-2: 0 1px 2px rgba(0,0,0,.6), 0 2px 6px 2px rgba(0,0,0,.4);',
  '    --md-sys-elevation-3: 0 4px 8px 3px rgba(0,0,0,.4), 0 1px 3px rgba(0,0,0,.6);',
  '    --md-sys-elevation-4: 0 6px 10px 4px rgba(0,0,0,.4), 0 2px 3px rgba(0,0,0,.6);',
]

function generateThemeCss(family, source) {
  const sourceHex = source.startsWith('oklch(') ? oklchToHex(source) : source
  const theme = themeFromSourceColor(argbFromHex(sourceHex))
  const light = [...systemDeclarations(theme, false), ...cerPaletteDeclarations(theme), ...sharedRoot]
  const dark = systemDeclarations(theme, true).map(declaration => `  ${declaration}`)

  return `/* Generated from CER ${family}-500 (${source}) using Material Color Utilities. */
:root {
${light.join('\n')}
}

body {
  font-family: var(--md-sys-typescale-font);
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
}

#app {
  min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
  :root {
${dark.join('\n')}
${darkElevation.join('\n')}
  }
}
`
}

await mkdir(outputDirectory, { recursive: true })
await Promise.all(Object.entries(familySeeds).map(([family, source]) =>
  writeFile(resolve(outputDirectory, `${family}.css`), generateThemeCss(family, source)),
))

console.log(`Generated ${Object.keys(familySeeds).length} static Material theme presets.`)
