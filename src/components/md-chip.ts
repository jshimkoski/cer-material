import { component, html, css, defineModel, useEmit, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-chip', () => {
  const props = useProps({
    variant: 'assist' as 'assist' | 'filter' | 'input' | 'suggestion',
    label: '',
    icon: '',
    disabled: false,
  });
  const emit = useEmit();
  const selected = defineModel('selected', false);

  useStyle(() => css`
    :host { display: inline-flex; vertical-align: middle; }

    /* chip-wrapper is the visual pill — border, radius, and overflow all live here
       so that sibling children (chip body + close button) are clipped inside it. */
    .chip-wrapper {
      display: inline-flex;
      align-items: center;
      height: 32px;
      border-radius: 16px;
      border: 1px solid var(--md-sys-color-outline, #79747E);
      background: transparent;
      overflow: hidden;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      white-space: nowrap;
    }
    .chip-wrapper.disabled { opacity: 0.38; pointer-events: none; }

    /* ── Filter selected state ── */
    .chip-wrapper.selected {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
      border-color: transparent;
    }

    /* ── Assist & Suggestion elevated ── */
    .chip-wrapper.elevated {
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      border-color: transparent;
      box-shadow: var(--md-sys-elevation-1);
    }
    .chip-wrapper.elevated:hover { box-shadow: var(--md-sys-elevation-2); }

    /* chip is the interactive/focusable area (label + icon) */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      padding: 0 16px;
      cursor: pointer;
      outline: none;
      position: relative;
    }
    /* Reduce right padding when a close button follows */
    .chip-wrapper:has(.close-btn) .chip { padding-right: 8px; }

    .chip::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      background: var(--md-sys-color-on-surface-variant, #49454F);
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .chip-wrapper.selected .chip::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }
    .chip:hover::before  { opacity: 0.08; }
    .chip:focus::before  { opacity: 0.12; }
    .chip:active::before { opacity: 0.12; }

    .has-icon { padding-left: 8px; }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      display: inline-block;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }
    .selected .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20; }

    .close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
      margin-right: 4px;
    }
    .close-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transition: opacity 200ms;
    }
    .close-btn:hover::before  { opacity: 0.08; }
    .close-btn:focus::before  { opacity: 0.12; }
    .close-btn:active::before { opacity: 0.12; }

    .close-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      position: relative;
      z-index: 1;
    }
  `);

  return html`
    <div
      :class="${{
        'chip-wrapper': true,
        selected: selected.value,
        elevated: props.variant === 'assist' || props.variant === 'suggestion',
        disabled: props.disabled,
      }}"
    >
      <div
        :class="${{
          chip: true,
          'has-icon': !!(props.variant === 'filter' && selected.value ? 'check' : props.icon),
        }}"
        role="${props.variant === 'filter' ? 'checkbox' : 'button'}"
        :bind="${{ 'aria-checked': props.variant === 'filter' ? String(selected.value) : null, 'aria-disabled': props.disabled ? 'true' : null }}"
        tabindex="${props.disabled ? -1 : 0}"
        @click="${() => { if (!props.disabled) { emit('click'); if (props.variant === 'filter') selected.value = !selected.value; } }}"
        @keydown="${(e: KeyboardEvent) => { if (!props.disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); emit('click'); if (props.variant === 'filter') selected.value = !selected.value; } }}"
      >
        ${when(!!(props.variant === 'filter' && selected.value ? 'check' : props.icon), () => html`<span class="icon" aria-hidden="true">${props.variant === 'filter' && selected.value ? 'check' : props.icon}</span>`)}
        ${props.label}
      </div>
      ${when(props.variant === 'input', () => html`
        <button
          type="button"
          class="close-btn"
          aria-label="Remove ${props.label}"
          :disabled="${props.disabled}"
          @click="${(e: Event) => { e.stopPropagation(); emit('remove'); }}"
        >
          <span class="close-icon" aria-hidden="true">close</span>
        </button>
      `)}
    </div>
  `;
});
