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
 * Class name convention: `<utility>-md<role>`
 * Examples:
 *   bg-mdprimary          → background: var(--md-sys-color-primary)
 *   text-mdonprimary      → color: var(--md-sys-color-on-primary)
 *   border-mdsurface      → border-color: var(--md-sys-color-surface)
 */
export const customColors: Record<string, Record<string, string>> = {
  // ── Primary ──────────────────────────────────────────────────────────────
  mdprimary:              { DEFAULT: 'var(--md-sys-color-primary)' },
  mdonprimary:            { DEFAULT: 'var(--md-sys-color-on-primary)' },
  mdprimarycontainer:     { DEFAULT: 'var(--md-sys-color-primary-container)' },
  mdonprimarycontainer:   { DEFAULT: 'var(--md-sys-color-on-primary-container)' },

  // ── Secondary ─────────────────────────────────────────────────────────────
  mdsecondary:            { DEFAULT: 'var(--md-sys-color-secondary)' },
  mdonsecondary:          { DEFAULT: 'var(--md-sys-color-on-secondary)' },
  mdsecondarycontainer:   { DEFAULT: 'var(--md-sys-color-secondary-container)' },
  mdonsecondarycontainer: { DEFAULT: 'var(--md-sys-color-on-secondary-container)' },

  // ── Tertiary ──────────────────────────────────────────────────────────────
  mdtertiary:             { DEFAULT: 'var(--md-sys-color-tertiary)' },
  mdontertiary:           { DEFAULT: 'var(--md-sys-color-on-tertiary)' },
  mdtertiarycontainer:    { DEFAULT: 'var(--md-sys-color-tertiary-container)' },
  mdontertiarycontainer:  { DEFAULT: 'var(--md-sys-color-on-tertiary-container)' },

  // ── Error ─────────────────────────────────────────────────────────────────
  mderror:                { DEFAULT: 'var(--md-sys-color-error)' },
  mdonerror:              { DEFAULT: 'var(--md-sys-color-on-error)' },
  mderrorcontainer:       { DEFAULT: 'var(--md-sys-color-error-container)' },
  mdonerrorcontainer:     { DEFAULT: 'var(--md-sys-color-on-error-container)' },

  // ── Surface & Background ──────────────────────────────────────────────────
  mdbackground:                 { DEFAULT: 'var(--md-sys-color-background)' },
  mdonbackground:               { DEFAULT: 'var(--md-sys-color-on-background)' },
  mdsurface:                    { DEFAULT: 'var(--md-sys-color-surface)' },
  mdonsurface:                  { DEFAULT: 'var(--md-sys-color-on-surface)' },
  mdsurfacevariant:             { DEFAULT: 'var(--md-sys-color-surface-variant)' },
  mdonsurfacevariant:           { DEFAULT: 'var(--md-sys-color-on-surface-variant)' },
  mdsurfacecontainerlowest:     { DEFAULT: 'var(--md-sys-color-surface-container-lowest)' },
  mdsurfacecontainerlow:        { DEFAULT: 'var(--md-sys-color-surface-container-low)' },
  mdsurfacecontainer:           { DEFAULT: 'var(--md-sys-color-surface-container)' },
  mdsurfacecontainerhigh:       { DEFAULT: 'var(--md-sys-color-surface-container-high)' },
  mdsurfacecontainerhighest:    { DEFAULT: 'var(--md-sys-color-surface-container-highest)' },

  // ── Inverse ───────────────────────────────────────────────────────────────
  mdinversesurface:       { DEFAULT: 'var(--md-sys-color-inverse-surface)' },
  mdinverseonsurface:     { DEFAULT: 'var(--md-sys-color-inverse-on-surface)' },
  mdinverseprimary:       { DEFAULT: 'var(--md-sys-color-inverse-primary)' },

  // ── Utility ───────────────────────────────────────────────────────────────
  mdoutline:              { DEFAULT: 'var(--md-sys-color-outline)' },
  mdoutlinevariant:       { DEFAULT: 'var(--md-sys-color-outline-variant)' },
  mdshadow:               { DEFAULT: 'var(--md-sys-color-shadow)' },
  mdscrim:                { DEFAULT: 'var(--md-sys-color-scrim)' },
  mdsurfacetint:          { DEFAULT: 'var(--md-sys-color-surface-tint)' },
}
