import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';

component('md-icon-button', () => {
  const props = useProps({
    variant: 'standard' as 'standard' | 'filled' | 'tonal' | 'outlined',
    icon: 'more_vert',
    selected: false,
    disabled: false,
    toggle: false,
    selectedIcon: '',
    ariaLabel: '',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: inline-flex; vertical-align: middle; }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      border: none;
      cursor: pointer;
      outline: none;
      position: relative;
      overflow: hidden;
      transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      background: transparent;
    }
    button:disabled { cursor: not-allowed; opacity: 0.38; pointer-events: none; }

    button::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    button:hover::before  { opacity: 0.08; }
    button:focus::before  { opacity: 0.12; }
    button:active::before { opacity: 0.12; }

    /* ── Standard ── */
    .standard { color: var(--md-sys-color-on-surface-variant, #49454F); }
    .standard.selected { color: var(--md-sys-color-primary, #6750A4); }
    .standard::before { background: var(--md-sys-color-on-surface-variant, #49454F); }
    .standard.selected::before { background: var(--md-sys-color-primary, #6750A4); }

    /* ── Filled (non-toggle: always primary) ── */
    .filled {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #fff);
    }
    .filled::before { background: var(--md-sys-color-on-primary, #fff); }

    /* ── Filled toggle: unselected ── */
    .filled.toggle {
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      color: var(--md-sys-color-primary, #6750A4);
    }
    .filled.toggle::before { background: var(--md-sys-color-primary, #6750A4); }

    /* ── Filled toggle: selected ── */
    .filled.toggle.selected {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #fff);
    }
    .filled.toggle.selected::before { background: var(--md-sys-color-on-primary, #fff); }

    /* ── Tonal (non-toggle: always secondary-container) ── */
    .tonal {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .tonal::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }

    /* ── Tonal toggle: unselected ── */
    .tonal.toggle {
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .tonal.toggle::before { background: var(--md-sys-color-on-surface-variant, #49454F); }

    /* ── Tonal toggle: selected ── */
    .tonal.toggle.selected {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .tonal.toggle.selected::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }

    /* ── Outlined ── */
    .outlined {
      border: 1px solid var(--md-sys-color-outline, #79747E);
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .outlined.selected {
      background: var(--md-sys-color-inverse-surface, #313033);
      color: var(--md-sys-color-inverse-on-surface, #F4EFF4);
      border-color: transparent;
    }
    .outlined::before { background: var(--md-sys-color-on-surface-variant, #49454F); }
    .outlined.selected::before { background: var(--md-sys-color-inverse-on-surface, #F4EFF4); }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      display: inline-block;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .selected .icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `);

  const displayIcon = props.toggle && props.selected && props.selectedIcon
    ? props.selectedIcon
    : props.icon;

  return html`
    <button
      :class="${{
        [props.variant]: true,
        selected: props.selected,
        toggle: props.toggle,
      }}"
      :disabled="${props.disabled}"
      :bind="${{ 'aria-label': props.ariaLabel || props.icon, 'aria-pressed': props.toggle ? String(props.selected) : null }}"
      type="button"
      @click="${() => {
        if (props.toggle) emit('change', !props.selected);
        emit('click');
      }}"
    >
      <span class="icon" aria-hidden="true">${displayIcon}</span>
    </button>
  `;
});
