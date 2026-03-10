import { component, html, css, ref, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { useListKeyNav } from '../composables/useListKeyNav';

/**
 * md-split-button
 *
 * MD3 Split button — a primary action button connected to a dropdown arrow
 * that reveals a menu of secondary actions.
 * Spec: https://m3.material.io/components/split-button
 *
 * Props:
 *   label    — primary button text
 *   icon     — optional leading icon for the primary button
 *   variant  — 'filled' | 'outlined' | 'tonal'
 *   disabled — disables both parts
 *   items    — secondary action items: { id, label, icon?, disabled? }
 *
 * Emits:
 *   click    — primary button clicked
 *   select   — { id } — a dropdown item was selected
 */

interface SplitItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

component('md-split-button', () => {
  const props = useProps({
    label: 'Action',
    icon: '',
    variant: 'filled' as 'filled' | 'outlined' | 'tonal',
    disabled: false,
    items: [] as SplitItem[],
  });
  const emit = useEmit();
  const menuOpen = ref(false);
  const previousFocus = ref<HTMLElement | null>(null);

  useEscapeKey(() => menuOpen.value, () => { menuOpen.value = false; })();

  const handleMenuKeyDown = useListKeyNav({
    orientation: 'vertical',
    itemSelector: '[role="menuitem"]:not([disabled])',
  });

  useStyle(() => css`
    :host { display: inline-flex; vertical-align: middle; position: relative; }

    .split {
      display: inline-flex;
      align-items: stretch;
    }

    /* ── Primary button ── */
    .primary-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px 0 20px;
      border: none;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      line-height: 20px;
      outline: none;
      position: relative;
      overflow: hidden;
      user-select: none;
      white-space: nowrap;
      border-radius: 20px 0 0 20px;
      transition: box-shadow 280ms cubic-bezier(0.4,0,0.2,1);
    }

    /* ── Divider between primary and arrow ── */
    .btn-divider {
      width: 1px;
      align-self: stretch;
    }

    /* ── Arrow button ── */
    .arrow-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      cursor: pointer;
      outline: none;
      position: relative;
      overflow: hidden;
      border-radius: 0 20px 20px 0;
      transition: box-shadow 280ms cubic-bezier(0.4,0,0.2,1);
    }

    /* State layer shared */
    .primary-btn::before,
    .arrow-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4,0,0.2,1);
      pointer-events: none;
    }
    .primary-btn:hover::before,
    .arrow-btn:hover::before   { opacity: 0.08; }
    .primary-btn:focus::before,
    .arrow-btn:focus::before   { opacity: 0.12; }
    .primary-btn:active::before,
    .arrow-btn:active::before  { opacity: 0.12; }
    .primary-btn:focus-visible,
    .arrow-btn:focus-visible   { outline: 2px solid var(--md-sys-color-primary,#6750A4); outline-offset: 2px; z-index: 1; }

    .primary-btn:disabled,
    .arrow-btn:disabled { cursor: not-allowed; pointer-events: none; }

    /* ── Filled variant ── */
    .filled .primary-btn,
    .filled .arrow-btn {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }
    .filled .primary-btn::before,
    .filled .arrow-btn::before { background: var(--md-sys-color-on-primary,#FFFFFF); }
    .filled .primary-btn:hover,
    .filled .arrow-btn:hover   { box-shadow: var(--md-sys-elevation-1); }
    .filled .btn-divider       { background: rgba(255,255,255,0.38); }
    .filled .primary-btn:disabled,
    .filled .arrow-btn:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); }

    /* ── Outlined variant ── */
    .outlined .primary-btn {
      background: transparent;
      color: var(--md-sys-color-primary,#6750A4);
      border: 1px solid var(--md-sys-color-outline,#79747E);
      border-right: none;
    }
    .outlined .arrow-btn {
      background: transparent;
      color: var(--md-sys-color-primary,#6750A4);
      border: 1px solid var(--md-sys-color-outline,#79747E);
      border-left: none;
    }
    .outlined .primary-btn::before,
    .outlined .arrow-btn::before { background: var(--md-sys-color-primary,#6750A4); }
    .outlined .btn-divider       { background: var(--md-sys-color-outline,#79747E); }
    .outlined .primary-btn:disabled,
    .outlined .arrow-btn:disabled { color: rgba(28,27,31,.38); border-color: rgba(28,27,31,.12); }

    /* ── Tonal variant ── */
    .tonal .primary-btn,
    .tonal .arrow-btn {
      background: var(--md-sys-color-secondary-container,#E8DEF8);
      color: var(--md-sys-color-on-secondary-container,#1D192B);
    }
    .tonal .primary-btn::before,
    .tonal .arrow-btn::before { background: var(--md-sys-color-on-secondary-container,#1D192B); }
    .tonal .primary-btn:hover,
    .tonal .arrow-btn:hover   { box-shadow: var(--md-sys-elevation-1); }
    .tonal .btn-divider       { background: rgba(29,25,43,0.3); }
    .tonal .primary-btn:disabled,
    .tonal .arrow-btn:disabled { background: rgba(28,27,31,.12); color: rgba(28,27,31,.38); }

    /* ── Icon ── */
    .btn-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 18;
    }
    .arrow-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 20px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20;
      transition: transform 200ms cubic-bezier(0.4,0,0.2,1);
    }
    .arrow-icon.open { transform: rotate(180deg); }

    /* ── Dropdown menu ── */
    .menu-wrapper {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: 200;
      min-width: 160px;
    }
    .menu {
      background: var(--md-sys-color-surface-container, #F3EDF7);
      border-radius: 4px;
      box-shadow: var(--md-sys-elevation-2, 0 2px 6px 2px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.3));
      overflow: hidden;
      padding: 8px 0;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      height: 48px;
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface,#1C1B1F);
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      outline: none;
      position: relative;
      overflow: hidden;
    }
    .menu-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface,#1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .menu-item:hover::before  { opacity: 0.08; }
    .menu-item:focus::before  { opacity: 0.12; }
    .menu-item:active::before { opacity: 0.12; }
    .menu-item:focus-visible  { outline: 2px solid var(--md-sys-color-primary,#6750A4); outline-offset: -2px; }
    .menu-item:disabled { color: rgba(28,27,31,.38); cursor: not-allowed; pointer-events: none; }
    .menu-item .btn-icon { color: var(--md-sys-color-on-surface-variant,#49454F); }

    /* ── Dropdown scrim ── */
    .drop-scrim {
      position: fixed;
      inset: 0;
      z-index: 199;
      cursor: default;
    }
  `);

  return html`
    <div :class="${{ split: true, [props.variant]: true }}">
      <!-- Primary action -->
      <button
        class="primary-btn"
        ?disabled="${props.disabled}"
        @click="${() => emit('click')}"
      >
        ${props.icon ? html`<span class="btn-icon" aria-hidden="true">${props.icon}</span>` : null}
        ${props.label}
      </button>

      <!-- Vertical divider -->
      <div class="btn-divider" aria-hidden="true"></div>

      <!-- Dropdown arrow -->
      <button
        class="arrow-btn"
        aria-haspopup="true"
        aria-expanded="${menuOpen.value}"
        aria-label="More actions"
        ?disabled="${props.disabled}"
        @click="${(e: Event) => { e.stopPropagation(); menuOpen.value = !menuOpen.value; }}"
      >
        <span :class="${{ 'arrow-icon': true, open: menuOpen.value }}" aria-hidden="true">arrow_drop_down</span>
      </button>
    </div>

    ${when(menuOpen.value, () => html`
      <div class="drop-scrim" @click="${(e: Event) => { e.stopPropagation(); menuOpen.value = false; }}"></div>
    `)}
    ${Transition({
      show: menuOpen.value,
      css: false,
      onEnter: (_el: HTMLElement, done: () => void) => done(),
      onLeave: (_el: HTMLElement, done: () => void) => done(),
      onAfterEnter(el: HTMLElement) {
        previousFocus.value = document.activeElement as HTMLElement;
        el.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
      },
      onAfterLeave() {
        previousFocus.value?.focus();
        previousFocus.value = null;
      },
    }, html`
      <div class="menu-wrapper">
        <div class="menu" role="menu" tabindex="-1" @keydown="${handleMenuKeyDown}">
          ${each(props.items, (item) => html`
            <button
              class="menu-item"
              role="menuitem"
              ?disabled="${item.disabled}"
              @click="${(e: Event) => { e.stopPropagation(); emit('select', { id: item.id }); menuOpen.value = false; }}"
            >
              ${when(!!item.icon, () => html`<span class="btn-icon" aria-hidden="true">${item.icon}</span>`)}
              ${item.label}
            </button>
          `)}
        </div>
      </div>
    `)}
  `;
});
