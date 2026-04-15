import { component, html, css, defineModel, useProps, useEmit, useStyle, useOnDisconnected } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { createFocusTrap } from '../composables/useFocusTrap';
import { useScrollLock } from '../composables/useScrollLock';

component('md-side-sheet', () => {
  const props = useProps({
    headline: '',
    variant: 'standard' as 'standard' | 'modal',
    divider: true,
    showBackButton: false
  });
  const emit = useEmit();
  const open = defineModel('open', false);

  // Only modal variant uses escape key, focus trap, and scroll lock.
  useEscapeKey(() => open.value && props.variant === 'modal', () => { emit('close'); open.value = false; })();
  const trap = createFocusTrap();
  useOnDisconnected(() => trap.cleanup());
  const scrollLock = useScrollLock();

  useStyle(() => css`
    :host { display: contents; }

    /* ── Scrim (modal only) ─────────────────────────────────────── */
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
      z-index: 500;
    }
    /* ── Modal side sheet: overlays content, slides in from right ── */
    .modal-side-sheet {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 360px;
      max-width: 85vw;
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      border-radius: 16px 0 0 16px;
      z-index: 501;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    /* ── Standard side sheet: in-layout, body shrinks to accommodate ── */
    .standard-side-sheet {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      width: 400px;
      height: 100%;
      background: var(--md-sys-color-surface, #FFFBFE);
      flex-shrink: 0;
    }
    .standard-side-sheet.with-divider {
      border-left: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
    }


    /* ── Shared header & content ─────────────────────────────────── */
    .sheet-header {
      display: flex;
      align-items: center;
      padding: 24px 24px 0;
      gap: 4px;
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

    .icon-btn {
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
    .icon-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transition: opacity 200ms;
    }
    .icon-btn:hover::before { opacity: 0.08; }
    .icon-btn:focus::before { opacity: 0.12; }

    .icon-btn-icon {
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

  return html`
    ${Transition({
      show: open.value && props.variant === 'modal',
      name: 'md-scrim',
      css: false,
      onBeforeEnter: (el) => { (el as HTMLElement).style.opacity = '0'; },
      onEnter: (el, done) => {
        const h = el as HTMLElement;
        h.offsetHeight;
        h.style.transition = 'opacity 250ms ease-out';
        h.style.opacity = '';
        h.addEventListener('transitionend', done, { once: true });
        setTimeout(done, 300);
      },
      onLeave: (el, done) => {
        const h = el as HTMLElement;
        h.style.transition = 'opacity 250ms ease-out';
        h.style.opacity = '0';
        h.addEventListener('transitionend', done, { once: true });
        setTimeout(done, 300);
      },
    }, html`
      <div class="scrim" @click="${() => { emit('close'); open.value = false; }}"></div>
    `)}

    ${props.variant === 'modal'
      ? Transition({
          show: open.value,
          name: 'md-modal-side-sheet',
          css: false,
          onBeforeEnter: (el) => {
            scrollLock.lock();
            (el as HTMLElement).style.transform = 'translateX(100%)';
          },
          onEnter: (el, done) => {
            const h = el as HTMLElement;
            h.offsetHeight;
            h.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
            h.style.transform = '';
            h.addEventListener('transitionend', done, { once: true });
            setTimeout(done, 350);
          },
          onAfterEnter: trap.onAfterEnter,
          onLeave: (el, done) => {
            const h = el as HTMLElement;
            h.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
            h.style.transform = 'translateX(100%)';
            h.addEventListener('transitionend', done, { once: true });
            setTimeout(done, 350);
          },
          onAfterLeave: () => { trap.onAfterLeave(); scrollLock.unlock(); },
        }, html`
          <div
            class="modal-side-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="${props.headline || 'Side sheet'}"
          >
            ${when(!!props.headline, () => html`
              <div class="sheet-header">
                <button
                  :when="${props.showBackButton}"
                  class="icon-btn" aria-label="Go back" @click="${() => emit('back')}"
                >
                  <span class="icon-btn-icon">arrow_back</span>
                </button>
                <h2 class="sheet-headline">${props.headline}</h2>
                <button class="icon-btn" aria-label="Close side sheet" @click="${() => { emit('close'); open.value = false; }}">
                  <span class="icon-btn-icon">close</span>
                </button>
              </div>
            `)}
            <div class="sheet-content">
              <slot></slot>
            </div>
          </div>
        `)
      : Transition({
          show: open.value,
          name: 'md-standard-side-sheet',
          css: false,
          onBeforeEnter: (el) => {
            (el as HTMLElement).style.width = '0';
          },
          onEnter: (el, done) => {
            const h = el as HTMLElement;
            h.offsetHeight; // force reflow to commit width: 0
            h.style.transition = 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)';
            h.style.width = '400px';
            h.addEventListener('transitionend', () => done(), { once: true });
            setTimeout(done, 350);
          },
          onAfterEnter: (el) => {
            const h = el as HTMLElement;
            h.style.removeProperty('width');
            h.style.removeProperty('transition');
          },
          onBeforeLeave: (el) => {
            const h = el as HTMLElement;
            h.style.width = `${h.offsetWidth}px`;
          },
          onLeave: (el, done) => {
            const h = el as HTMLElement;
            h.style.transition = 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)';
            h.style.width = '0';
            h.addEventListener('transitionend', () => done(), { once: true });
            setTimeout(done, 350);
          },
          onAfterLeave: (el) => {
            const h = el as HTMLElement;
            h.style.removeProperty('width');
            h.style.removeProperty('transition');
          },
        }, html`
          <div
            :class="${{ 'standard-side-sheet': true, 'with-divider': props.divider }}"
            role="complementary"
            aria-label="${props.headline || 'Side sheet'}"
          >
            ${when(!!props.headline, () => html`
              <div class="sheet-header">
                <h2 class="sheet-headline">${props.headline}</h2>
                <button class="icon-btn" aria-label="Close side sheet" @click="${() => { emit('close'); open.value = false; }}">
                  <span class="icon-btn-icon">close</span>
                </button>
              </div>
            `)}
            <div class="sheet-content">
              <slot></slot>
            </div>
          </div>
        `)
    }
  `;
});
