import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';

interface DrawerItem {
  id?: string;
  label?: string;
  icon?: string;
  section?: string;
  divider?: boolean;
  disabled?: boolean;
}

component('md-navigation-drawer', () => {
  const props = useProps({
    open: false,
    headline: '',
    variant: 'modal' as 'modal' | 'standard',
    items: [] as DrawerItem[],
    active: '',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: contents; }

    /* ── Scrim ─────────────────────────────────────────────────────────── */
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
      z-index: 600;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      /* Closing: keep visible until transition fully completes, then hide. */
      transition: opacity 250ms ease-out, visibility 0s linear 250ms;
    }
    .scrim.open {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      /* Opening: no delay — element must be visible from frame 1. */
      transition: opacity 250ms ease-out;
    }

    /* ── Modal drawer (position: fixed overlay) ─────────────────────────── */
    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 360px;
      max-width: 85vw;
      background: var(--md-sys-color-surface, #FFFBFE);
      z-index: 601;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      /* Closed: slide fully off-screen. The transform hides it visually;
         pointer-events:none prevents interaction without visibility tricks
         that starve the compositor of a promoted layer on first paint. */
      transform: translateX(-100%);
      pointer-events: none;
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .drawer.open {
      transform: translateX(0);
      pointer-events: auto;
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Standard drawer (in-layout, no overlay) ─────────────────────────── */
    .standard-drawer {
      display: none;
      flex-direction: column;
      overflow: hidden;
      background: var(--md-sys-color-surface, #FFFBFE);
      height: 100%;
    }
    .standard-drawer.open {
      display: flex;
    }

    /* ── Inner content ──────────────────────────────────────────────────── */
    .drawer-header {
      padding: 12px 28px;
      min-height: 56px;
      display: flex;
      align-items: center;
    }
    .drawer-headline {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px;
    }

    .drawer-item {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 56px;
      padding: 0 16px;
      border-radius: 28px;
      cursor: pointer;
      border: none;
      background: transparent;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      width: 100%;
      text-align: left;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }
    .drawer-item::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .drawer-item:hover::before { opacity: 0.08; }
    .drawer-item:focus::before { opacity: 0.12; }
    .drawer-item:disabled { opacity: 0.38; pointer-events: none; }

    .drawer-item.active {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .drawer-item.active::before {
      background: var(--md-sys-color-on-secondary-container, #1D192B);
    }

    .drawer-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }
    .drawer-item.active .drawer-icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .drawer-label {
      position: relative;
      z-index: 1;
    }

    .section-label {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      padding: 18px 16px 8px;
      letter-spacing: 0.1px;
    }

    .divider {
      height: 1px;
      background: var(--md-sys-color-outline-variant, #CAC4D0);
      margin: 8px 12px;
    }
  `);

  // Drawer is always rendered; the .open class drives CSS enter/exit transitions
  // so both opening and closing are animated (fixes "strange toggle" behaviour).
  return html`
    ${when(props.variant === 'modal', () => html`
      <div
        :class="${{ scrim: true, open: props.open }}"
        @click="${() => emit('close')}"
      ></div>
    `)}
    <div
      :class="${{
        drawer: props.variant === 'modal',
        'standard-drawer': props.variant === 'standard',
        open: props.open,
      }}"
      role="navigation"
      aria-label="Navigation drawer"
    >
      ${when(!!props.headline, () => html`
        <div class="drawer-header">
          <span class="drawer-headline">${props.headline}</span>
        </div>
      `)}
      <div class="drawer-content">
        ${each(
          Array.isArray(props.items) ? props.items : [],
          (item: DrawerItem) =>
            item.divider
              ? html`<div class="divider"></div>`
              : item.section
              ? html`<div class="section-label">${item.section}</div>`
              : html`
                <button
                  key="${item.id}"
                  :class="${{ 'drawer-item': true, active: props.active === item.id }}"
                  :disabled="${item.disabled || false}"
                  aria-current="${props.active === item.id ? 'page' : 'false'}"
                  @click="${() => { if (item.id) { emit('change', item.id); if (props.variant === 'modal') emit('close'); } }}"
                >
                  ${when(!!item.icon, () => html`<span class="drawer-icon">${item.icon}</span>`)}
                  <span class="drawer-label">${item.label}</span>
                </button>
              `,
        )}
        <slot></slot>
      </div>
    </div>
  `;
});

