import { component, html, css, ref, computed, watch, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-slider', () => {
  const props = useProps({
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    disabled: false,
    labeled: false,
    ticks: false,
  });
  const emit = useEmit();
  const internalValue = ref(props.value);

  // Sync with controlled prop
  watch(() => props.value, (v) => { internalValue.value = v; });
  const percentage = computed(() =>
    ((internalValue.value - props.min) / (props.max - props.min)) * 100,
  );

  useStyle(() => css`
    :host { display: block; }

    .slider-wrapper {
      position: relative;
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }

    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      background: transparent;
      position: relative;
      z-index: 2;
    }
    input[type="range"]:disabled { opacity: 0.38; cursor: not-allowed; }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--md-sys-color-primary, #6750A4);
      cursor: pointer;
      box-shadow: 0 0 0 0 rgba(103,80,164,0);
      transition: box-shadow 200ms;
    }
    input[type="range"]:not(:disabled)::-webkit-slider-thumb:hover {
      box-shadow: 0 0 0 8px rgba(103,80,164,0.12);
    }
    input[type="range"]:not(:disabled):focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 10px rgba(103,80,164,0.12);
    }
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--md-sys-color-primary, #6750A4);
      cursor: pointer;
      border: none;
    }

    .track-bg {
      position: absolute;
      left: 10px;
      right: 10px;
      height: 4px;
      border-radius: 2px;
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      z-index: 0;
    }
    .track-active {
      position: absolute;
      left: 10px;
      height: 4px;
      border-radius: 2px;
      background: var(--md-sys-color-primary, #6750A4);
      z-index: 1;
      pointer-events: none;
      transition: width 0ms;
    }

    .value-label {
      position: absolute;
      top: -28px;
      transform: translateX(-50%);
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #fff);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      white-space: nowrap;
      pointer-events: none;
    }
  `);

  return html`
    <div class="slider-wrapper">
      <div class="track-bg"></div>
      <div class="track-active" :style="${{ width: `calc(${percentage.value}% * (100% - 20px) / 100)` }}"></div>
      ${when(props.labeled, () => html`
        <div class="value-label" :style="${{ left: `calc(10px + ${percentage.value}% * (100% - 20px) / 100)` }}">
          ${internalValue.value}
        </div>
      `)}
      <input
        type="range"
        :min="${String(props.min)}"
        :max="${String(props.max)}"
        :step="${String(props.step)}"
        :value="${String(internalValue.value)}"
        :disabled="${props.disabled}"
        @input="${(e: Event) => {
          internalValue.value = Number((e.target as HTMLInputElement).value);
          emit('change', internalValue.value);
        }}"
      />
    </div>
  `;
});
