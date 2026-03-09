import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';

component('md-card', () => {
  const props = useProps({
    variant: 'elevated' as 'elevated' | 'filled' | 'outlined',
    clickable: false,
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
      <slot></slot>
    </div>
  `;
});
