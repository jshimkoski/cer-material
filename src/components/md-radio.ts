import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';

component('md-radio', () => {
  const props = useProps({
    checked: false,
    disabled: false,
    name: '',
    value: '',
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

    .radio-container {
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      position: relative;
      flex-shrink: 0;
    }
    .radio-container::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .radio-container.checked::before {
      background: var(--md-sys-color-primary, #6750A4);
    }
    label:hover .radio-container::before  { opacity: 0.08; }
    label:focus-within .radio-container::before { opacity: 0.12; }

    input[type="radio"] {
      position: absolute;
      opacity: 0;
      width: 40px;
      height: 40px;
      margin: 0;
      cursor: pointer;
    }
    input[type="radio"]:disabled { cursor: not-allowed; }

    .circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--md-sys-color-on-surface-variant, #49454F);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 200ms;
      flex-shrink: 0;
    }
    .checked .circle { border-color: var(--md-sys-color-primary, #6750A4); }

    .inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--md-sys-color-primary, #6750A4);
      transform: scale(0);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .checked .inner { transform: scale(1); }
  `);

  return html`
    <label :class="${{ disabled: props.disabled }}">
      <div :class="${{
        'radio-container': true,
        checked: props.checked,
      }}">
        <input
          type="radio"
          :checked="${props.checked}"
          :disabled="${props.disabled}"
          :name="${props.name}"
          :value="${props.value}"
          @change="${() => emit('change', props.value)}"
        />
        <div class="circle">
          <div class="inner"></div>
        </div>
      </div>
      ${props.label}
    </label>
  `;
});
