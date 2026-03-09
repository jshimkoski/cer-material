import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-dialog', () => {
  const props = useProps({
    open: false,
    headline: '',
    icon: '',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: contents; }

    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  visibility 0s linear 200ms;
    }
    .scrim.open {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dialog {
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      border-radius: 28px;
      min-width: 280px;
      max-width: 560px;
      width: calc(100% - 48px);
      max-height: calc(100% - 48px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--md-sys-elevation-3);
      transform: scale(0.92);
      opacity: 0;
      pointer-events: none;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .scrim.open .dialog {
      transform: scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .dialog-header {
      padding: 24px 24px 0;
      text-align: center;
    }
    .dialog-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      display: block;
      color: var(--md-sys-color-secondary, #625B71);
      margin-bottom: 16px;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .dialog-headline {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 24px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      margin: 0 0 16px;
    }

    .dialog-content {
      padding: 0 24px 24px;
      overflow-y: auto;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      line-height: 20px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 0 24px 24px;
      flex-shrink: 0;
    }
  `);

  // Dialog is always in the DOM; .open class drives CSS enter/exit transitions.
  return html`
    <div
      :class="${{ scrim: true, open: props.open }}"
      @click="${(e: Event) => { if (e.target === e.currentTarget) emit('close'); }}"
    >
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-headline">
        <div class="dialog-header">
          ${when(!!props.icon, () => html`<span class="dialog-icon">${props.icon}</span>`)}
          ${when(!!props.headline, () => html`<h2 class="dialog-headline" id="dialog-headline">${props.headline}</h2>`)}
        </div>
        <div class="dialog-content">
          <slot></slot>
        </div>
        <div class="dialog-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  `;
});
