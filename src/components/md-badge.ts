import { component, html, css, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-badge', () => {
  const props = useProps({
    value: '' as string | number,
    small: false,
  });

  useStyle(() => css`
    :host { display: inline-block; position: relative; }

    .host-wrapper { position: relative; display: inline-flex; }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--md-sys-color-error, #B3261E);
      color: var(--md-sys-color-on-error, #fff);
      border-radius: 99px;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 11px;
      font-weight: 500;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      z-index: 1;
    }
    .badge.small {
      width: 6px;
      height: 6px;
      top: -2px;
      right: -2px;
    }
    .badge.large {
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
    }
  `);

  return html`
    <div class="host-wrapper">
      <slot></slot>
      ${when(props.small || !!props.value, () => html`
        <span :class="${{ badge: true, small: props.small, large: !props.small }}">
          ${when(!props.small, () => html`${String(props.value)}`)}
        </span>
      `)}
    </div>
  `;
});
