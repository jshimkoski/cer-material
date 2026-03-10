import { component, html, css, ref, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-tooltip', () => {
  const props = useProps({
    text: '',
    variant: 'plain' as 'plain' | 'rich',
    title: '',
    action: '',
  });
  const emit = useEmit();
  const visible = ref(false);
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const show = () => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    visible.value = true;
  };
  const scheduleHide = () => {
    hideTimer = setTimeout(() => { visible.value = false; }, 100);
  };
  const cancelHide = () => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  };

  useStyle(() => css`
    :host { display: inline-flex; vertical-align: middle; }

    .anchor {
      position: relative;
      display: inline-flex;
    }

    .tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 800;
      animation: tip-in 100ms ease-out;
    }
    @keyframes tip-in {
      from { opacity: 0; transform: translateX(-50%) translateY(4px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    /* ── Plain ── */
    .tooltip.plain {
      background: var(--md-sys-color-inverse-surface, #313033);
      color: var(--md-sys-color-inverse-on-surface, #F4EFF4);
      border-radius: 4px;
      padding: 4px 8px;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 12px;
      line-height: 16px;
      white-space: nowrap;
      pointer-events: none;
    }

    /* ── Rich ── */
    .tooltip.rich {
      background: var(--md-sys-color-surface-container, #F3EDF7);
      border-radius: 12px;
      padding: 12px 16px;
      min-width: 120px;
      max-width: 315px;
      box-shadow: var(--md-sys-elevation-2, 0 2px 6px rgba(0,0,0,0.15));
      pointer-events: all;
    }

    .tip-title {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      margin-bottom: 4px;
    }

    .tip-text {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 12px;
      line-height: 16px;
      /* color is inherited from .tooltip.plain (light) or set below for rich */
    }
    .tooltip.rich .tip-text {
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }

    .tip-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .tip-action-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-primary, #6750A4);
      padding: 6px 8px;
      border-radius: 4px;
      outline: none;
      position: relative;
      overflow: hidden;
    }
    .tip-action-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-primary, #6750A4);
      opacity: 0;
      transition: opacity 200ms;
    }
    .tip-action-btn:hover::before { opacity: 0.08; }
    .tip-action-btn:focus::before { opacity: 0.12; }
  `);

  return html`
    <div
      class="anchor"
      @mouseenter="${show}"
      @mouseleave="${scheduleHide}"
      @focusin="${show}"
      @focusout="${scheduleHide}"
    >
      <slot></slot>
      ${when(visible.value, () => html`
        <div
          :class="${{ tooltip: true, plain: props.variant === 'plain', rich: props.variant === 'rich' }}"
          role="tooltip"
          @mouseenter="${cancelHide}"
          @mouseleave="${scheduleHide}"
        >
          ${when(props.variant === 'rich' && !!props.title, () => html`
            <div class="tip-title">${props.title}</div>
          `)}
          ${when(!!props.text, () => html`
            <div class="tip-text">${props.text}</div>
          `)}
          ${when(props.variant === 'rich' && !!props.action, () => html`
            <div class="tip-actions">
              <button class="tip-action-btn" @click="${() => emit('action')}">${props.action}</button>
            </div>
          `)}
        </div>
      `)}
    </div>
  `;
});
