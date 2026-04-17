/**
 * JITCSS `customColors` for all MD3 semantic color roles defined in theme.css.
 *
 * Each MD3 role maps to a single-word color family name with
 * a `DEFAULT` shade that references the corresponding CSS custom property.
 *
 * Usage in cer.config.ts:
 * ```ts
 * import { customColors } from '@jasonshimmy/cer-material/jit-css'
 *
 * export default defineConfig({
 *   jitCss: { customColors },
 * })
 * ```
 *
 * Class name convention: `<utility>-md-<role>`
 * Examples:
 *   bg-md-primary          → background: var(--md-sys-color-primary)
 *   text-md-on-primary      → color: var(--md-sys-color-on-primary)
 *   border-md-surface      → border-color: var(--md-sys-color-surface)
 */
export const customColors: Record<string, Record<string, string>> = {
  // ── Primary ──────────────────────────────────────────────────────────────
  'md-primary':              { DEFAULT: 'var(--md-sys-color-primary)' },
  'md-on-primary':           { DEFAULT: 'var(--md-sys-color-on-primary)' },
  'md-primary-container':    { DEFAULT: 'var(--md-sys-color-primary-container)' },
  'md-on-primary-container': { DEFAULT: 'var(--md-sys-color-on-primary-container)' },

  // ── Secondary ─────────────────────────────────────────────────────────────
  'md-secondary':              { DEFAULT: 'var(--md-sys-color-secondary)' },
  'md-on-secondary':           { DEFAULT: 'var(--md-sys-color-on-secondary)' },
  'md-secondary-container':    { DEFAULT: 'var(--md-sys-color-secondary-container)' },
  'md-on-secondary-container': { DEFAULT: 'var(--md-sys-color-on-secondary-container)' },

  // ── Tertiary ──────────────────────────────────────────────────────────────
  'md-tertiary':              { DEFAULT: 'var(--md-sys-color-tertiary)' },
  'md-on-tertiary':           { DEFAULT: 'var(--md-sys-color-on-tertiary)' },
  'md-tertiary-container':    { DEFAULT: 'var(--md-sys-color-tertiary-container)' },
  'md-on-tertiary-container': { DEFAULT: 'var(--md-sys-color-on-tertiary-container)' },

  // ── Error ─────────────────────────────────────────────────────────────────
  'md-error':              { DEFAULT: 'var(--md-sys-color-error)' },
  'md-on-error':           { DEFAULT: 'var(--md-sys-color-on-error)' },
  'md-error-container':    { DEFAULT: 'var(--md-sys-color-error-container)' },
  'md-on-error-container': { DEFAULT: 'var(--md-sys-color-on-error-container)' },

  // ── Surface & Background ──────────────────────────────────────────────────
  'md-background':                    { DEFAULT: 'var(--md-sys-color-background)' },
  'md-on-background':                 { DEFAULT: 'var(--md-sys-color-on-background)' },
  'md-surface':                       { DEFAULT: 'var(--md-sys-color-surface)' },
  'md-on-surface':                    { DEFAULT: 'var(--md-sys-color-on-surface)' },
  'md-surface-variant':               { DEFAULT: 'var(--md-sys-color-surface-variant)' },
  'md-on-surface-variant':            { DEFAULT: 'var(--md-sys-color-on-surface-variant)' },
  'md-surface-container-lowest':      { DEFAULT: 'var(--md-sys-color-surface-container-lowest)' },
  'md-surface-container-low':         { DEFAULT: 'var(--md-sys-color-surface-container-low)' },
  'md-surface-container':             { DEFAULT: 'var(--md-sys-color-surface-container)' },
  'md-surface-container-high':        { DEFAULT: 'var(--md-sys-color-surface-container-high)' },
  'md-surface-container-highest':     { DEFAULT: 'var(--md-sys-color-surface-container-highest)' },

  // ── Inverse ───────────────────────────────────────────────────────────────
  'md-inverse-surface':    { DEFAULT: 'var(--md-sys-color-inverse-surface)' },
  'md-inverse-on-surface': { DEFAULT: 'var(--md-sys-color-inverse-on-surface)' },
  'md-inverse-primary':    { DEFAULT: 'var(--md-sys-color-inverse-primary)' },

  // ── Utility ───────────────────────────────────────────────────────────────
  'md-outline':         { DEFAULT: 'var(--md-sys-color-outline)' },
  'md-outline-variant': { DEFAULT: 'var(--md-sys-color-outline-variant)' },
  'md-shadow':          { DEFAULT: 'var(--md-sys-color-shadow)' },
  'md-scrim':           { DEFAULT: 'var(--md-sys-color-scrim)' },
  'md-surface-tint':    { DEFAULT: 'var(--md-sys-color-surface-tint)' },
}
