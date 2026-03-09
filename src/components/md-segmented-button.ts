import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';
import { useListKeyNav } from '../composables/useListKeyNav';

interface Segment {
  id: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
}

component('md-segmented-button', () => {
  const props = useProps({
    segments: [] as Segment[],
    selected: '' as string | string[],
    multiselect: false,
  });
  const emit = useEmit();

  const handleKeyDown = useListKeyNav({
    orientation: 'horizontal',
    itemSelector: 'button:not([disabled])',
    onNavigate: (item) => {
      // For single-select (radio), arrow keys both move focus and activate the item.
      if (!props.multiselect) item.click();
    },
  });

  const isSelected = (id: string): boolean => {
    if (Array.isArray(props.selected)) return props.selected.includes(id);
    return props.selected === id;
  };

  const handleClick = (id: string) => {
    if (props.multiselect) {
      const current = Array.isArray(props.selected)
        ? [...props.selected]
        : props.selected ? [props.selected as string] : [];
      const idx = current.indexOf(id);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(id);
      emit('change', current);
    } else {
      emit('change', id);
    }
  };

  useStyle(() => css`
    :host { display: inline-flex; }

    .segmented-btn-group {
      display: inline-flex;
      height: 40px;
      border: 1px solid var(--md-sys-color-outline, #79747E);
      border-radius: 20px;
      overflow: hidden;
    }

    .segment {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 48px;
      padding: 0 16px;
      border: none;
      border-right: 1px solid var(--md-sys-color-outline, #79747E);
      background: transparent;
      cursor: pointer;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      outline: none;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
    }
    .segment:last-child { border-right: none; }
    .segment:disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }

    .segment::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .segment:hover::before  { opacity: 0.08; }
    .segment:focus::before  { opacity: 0.12; }
    .segment:active::before { opacity: 0.16; }

    .segment.selected {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #1D192B);
    }
    .segment.selected::before {
      background: var(--md-sys-color-on-secondary-container, #1D192B);
    }

    .seg-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      position: relative;
      z-index: 1;
    }
    .segment.selected .seg-icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    .check-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      position: relative;
      z-index: 1;
    }

    .seg-label {
      position: relative;
      z-index: 1;
    }
  `);

  return html`
    <div class="segmented-btn-group" role="group" @keydown="${handleKeyDown}">
      ${each(
        Array.isArray(props.segments) ? props.segments : [],
        (seg: Segment) => html`
          <button
            key="${seg.id}"
            :class="${{ segment: true, selected: isSelected(seg.id) }}"
            :disabled="${seg.disabled || false}"
            role="${props.multiselect ? 'checkbox' : 'radio'}"
            aria-checked="${String(isSelected(seg.id))}"
            @click="${() => { if (!seg.disabled) handleClick(seg.id); }}"
          >
            ${when(isSelected(seg.id), () => html`<span class="check-icon">check</span>`)}
            ${when(!isSelected(seg.id) && !!seg.icon, () => html`<span class="seg-icon">${seg.icon}</span>`)}
            ${when(!!seg.label, () => html`<span class="seg-label">${seg.label}</span>`)}
          </button>
        `,
      )}
    </div>
  `;
});
