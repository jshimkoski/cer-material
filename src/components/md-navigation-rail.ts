import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';
import { useListKeyNav } from '../composables/useListKeyNav';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
}

component('md-navigation-rail', () => {
  const props = useProps({
    items: [] as NavItem[],
    active: '',
    fab: false,
    fabIcon: 'add',
    menuIcon: false,
  });
  const emit = useEmit();

  const handleNavKeyDown = useListKeyNav({
    orientation: 'vertical',
    itemSelector: '.nav-item',
  });

  useStyle(() => css`
    :host { display: block; height: 100%; }

    .nav-rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 80px;
      min-height: 100%;
      background: var(--md-sys-color-surface, #FFFBFE);
      padding: 12px 0;
      gap: 4px;
      box-sizing: border-box;
    }

    /* ── Menu icon ── */
    .menu-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      outline: none;
      position: relative;
      overflow: hidden;
      margin-bottom: 4px;
      flex-shrink: 0;
    }
    .menu-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transition: opacity 200ms;
    }
    .menu-btn:hover::before { opacity: 0.08; }
    .menu-btn:focus::before { opacity: 0.12; }

    /* ── FAB ── */
    .fab {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      border: none;
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      position: relative;
      overflow: hidden;
      margin-bottom: 8px;
      box-shadow: var(--md-sys-elevation-1, 0 1px 2px rgba(0,0,0,0.3));
      flex-shrink: 0;
      transition: box-shadow 200ms;
    }
    .fab::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--md-sys-color-on-secondary-container, #1D192B);
      opacity: 0;
      transition: opacity 200ms;
    }
    .fab:hover { box-shadow: var(--md-sys-elevation-2, 0 2px 6px rgba(0,0,0,0.2)); }
    .fab:hover::before { opacity: 0.08; }
    .fab:focus::before { opacity: 0.12; }

    /* ── Nav item ── */
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 4px 0;
      cursor: pointer;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      outline: none;
      gap: 4px;
    }

    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 32px;
      border-radius: 16px;
      position: relative;
      /* no overflow:hidden — allows badge to extend outside the pill */
      transition: background-color 200ms;
    }
    .indicator::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
      pointer-events: none;
    }
    .nav-item:hover .indicator::before  { opacity: 0.08; }
    .nav-item:focus .indicator::before  { opacity: 0.12; }
    .nav-item:active .indicator::before { opacity: 0.12; }

    .nav-item.active .indicator {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
    }
    .nav-item.active .indicator::before {
      background: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .nav-item.active { color: var(--md-sys-color-on-secondary-container, #1D192B); }

    .nav-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      position: relative;
      z-index: 1;
    }
    .nav-item.active .nav-icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .nav-label {
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.5px;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: 4px;
      min-width: 16px;
      height: 16px;
      background: var(--md-sys-color-error, #B3261E);
      color: var(--md-sys-color-on-error, #fff);
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      z-index: 2;
    }
    .badge-dot {
      position: absolute;
      top: -2px;
      right: 8px;
      width: 6px;
      height: 6px;
      background: var(--md-sys-color-error, #B3261E);
      border-radius: 50%;
      z-index: 2;
    }

    .mat-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `);

  return html`
      <nav class="nav-rail" aria-label="Navigation rail" @keydown="${handleNavKeyDown}">
      ${when(props.menuIcon, () => html`
        <button type="button" class="menu-btn" aria-label="Open navigation menu" @click="${() => emit('menu-click')}">
          <span class="mat-icon" aria-hidden="true">menu</span>
        </button>
      `)}
      ${when(props.fab, () => html`
        <button type="button" class="fab" aria-label="Create" @click="${() => emit('fab-click')}">
          <span class="mat-icon" aria-hidden="true">${props.fabIcon}</span>
        </button>
      `)}
      ${each(
        Array.isArray(props.items) ? props.items : [],
        (item: NavItem) => html`
          <button
            key="${item.id}"
            :class="${{ 'nav-item': true, active: props.active === item.id }}"
            aria-label="${item.label}"
            :bind="${{ 'aria-current': props.active === item.id ? 'page' : null }}"
            @click="${() => emit('change', item.id)}"
          >
            <div class="indicator">
              <span class="nav-icon" aria-hidden="true">${item.icon}</span>
              ${when(!!item.badge, () => html`
                <span :class="${{ 'badge-dot': typeof item.badge === 'boolean', badge: typeof item.badge !== 'boolean' }}" aria-hidden="true">
                  ${typeof item.badge === 'boolean' ? '' : String(item.badge)}
                </span>
              `)}
            </div>
            <span class="nav-label">${item.label}</span>
          </button>
        `,
      )}
    </nav>
  `;
});
