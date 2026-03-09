import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-switch', () => {
  const props = useProps({
    selected: false,
    disabled: false,
    icons: false,
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: inline-flex; align-items: center; vertical-align: middle; }

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
    }
    .selected .track {
      background: var(--md-sys-color-primary, #6750A4);
      border-color: var(--md-sys-color-primary, #6750A4);
    }

    .thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--md-sys-color-outline, #79747E);
      transform: translateX(0);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  width 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  height 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }
    .switch:hover .thumb:not(.selected) {
      width: 20px;
      height: 20px;
      background: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .switch:active .thumb:not(.selected) {
      width: 28px;
      height: 28px;
      background: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .selected .thumb {
      width: 24px;
      height: 24px;
      background: var(--md-sys-color-on-primary, #fff);
      transform: translateX(20px);
    }
    /* Selected hover: color → primary-container, size stays 24px */
    .switch.selected:hover .thumb {
      background: var(--md-sys-color-primary-container, #EADDFF);
    }
    /* Selected pressed: 28px, primary-container */
    .switch.selected:active .thumb {
      width: 28px;
      height: 28px;
      background: var(--md-sys-color-primary-container, #EADDFF);
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
        selected: props.selected,
        disabled: props.disabled,
        icons: props.icons,
      }}"
    >
      <input
        type="checkbox"
        :checked="${props.selected}"
        :disabled="${props.disabled}"
        @change="${(e: Event) => emit('change', (e.target as HTMLInputElement).checked)}"
      />
      <div class="track">
        <div :class="${{ thumb: true, selected: props.selected }}">
          ${when(props.icons, () => html`<span class="thumb-icon">${props.selected ? 'check' : 'close'}</span>`)}
        </div>
      </div>
    </div>
  `;
});
