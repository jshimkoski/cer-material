import { component, html, css, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-progress', () => {
  const props = useProps({
    variant: 'linear' as 'linear' | 'circular',
    value: 0,
    indeterminate: false,
    buffer: 100,
    ariaLabel: 'Loading',
  });

  useStyle(() => css`
    :host { display: block; }

    /* ── Linear ── */
    .linear {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      overflow: hidden;
      position: relative;
    }

    .linear-buffer {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      border-radius: 2px;
      background: var(--md-sys-color-primary-container, #EADDFF);
      transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .linear-indicator {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      border-radius: 2px;
      background: var(--md-sys-color-primary, #6750A4);
      transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes linear-indeterminate {
      0%   { transform: translateX(-100%) scaleX(0.5); }
      40%  { transform: translateX(0%) scaleX(0.5); }
      60%  { transform: translateX(50%) scaleX(1); }
      100% { transform: translateX(150%) scaleX(0.5); }
    }
    .linear.indeterminate .linear-indicator {
      width: 50% !important;
      animation: linear-indeterminate 1.5s ease-in-out infinite;
      transform-origin: center left;
    }

    /* ── Circular ── */
    .circular {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .circular svg {
      transform: rotate(-90deg);
    }

    .circular circle {
      fill: none;
      stroke-width: 4;
      stroke-linecap: round;
      transition: stroke-dashoffset 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .track-circle { stroke: var(--md-sys-color-secondary-container, #E8DEF8); }
    .indicator-circle { stroke: var(--md-sys-color-primary, #6750A4); }

    @keyframes circular-indeterminate {
      0%   { stroke-dashoffset: 150; }
      50%  { stroke-dashoffset: 40; }
      100% { stroke-dashoffset: 150; }
    }
    @keyframes circular-rotate {
      100% { transform: rotate(270deg); }
    }
    .circular.indeterminate svg {
      animation: circular-rotate 1.5s linear infinite;
    }
    .circular.indeterminate .indicator-circle {
      animation: circular-indeterminate 1.5s ease-in-out infinite;
    }
  `);

  const RADIUS = 18;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashoffset = CIRCUMFERENCE - (props.value / 100) * CIRCUMFERENCE;

  return html`
    ${when(
      props.variant === 'linear',
      () => html`
        <div
          :class="${{ linear: true, indeterminate: props.indeterminate }}"
          role="progressbar"
          aria-label="${props.ariaLabel}"
          :bind="${{
            'aria-valuenow': props.indeterminate ? null : String(props.value),
            'aria-valuemin': '0',
            'aria-valuemax': '100',
          }}"
        >
          ${when(!props.indeterminate && props.buffer < 100, () => html`
            <div class="linear-buffer" :style="${{ width: `${props.buffer}%` }}"></div>
          `)}
          <div
            class="linear-indicator"
            :style="${{ width: props.indeterminate ? '50%' : `${props.value}%` }}"
          ></div>
        </div>
      `,
    )}
    ${when(
      props.variant === 'circular',
      () => html`
        <div
          :class="${{ circular: true, indeterminate: props.indeterminate }}"
          role="progressbar"
          aria-label="${props.ariaLabel}"
          :bind="${{
            'aria-valuenow': props.indeterminate ? null : String(props.value),
            'aria-valuemin': '0',
            'aria-valuemax': '100',
          }}"
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle class="track-circle" cx="24" cy="24" r="${RADIUS}" />
            <circle
              class="indicator-circle"
              cx="24"
              cy="24"
              r="${RADIUS}"
              :style="${{
                strokeDasharray: String(CIRCUMFERENCE),
                strokeDashoffset: props.indeterminate ? undefined : String(dashoffset),
              }}"
            />
          </svg>
        </div>
      `,
    )}
  `;
});
