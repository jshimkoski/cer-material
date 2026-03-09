import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-app-bar', () => {
  const props = useProps({
    variant: 'small' as 'small' | 'medium' | 'large' | 'center',
    title: '',
    leadingIcon: 'menu',
    trailingIcons: [] as string[],
    scrolled: false,
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: block; }

    .app-bar {
      background: var(--md-sys-color-surface, #FFFBFE);
      display: flex;
      align-items: center;
      width: 100%;
      transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 280ms;
    }
    .app-bar.scrolled {
      background: var(--md-sys-color-surface-container, #F3EDF7);
      box-shadow: var(--md-sys-elevation-2);
    }

    /* ── Small / Center ── */
    .small, .center {
      height: 64px;
      padding: 0 4px;
      flex-direction: row;
      gap: 4px;
    }

    /* ── Medium ── */
    .medium {
      min-height: 112px;
      padding: 8px 4px 20px;
      flex-direction: column;
      align-items: flex-start;
    }
    .medium .top-row {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0;
      height: 64px;
    }
    .medium .title {
      padding: 0 16px;
      font-size: 28px;
    }

    /* ── Large ── */
    .large {
      min-height: 152px;
      padding: 8px 4px 28px;
      flex-direction: column;
      align-items: flex-start;
    }
    .large .top-row {
      display: flex;
      align-items: center;
      width: 100%;
      height: 64px;
    }
    .large .title {
      padding: 0 16px;
      font-size: 36px;
    }

    .icon-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      outline: none;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    .icon-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .icon-btn:hover::before  { opacity: 0.08; }
    .icon-btn:focus::before  { opacity: 0.12; }
    .icon-btn:active::before { opacity: 0.12; }

    .nav-icon,
    .action-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .title-area {
      flex: 1;
      overflow: hidden;
    }

    .title {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 22px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 4px;
    }

    .center .title-area { text-align: center; }

    .trailing-actions {
      display: flex;
      align-items: center;
      gap: 0;
      flex-shrink: 0;
    }

    .top-row { display: flex; align-items: center; width: 100%; }
  `);

  const isColumn = props.variant === 'medium' || props.variant === 'large';
  const safeTrailingIcons = Array.isArray(props.trailingIcons) ? props.trailingIcons : [];

  return html`
    <header :class="${{
      'app-bar': true,
      [props.variant]: true,
      scrolled: props.scrolled,
    }}">
      <div class="top-row">
        ${when(!!props.leadingIcon, () => html`
          <button class="icon-btn" aria-label="Navigation" @click="${() => emit('nav')}">
            <span class="nav-icon">${props.leadingIcon}</span>
          </button>
        `)}

        ${when(!isColumn, () => html`
          <div class="title-area">
            <span class="title">${props.title}<slot name="title"></slot></span>
          </div>
        `)}

        <div class="trailing-actions">
          <slot name="trailing"></slot>
          ${safeTrailingIcons.map((icon: string) => html`
            <button class="icon-btn" @click="${() => emit('action', icon)}">
              <span class="action-icon">${icon}</span>
            </button>
          `)}
        </div>
      </div>

      ${when(isColumn, () => html`
        <div class="title-area">
          <span class="title">${props.title}<slot name="title"></slot></span>
        </div>
      `)}
    </header>
  `;
});
