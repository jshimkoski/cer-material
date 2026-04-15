import { component, html, css, defineModel, useEmit, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

/**
 * md-switch
 *
 * MD3 toggle switch.
 * Spec: https://m3.material.io/components/switch
 *
 * Props:
 *   icons     — shows check/close icons inside the thumb
 *   label     — visible label text rendered to the right of the switch
 *   ariaLabel — accessible label (used when no visible label is present)
 *   disabled  — disables interaction
 *
 * Model:
 *   selected — current on/off state; bindable with :model
 *
 * Emits:
 *   change — fired when the switch is toggled; payload: new selected value (boolean)
 */
component('md-switch', () => {
  const props = useProps({
    disabled: false,
    icons: false,
    label: '',
    ariaLabel: '',
  });
  const emit = useEmit();
  const selected = defineModel('selected', false);

  useStyle(() => css`
    :host { display: inline-flex; align-items: center; vertical-align: middle; gap: 16px; }

    .switch-label {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      cursor: pointer;
      user-select: none;
    }
    .disabled .switch-label { opacity: 0.38; cursor: not-allowed; }

    .switch {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      position: relative;
    }
    .switch.disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }

    input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      cursor: pointer;
    }

    .track {
      width: 52px;
      height: 32px;
      border-radius: 16px;
      border: 2px solid var(--md-sys-color-outline, #79747E);
      background: var(--md-sys-color-surface-container-highest, #E6E0E9);
      display: flex;
      align-items: center;
      padding: 0 4px;
      transition: background-color 200ms, border-color 200ms;
      position: relative;
      overflow: hidden;
    }
    .selected .track {
      background: var(--md-sys-color-primary, #6750A4);
      border-color: var(--md-sys-color-primary, #6750A4);
    }

    /* Thumb: fixed at max (28px) size, scaled down visually to avoid layout reflow */
    .thumb {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--md-sys-color-outline, #79747E);
      /* Resting unselected: visually 16px (16/28 ≈ 0.571) */
      transform: translateX(0) scale(0.571);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }
    /* Hover unselected: visually 20px (20/28 ≈ 0.714) */
    .switch:hover .thumb:not(.selected) {
      transform: translateX(0) scale(0.714);
      background: var(--md-sys-color-on-surface-variant, #49454F);
    }
    /* Press unselected: visually 28px */
    .switch:active .thumb:not(.selected) {
      transform: translateX(0) scale(1);
      background: var(--md-sys-color-on-surface-variant, #49454F);
    }
    /* Selected resting: visually 24px (24/28 ≈ 0.857), moved right */
    .selected .thumb {
      background: var(--md-sys-color-on-primary, #fff);
      transform: translateX(14px) scale(0.857);
    }
    /* Selected hover: same size, color changes */
    .switch.selected:hover .thumb {
      background: var(--md-sys-color-primary-container, #EADDFF);
      transform: translateX(14px) scale(0.857);
    }
    /* Selected press: visually 28px */
    .switch.selected:active .thumb {
      background: var(--md-sys-color-primary-container, #EADDFF);
      transform: translateX(14px) scale(1);
    }

    /* state layer */
    .thumb::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
      pointer-events: none;
    }
    .selected .thumb::before {
      background: var(--md-sys-color-primary, #6750A4);
    }
    .switch:hover .thumb::before { opacity: 0.08; }
    .switch:focus-within .thumb::before { opacity: 0.12; }
    .switch:active .thumb::before { opacity: 0.12; }

    .thumb-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      color: var(--md-sys-color-surface-container-highest, #E6E0E9);
      display: none;
    }
    .selected .thumb-icon { color: var(--md-sys-color-on-primary-container, #21005D); }
    .icons .thumb .thumb-icon { display: block; }
  `);

  return html`
    <div
      :class="${{
        switch: true,
        selected: selected.value,
        disabled: props.disabled,
        icons: props.icons,
      }}"
    >
      <input
        role="switch"
        type="checkbox"
        :checked="${selected.value}"
        :disabled="${props.disabled}"
        :bind="${{ 'aria-checked': String(selected.value), 'aria-label': props.ariaLabel || props.label || null }}"
        @change="${(e: Event) => { emit('change', (e.target as HTMLInputElement).checked); selected.value = (e.target as HTMLInputElement).checked; }}"
      />
      <div class="track">
        <div :class="${{ thumb: true, selected: selected.value }}">
          ${when(props.icons, () => html`<span class="thumb-icon" aria-hidden="true">${selected.value ? 'check' : 'close'}</span>`)}
        </div>
      </div>
    </div>
    ${when(!!props.label, () => html`<span class="switch-label">${props.label}</span>`)}
  `;
});
