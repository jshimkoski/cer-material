import { component, html, css, defineModel, useProps, useEmit, useStyle, useOnDisconnected } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { createFocusTrap } from '../composables/useFocusTrap';
import { useScrollLock } from '../composables/useScrollLock';

component('md-dialog', () => {
  const props = useProps({
    headline: '',
    icon: '',
  });
  const emit = useEmit();
  const open = defineModel('open', false);

  useEscapeKey(() => open.value, () => { emit('close'); open.value = false; })();
  const trap = createFocusTrap();
  useOnDisconnected(() => trap.cleanup());
  const scrollLock = useScrollLock();

  useStyle(() => css`
    :host { display: contents; }

    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
      z-index: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      /* Base = fully visible; opacity: 1 and pointer-events: auto are defaults */
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
      /* Base = fully open; transform: none and opacity: 1 are defaults */
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

// Scrim + dialog are conditionally mounted via Transition. Both the scrim
  // and inner dialog are animated via JS hooks to avoid getComputedStyle
  // timing issues with freshly-inserted Shadow DOM elements.
  return html`
    ${Transition({
      show: open.value,
      name: 'md-dialog-scrim',
      css: false,
      onBeforeEnter: (el) => {
        scrollLock.lock();
        const h = el as HTMLElement;
        h.style.opacity = '0';
        const dialog = h.querySelector<HTMLElement>('.dialog');
        if (dialog) { dialog.style.transform = 'scale(0.92)'; dialog.style.opacity = '0'; }
      },
      onEnter: (el, done) => {
        const h = el as HTMLElement;
        const dialog = h.querySelector<HTMLElement>('.dialog');
        h.offsetHeight;
        const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
        h.style.transition = `opacity 200ms ${ease}`;
        h.style.opacity = '';
        if (dialog) {
          dialog.style.transition = `opacity 200ms ${ease}, transform 200ms ${ease}`;
          dialog.style.transform = '';
          dialog.style.opacity = '';
        }
        h.addEventListener('transitionend', done, { once: true });
        setTimeout(done, 250);
      },
      onAfterEnter: (el) => {
        const h = el as HTMLElement;
        h.style.transition = '';
        h.querySelector<HTMLElement>('.dialog')?.style.setProperty('transition', '');
        trap.onAfterEnter(h);
      },
      onLeave: (el, done) => {
        const h = el as HTMLElement;
        const dialog = h.querySelector<HTMLElement>('.dialog');
        const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
        h.style.transition = `opacity 200ms ${ease}`;
        h.style.opacity = '0';
        if (dialog) {
          dialog.style.transition = `opacity 200ms ${ease}, transform 200ms ${ease}`;
          dialog.style.transform = 'scale(0.92)';
          dialog.style.opacity = '0';
        }
        h.addEventListener('transitionend', done, { once: true });
        setTimeout(done, 250);
      },
      onAfterLeave: () => { trap.onAfterLeave(); scrollLock.unlock(); },
    }, html`
      <div
        class="scrim"
        @click="${(e: Event) => { if (e.target === e.currentTarget) { emit('close'); open.value = false; } }}"
      >
        <div class="dialog" role="dialog" aria-modal="true" :bind="${{ 'aria-labelledby': props.headline ? 'dialog-headline' : null }}">
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
    `)}
  `;
});
