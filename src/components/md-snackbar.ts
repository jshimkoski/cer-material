import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-snackbar', () => {
  const props = useProps({
    open: false,
    message: '',
    actionLabel: '',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: contents; }

    .bar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      min-width: 288px;
      max-width: 568px;
      background: var(--md-sys-color-inverse-surface, #313033);
      color: var(--md-sys-color-inverse-on-surface, #F4EFF4);
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      min-height: 48px;
      box-shadow: var(--md-sys-elevation-3);
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      z-index: 1100;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      transition:
        transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity   300ms cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0s linear 300ms;
    }
    .bar.open {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transition:
        transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity   300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .message {
      flex: 1;
      padding: 12px 0;
      line-height: 20px;
    }

    .action {
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: var(--md-sys-color-inverse-primary, #D0BCFF);
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      padding: 8px 12px;
      flex-shrink: 0;
      outline: none;
      position: relative;
      overflow: hidden;
    }
    .action::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--md-sys-color-inverse-primary, #D0BCFF);
      opacity: 0;
      transition: opacity 200ms;
    }
    .action:hover::before  { opacity: 0.08; }
    .action:focus::before  { opacity: 0.12; }
    .action:active::before { opacity: 0.12; }

    .close-btn {
      background: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      color: var(--md-sys-color-inverse-on-surface, #F4EFF4);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      outline: none;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .close-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--md-sys-color-inverse-on-surface, #F4EFF4);
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
      :class="${{ bar: true, open: props.open }}"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="message">${props.message}</span>
      ${when(!!props.actionLabel, () => html`
        <button class="action" @click="${() => emit('action')}">
          ${props.actionLabel}
        </button>
      `)}
      <button class="close-btn" aria-label="Dismiss" @click="${() => emit('close')}">
        <span class="close-icon" aria-hidden="true">close</span>
      </button>
    </div>
  `;
});
