import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-card', () => {
  const props = useProps({
    variant: 'elevated' as 'elevated' | 'filled' | 'outlined',
    clickable: false,
    headline: '',
    supportingText: '',
    icon: '',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: block; }

    .card {
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card.clickable { cursor: pointer; }

    .card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
    .card.clickable:hover::before  { opacity: 0.08; }
    .card.clickable:focus::before  { opacity: 0.12; }
    .card.clickable:active::before { opacity: 0.12; }

    /* ── Elevated ── */
    .elevated {
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      box-shadow: var(--md-sys-elevation-1);
    }
    .elevated::before { background: var(--md-sys-color-on-surface, #1C1B1F); }
    .elevated.clickable:hover { box-shadow: var(--md-sys-elevation-2); }

    /* ── Filled ── */
    .filled {
      background: var(--md-sys-color-surface-container-highest, #E6E0E9);
    }
    .filled::before { background: var(--md-sys-color-on-surface, #1C1B1F); }
    .filled.clickable:hover { box-shadow: var(--md-sys-elevation-1); }

    /* ── Outlined ── */
    .outlined {
      background: var(--md-sys-color-surface, #FFFBFE);
      border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
    }
    .outlined::before { background: var(--md-sys-color-on-surface, #1C1B1F); }
    .outlined.clickable:hover { box-shadow: var(--md-sys-elevation-1); }

    /* ── Card header (headline / icon) ── */
    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 16px 0;
    }
    .card-header-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      line-height: 24px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      flex-shrink: 0;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }
    .card-header-text { flex: 1; min-width: 0; }
    .card-headline {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      margin: 0;
    }
    .card-supporting-text {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      margin: 4px 0 0;
    }
  `);

  return html`
    <div
      :class="${{
        card: true,
        [props.variant]: true,
        clickable: props.clickable,
      }}"
      tabindex="${props.clickable ? '0' : undefined}"
      :bind="${{ role: props.clickable ? 'button' : null }}"
      @click="${() => props.clickable && emit('click')}"
      @keydown="${(e: KeyboardEvent) => {
        if (props.clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          emit('click');
        }
      }}"
    >
      ${when(!!(props.headline || props.icon), () => html`
        <div class="card-header">
          ${when(!!props.icon, () => html`<span class="card-header-icon" aria-hidden="true">${props.icon}</span>`)}
          <div class="card-header-text">
            ${when(!!props.headline, () => html`<p class="card-headline">${props.headline}</p>`)}
            ${when(!!props.supportingText, () => html`<p class="card-supporting-text">${props.supportingText}</p>`)}
          </div>
        </div>
      `)}
      <slot></slot>
    </div>
  `;
});
