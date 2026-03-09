import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';

component('md-checkbox', () => {
  const props = useProps({
    checked: false,
    indeterminate: false,
    disabled: false,
    label: '',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: inline-flex; align-items: center; vertical-align: middle; }

    label {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      user-select: none;
    }
    label.disabled { opacity: 0.38; cursor: not-allowed; }

    .checkbox-container {
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      position: relative;
      flex-shrink: 0;
    }
    .checkbox-container::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .checkbox-container.checked::before,
    .checkbox-container.indeterminate::before {
      background: var(--md-sys-color-primary, #6750A4);
    }
    label:hover .checkbox-container::before  { opacity: 0.08; }
    label:focus-within .checkbox-container::before { opacity: 0.12; }

    input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 40px;
      height: 40px;
      margin: 0;
      cursor: pointer;
    }
    input[type="checkbox"]:disabled { cursor: not-allowed; }

    .box {
      width: 18px;
      height: 18px;
      border-radius: 2px;
      border: 2px solid var(--md-sys-color-on-surface-variant, #49454F);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 200ms, border-color 200ms;
      position: relative;
      flex-shrink: 0;
    }
    .checked .box,
    .indeterminate .box {
      background: var(--md-sys-color-primary, #6750A4);
      border-color: var(--md-sys-color-primary, #6750A4);
    }

    .check-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 14px;
      font-weight: 700;
      font-style: normal;
      color: var(--md-sys-color-on-primary, #fff);
      display: none;
      line-height: 1;
      font-variation-settings: 'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 20;
    }
    .checked   .check-icon { display: block; }
    .indeterminate .check-icon { display: block; }
  `);

  return html`
    <label :class="${{ disabled: props.disabled }}">
      <div :class="${{
        'checkbox-container': true,
        checked: props.checked,
        indeterminate: props.indeterminate,
      }}">
        <input
          type="checkbox"
          :checked="${props.checked}"
          :disabled="${props.disabled}"
          :bind="${{ indeterminate: props.indeterminate }}"
          @change="${(e: Event) => emit('change', (e.target as HTMLInputElement).checked)}"
        />
        <div class="box">
          <span class="check-icon">${props.indeterminate ? 'remove' : 'check'}</span>
        </div>
      </div>
      ${props.label}
    </label>
  `;
});
