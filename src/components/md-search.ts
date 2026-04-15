import { component, html, css, defineModel, useEmit, useProps, useStyle, useOnConnected, useExpose, getCurrentComponentContext } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-search', () => {
  const props = useProps({
    placeholder: 'Search',
    leadingIcon: 'search',
    showAvatar: false,
    autofocus: false,
  });
  const emit = useEmit();
  const modelValue = defineModel('');
  const ctx = getCurrentComponentContext() as any;
  const focusInput = () =>
    (ctx._host as HTMLElement)?.shadowRoot?.querySelector<HTMLInputElement>('input')?.focus();
  useExpose({ focus: focusInput });
  useOnConnected(() => { if (props.autofocus) focusInput(); });

  const handleClear = () => {
    modelValue.value = '';
    emit('clear');
  };

  useStyle(() => css`
    :host { display: block; }

    .search-bar {
      display: flex;
      align-items: center;
      height: 56px;
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      border-radius: 28px;
      padding: 0 16px;
      gap: 16px;
      box-shadow: var(--md-sys-elevation-1, 0 1px 2px rgba(0,0,0,0.3));
      transition: box-shadow 200ms;
    }
    .search-bar:focus-within {
      background: var(--md-sys-color-surface-container-highest, #E6E0E9);
      box-shadow: var(--md-sys-elevation-2, 0 2px 6px rgba(0,0,0,0.15));
    }

    .lead-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      flex-shrink: 0;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 16px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      outline: none;
      caret-color: var(--md-sys-color-primary, #6750A4);
      min-width: 0;
    }
    .search-input::placeholder {
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    /* Remove native search cancel button */
    .search-input::-webkit-search-cancel-button { display: none; }

    .clear-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    .clear-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transition: opacity 200ms;
    }
    .clear-btn:hover::before { opacity: 0.08; }
    .clear-btn:focus::before { opacity: 0.12; }

    .clear-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      position: relative;
      z-index: 1;
    }

    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--md-sys-color-primary-container, #EADDFF);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .avatar-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 20px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      color: var(--md-sys-color-on-primary-container, #21005D);
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }
  `);

  return html`
    <div class="search-bar" role="search">
      <span class="lead-icon" aria-hidden="true">${props.leadingIcon}</span>
      <input
        type="search"
        class="search-input"
        placeholder="${props.placeholder}"
        :model="${modelValue}"
        aria-label="${props.placeholder}"
        @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') emit('search', modelValue.value); }}"
      >
      ${when(!!modelValue.value, () => html`
        <button type="button" class="clear-btn" aria-label="Clear search" @click="${handleClear}">
          <span class="clear-icon" aria-hidden="true">close</span>
        </button>
      `)}
      ${when(props.showAvatar, () => html`
        <div class="avatar">
          <span class="avatar-icon">person</span>
        </div>
      `)}
    </div>
  `;
});
