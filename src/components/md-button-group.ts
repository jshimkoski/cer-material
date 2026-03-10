import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';

/**
 * md-button-group
 *
 * MD3 Button groups — horizontally connected group of buttons that share borders.
 * Spec: https://m3.material.io/components/button-groups
 *
 * Props:
 *   variant  — 'filled' | 'outlined' | 'tonal' | 'text' | 'elevated'
 *   disabled — disable all buttons
 *   items    — array of { id, label, icon?, disabled? }
 *
 * Emits:
 *   click    — { id, index }
 */

interface ButtonGroupItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

component('md-button-group', () => {
  const props = useProps({
    variant: 'outlined' as 'filled' | 'outlined' | 'tonal' | 'text' | 'elevated',
    disabled: false,
    items: [] as ButtonGroupItem[],
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: inline-flex; vertical-align: middle; }

    .group {
      display: inline-flex;
      align-items: stretch;
    }

    /* Each button in the group */
    .group-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 40px;
      padding: 0 20px;
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
      transition: box-shadow 280ms cubic-bezier(0.4,0,0.2,1);
      user-select: none;
      white-space: nowrap;
      -webkit-font-smoothing: antialiased;
      /* Flatten adjacent radii to create connected look */
      border-radius: 0;
    }
    /* First button: round left corners */
    .group-btn:first-child { border-radius: 20px 0 0 20px; }
    /* Last button: round right corners */
    .group-btn:last-child  { border-radius: 0 20px 20px 0; }
    /* Only child */
    .group-btn:only-child  { border-radius: 20px; }

    .group-btn:disabled { cursor: not-allowed; pointer-events: none; }

    /* State layer */
    .group-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4,0,0.2,1);
      pointer-events: none;
    }
    .group-btn:hover::before  { opacity: 0.08; }
    .group-btn:focus::before  { opacity: 0.12; }
    .group-btn:active::before { opacity: 0.12; }
    .group-btn:focus-visible  { outline: 2px solid var(--md-sys-color-primary, #6750A4); outline-offset: 2px; z-index: 1; }

    /* ── Filled ── */
    .filled .group-btn {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }
    .filled .group-btn::before { background: var(--md-sys-color-on-primary, #FFFFFF); }
    .filled .group-btn:hover   { box-shadow: var(--md-sys-elevation-1); }
    .filled .group-btn:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); }
    /* Divider between filled buttons */
    .filled .group-btn + .group-btn {
      border-left: 1px solid var(--md-sys-color-on-primary, #FFFFFF);
      opacity: 0.5;
    }

    /* ── Outlined ── */
    .outlined .group-btn {
      background: transparent;
      color: var(--md-sys-color-primary, #6750A4);
      border: 1px solid var(--md-sys-color-outline, #79747E);
    }
    .outlined .group-btn::before { background: var(--md-sys-color-primary, #6750A4); }
    /* Collapse adjacent borders */
    .outlined .group-btn + .group-btn { margin-left: -1px; }
    .outlined .group-btn:disabled { color: rgba(28,27,31,.38); border-color: rgba(28,27,31,.12); }

    /* ── Tonal ── */
    .tonal .group-btn {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .tonal .group-btn::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }
    .tonal .group-btn:hover   { box-shadow: var(--md-sys-elevation-1); }
    .tonal .group-btn + .group-btn {
      border-left: 1px solid var(--md-sys-color-on-secondary-container, #1D192B);
      opacity: 0.2;
    }
    .tonal .group-btn:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); }

    /* ── Text ── */
    .text .group-btn {
      background: transparent;
      color: var(--md-sys-color-primary, #6750A4);
      padding: 0 12px;
    }
    .text .group-btn::before { background: var(--md-sys-color-primary, #6750A4); }
    .text .group-btn + .group-btn {
      border-left: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
    }
    .text .group-btn:disabled { color: rgba(28,27,31,.38); }

    /* ── Elevated ── */
    .elevated .group-btn {
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      color: var(--md-sys-color-primary, #6750A4);
      box-shadow: var(--md-sys-elevation-1);
    }
    .elevated .group-btn::before { background: var(--md-sys-color-primary, #6750A4); }
    .elevated .group-btn:hover   { box-shadow: var(--md-sys-elevation-2); }
    .elevated .group-btn + .group-btn {
      border-left: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
    }
    .elevated .group-btn:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); box-shadow: none; }

    /* Icon within button */
    .btn-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 18;
    }
  `);

  return html`
    <div :class="${{ group: true, [props.variant]: true }}" role="group">
      ${each(props.items, (item, i) => html`
        <button
          class="group-btn"
          aria-label="${item.label}"
          ?disabled="${props.disabled || item.disabled}"
          @click="${(e: Event) => { e.stopPropagation(); emit('click', { id: item.id, index: i }); }}"
        >
          ${when(!!item.icon, () => html`<span class="btn-icon" aria-hidden="true">${item.icon}</span>`)}
          ${item.label}
        </button>
      `)}
    </div>
  `;
});
