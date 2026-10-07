import { ref, useHost, useOnConnected, useFormInternals, nextTick, useExpose } from '@jasonshimmy/custom-elements-runtime';
import type { ModelRef } from '@jasonshimmy/custom-elements-runtime';

/** Native value/validity/reset contract for form-associated Material input hosts. */
export function useNativeFormControl<T extends string | number | boolean>(
  model: ModelRef<T>,
  props: { disabled: boolean; required?: boolean; value?: string },
  checked = false,
) {
  const host = useHost();
  const initial = ref(model.value);
  const formDisabled = ref(false);
  const internals = useFormInternals({
    reset: () => { model.value = initial.value; },
    disabled: (value) => { formDisabled.value = value; },
    restore: (value) => {
      if (typeof value !== 'string') return;
      model.value = (typeof initial.value === 'boolean' ? value === 'true' : typeof initial.value === 'number' ? Number(value) : value) as T;
    },
  });
  useExpose({
    focus: () => host?.shadowRoot?.querySelector<HTMLInputElement>('input')?.focus(),
    checkValidity: () => internals?.checkValidity() ?? true,
    reportValidity: () => internals?.reportValidity() ?? true,
  });
  const sync = () => {
    const input = host?.shadowRoot?.querySelector<HTMLInputElement>('input');
    if (!internals || !input) return;
    input.disabled = props.disabled || formDisabled.value || !!host?.matches(':disabled');
    internals.setFormValue(input.disabled || (checked && !model.value) ? null : checked ? (props.value ?? 'on') : String(model.value), String(model.value));
    const invalid = props.required && checked && !model.value;
    if (input.disabled) internals.setValidity({});
    else if (invalid) internals.setValidity({ valueMissing: true }, 'Please select this option.', input);
    else internals.setValidity(input.validity, input.validationMessage, input);
  };
  useOnConnected(() => {
    sync();
    const activate = (event: Event) => {
      if (event.composedPath()[0] !== host) return
      const input = host?.shadowRoot?.querySelector<HTMLInputElement>('input');
      if (!input || input.disabled) return
      input.focus();
      if (input.type === 'checkbox') input.click();
    };
    host?.addEventListener('click', activate);
    host?.addEventListener('input', sync);
    host?.addEventListener('change', sync);
    return () => { host?.removeEventListener('click', activate); host?.removeEventListener('input', sync); host?.removeEventListener('change', sync); };
  });
  // Prop/model renders must update validity after native constraints have been patched.
  if (host) void nextTick().then(sync);
  return { internals, disabled: props.disabled || formDisabled.value };
}
