import { component, html, css, ref, watch, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

component('md-tabs', () => {
  const props = useProps({
    variant: 'primary' as 'primary' | 'secondary',
    tabs: [] as Tab[],
    activeTab: '',
  });
  const emit = useEmit();
  const active = ref(props.activeTab || (props.tabs[0]?.id ?? ''));

  // Keep active in sync with controlled prop changes
  watch(() => props.activeTab, (v) => { if (v) active.value = v; });
  watch(() => props.tabs, (newTabs) => {
    if (!active.value && newTabs && newTabs.length > 0) {
      active.value = newTabs[0].id;
    }
  });

  const safeTabs = (): Tab[] => Array.isArray(props.tabs) ? props.tabs : [];

  useStyle(() => css`
    :host { display: block; }

    .tabs-container {
      display: flex;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
      overflow-x: auto;
      scrollbar-width: none;
      position: relative;
    }
    .tabs-container::-webkit-scrollbar { display: none; }

    .tab {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 16px;
      min-width: 80px;
      height: 48px;
      cursor: pointer;
      border: none;
      background: transparent;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      outline: none;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      flex-shrink: 0;
      transition: color 200ms;
    }
    .tab::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface-variant, #49454F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .tab:hover::before  { opacity: 0.08; }
    .tab:focus::before  { opacity: 0.12; }
    .tab:active::before { opacity: 0.12; }

    .tab.active {
      color: var(--md-sys-color-primary, #6750A4);
    }
    .tab.active::before { background: var(--md-sys-color-primary, #6750A4); }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 3px 3px 0 0;
      background: var(--md-sys-color-primary, #6750A4);
    }

    .tab-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .tab.active .tab-icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* secondary variant: smaller, no indicator height */
    .secondary .tab { height: 48px; font-size: 14px; }
    .secondary .tab-indicator { height: 2px; }

    .tab-badge {
      position: absolute;
      top: 6px;
      right: 8px;
      min-width: 16px;
      height: 16px;
      background: var(--md-sys-color-error, #B3261E);
      color: var(--md-sys-color-on-error, #fff);
      border-radius: 8px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    .content {
      padding: 16px 0;
    }
  `);

  const handleTabKeyDown = (e: KeyboardEvent, idx: number) => {
    const tabs = safeTabs();
    let newIdx = idx;
    if (e.key === 'ArrowRight') { newIdx = (idx + 1) % tabs.length; }
    else if (e.key === 'ArrowLeft') { newIdx = (idx - 1 + tabs.length) % tabs.length; }
    else if (e.key === 'Home') { newIdx = 0; }
    else if (e.key === 'End') { newIdx = tabs.length - 1; }
    else { return; }
    e.preventDefault();
    active.value = tabs[newIdx].id;
    emit('tab-change', tabs[newIdx].id);
    const container = (e.currentTarget as HTMLElement).parentElement;
    if (container) {
      const btns = container.querySelectorAll<HTMLElement>('[role="tab"]');
      btns[newIdx]?.focus();
    }
  };

  return html`
    <div>
      <div :class="${{ 'tabs-container': true, [props.variant]: true }}" role="tablist">
        ${each(
          safeTabs(),
          (tab: Tab, idx: number) => html`
            <button
              key="${tab.id}"
              :class="${{ tab: true, active: active.value === tab.id }}"
              role="tab"
              aria-selected="${String(active.value === tab.id)}"
              tabindex="${active.value === tab.id ? '0' : '-1'}"
              @click="${() => { active.value = tab.id; emit('tab-change', tab.id); }}"
              @keydown="${(e: KeyboardEvent) => handleTabKeyDown(e, idx)}"
            >
              ${when(!!tab.icon, () => html`<span class="tab-icon">${tab.icon}</span>`)}
              ${tab.label}
              ${when(active.value === tab.id, () => html`<div class="tab-indicator"></div>`)}
              ${when(!!tab.badge, () => html`<span class="tab-badge">${tab.badge}</span>`)}
            </button>
          `,
        )}
      </div>
      <div class="content" role="tabpanel">
        <slot></slot>
      </div>
    </div>
  `;
});
