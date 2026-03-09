import { component, html, css, computed, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';
import { useControlledValue } from '../composables/useControlledValue';

component('md-slider', () => {
  const props = useProps({
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    disabled: false,
    labeled: false,
    ticks: false,
    ariaLabel: '',
  });
  const emit = useEmit();
  const internalValue = useControlledValue(() => props.value);
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
      top: -32px;
      transform: translateX(-50%);
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #fff);
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      white-space: nowrap;
      pointer-events: none;
      min-width: 28px;
      text-align: center;
    }

    .tick-marks {
      position: absolute;
      left: 10px;
      right: 10px;
      height: 4px;
      z-index: 1;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tick {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--md-sys-color-on-primary, #fff);
      flex-shrink: 0;
    }
    .tick.inactive {
      background: var(--md-sys-color-primary, #6750A4);
    }
  `);

  const tickCount = computed(() => {
    if (!props.ticks || props.step <= 0) return [];
    const count = Math.round((props.max - props.min) / props.step) + 1;
    return Array.from({ length: count }, (_, i) => {
      const tickValue = props.min + i * props.step;
      return tickValue <= internalValue.value ? 'active' : 'inactive';
    });
  });

  return html`
    <div class="slider-wrapper">
      <div class="track-bg"></div>
      <div class="track-active" :style="${{ width: `calc(${percentage.value}% * (100% - 20px) / 100)` }}"></div>
      ${when(props.ticks && tickCount.value.length > 0, () => html`
        <div class="tick-marks">
          ${each(tickCount.value, (state: string, i: number) => html`
            <div key="${String(i)}" :class="${{ tick: true, inactive: state === 'inactive' }}"></div>
          `)}
        </div>
      `)}
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
        :bind="${{ 'aria-label': props.ariaLabel || null }}"
        @input="${(e: Event) => {
          internalValue.value = Number((e.target as HTMLInputElement).value);
          emit('change', internalValue.value);
        }}"
      />
    </div>
  `;
});
