import { component, html, css, defineModel, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { useListKeyNav } from '../composables/useListKeyNav';
import { createFocusReturn } from '../composables/useFocusReturn';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
}

component('md-menu', () => {
  const props = useProps({
    items: [] as MenuItem[],
    anchor: 'bottom-start' as 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end',
  });
  const emit = useEmit();
  const open = defineModel('open', false);

  useStyle(() => css`
    :host { display: inline-block; position: relative; }

    .menu-wrapper { position: relative; display: inline-flex; }

    .menu {
      position: absolute;
      background: var(--md-sys-color-surface-container, #F3EDF7);
      border-radius: 12px;
      min-width: 112px;
      max-width: 280px;
      box-shadow: var(--md-sys-elevation-2);
      z-index: 500;
      overflow: hidden;
      transform-origin: top left;
      animation: menu-in 120ms cubic-bezier(0, 0, 0.2, 1);
      padding: 8px 0;
    }
    @keyframes menu-in {
      from { opacity: 0; transform: scale(0.8); }
      to   { opacity: 1; transform: scale(1); }
    }

    .menu.bottom-start { top: 100%; left: 0; }
    .menu.bottom-end   { top: 100%; right: 0; }
    .menu.top-start    { bottom: 100%; left: 0; }
    .menu.top-end      { bottom: 100%; right: 0; }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 48px;
      padding: 0 12px;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      outline: none;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
    }
    .menu-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .menu-item:hover::before  { opacity: 0.08; }
    .menu-item:focus::before  { opacity: 0.12; }
    .menu-item:active::before { opacity: 0.12; }
    .menu-item:disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }

    .item-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      flex-shrink: 0;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .menu-divider {
      height: 1px;
      background: var(--md-sys-color-outline-variant, #CAC4D0);
      margin: 8px 0;
    }

    .scrim {
      position: fixed;
      inset: 0;
      z-index: 499;
    }
  `);

  const handleMenuKeyDown = useListKeyNav({
    orientation: 'vertical',
    itemSelector: '[role="menuitem"]:not([disabled])',
  });

  // Auto-focus the first menu item and restore focus on close via Transition callbacks.
  const focusReturn = createFocusReturn();

  // Escape key: document-level listener so it fires regardless of focus.
  useEscapeKey(() => open.value, () => { emit('close'); open.value = false; })();

  return html`
    <div class="menu-wrapper">
      <slot name="trigger"></slot>

      ${when(open.value, () => html`
        <div class="scrim" @click="${() => { emit('close'); open.value = false; }}"></div>`)}  
      ${Transition({
        show: open.value,
        css: false,
        onEnter: (_el: HTMLElement, done: () => void) => done(),
        onLeave: (_el: HTMLElement, done: () => void) => done(),
        onAfterEnter(el: HTMLElement) {
          focusReturn.onAfterEnter(el);
          el.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
        },
        onAfterLeave: focusReturn.onAfterLeave,
      }, html`
        <div :class="${{ menu: true, [props.anchor]: !!props.anchor }}" role="menu" tabindex="-1" @keydown="${handleMenuKeyDown}">
          ${each(
            Array.isArray(props.items) ? props.items : [],
            (item: MenuItem) => item.divider
              ? html`<div key="${item.id}" class="menu-divider"></div>`
              : html`
                <button
                  key="${item.id}"
                  class="menu-item"
                  role="menuitem"
                  :disabled="${item.disabled || false}"
                  @click="${() => { emit('select', item.id); emit('close'); open.value = false; }}"
                >
                  ${when(!!item.icon, () => html`<span class="item-icon" aria-hidden="true">${item.icon}</span>`)}
                  ${item.label}
                </button>
              `,
          )}
        </div>
      `)}
    </div>
  `;
});
