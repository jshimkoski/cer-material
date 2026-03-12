import { component, html, css, defineModel, useEmit, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';
import { useListKeyNav } from '../composables/useListKeyNav';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
}

component('md-navigation-bar', () => {
  const props = useProps({
    items: [] as NavItem[],
  });
  const emit = useEmit();
  const active = defineModel('active', '');

  const handleNavKeyDown = useListKeyNav({
    orientation: 'horizontal',
    itemSelector: '.nav-item',
  });

  useStyle(() => css`
    :host { display: block; }

    .nav-bar {
      display: flex;
      background: var(--md-sys-color-surface-container, #F3EDF7);
      height: 80px;
      align-items: stretch;
      box-shadow: 0 -1px 0 var(--md-sys-color-surface-variant, #E7E0EC);
    }

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      border: none;
      background: transparent;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      position: relative;
      overflow: hidden;
      padding: 0;
      transition: color 200ms;
    }
    .nav-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .nav-item:hover::before  { opacity: 0.08; }
    .nav-item:focus::before  { opacity: 0.12; }
    .nav-item:active::before { opacity: 0.12; }

    .nav-item.active { color: var(--md-sys-color-on-secondary-container, #1D192B); }
    .nav-item.active::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }

    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 32px;
      border-radius: 16px;
      position: relative;
      transition: background-color 200ms;
    }
    .active .indicator {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
    }

    .nav-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .active .nav-icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .nav-label {
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.5px;
    }
    .active .nav-label { color: var(--md-sys-color-on-secondary-container, #1D192B); }

    .badge {
      position: absolute;
      top: 0;
      right: 8px;
      min-width: 16px;
      height: 16px;
      background: var(--md-sys-color-error, #B3261E);
      color: var(--md-sys-color-on-error, #fff);
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .badge-dot {
      position: absolute;
      top: 2px;
      right: 12px;
      width: 6px;
      height: 6px;
      background: var(--md-sys-color-error, #B3261E);
      border-radius: 50%;
    }
  `);

  return html`
    <div class="nav-bar" role="navigation" aria-label="Navigation bar" @keydown="${handleNavKeyDown}">
      ${each(
        Array.isArray(props.items) ? props.items : [],
        (item: NavItem) => html`
          <button
            type="button"
            key="${item.id}"
            :class="${{ 'nav-item': true, active: active.value === item.id }}"
            aria-label="${item.label}"
            :bind="${{ 'aria-current': active.value === item.id ? 'page' : null }}"
            @click="${() => { emit('change', item.id); active.value = item.id; }}"
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
    </div>
  `;
});
