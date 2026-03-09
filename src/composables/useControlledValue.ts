import {
  ref,
  useOnAttributeChanged,
} from '@jasonshimmy/custom-elements-runtime';
import type { ReactiveState } from '@jasonshimmy/custom-elements-runtime';

/**
 * Creates an internal reactive ref that mirrors an external prop value and
 * stays in sync when the prop changes — both via DOM attribute changes and
 * JS property assignment (e.g. `:bind` from a parent component).
 *
 * @param getProp - A getter that returns the current coerced prop value.
 *                  e.g. `() => props.value || ''`
 *
 * @example
 * const query = useControlledValue(() => props.value || '');
 * query.value = 'typed by user'; // internal mutation works
 */
export function useControlledValue<T>(getProp: () => T): ReactiveState<T> {
  const internal = ref<T>(getProp());

  // PATH 1 — attribute changes.
  // useOnAttributeChanged fires after _applyProps() but before the scheduled
  // re-render, so getProp() already returns the new coerced value. Assigning
  // here is safe (outside of render) — no "state modified during render" warning
  // and no spurious extra render cycle.
  useOnAttributeChanged(() => {
    const next = getProp();
    if (!Object.is(next, internal.value)) {
      internal.value = next;
    }
  });

  // PATH 2 — JS property changes (e.g. :bind from a parent component).
  // These do NOT fire attributeChangedCallback, so useOnAttributeChanged never
  // fires. The element's reactive property setter calls _requestRender() directly.
  // On that re-render, ref() returns the same ReactiveState (stable stateIndex key)
  // with the stale value, so we sync here using initSilent(), which:
  //   • writes directly to _value without calling makeReactive (safe for primitives)
  //   • does NOT call triggerUpdate, avoiding the render warning and an extra render
  const propValue = getProp();
  if (!Object.is(propValue, internal.peek())) {
    internal.initSilent(propValue as T);
  }

  return internal;
}