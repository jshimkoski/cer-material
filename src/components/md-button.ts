import { component, html, css, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

/**
 * md-button
 *
 * MD3 button with five variants.
 * Spec: https://m3.material.io/components/buttons
 *
 * Props:
 *   variant      — 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
 *   label        — button text (can also be set via the default slot)
 *   icon         — Material Symbol name for the leading icon
 *   trailingIcon — Material Symbol name for the trailing icon
 *   type         — native button type: 'button' | 'submit' | 'reset'
 *   disabled     — disables the button
 *
 * Slots:
 *   (default) — button label text (used alongside or instead of `label` prop)
 */
component('md-button', () => {
  const props = useProps({
    variant: 'filled' as 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal',
    label: '',
    icon: '',
    trailingIcon: '',
    type: 'button' as 'button' | 'submit' | 'reset',
    disabled: false,
  });
  useStyle(() => css`
    :host { display: inline-flex; vertical-align: middle; }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 40px;
      padding: 0 24px;
      border-radius: 20px;
      border: none;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      line-height: 20px;
      outline: none;
      position: relative;
      overflow: hidden;
      transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      white-space: nowrap;
      -webkit-font-smoothing: antialiased;
    }
    button:disabled { cursor: not-allowed; pointer-events: none; }

    /* state layer */
    button::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
    button:hover::before  { opacity: 0.08; }
    button:focus::before  { opacity: 0.12; }
    button:active::before { opacity: 0.12; }

    /* ── Filled ── */
    .filled {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #fff);
    }
    .filled::before { background: var(--md-sys-color-on-primary, #fff); }
    .filled:hover   { box-shadow: var(--md-sys-elevation-1); }
    .filled:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); box-shadow: none; }

    /* ── Outlined ── */
    .outlined {
      background: transparent;
      color: var(--md-sys-color-primary, #6750A4);
      border: 1px solid var(--md-sys-color-outline, #79747E);
    }
    .outlined::before { background: var(--md-sys-color-primary, #6750A4); }
    .outlined:disabled { border-color: rgba(28,27,31,.12); color: rgba(28,27,31,.38); }

    /* ── Text ── */
    .text {
      background: transparent;
      color: var(--md-sys-color-primary, #6750A4);
      padding: 0 12px;
    }
    .text::before { background: var(--md-sys-color-primary, #6750A4); }
    .text:disabled { color: rgba(28,27,31,.38); }

    /* ── Elevated ── */
    .elevated {
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      color: var(--md-sys-color-primary, #6750A4);
      box-shadow: var(--md-sys-elevation-1);
    }
    .elevated::before { background: var(--md-sys-color-primary, #6750A4); }
    .elevated:hover   { box-shadow: var(--md-sys-elevation-2); }
    .elevated:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); box-shadow: none; }

    /* ── Tonal ── */
    .tonal {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .tonal::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }
    .tonal:hover   { box-shadow: var(--md-sys-elevation-1); }
    .tonal:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); box-shadow: none; }

    /* leading icon: reduce left padding */
    .has-icon { padding-left: 16px; }
    .text.has-icon { padding-left: 12px; padding-right: 16px; }
    /* trailing icon: reduce right padding */
    .has-trailing-icon { padding-right: 16px; }
    .text.has-trailing-icon { padding-right: 12px; padding-left: 16px; }
    /* both icons */
    .has-icon.has-trailing-icon { padding-left: 16px; padding-right: 16px; }
    .text.has-icon.has-trailing-icon { padding-left: 12px; padding-right: 12px; }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: 400;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }
  `);

  return html`
    <button
      :type="${props.type}"
      :class="${{
        [props.variant]: true,
        'has-icon': !!props.icon,
        'has-trailing-icon': !!props.trailingIcon,
      }}"
      :disabled="${props.disabled}"
    >
      ${when(!!props.icon, () => html`<span class="icon" aria-hidden="true">${props.icon}</span>`)}
      ${props.label}<slot></slot>
      ${when(!!props.trailingIcon, () => html`<span class="icon" aria-hidden="true">${props.trailingIcon}</span>`)}
    </button>
  `;
});
