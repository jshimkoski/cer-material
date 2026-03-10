import { component, html, css, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';

/**
 * md-loading-indicator
 *
 * The MD3 four-colored indeterminate circular loading indicator.
 * Distinct from md-progress (which covers determinate/indeterminate
 * single-color progress indicators).
 *
 * Props:
 *   size   — 'small' | 'medium' | 'large' (36px / 48px / 64px)
 *   ariaLabel — accessible description (default "Loading")
 */
component('md-loading-indicator', () => {
  const props = useProps({
    size: 'medium' as 'small' | 'medium' | 'large',
    ariaLabel: 'Loading',
  });

  useStyle(() => css`
    :host { display: inline-flex; align-items: center; justify-content: center; }

    .loader {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loader.small  { width: 36px;  height: 36px; }
    .loader.medium { width: 48px;  height: 48px; }
    .loader.large  { width: 64px;  height: 64px; }

    svg {
      width: 100%;
      height: 100%;
      animation: md-rotate 1.4s linear infinite;
    }

    /* Four colored arcs use stroke-dashoffset animation */
    .track {
      fill: none;
      stroke-width: 4;
      stroke-linecap: round;
    }

    .arc1 { stroke: var(--md-sys-color-primary,          #6750A4); animation: md-arc 1.4s ease-in-out infinite; }
    .arc2 { stroke: var(--md-sys-color-tertiary,         #7D5260); animation: md-arc 1.4s ease-in-out infinite -0.35s; }
    .arc3 { stroke: var(--md-sys-color-secondary,        #625B71); animation: md-arc 1.4s ease-in-out infinite -0.7s; }
    .arc4 { stroke: var(--md-sys-color-error,            #B3261E); animation: md-arc 1.4s ease-in-out infinite -1.05s; }

    @keyframes md-rotate {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Animate stroke-dashoffset to produce the arc-grow / shrink effect */
    @keyframes md-arc {
      0%   { stroke-dasharray: 1px, 200px; stroke-dashoffset:  0; }
      50%  { stroke-dasharray: 100px, 200px; stroke-dashoffset: -15px; }
      100% { stroke-dasharray: 100px, 200px; stroke-dashoffset: -125px; }
    }
  `);

  // Circle radius=20, circumference≈125.7
  // viewBox = 0 0 50 50 → centre 25,25 r=20
  return html`
    <div
      :class="${{ loader: true, [props.size]: true }}"
      role="progressbar"
      aria-label="${props.ariaLabel}"
      aria-busy="true"
    >
      <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle class="track arc1" cx="25" cy="25" r="20"
          stroke-dasharray="125" stroke-dashoffset="0" />
        <circle class="track arc2" cx="25" cy="25" r="20"
          stroke-dasharray="125" stroke-dashoffset="0" />
        <circle class="track arc3" cx="25" cy="25" r="20"
          stroke-dasharray="125" stroke-dashoffset="0" />
        <circle class="track arc4" cx="25" cy="25" r="20"
          stroke-dasharray="125" stroke-dashoffset="0" />
      </svg>
    </div>
  `;
});
