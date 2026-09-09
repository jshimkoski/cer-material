import type { Plugin } from 'vite'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const MATERIAL_COMPONENT_MODULES = {
  'md-app-bar': 'md-app-bar',
  'md-badge': 'md-badge',
  'md-bottom-sheet': 'md-bottom-sheet',
  'md-button-group': 'md-button-group',
  'md-button': 'md-button',
  'md-card': 'md-card',
  'md-carousel': 'md-carousel',
  'md-checkbox': 'md-checkbox',
  'md-chip': 'md-chip',
  'md-date-picker': 'md-date-picker',
  'md-dialog': 'md-dialog',
  'md-divider': 'md-divider',
  'md-fab-menu': 'md-fab-menu',
  'md-fab': 'md-fab',
  'md-icon-button': 'md-icon-button',
  'md-icon': 'md-icon',
  'md-list': 'md-list',
  'md-list-item': 'md-list',
  'md-loading-indicator': 'md-loading-indicator',
  'md-menu': 'md-menu',
  'md-navigation-bar': 'md-navigation-bar',
  'md-navigation-drawer': 'md-navigation-drawer',
  'md-navigation-rail': 'md-navigation-rail',
  'md-progress': 'md-progress',
  'md-radio': 'md-radio',
  'md-search': 'md-search',
  'md-segmented-button': 'md-segmented-button',
  'md-side-sheet': 'md-side-sheet',
  'md-slider': 'md-slider',
  'md-snackbar': 'md-snackbar',
  'md-split-button': 'md-split-button',
  'md-switch': 'md-switch',
  'md-tabs': 'md-tabs',
  'md-text-field': 'md-text-field',
  'md-time-picker': 'md-time-picker',
  'md-tooltip': 'md-tooltip',
} as const

/** Resolve a public `md-*` tag to its side-effect registration module. */
export function materialComponentResolver(tag: string): string | undefined {
  const moduleName = MATERIAL_COMPONENT_MODULES[tag as keyof typeof MATERIAL_COMPONENT_MODULES]
  if (!moduleName) return undefined
  return `@jasonshimmy/cer-material/components/${moduleName}`
}

export interface CerMaterialOptions {
  /** Include the default Material color/typography tokens. Defaults to true. */
  theme?: boolean
  /** Include and production-subset Material Symbols, or configure dynamic names. */
  symbols?: boolean | MaterialSymbolsOptions
}

/**
 * Framework-neutral integration descriptor consumed by CER App. Keeping the
 * resolver and global imports declarative lets the application framework inject
 * them into both client and SSR entries while retaining per-component chunks.
 */
export interface CerMaterialIntegration {
  name: 'cer-material'
  componentResolver: typeof materialComponentResolver
  globalImports: string[]
  plugins: Plugin[]
}

export function cerMaterial(options: CerMaterialOptions = {}): CerMaterialIntegration {
  const includeTheme = options.theme !== false
  const includeSymbols = options.symbols !== false
  const symbolOptions = typeof options.symbols === 'object' ? options.symbols : undefined

  return {
    name: 'cer-material',
    componentResolver: materialComponentResolver,
    globalImports: [
      ...(includeSymbols ? ['material-symbols/outlined.css'] : []),
      ...(includeTheme ? ['@jasonshimmy/cer-material/theme.css'] : []),
    ],
    plugins: includeSymbols ? [materialSymbols(symbolOptions)] : [],
  }
}

function withBase(base: string, fileName: string): string {
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}${fileName.replace(/^\//, '')}`
}

/**
 * Injects a `<link rel="preload">` for a bundled Roboto 400 woff2 asset so
 * the browser fetches the font in parallel with the CSS link,
 * eliminating the font-swap CLS caused by `font-display: swap`.
 *
 * The tag is injected at the very top of `<head>` (`head-prepend`) so it
 * fires before any render-blocking CSS request. No-ops when the font is not
 * found in the bundle (e.g. CDN / externalized setups).
 */
export function robotoPreload(): Plugin {
  let base = '/'
  return {
    name: 'cer-material-roboto-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml(_html, ctx) {
      if (!ctx.bundle) return []
      const key = Object.keys(ctx.bundle).find(
        k => k.includes('roboto-latin-400') && k.endsWith('.woff2'),
      )
      if (!key) return []
      return [{
        tag: 'link',
        attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: withBase(base, key) },
        injectTo: 'head-prepend' as const,
      }]
    },
  }
}

export interface MaterialSymbolsOptions {
  /** Icon names that cannot be discovered statically (for example CMS values). */
  include?: string[]
}

const SYMBOL_NAME = /^[a-z][a-z0-9_]*$/
const SUBSET_CACHE_VERSION = '1'

// Symbols rendered by component internals rather than passed through an icon
// prop. These cannot be discovered by scanning icon="..." attributes alone.
// Keep this usage-based: only symbols for md-* tags present in transformed app
// source are added, preserving the smallest possible production font subset.
const COMPONENT_INTERNAL_SYMBOLS: Readonly<Record<string, readonly string[]>> = {
  'md-app-bar': ['menu'],
  'md-carousel': ['image'],
  'md-checkbox': ['check', 'remove'],
  'md-chip': ['check', 'close'],
  'md-date-picker': [
    'arrow_drop_down',
    'arrow_drop_up',
    'calendar_today',
    'chevron_left',
    'chevron_right',
    'error',
    'keyboard',
  ],
  'md-list': ['check', 'remove'],
  'md-navigation-rail': ['menu'],
  'md-search': ['close', 'person', 'search'],
  'md-segmented-button': ['check'],
  'md-side-sheet': ['arrow_back', 'close'],
  'md-snackbar': ['close'],
  'md-split-button': ['arrow_drop_down'],
  'md-switch': ['check', 'close'],
  'md-text-field': ['error'],
  'md-time-picker': ['keyboard', 'schedule'],
}

/** Finds statically-declared Material Symbol names in HTML and JS/TS source. */
export function findMaterialSymbolNames(code: string): Set<string> {
  const names = new Set<string>()
  // HTML/template attributes: icon, :icon, leading-icon, trailingIcon, etc.
  const htmlAttribute = /\b:?(?:[a-z][a-z0-9_-]*)?icon\s*=\s*["']([a-z][a-z0-9_]+)["']/gi
  // Object properties: icon: 'home', closeIcon: 'close', 'selected-icon': 'check'.
  const objectProperty = /(?:\b(?:[a-zA-Z_$][\w$-]*[Ii]con|[Ii]con)|["'](?:[a-zA-Z_$][\w$-]*[Ii]con|[Ii]con)["'])\s*:\s*["']([a-z][a-z0-9_]+)["']/g
  // Icon-list properties: trailingIcons: ['search', 'more_vert'].
  const arrayProperty = /(?:\b[a-zA-Z_$][\w$-]*[Ii]cons|["'][a-zA-Z_$][\w$-]*[Ii]cons["'])\s*:\s*\[([^\]]*)\]/g
  // Component tags can render fixed symbols internally (for example an
  // md-switch with icons renders check/close). Support HTML templates, VNode
  // objects, and imperative createElement() calls.
  const componentTag = /<\s*(md-[a-z][a-z0-9-]*)\b|\btag\s*:\s*["'](md-[a-z][a-z0-9-]*)["']|\bcreateElement\(\s*["'](md-[a-z][a-z0-9-]*)["']/gi

  for (const match of code.matchAll(htmlAttribute)) names.add(match[1])
  for (const match of code.matchAll(objectProperty)) names.add(match[1])
  for (const arrayMatch of code.matchAll(arrayProperty)) {
    for (const nameMatch of arrayMatch[1].matchAll(/["']([a-z][a-z0-9_]+)["']/g)) {
      names.add(nameMatch[1])
    }
  }
  for (const match of code.matchAll(componentTag)) {
    const tag = (match[1] ?? match[2] ?? match[3]).toLowerCase()
    for (const name of COMPONENT_INTERNAL_SYMBOLS[tag] ?? []) names.add(name)
  }
  return names
}

/**
 * Subsets the font using pure JS — no Python, no system dependencies.
 *
 * Pipeline:
 *  1. wawoff2 decompresses the woff2 bundle asset → raw TTF bytes.
 *  2. opentype.js parses the TTF and walks every GSUB LigatureSubst lookup.
 *     Extension (Type 7) wrappers are unwrapped so the inner Type 4 data is
 *     directly accessible and writable.
 *  3. Each ligature's glyph sequence is reconstructed into an icon name string
 *     via the font's cmap (glyph-id → ASCII char). Rules whose name is not in
 *     the requested set are removed; the rest survive.
 *  4. opentype.js writes the pruned TTF back to an ArrayBuffer.
 *  5. subset-font (harfbuzz WASM) receives the pruned TTF, subsets with normal
 *     layout closure, and emits woff2.
 *
 * Crucially, step 5 uses layout closure ON — which is safe now because GSUB
 * only contains ligature rules for the icons we want. Closure from source
 * characters ("home", "menu", …) can only reach our icons' PUA output glyphs;
 * the cascade to every other icon that shares those characters is structurally
 * impossible once their rules have been pruned away in step 3.
 *
 * subset-font, wawoff2 and opentype.js are direct dependencies of cer-material and are
 * always present.
 */
async function _subsetFont(
  inputBuf: Buffer,
  iconNames: Set<string>,
): Promise<Buffer | null> {
  const _require = createRequire(import.meta.url)

  // Dependencies — auto-installed.
  let wawoff2: { decompress: (buf: Buffer) => Promise<Uint8Array> }
  let opentype: { parse: (ab: ArrayBuffer) => any }
  try { wawoff2  = _require('wawoff2') }   catch { return null }
  try { opentype = _require('opentype.js') } catch { return null }

  type SubsetFn = (buf: Buffer, text: string, opts: { targetFormat: string }) => Promise<Buffer>
  let subsetFn: SubsetFn
  try {
    subsetFn = _require('subset-font') as SubsetFn
  } catch {
    return null
  }

  // Step 1: woff2 → TTF
  let ttfData: Uint8Array
  try {
    ttfData = await wawoff2.decompress(inputBuf)
  } catch (e) {
    console.warn('[cer-material] wawoff2 decompression failed:', e)
    return null
  }
  const ab = ttfData.buffer.slice(ttfData.byteOffset, ttfData.byteOffset + ttfData.byteLength) as ArrayBuffer

  // Step 2: Parse TTF
  let font: any
  try {
    font = opentype.parse(ab)
  } catch (e) {
    console.warn('[cer-material] opentype.js failed to parse font:', e)
    return null
  }

  // Build glyph-id → ASCII char from cmap (used to reconstruct icon names from
  // ligature component glyph sequences).
  const glyphToChar = new Map<number, string>()
  for (const [cpStr, glyphId] of Object.entries(
    font.tables.cmap.glyphIndexMap as Record<string, number>,
  )) {
    const cp = parseInt(cpStr, 10)
    if (cp < 256) glyphToChar.set(glyphId, String.fromCodePoint(cp))
  }

  // Coverage Format 2 uses ranges; expand to a flat glyph-id list.
  function expandCoverage(cov: any): number[] {
    if (cov.glyphs) return cov.glyphs
    const out: number[] = []
    for (const r of cov.ranges) for (let g = r.start; g <= r.end; g++) out.push(g)
    return out
  }

  // Step 3: Prune GSUB.
  // Extension (Type 7) lookups store the real subtable data under .extension
  // and cannot be written back by opentype.js as-is. Unwrap them: replace the
  // subtables array with the inner extension objects and update lookupType to
  // the inner type (4 = LigatureSubst) so the correct writer is used.
  let kept = 0
  const gsub = font.tables.gsub
  if (gsub?.lookups) {
    for (const lookup of gsub.lookups as any[]) {
      if (lookup.lookupType === 7 && lookup.subtables[0]?.extension) {
        lookup.lookupType = lookup.subtables[0].lookupType   // inner type
        lookup.subtables  = (lookup.subtables as any[]).map((st: any) => st.extension)
      }

      for (const subtable of lookup.subtables as any[]) {
        if (!subtable.coverage || !subtable.ligatureSets) continue
        const firstGlyphs = expandCoverage(subtable.coverage)
        for (let i = 0; i < firstGlyphs.length; i++) {
          const ligSet: Array<{ ligGlyph: number; components: number[] }> = subtable.ligatureSets[i]
          if (!ligSet) continue
          const pruned = ligSet.filter(lig => {
            const name = [firstGlyphs[i], ...lig.components]
              .map((g: number) => glyphToChar.get(g) ?? '')
              .join('')
            return iconNames.has(name)
          })
          kept += pruned.length
          subtable.ligatureSets[i] = pruned
        }
      }
    }
  }

  if (kept === 0) {
    console.warn('[cer-material] No icons matched in GSUB table')
    return null
  }

  // Step 4: Write pruned TTF
  let ttfBuf: Buffer
  try {
    ttfBuf = Buffer.from(new Uint8Array(font.toArrayBuffer()))
  } catch (e) {
    console.warn('[cer-material] opentype.js write failed:', e)
    return null
  }

  // Step 5: Glyph-subset the pruned TTF → woff2.
  // Layout closure is safe: GSUB now has only our icons' rules, so closure from
  // source characters cannot reach other icons' PUA output glyphs.
  const text = Array.from(iconNames).sort().join('\n')
  return subsetFn(ttfBuf, text, { targetFormat: 'woff2' })
}

/**
 * Vite plugin that subsets the Material Symbols Outlined font to only the
 * icon names statically referenced in the app's source files.
 *
 * Scans all non-node_modules .ts/.js/.html files during the build for:
 *   icon="name"    :icon="name"    icon: 'name'    leadingIcon: 'name'  etc.
 *
 * Replaces the full woff2 in the bundle with a content-addressed subset and
 * injects a base-aware font preload link via transformIndexHtml.
 *
 * Usage in cer.config.ts / vite.config.ts:
 * ```ts
 * import { materialSymbols } from '@jasonshimmy/cer-material/vite'
 * export default defineConfig({
 *   plugins: [materialSymbols()],
 * })
 * ```
 */
export function materialSymbols(options: MaterialSymbolsOptions = {}): Plugin {
  const included = options.include ?? []
  for (const name of included) {
    if (!SYMBOL_NAME.test(name)) {
      throw new Error(`[cer-material] Invalid Material Symbol name: ${JSON.stringify(name)}`)
    }
  }

  const iconNames = new Set(included)
  let fontEmitted = false
  let fontHref: string | null = null
  let base = '/'
  let isSsrBuild = false
  let subsetCacheDir = ''

  return {
    name: 'cer-material-symbols-subset',
    apply: 'build',

    configResolved(config) {
      base = config.base
      isSsrBuild = Boolean(config.build.ssr)
      subsetCacheDir = join(config.cacheDir, 'cer-material')
    },

    buildStart() {
      iconNames.clear()
      for (const name of included) iconNames.add(name)
      fontEmitted = false
      fontHref = null
    },

    transform(code, id) {
      if (isSsrBuild) return null
      // Scan the consuming app AND @jasonshimmy/cer-material (which defines
      // default icon prop values like leadingIcon: 'search' in md-search).
      const isCerMaterial = id.includes('@jasonshimmy/cer-material')
      if (id.includes('node_modules') && !isCerMaterial) return null
      const cleanId = id.split('?')[0]
      if (!/\.(?:[cm]?[jt]sx?|html)$/.test(cleanId)) return null

      for (const name of findMaterialSymbolNames(code)) iconNames.add(name)

      return null
    },

    async generateBundle(_options, bundle) {
      if (isSsrBuild) return
      if (iconNames.size === 0) return

      const woff2Key = Object.keys(bundle).find(
        k => k.includes('material-symbols-outlined') && k.endsWith('.woff2'),
      )
      if (!woff2Key) {
        this.warn(
          `[cer-material] Found ${iconNames.size} Material Symbol name(s), but no ` +
          `'material-symbols-outlined*.woff2' asset was present in the bundle. ` +
          'Bundle a local font asset or remove materialSymbols().',
        )
        return
      }

      const asset = bundle[woff2Key]
      if (asset.type !== 'asset') return

      const inputBuf = Buffer.from(asset.source as Uint8Array)
      const sortedIconNames = Array.from(iconNames).sort()
      const cacheKey = createHash('sha256')
        .update(SUBSET_CACHE_VERSION)
        .update('\0')
        .update(inputBuf)
        .update('\0')
        .update(sortedIconNames.join('\n'))
        .digest('hex')
      const cachePath = join(subsetCacheDir, `material-symbols-${cacheKey}.woff2`)

      let subsetBuf: Buffer | null = null
      let cacheHit = false
      try {
        const cached = await readFile(cachePath)
        if (cached.length > 0) {
          subsetBuf = cached
          cacheHit = true
        }
      } catch { /* cache miss or unavailable cache directory */ }

      if (subsetBuf === null) {
        subsetBuf = await _subsetFont(inputBuf, iconNames)
        if (subsetBuf !== null) {
          try {
            await mkdir(subsetCacheDir, { recursive: true })
            await writeFile(cachePath, subsetBuf)
          } catch { /* a read-only cache must never fail the build */ }
        }
      }

      if (subsetBuf === null) {
        console.warn('[cer-material] Font subsetting skipped — one or more dependencies failed to load.')
        return
      }

      // Content-address the subset so immutable deployment caches never serve
      // glyphs from a previous build after the discovered icon set changes.
      const hash = createHash('sha256').update(subsetBuf).digest('hex').slice(0, 10)
      const subsetFontName = `material-symbols-subset-${hash}.woff2`
      const subsetFontPath = `assets/${subsetFontName}`
      this.emitFile({
        type: 'asset',
        fileName: subsetFontPath,
        source: new Uint8Array(subsetBuf),
      })
      fontEmitted = true
      fontHref = withBase(base, subsetFontPath)

      // Remove the original font from the bundle — the content-addressed subset replaces it.
      delete bundle[woff2Key]

      // Update every CSS asset that references the old hashed font filename.
      const oldFileName = woff2Key.split('/').pop()!
      for (const key of Object.keys(bundle)) {
        if (!key.endsWith('.css')) continue
        const cssAsset = bundle[key]
        if (cssAsset.type !== 'asset') continue
        const src = typeof cssAsset.source === 'string'
          ? cssAsset.source
          : new TextDecoder().decode(cssAsset.source as Uint8Array)
        if (!src.includes(oldFileName)) continue
        cssAsset.source = src.replaceAll(oldFileName, subsetFontName)
      }

      const pct = ((1 - subsetBuf.length / inputBuf.length) * 100).toFixed(2)
      console.log(
        `\n[cer-material] Material Symbols subset:` +
        `\n  Icons:    ${sortedIconNames.join(', ')}` +
        `\n  Before:   ${(inputBuf.length / 1024).toFixed(0)} KB` +
        `\n  After:    ${(subsetBuf.length / 1024).toFixed(0)} KB  (${pct}% smaller)` +
        `\n  Method:   ${cacheHit ? 'persistent cache' : 'GSUB prune (opentype.js + wawoff2) → woff2 (subset-font)'}\n`,
      )
    },

    transformIndexHtml() {
      if (!fontEmitted || !fontHref) return []
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'font',
            type: 'font/woff2',
            crossorigin: '',
            href: fontHref,
          },
          injectTo: 'head-prepend' as const,
        },
      ]
    },
  }
}
