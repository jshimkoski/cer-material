import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-fab', () => {
  const props = useProps({
    variant: 'primary' as 'primary' | 'secondary' | 'tertiary' | 'surface',
    size: 'regular' as 'small' | 'regular' | 'medium' | 'large',
    icon: 'add',
    label: '',
    lowered: false,
    ariaLabel: '',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: inline-flex; }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: none;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      outline: none;
      position: relative;
      overflow: hidden;
      transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* state layer */
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

    /* ── Sizes ── */
    .small   { width: 40px; height: 40px; border-radius: 12px; }
    .regular { width: 56px; height: 56px; border-radius: 16px; }
    .medium  { width: 80px; height: 80px; border-radius: 20px; }
    .large   { width: 96px; height: 96px; border-radius: 28px; }
    .extended { height: 56px; border-radius: 16px; padding: 0 20px 0 16px; }

    /* ── Color variants ── */
    .primary {
      background: var(--md-sys-color-primary-container, #EADDFF);
      color: var(--md-sys-color-on-primary-container, #21005D);
      box-shadow: var(--md-sys-elevation-3);
    }
    .primary::before { background: var(--md-sys-color-on-primary-container, #21005D); }

    .secondary {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
      box-shadow: var(--md-sys-elevation-3);
    }
    .secondary::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }

    .tertiary {
      background: var(--md-sys-color-tertiary-container, #FFD8E4);
      color: var(--md-sys-color-on-tertiary-container, #31111D);
      box-shadow: var(--md-sys-elevation-3);
    }
    .tertiary::before { background: var(--md-sys-color-on-tertiary-container, #31111D); }

    .surface-variant {
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      color: var(--md-sys-color-primary, #6750A4);
      box-shadow: var(--md-sys-elevation-3);
    }
    .surface-variant::before { background: var(--md-sys-color-primary, #6750A4); }

    button:hover { box-shadow: var(--md-sys-elevation-4); }
    .lowered      { box-shadow: var(--md-sys-elevation-1) !important; }
    .lowered:hover { box-shadow: var(--md-sys-elevation-2) !important; }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      display: inline-block;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .small   .icon { font-size: 24px; }
    .regular .icon { font-size: 24px; }
    .medium  .icon { font-size: 28px; }
    .large   .icon { font-size: 36px; }
    .extended .icon { font-size: 24px; }

    .label { font-size: 14px; font-weight: 500; }
  `);

  return html`
    <button
      :class="${{
        [props.variant === 'surface' ? 'surface-variant' : props.variant]: true,
        [props.label ? 'extended' : props.size]: true,
        lowered: props.lowered,
      }}"
      :bind="${{ 'aria-label': props.ariaLabel || props.label || props.icon }}"
      type="button"
      @click="${() => emit('click')}"
    >
      <span class="icon" aria-hidden="true">${props.icon}</span>
      ${when(!!props.label, () => html`<span class="label">${props.label}</span>`)}
    </button>
  `;
});
