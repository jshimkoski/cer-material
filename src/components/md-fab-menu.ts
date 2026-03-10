import { component, html, css, ref, watch, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';

/**
 * md-fab-menu  (Speed Dial)
 *
 * MD3 FAB menu — a FAB that expands to reveal a list of related actions.
 * Spec: https://m3.material.io/components/fab-menu
 *
 * Props:
 *   icon      — icon of the main FAB (shown when closed)
 *   closeIcon — icon shown when menu is open (default: close)
 *   variant   — 'primary' | 'secondary' | 'tertiary' | 'surface'
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

component('md-fab-menu', () => {
  const props = useProps({
    icon: 'add',
    closeIcon: 'close',
    variant: 'primary' as 'primary' | 'secondary' | 'tertiary' | 'surface',
    open: false,
    items: [] as FabMenuItem[],
    ariaLabel: 'Speed dial',
  });
  const emit = useEmit();

  const localOpen = ref(props.open);
  watch(() => props.open, v => { localOpen.value = v; });

  const toggle = () => {
    localOpen.value = !localOpen.value;
    emit(localOpen.value ? 'open' : 'close');
  };

  const selectItem = (item: FabMenuItem) => {
    if (item.disabled) return;
    emit('select', { id: item.id });
    localOpen.value = false;
    emit('close');
  };

  useEscapeKey(() => localOpen.value, () => { localOpen.value = false; emit('close'); })();

  useStyle(() => css`
    :host { display: inline-flex; }

    /* ── Outside-click scrim ── */
    .fab-scrim {
      position: fixed;
      inset: 0;
      z-index: 1;
      cursor: default;
    }

    /* ── Wrapper: relative anchor for the items panel ── */
    .fab-wrap {
      position: relative;
      z-index: 2;
      display: inline-flex;
    }

    /* ── Action items list: absolutely positioned above the trigger ── */
    .items-list {
      position: absolute;
      bottom: calc(100% + 12px);
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }
    .fab-trigger {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;
      position: relative;
      overflow: hidden;
      outline: none;
      transition: box-shadow 280ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1);
      z-index: 1;
      user-select: none;
    }
    .fab-trigger::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4,0,0.2,1);
    }
    .fab-trigger:hover::before  { opacity: 0.08; }
    .fab-trigger:focus::before  { opacity: 0.12; }
    .fab-trigger:active::before { opacity: 0.12; }
    .fab-trigger:focus-visible  { outline: 2px solid var(--md-sys-color-primary,#6750A4); outline-offset: 2px; }

    /* Rotate trigger icon smoothly when open */
    .fab-trigger.open .fab-trigger-icon { transform: rotate(45deg); }

    .fab-trigger-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;
      transition: transform 200ms cubic-bezier(0.4,0,0.2,1);
    }

    /* ── Color variants ── */
    .primary .fab-trigger {
      background: var(--md-sys-color-primary-container,#EADDFF);
      color: var(--md-sys-color-on-primary-container,#21005D);
      box-shadow: var(--md-sys-elevation-3);
    }
    .primary .fab-trigger::before { background: var(--md-sys-color-on-primary-container,#21005D); }

    .secondary .fab-trigger {
      background: var(--md-sys-color-secondary-container,#E8DEF8);
      color: var(--md-sys-color-on-secondary-container,#1D192B);
      box-shadow: var(--md-sys-elevation-3);
    }
    .secondary .fab-trigger::before { background: var(--md-sys-color-on-secondary-container,#1D192B); }

    .tertiary .fab-trigger {
      background: var(--md-sys-color-tertiary-container,#FFD8E4);
      color: var(--md-sys-color-on-tertiary-container,#31111D);
      box-shadow: var(--md-sys-elevation-3);
    }
    .tertiary .fab-trigger::before { background: var(--md-sys-color-on-tertiary-container,#31111D); }

    .surface .fab-trigger {
      background: var(--md-sys-color-surface-container-high,#ECE6F0);
      color: var(--md-sys-color-primary,#6750A4);
      box-shadow: var(--md-sys-elevation-3);
    }
    .surface .fab-trigger::before { background: var(--md-sys-color-primary,#6750A4); }

    /* items enter/leave transitions (slide up from trigger direction) */
    .items-enter-from { opacity: 0; transform: translateY(16px); }
    .items-enter-active { transition: opacity 150ms cubic-bezier(0.4,0,0.2,1), transform 150ms cubic-bezier(0.4,0,0.2,1); }
    .items-leave-to { opacity: 0; transform: translateY(16px); }
    .items-leave-active { transition: opacity 100ms cubic-bezier(0.4,0,0.2,1), transform 100ms cubic-bezier(0.4,0,0.2,1); }

    /* ── Each action item row ── */
    .item-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
    }
    .item-label {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface,#1C1B1F);
      background: var(--md-sys-color-surface-container-high,#ECE6F0);
      padding: 4px 12px;
      border-radius: 4px;
      box-shadow: var(--md-sys-elevation-1);
      white-space: nowrap;
      user-select: none;
    }

    /* ── Mini FAB (action item button) ── */
    .mini-fab {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--md-sys-color-surface-container-high,#ECE6F0);
      color: var(--md-sys-color-primary,#6750A4);
      box-shadow: var(--md-sys-elevation-3);
      position: relative;
      overflow: hidden;
      outline: none;
      transition: box-shadow 280ms cubic-bezier(0.4,0,0.2,1);
    }
    .mini-fab::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--md-sys-color-primary,#6750A4);
      opacity: 0;
      transition: opacity 200ms;
    }
    .mini-fab:hover::before  { opacity: 0.08; }
    .mini-fab:focus::before  { opacity: 0.12; }
    .mini-fab:active::before { opacity: 0.12; }
    .mini-fab:hover { box-shadow: var(--md-sys-elevation-4, 0 6px 10px 4px rgba(0,0,0,.15)); }
    .mini-fab:focus-visible { outline: 2px solid var(--md-sys-color-primary,#6750A4); outline-offset: 2px; }
    .mini-fab:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); cursor: not-allowed; pointer-events: none; }
    .mini-fab-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 18;
    }
  `);

  return html`
    ${when(localOpen.value, () => html`
      <div class="fab-scrim" @click="${() => { localOpen.value = false; emit('close'); }}"></div>
    `)}
    <div :class="${{ 'fab-wrap': true, [props.variant]: true }}">
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
      ${Transition({ show: localOpen.value,
        enterFrom: 'items-enter-from', enterActive: 'items-enter-active',
        leaveActive: 'items-leave-active', leaveTo: 'items-leave-to',
      }, html`
        <div class="items-list" role="menu">
          ${each(props.items, (item) => html`
            <div class="item-row">
              <span class="item-label">${item.label}</span>
              <button
                class="mini-fab"
                role="menuitem"
                aria-label="${item.label}"
                ?disabled="${item.disabled}"
                @click="${(e: Event) => { e.stopPropagation(); selectItem(item); }}"
              >
                <span class="mini-fab-icon" aria-hidden="true">${item.icon}</span>
              </button>
            </div>
          `)}
        </div>
      `)}
    </div>
  `;
});
