import { getCurrentComponentContext } from '@jasonshimmy/custom-elements-runtime';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary:not([disabled])',
].join(', ');

function isVisible(el: HTMLElement): boolean {
  if ((el as unknown as { hidden?: boolean }).hidden) return false;
  const s = getComputedStyle(el);
  return s.display !== 'none' && s.visibility !== 'hidden';
}

/**
 * Recursively collects focusable elements, drilling into:
 *   - Shadow roots of custom elements (e.g. the <button> inside <md-button>)
 *   - Slotted light-DOM elements assigned to any <slot>
 *
 * This ensures the focus trap works even when all interactive elements are
 * custom components (like <md-button>) rather than native HTML elements.
 */
function collectDeepTabbables(root: Element | ShadowRoot, out: HTMLElement[]): void {
  for (const child of Array.from(root.children)) {
    const el = child as HTMLElement;
    if (el.tagName === 'SLOT') {
      for (const assigned of (el as HTMLSlotElement).assignedElements({ flatten: true })) {
        collectDeepTabbables(assigned, out);
      }
    } else if (el.shadowRoot) {
      // Custom element: focus lands on its internal focusable, not the host
      collectDeepTabbables(el.shadowRoot, out);
    } else if (el.matches(FOCUSABLE) && isVisible(el)) {
      out.push(el);
    } else {
      collectDeepTabbables(el, out);
    }
  }
}

function getFocusableDeep(container: Element | ShadowRoot): HTMLElement[] {
  const out: HTMLElement[] = [];
  collectDeepTabbables(container, out);
  return out;
}

function getDeepActiveElement(): HTMLElement | null {
  let el: Element | null = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el as HTMLElement | null;
}

/**
 * Creates a focus trap for an overlay.
 *
 * Wire the returned callbacks directly into a CER `Transition`:
 *   `onAfterEnter: trap.onAfterEnter, onAfterLeave: trap.onAfterLeave`
 *
 * State is stored on the component context so it survives re-renders without
 * losing the saved "previous focus" element or leaking event listeners.
 *
 * Behaviour:
 *   - `onAfterEnter(el)`: saves the currently focused element, registers a
 *     Tab/Shift+Tab keydown guard, and focuses the first tabbable inside `el`.
 *   - `onAfterLeave()`: removes the keydown guard and restores focus to the
 *     previously focused element.
 *   - `cleanup()`: removes the keydown guard — call from `useOnDisconnected`
 *     to avoid leaks if the component is removed while the overlay is open.
 *
 * Drills into shadow roots so nested custom elements (e.g. `<md-button>`)
 * are discovered and included in the tab cycle.
 *
 * @example
 * const trap = createFocusTrap();
 * useOnDisconnected(() => trap.cleanup());
 * // In template:
 * Transition({ show: props.open, onAfterEnter: trap.onAfterEnter, onAfterLeave: trap.onAfterLeave }, html`...`)
 */
export function createFocusTrap() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = getCurrentComponentContext() as any;

  // Persist state on the context — the context object lives for the lifetime
  // of the component instance and survives re-renders, so onAfterLeave always
  // reads the previousFocus that onAfterEnter saved even if a re-render
  // occurred in between.
  if (!ctx.__mdFocusTrap) {
    const state = {
      container: null as Element | null,
      previousFocus: null as HTMLElement | null,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !state.container) return;
      const focusable = getFocusableDeep(state.container);
      if (!focusable.length) return;
      const active = getDeepActiveElement();
      const idx = active ? focusable.indexOf(active) : -1;
      if (e.shiftKey) {
        if (idx <= 0) { e.preventDefault(); focusable[focusable.length - 1].focus(); }
      } else {
        if (idx === focusable.length - 1 || idx < 0) { e.preventDefault(); focusable[0].focus(); }
      }
    };

    ctx.__mdFocusTrap = {
      onAfterEnter(el: HTMLElement) {
        state.container = el;
        state.previousFocus = getDeepActiveElement();
        document.addEventListener('keydown', handleKeyDown);
        getFocusableDeep(el)[0]?.focus();
      },
      onAfterLeave() {
        document.removeEventListener('keydown', handleKeyDown);
        state.previousFocus?.focus();
        state.previousFocus = null;
        state.container = null;
      },
      cleanup() {
        document.removeEventListener('keydown', handleKeyDown);
        state.container = null;
      },
    };
  }

  return ctx.__mdFocusTrap as {
    onAfterEnter: (el: HTMLElement) => void;
    onAfterLeave: () => void;
    cleanup: () => void;
  };
}

