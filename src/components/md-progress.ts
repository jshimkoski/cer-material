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
      background: var(--md-sys-color-secondary-container, #E8DEF8);
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
      100% { transform: translateX(220%) scaleX(0.5); }
    }
    .linear.indeterminate .linear-indicator {
      width: 50% !important;
      animation: linear-indeterminate 1.5s ease-in-out infinite;
      transform-origin: center left;
    }

    /* ── Circular ── */
    .circular {
      display: inline-block;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: conic-gradient(
        var(--md-sys-color-primary, #6750A4) 0deg calc(var(--_progress, 0) * 3.6deg),
        var(--md-sys-color-secondary-container, #E8DEF8) calc(var(--_progress, 0) * 3.6deg)
      );
      -webkit-mask: radial-gradient(farthest-side, transparent 83%, black 83%);
      mask: radial-gradient(farthest-side, transparent 83%, black 83%);
      transition: background 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes circular-rotate {
      to { transform: rotate(360deg); }
    }

    .circular.indeterminate {
      background: none;
      -webkit-mask: none;
      mask: none;
      border: 4px solid var(--md-sys-color-secondary-container, #E8DEF8);
      border-top-color: var(--md-sys-color-primary, #6750A4);
      box-sizing: border-box;
      animation: circular-rotate 1.4s linear infinite;
      transition: none;
    }
  `);

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
          :style="${props.indeterminate ? {} : { '--_progress': props.value }}"
        ></div>
      `,
    )}
  `;
});
