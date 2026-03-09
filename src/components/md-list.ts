import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-list-item', () => {
  const props = useProps({
    headline: '',
    supportingText: '',
    leadingIcon: '',
    trailingIcon: '',
    trailingSupportingText: '',
    disabled: false,
    selected: false,
    type: 'text' as 'text' | 'link' | 'checkbox' | 'radio',
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: block; }

    .list-item {
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 56px;
      padding: 8px 16px;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      position: relative;
      overflow: hidden;
      transition: background-color 200ms;
      color: var(--md-sys-color-on-surface, #1C1B1F);
    }
    .list-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .list-item:hover::before  { opacity: 0.08; }
    .list-item:focus::before  { opacity: 0.12; }
    .list-item:active::before { opacity: 0.12; }
    .list-item.selected::before { opacity: 0.12; background: var(--md-sys-color-primary, #6750A4); }
    .list-item.selected { color: var(--md-sys-color-primary, #6750A4); }
    .list-item.disabled { opacity: 0.38; pointer-events: none; }

    .leading-slot {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .leading-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .selected .leading-icon { color: var(--md-sys-color-primary, #6750A4); }

    .content { flex: 1; min-width: 0; }
    .headline {
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .supporting-text {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      line-height: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .trailing-slot {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .trailing-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .trailing-text {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
  `);

  return html`
    <div
      :class="${{
        'list-item': true,
        selected: props.selected,
        disabled: props.disabled,
      }}"
      role="listitem"
      tabindex="${props.disabled ? -1 : 0}"
      @click="${() => !props.disabled && emit('click')}"
    >
      ${when(!!props.leadingIcon, () => html`
        <div class="leading-slot">
          <span class="leading-icon">${props.leadingIcon}</span>
        </div>
      `)}
      ${when(!props.leadingIcon, () => html`<slot name="leading" class="leading-slot"></slot>`)}

      <div class="content">
        <div class="headline">${props.headline}<slot></slot></div>
          ${when(!!props.supportingText, () => html`
          <div class="supporting-text">${props.supportingText}</div>
        `)}
      </div>

      <div class="trailing-slot">
          ${when(!!props.trailingSupportingText, () => html`
          <span class="trailing-text">${props.trailingSupportingText}</span>
        `)}
          ${when(!!props.trailingIcon, () => html`
          <span class="trailing-icon">${props.trailingIcon}</span>
        `)}
        <slot name="trailing"></slot>
      </div>
    </div>
  `;
});
