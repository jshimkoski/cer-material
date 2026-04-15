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
 * Checks whether `descendant` is inside `ancestor` in the composed (flat) DOM
 * tree, correctly crossing shadow-root host boundaries and slot assignments.
 *
 * `Node.contains()` alone is insufficient here because:
 *   - When focus is inside a shadow root, `document.activeElement` returns the
 *     outermost shadow host, not the inner element.
 *   - The overlay's slotted children live in a *parent* shadow root, so the
 *     overlay container div never `contains` them via light-DOM traversal.
 *
 * Algorithm: walk upward using `assignedSlot` (to follow slot projections),
 * then `parentElement`, then `shadowRoot.host` when hitting a shadow boundary.
 */
function isInsideComposed(descendant: Element | null, ancestor: Element): boolean {
  let el: Element | null = descendant;
  while (el !== null) {
    if (el === ancestor) return true;
    const assigned = (el as HTMLElement).assignedSlot;
    if (assigned) {
      el = assigned;
    } else if (el.parentElement) {
      el = el.parentElement;
    } else {
      const root = el.getRootNode();
      el = root instanceof ShadowRoot ? root.host : null;
    }
  }
  return false;
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

/**
 * Searches the composed tree for the first element with an `autofocus`
 * attribute, starting from `el` itself. For custom elements it drills into the
 * shadow root so the actual focusable input/button is returned rather than the
 * host element.
 */
function findAutofocusEl(el: HTMLElement): HTMLElement | null {
  if (el.hasAttribute('autofocus')) {
    // Custom element — return the first focusable inside its shadow root.
    if (el.shadowRoot) return getFocusableDeep(el.shadowRoot)[0] ?? null;
    return isVisible(el) && el.matches(FOCUSABLE) ? el : null;
  }
  if (el.shadowRoot) return findAutofocusDeep(el.shadowRoot);
  return findAutofocusDeep(el);
}

function findAutofocusDeep(root: Element | ShadowRoot): HTMLElement | null {
  for (const child of Array.from(root.children)) {
    const el = child as HTMLElement;
    if (el.tagName === 'SLOT') {
      for (const assigned of (el as HTMLSlotElement).assignedElements({ flatten: true })) {
        const found = findAutofocusEl(assigned as HTMLElement);
        if (found) return found;
      }
    } else {
      const found = findAutofocusEl(el);
      if (found) return found;
    }
  }
  return null;
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
        // Don't steal focus if autofocus (or anything else) has already moved
        // focus inside the overlay.
        //
        // We must use the composed-tree check rather than `contains()` because:
        //   1. The slotted content (e.g. <md-search>) lives in a *parent* shadow
        //      root, so the overlay's container div never `contains` it.
        //   2. When focus is inside a nested shadow (md-search's input),
        //      document.activeElement returns the outermost shadow host
        //      (e.g. md-showcase), not the overlay host — so host.contains()
        //      would be reversed (ancestor, not descendant).
        //
        // isInsideComposed walks upward through assignedSlot / parentElement /
        // shadowRoot.host boundaries, so it correctly identifies any element
        // inside the overlay regardless of shadow-DOM nesting depth.
        const deepActive = getDeepActiveElement();
        const alreadyInside =
          deepActive !== null &&
          (isInsideComposed(deepActive, el) ||
           isInsideComposed(deepActive, ctx._host as HTMLElement));
        if (!alreadyInside) {
          // Honour [autofocus] on slotted content (browser won't fire it for
          // dynamically-inserted custom overlays). Falls back to the first
          // tabbable element if no [autofocus] target is found.
          (findAutofocusDeep(el) ?? getFocusableDeep(el)[0])?.focus();
        }
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

