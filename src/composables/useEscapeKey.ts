import { createComposable, useOnConnected, useOnDisconnected } from '@jasonshimmy/custom-elements-runtime';

/**
 * Registers a document-level `keydown` listener for the Escape key that fires
 * for the lifetime of the host element.  The provided `guard` function is
 * called on every keydown; when it returns `true` the event is cancelled and
 * `onEscape` is invoked.
 *
 * Using `createComposable` ensures the lifecycle hooks are bound to the correct
 * component context even when called from outside the component render closure.
 *
 * @example
 * useEscapeKey(
 *   () => props.open,           // guard: only active when open
 *   () => emit('close'),
 * )();
 */
export function useEscapeKey(guard: () => boolean, onEscape: () => void) {
  return createComposable(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (!guard()) return;
      e.preventDefault();
      onEscape();
    };

    useOnConnected(() => { document.addEventListener('keydown', handler); });
    useOnDisconnected(() => { document.removeEventListener('keydown', handler); });
  });
}
