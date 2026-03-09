import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-side-sheet', () => {
  const props = useProps({
    open: false,
    headline: '',
    variant: 'modal' as 'modal' | 'standard',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: contents; }

    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
      z-index: 700;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transition: opacity 250ms ease-out, visibility 0s linear 250ms;
    }
    .scrim.open {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transition: opacity 250ms ease-out;
    }

    .side-sheet {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 400px;
      max-width: 85vw;
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      z-index: 701;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateX(100%);
      pointer-events: none;
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .side-sheet.open {
      transform: translateX(0);
      pointer-events: auto;
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .standard-side-sheet {
      display: none;
      flex-direction: column;
      overflow: hidden;
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      height: 100%;
    }
    .standard-side-sheet.open {
      display: flex;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      padding: 24px 24px 0;
      gap: 8px;
      flex-shrink: 0;
    }
    .sheet-headline {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 24px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      margin: 0;
      flex: 1;
    }

    .close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
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
    .close-btn:hover::before { opacity: 0.08; }
    .close-btn:focus::before { opacity: 0.12; }

    .close-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      position: relative;
      z-index: 1;
    }

    .sheet-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px 24px;
    }
  `);

  // Sheet is always in the DOM; .open class drives CSS enter/exit transitions.
  return html`
    ${when(props.variant === 'modal', () => html`
      <div
        :class="${{ scrim: true, open: props.open }}"
        @click="${() => emit('close')}"
      ></div>
    `)}
    <div
      :class="${{
        'side-sheet': props.variant === 'modal',
        'standard-side-sheet': props.variant === 'standard',
        open: props.open,
      }}"
      role="complementary"
      aria-label="${props.headline || 'Side sheet'}"
    >
      ${when(!!props.headline, () => html`
        <div class="sheet-header">
          <h2 class="sheet-headline">${props.headline}</h2>
          <button class="close-btn" aria-label="Close side sheet" @click="${() => emit('close')}">
            <span class="close-icon">close</span>
          </button>
        </div>
      `)}
      <div class="sheet-content">
        <slot></slot>
      </div>
    </div>
  `;
});
