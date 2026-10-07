import { ref, useProps, useEmit } from '@jasonshimmy/custom-elements-runtime';
import type { ModelRef } from '@jasonshimmy/custom-elements-runtime';

/** Supports both standalone native forms and parent-controlled :model bindings. */
export function useFormModel<T>(name: string, initial: T): ModelRef<T> {
  const props = useProps({ [name]: initial });
  const emit = useEmit();
  const value = ref(props[name] as T);
  const previous = ref(props[name] as T);
  if (!Object.is(previous.peek(), props[name])) {
    previous.initSilent(props[name] as T);
    value.initSilent(props[name] as T);
  }
  return {
    [Symbol.for('@cer/ReactiveState')]: true,
    get value() { return value.value; },
    set value(next: T) { value.value = next; emit(`update:${name}`, next); },
  } as ModelRef<T>;
}
