import { component, html, css, defineModel, useProps, useEmit, useStyle, useOnDisconnected } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { createFocusTrap } from '../composables/useFocusTrap';
import { useScrollLock } from '../composables/useScrollLock';

interface DrawerItem {
  id?: string;
  label?: string;
  icon?: string;
  section?: string;
  divider?: boolean;
  disabled?: boolean;
}

component('md-navigation-drawer', () => {
  const props = useProps({
    headline: '',
    variant: 'standard' as 'standard' | 'modal',
    items: [] as DrawerItem[],
  });
  const emit = useEmit();
  const open = defineModel('open', false);
  const active = defineModel('active', '');

  useEscapeKey(() => open.value && props.variant === 'modal', () => { emit('close'); open.value = false; })();
  const trap = createFocusTrap();
  useOnDisconnected(() => trap.cleanup());
  const scrollLock = useScrollLock();

  useStyle(() => css`
    :host { display: contents; }

    /* ── Scrim ─────────────────────────────────────────────────────────── */
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
      z-index: 400;
      /* Base = fully visible; opacity: 1 and pointer-events: auto are defaults */
    }
    .scrim-enter-from, .scrim-leave-to {
      opacity: 0;
      pointer-events: none;
    }
    .scrim-enter-active, .scrim-leave-active {
      transition: opacity 250ms ease-out;
    }

    /* ── Modal drawer (position: fixed overlay) ─────────────────────────── */
    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 360px;
      max-width: 85vw;
      background: var(--md-sys-color-surface, #FFFBFE);
      z-index: 401;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      /* Base = fully open; transform: none and pointer-events: auto are defaults */
    }
    .drawer-enter-from, .drawer-leave-to {
      transform: translateX(-100%);
      pointer-events: none;
    }
    .drawer-enter-active, .drawer-leave-active {
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Standard drawer: in-layout, body shrinks to accommodate ───── */
    .standard-drawer {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      width: 360px;
      height: 100%;
      background: var(--md-sys-color-surface, #FFFBFE);
      flex-shrink: 0;
    }
    .standard-enter-from, .standard-leave-to {
      width: 0;
    }
    .standard-enter-active, .standard-leave-active {
      transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Inner content ──────────────────────────────────────────────────── */
    .drawer-header {
      padding: 12px 28px;
      min-height: 56px;
      display: flex;
      align-items: center;
    }
    .drawer-headline {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px;
    }

    .drawer-item {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 56px;
      padding: 0 16px;
      border-radius: 28px;
      cursor: pointer;
      border: none;
      background: transparent;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      width: 100%;
      text-align: left;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }
    .drawer-item::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .drawer-item:hover::before { opacity: 0.08; }
    .drawer-item:focus::before { opacity: 0.12; }
    .drawer-item:active::before { opacity: 0.12; }
    .drawer-item:disabled { opacity: 0.38; pointer-events: none; }

    .drawer-item.active {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .drawer-item.active::before {
      background: var(--md-sys-color-on-secondary-container, #1D192B);
    }

    .drawer-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }
    .drawer-item.active .drawer-icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .drawer-label {
      position: relative;
      z-index: 1;
    }

    .section-label {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      padding: 18px 16px 8px;
      letter-spacing: 0.1px;
    }

    .divider {
      height: 1px;
      background: var(--md-sys-color-outline-variant, #CAC4D0);
      margin: 8px 12px;
    }
  `);

  return html`
    ${Transition({
      show: open.value && props.variant === 'modal',
      name: 'md-scrim',
      enterFrom: 'scrim-enter-from',
      enterActive: 'scrim-enter-active',
      leaveActive: 'scrim-leave-active',
      leaveTo: 'scrim-leave-to',
    }, html`
      <div class="scrim" @click="${() => { emit('close'); open.value = false; }}"></div>
    `)}

    ${props.variant === 'modal'
      ? Transition({
          show: open.value,
          name: 'md-modal-drawer',
          enterFrom: 'drawer-enter-from',
          enterActive: 'drawer-enter-active',
          leaveActive: 'drawer-leave-active',
          leaveTo: 'drawer-leave-to',
          onBeforeEnter: scrollLock.lock,
          onAfterEnter: trap.onAfterEnter,
          onAfterLeave: () => { trap.onAfterLeave(); scrollLock.unlock(); },
        }, html`
          <div
            class="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="${props.headline || 'Navigation drawer'}"
          >
            ${when(!!props.headline, () => html`
              <div class="drawer-header">
                <span class="drawer-headline">${props.headline}</span>
              </div>
            `)}
            <div class="drawer-content">
              ${each(
                Array.isArray(props.items) ? props.items : [],
                (item: DrawerItem) =>
                  item.divider
                    ? html`<div class="divider"></div>`
                    : item.section
                    ? html`<div class="section-label">${item.section}</div>`
                    : html`
                      <button
                        key="${item.id}"
                        :class="${{ 'drawer-item': true, active: active.value === item.id }}"
                        :disabled="${item.disabled || false}"
                        :bind="${{ 'aria-current': active.value === item.id ? 'page' : null }}"
                        @click="${() => { if (item.id) { emit('change', item.id); active.value = item.id; emit('close'); open.value = false; } }}"
                      >
                        ${when(!!item.icon, () => html`<span class="drawer-icon" aria-hidden="true">${item.icon}</span>`)}
                        <span class="drawer-label">${item.label}</span>
                      </button>
                    `,
              )}
              <slot></slot>
            </div>
          </div>
        `)
      : Transition({
          show: open.value,
          name: 'md-standard-drawer',
          enterFrom: 'standard-enter-from',
          enterActive: 'standard-enter-active',
          leaveActive: 'standard-leave-active',
          leaveTo: 'standard-leave-to',
        }, html`
          <div
            class="standard-drawer"
            role="navigation"
            aria-label="${props.headline || 'Navigation drawer'}"
          >
            ${when(!!props.headline, () => html`
              <div class="drawer-header">
                <span class="drawer-headline">${props.headline}</span>
              </div>
            `)}
            <div class="drawer-content">
              ${each(
                Array.isArray(props.items) ? props.items : [],
                (item: DrawerItem) =>
                  item.divider
                    ? html`<div class="divider"></div>`
                    : item.section
                    ? html`<div class="section-label">${item.section}</div>`
                    : html`
                      <button
                        key="${item.id}"
                        :class="${{ 'drawer-item': true, active: active.value === item.id }}"
                        :disabled="${item.disabled || false}"
                        :bind="${{ 'aria-current': active.value === item.id ? 'page' : null }}"
                        @click="${() => { if (item.id) { emit('change', item.id); active.value = item.id; } }}"
                      >
                        ${when(!!item.icon, () => html`<span class="drawer-icon" aria-hidden="true">${item.icon}</span>`)}
                        <span class="drawer-label">${item.label}</span>
                      </button>
                    `,
              )}
              <slot></slot>
            </div>
          </div>
        `)
    }
  `;
});

