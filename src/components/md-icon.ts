import { component, html, css, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';

component('md-icon', () => {
  const props = useProps({
    icon: '',
  });

  useStyle(() => css`
    :host { display: inline-flex; align-items: center; justify-content: center; }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      display: inline-block;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `);

  return html`
    <span class="icon" aria-hidden="true">${props.icon}</span>
  `;
});
