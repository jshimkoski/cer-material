import { getCurrentComponentContext } from '@jasonshimmy/custom-elements-runtime';

function getDeepActiveElement(): HTMLElement | null {
  let el: Element | null = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el as HTMLElement | null;
}

/**
 * Creates a lightweight focus-return handler (no Tab trapping) for overlays
 * that don't need full keyboard confinement — e.g. side sheets, drawers, menus.
 *
 * Wire the returned callbacks into a CER `Transition`:
 *   `onAfterEnter: focusReturn.onAfterEnter, onAfterLeave: focusReturn.onAfterLeave`
 *
 * State is stored on the component context so it survives re-renders.
 *
 * @example
 * const focusReturn = createFocusReturn();
 * // In template:
 * Transition({ show: props.open, onAfterEnter: focusReturn.onAfterEnter, onAfterLeave: focusReturn.onAfterLeave }, html`...`)
 */
export function createFocusReturn() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = getCurrentComponentContext() as any;

  if (!ctx.__mdFocusReturn) {
    const state = { previousFocus: null as HTMLElement | null };

    ctx.__mdFocusReturn = {
      onAfterEnter(_el?: HTMLElement) {
        state.previousFocus = getDeepActiveElement();
      },
      onAfterLeave(_el?: HTMLElement) {
        state.previousFocus?.focus();
        state.previousFocus = null;
      },
    };
  }

  return ctx.__mdFocusReturn as {
    onAfterEnter: (el?: HTMLElement) => void;
    onAfterLeave: (el?: HTMLElement) => void;
  };
}

