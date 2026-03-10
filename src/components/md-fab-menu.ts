import { component, html, css, ref, watch, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';

/**
 * md-fab-menu
 *
 * MD3 FAB menu — a FAB that expands to reveal a list of related actions.
 * Spec: https://m3.material.io/components/fab-menu
 *
 * Props:
 *   icon      — icon of the main FAB (shown when closed)
 *   closeIcon — icon shown when menu is open (default: close)
 *   variant   — 'primary' | 'secondary' | 'tertiary'
 *   open      — controlled open state
 *   items     — array of { id, icon, label }
 *   ariaLabel — accessible label for the trigger FAB
 *
 * Emits:
 *   open     — menu opened
 *   close    — menu closed
 *   select   — { id } — an action item was clicked
 */

interface FabMenuItem {
  id: string;
  icon: string;
  label: string;
  disabled?: boolean;
}

// Singleton: only one FAB menu may be open at a time across the whole page.
// When a new FAB opens it calls this to close the previously open one.
let _activeFabClose: (() => void) | null = null;

component('md-fab-menu', () => {
  const props = useProps({
    icon: 'add',
    closeIcon: 'close',
    variant: 'primary' as 'primary' | 'secondary' | 'tertiary',
    open: false,
    items: [] as FabMenuItem[],
    ariaLabel: 'Speed dial',
  });
  const emit = useEmit();

  const localOpen = ref(props.open);
  watch(() => props.open, v => { localOpen.value = v; });

  const closeMenu = () => {
    if (_activeFabClose === closeMenu) _activeFabClose = null;
    localOpen.value = false;
    emit('close');
  };

  const toggle = () => {
    if (localOpen.value) {
      closeMenu();
    } else {
      // Close any other open FAB menu before opening this one.
      if (_activeFabClose) _activeFabClose();
      localOpen.value = true;
      _activeFabClose = closeMenu;
      emit('open');
    }
  };

  const selectItem = (item: FabMenuItem) => {
    if (item.disabled) return;
    emit('select', { id: item.id });
    closeMenu();
  };

  useEscapeKey(() => localOpen.value, closeMenu)();

  useStyle(() => css`
    :host { display: inline-flex; }

    /* ── Outside-click scrim ── */
    .fab-scrim {
      position: fixed;
      inset: 0;
      z-index: 998;
      cursor: default;
    }

    /* ── Wrapper: anchor for absolutely positioned items ── */
    /* z-index 999 so the active FAB's trigger and items sit above its own scrim */
    .fab-wrap {
      position: relative;
      z-index: 999;
      display: inline-flex;
      width: 56px;
      height: 56px;
    }

    /* ── Items list: absolutely positioned above the trigger ── */
    .items-list {
      position: absolute;
      bottom: calc(100% + 16px);
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    /* ── Each menu item (M3 list item — 56dp, icon + label) ── */
    .menu-item {
      height: 56px;
      border-radius: 16px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      box-shadow: var(--md-sys-elevation-3);
      position: relative;
      overflow: hidden;
      outline: none;
      white-space: nowrap;
      transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    .menu-item::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .menu-item:hover::before  { opacity: 0.08; }
    .menu-item:focus::before  { opacity: 0.12; }
    .menu-item:active::before { opacity: 0.12; }
    .menu-item:hover { box-shadow: var(--md-sys-elevation-4); }
    .menu-item:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, #6750A4);
      outline-offset: 2px;
    }
    .menu-item:disabled {
      opacity: 0.38;
      cursor: not-allowed;
      pointer-events: none;
    }

    .menu-item-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      line-height: 1;
    }

    .menu-item-label {
      font-size: 14px;
      font-weight: 500;
    }

    /* ── Trigger button (56dp close button) ── */
    .fab-trigger {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      outline: none;
      transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;
      user-select: none;
    }
    .fab-trigger::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .fab-trigger:hover::before  { opacity: 0.08; }
    .fab-trigger:focus::before  { opacity: 0.12; }
    .fab-trigger:active::before { opacity: 0.12; }
    .fab-trigger:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, #6750A4);
      outline-offset: 2px;
    }

    .fab-trigger-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Color variants: close button uses container colors, items use full colors ── */
    /* Primary */
    .primary .fab-trigger {
      background: var(--md-sys-color-primary-container, #EADDFF);
      color: var(--md-sys-color-on-primary-container, #21005D);
      box-shadow: var(--md-sys-elevation-3);
    }
    .primary .fab-trigger::before { background: var(--md-sys-color-on-primary-container, #21005D); }
    .primary .menu-item {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }
    .primary .menu-item::before { background: var(--md-sys-color-on-primary, #FFFFFF); }

    /* Secondary */
    .secondary .fab-trigger {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
      box-shadow: var(--md-sys-elevation-3);
    }
    .secondary .fab-trigger::before { background: var(--md-sys-color-on-secondary-container, #1D192B); }
    .secondary .menu-item {
      background: var(--md-sys-color-secondary, #625B71);
      color: var(--md-sys-color-on-secondary, #FFFFFF);
    }
    .secondary .menu-item::before { background: var(--md-sys-color-on-secondary, #FFFFFF); }

    /* Tertiary */
    .tertiary .fab-trigger {
      background: var(--md-sys-color-tertiary-container, #FFD8E4);
      color: var(--md-sys-color-on-tertiary-container, #31111D);
      box-shadow: var(--md-sys-elevation-3);
    }
    .tertiary .fab-trigger::before { background: var(--md-sys-color-on-tertiary-container, #31111D); }
    .tertiary .menu-item {
      background: var(--md-sys-color-tertiary, #7D5260);
      color: var(--md-sys-color-on-tertiary, #FFFFFF);
    }
    .tertiary .menu-item::before { background: var(--md-sys-color-on-tertiary, #FFFFFF); }

    /* ── Transition classes (slide up from trigger direction) ── */
    .items-enter-from { opacity: 0; transform: translateY(16px); }
    .items-enter-active { transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1); }
    .items-leave-to { opacity: 0; transform: translateY(16px); }
    .items-leave-active { transition: opacity 100ms cubic-bezier(0.4, 0, 0.2, 1), transform 100ms cubic-bezier(0.4, 0, 0.2, 1); }
  `);

  return html`
    ${when(localOpen.value, () => html`
      <div class="fab-scrim" @click="${() => closeMenu()}"></div>
    `)}
    <div :class="${{ 'fab-wrap': true, [props.variant]: true }}">
      ${Transition({ show: localOpen.value,
        enterFrom: 'items-enter-from', enterActive: 'items-enter-active',
        leaveActive: 'items-leave-active', leaveTo: 'items-leave-to',
      }, html`
        <div class="items-list" role="menu">
          ${each(props.items, (item) => html`
            <button
              class="menu-item"
              role="menuitem"
              aria-label="${item.label}"
              ?disabled="${item.disabled}"
              @click="${(e: Event) => { e.stopPropagation(); selectItem(item); }}"
            >
              <span class="menu-item-icon" aria-hidden="true">${item.icon}</span>
              <span class="menu-item-label">${item.label}</span>
            </button>
          `)}
        </div>
      `)}
      <button
        :class="${{ 'fab-trigger': true, open: localOpen.value }}"
        aria-label="${props.ariaLabel}"
        aria-expanded="${localOpen.value}"
        aria-haspopup="true"
        @click="${() => toggle()}"
      >
        <span class="fab-trigger-icon" aria-hidden="true">
          ${localOpen.value ? props.closeIcon : props.icon}
        </span>
      </button>
    </div>
  `;
});
