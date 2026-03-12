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

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 32px;
      padding: 0 16px;
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline, #79747E);
      background: transparent;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      position: relative;
      overflow: hidden;
      transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      white-space: nowrap;
    }
    .chip:disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }

    .chip::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      background: var(--md-sys-color-on-surface-variant, #49454F);
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .chip:hover::before  { opacity: 0.08; }
    .chip:focus::before  { opacity: 0.12; }
    .chip:active::before { opacity: 0.12; }

    /* ── Filter selected state ── */
    .chip.selected {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
      border-color: transparent;
    }
    .chip.selected::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }

    /* ── Assist & Suggestion elevated ── */
    .chip.elevated {
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      border-color: transparent;
      box-shadow: var(--md-sys-elevation-1);
    }
    .chip.elevated:hover { box-shadow: var(--md-sys-elevation-2); }

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

    .close-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      cursor: pointer;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      position: relative;
      overflow: hidden;
    }
    .close-icon::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transition: opacity 200ms;
    }
    .close-icon:hover::before  { opacity: 0.08; }
    .close-icon:focus::before  { opacity: 0.12; }
    .close-icon:active::before { opacity: 0.12; }
  `);

  const isElevated = props.variant === 'assist' || props.variant === 'suggestion';
  const checkIcon = selected.value && props.variant === 'filter' ? 'check' : props.icon;

  return html`
    <div
      :class="${{
        chip: true,
        selected: selected.value,
        elevated: isElevated,
        'has-icon': !!checkIcon,
      }}"
      role="${props.variant === 'filter' ? 'checkbox' : 'button'}"
      :bind="${{ 'aria-checked': props.variant === 'filter' ? String(selected.value) : null }}"
      :aria-disabled="${String(props.disabled)}"
      tabindex="${props.disabled ? -1 : 0}"
      @click="${() => { if (!props.disabled) { emit('click'); if (props.variant === 'filter') selected.value = !selected.value; } }}"
      @keydown="${(e: KeyboardEvent) => { if (!props.disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); emit('click'); if (props.variant === 'filter') selected.value = !selected.value; } }}"
    >
      ${when(!!checkIcon, () => html`<span class="icon" aria-hidden="true">${checkIcon}</span>`)}
      ${props.label}
      ${when(props.variant === 'input', () => html`
        <span
          class="close-icon"
          role="button"
          tabindex="0"
          aria-label="Remove ${props.label}"
          @click="${(e: Event) => { e.stopPropagation(); emit('remove'); }}"
          @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); emit('remove'); } }}"
        >close</span>
      `)}
    </div>
  `;
});
