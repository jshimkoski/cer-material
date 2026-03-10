import { component, html, css, ref, watch, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

let _fieldIdCounter = 0;

component('md-text-field', () => {
  const fieldId = `md-field-${++_fieldIdCounter}`;
  const props = useProps({
    variant: 'filled' as 'filled' | 'outlined',
    label: 'Label',
    value: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    error: false,
    errorText: '',
    supportingText: '',
    leadingIcon: '',
    trailingIcon: '',
    required: false,
    readonly: false,
  });
  const emit = useEmit();
  const focused = ref(false);
  const internalValue = ref(props.value);

  // Sync with controlled prop
  watch(() => props.value, (v) => { internalValue.value = v; });

  useStyle(() => css`
    :host { display: block; }

    .field-wrapper {
      position: relative;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
    }

    /* ── Filled ── */
    .filled {
      background: var(--md-sys-color-surface-container-highest, #E6E0E9);
      border-radius: 4px 4px 0 0;
      padding: 0 16px;
      min-height: 56px;
      display: flex;
      align-items: flex-end;
      position: relative;
    }
    .filled.has-leading { padding-left: 12px; }

    .filled-border {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--md-sys-color-on-surface-variant, #49454F);
      transition: height 200ms;
    }
    .filled:focus-within .filled-border {
      height: 2px;
      background: var(--md-sys-color-primary, #6750A4);
    }
    .error .filled-border,
    .filled.error .filled-border { background: var(--md-sys-color-error, #B3261E) !important; }

    /* ── Outlined ── */
    .outlined {
      border-radius: 4px;
      padding: 0 16px;
      min-height: 56px;
      display: flex;
      align-items: center;
      position: relative;
    }
    .outlined.has-leading { padding-left: 12px; }

    .outlined-border {
      position: absolute;
      inset: 0;
      border: 1px solid var(--md-sys-color-outline, #79747E);
      border-radius: 4px;
      pointer-events: none;
      transition: border-color 200ms, border-width 200ms;
    }
    .outlined:focus-within .outlined-border {
      border-width: 2px;
      border-color: var(--md-sys-color-primary, #6750A4);
    }
    .error .outlined-border { border-color: var(--md-sys-color-error, #B3261E) !important; }

    /* ── Shared input ── */
    input {
      border: none;
      background: transparent;
      outline: none;
      font-family: inherit;
      font-size: 16px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      width: 100%;
      padding: 12px 0 0 0;
      caret-color: var(--md-sys-color-primary, #6750A4);
    }
    input:disabled { color: rgba(28,27,31,.38); cursor: not-allowed; }
    .outlined input { padding: 0; }

    input::placeholder { color: transparent; }
    input:focus::placeholder { color: var(--md-sys-color-on-surface-variant, #49454F); opacity: 0.5; }

    /* ── Label ── */
    label {
      position: absolute;
      font-family: inherit;
      font-size: 16px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      pointer-events: none;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
                  font-size 150ms cubic-bezier(0.4, 0, 0.2, 1),
                  color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: left top;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(100% - 16px);
    }

    /* filled label */
    .filled label {
      top: 16px;
      left: 16px;
    }
    .filled.has-leading label { left: 52px; }
    .filled.is-active label,
    .filled:focus-within label {
      transform: translateY(-8px) scale(0.75);
      color: var(--md-sys-color-primary, #6750A4);
    }
    .filled.error label,
    .filled.error:focus-within label { color: var(--md-sys-color-error, #B3261E); }

    /* outlined label */
    .outlined label {
      top: 50%;
      left: 16px;
      transform: translateY(-50%);
      background: transparent;
    }
    .outlined.has-leading label { left: 52px; }
    .outlined.is-active label,
    .outlined:focus-within label {
      transform: translateY(-150%) scale(0.75);
      background: var(--md-sys-color-surface, #FFFBFE);
      padding: 0 4px;
      color: var(--md-sys-color-primary, #6750A4);
      left: 12px;
    }
    .outlined.error label { color: var(--md-sys-color-error, #B3261E); }

    /* ── Icons ── */
    .field-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      display: inline-flex;
      align-items: center;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      line-height: 1;
      flex-shrink: 0;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .leading-icon { margin-right: 12px; }
    .trailing-icon { margin-left: 8px; }
    .error-icon { color: var(--md-sys-color-error, #B3261E); }

    /* input row inside filled */
    .filled .input-row {
      display: flex;
      align-items: center;
      width: 100%;
      padding-bottom: 8px;
    }
    .outlined .input-row {
      display: flex;
      align-items: center;
      width: 100%;
    }

    /* ── Support text ── */
    .support {
      font-size: 12px;
      padding: 4px 16px 0;
      line-height: 16px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .support.error-text { color: var(--md-sys-color-error, #B3261E); }

    /* ── Disabled ── */
    .disabled .filled   { opacity: 0.38; }
    .disabled .outlined { opacity: 0.38; }
  `);

  const showError = props.error;

  return html`
    <div :class="${{ 'field-wrapper': true, disabled: props.disabled }}">
      <div
        :class="${{
          [props.variant]: true,
          'has-leading': !!props.leadingIcon,
          'is-active': internalValue.value !== '' || focused.value,
          error: !!showError,
        }}"
      >
        ${when(props.variant === 'filled', () => html`<div class="filled-border"></div>`)}
        ${when(props.variant === 'outlined', () => html`<div class="outlined-border"></div>`)}

        <label :for="${fieldId}">${props.label}${props.required ? html`<span aria-hidden="true"> *</span>` : ''}</label>

        <div class="input-row">
          ${when(!!props.leadingIcon, () => html`<span class="field-icon leading-icon" aria-hidden="true">${props.leadingIcon}</span>`)}
          <input
            :id="${fieldId}"
            :type="${props.type}"
            :value="${internalValue.value}"
            :disabled="${props.disabled}"
            :readonly="${props.readonly}"
            :required="${props.required}"
            :placeholder="${props.placeholder}"
            :bind="${{
              'aria-required': props.required ? 'true' : null,
              'aria-invalid': props.error ? 'true' : null,
              'aria-describedby': (props.error && props.errorText) || props.supportingText ? `${fieldId}-supporting` : null,
            }}"
            @focus="${() => { focused.value = true; }}"
            @blur="${() => { focused.value = false; }}"
            @input="${(e: Event) => {
              internalValue.value = (e.target as HTMLInputElement).value;
              emit('change', internalValue.value);
            }}"
          />
          ${when(!!props.trailingIcon, () => html`<span :class="${{ 'field-icon': true, 'trailing-icon': true, 'error-icon': !!showError }}" aria-hidden="true">${props.trailingIcon}</span>`)}
          ${when(!props.trailingIcon && showError, () => html`<span class="field-icon trailing-icon error-icon" aria-hidden="true">error</span>`)}
        </div>
      </div>

      ${when(!!(showError && props.errorText), () => html`<div :id="${fieldId}-supporting" class="support error-text">${props.errorText}</div>`)}
      ${when(!!((!showError) && props.supportingText), () => html`<div :id="${fieldId}-supporting" class="support">${props.supportingText}</div>`)}
    </div>
  `;
});
