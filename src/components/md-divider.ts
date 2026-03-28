import { component, html, css, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';

component('md-divider', () => {
  const props = useProps({
    inset: false,
    insetStart: false,
    insetEnd: false,
    vertical: false,
  });

  useStyle(() => css`
    :host { display: block; }

    .divider {
      background: var(--md-sys-color-outline-variant, #CAC4D0);
    }
    .horizontal {
      height: 1px;
    }
    .vertical {
      width: 1px;
      height: 100%;
      align-self: stretch;
    }
    .inset        { margin-left: 16px; margin-right: 16px; }
    .inset-start  { margin-left: 16px; }
    .inset-end    { margin-right: 16px; }
    .vertical.inset { margin-top: 8px; margin-bottom: 8px; }
  `);

  return html`<div :class="${{
    divider: true,
    vertical: props.vertical,
    horizontal: !props.vertical,
    inset: props.inset,
    'inset-start': props.insetStart,
    'inset-end': props.insetEnd,
  }}" role="separator" :bind="${{ 'aria-orientation': props.vertical ? 'vertical' : null }}"></div>`;
});
