import { component, html, css, defineModel, useProps, useEmit, useHost, useOnConnected, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-list', () => {
  const props = useProps({
    /**
     * ARIA role for the list container.
     * - `'list'`        — standard list (default)
     * - `'radiogroup'`  — use when all children are `type="radio"` list items;
     *                     satisfies the ARIA requirement that role="radio" elements
     *                     be owned by a role="radiogroup" ancestor
     */
    role: 'list' as 'list' | 'radiogroup',
  });
  const host = useHost();
  const syncListRole = () => {
    if (host && host.getAttribute('role') !== props.role) {
      host.setAttribute('role', props.role);
    }
  };
  // Custom-element constructors may not add attributes to themselves. Sync
  // immediately only after connection, and use the lifecycle hook for the
  // first render performed during element construction.
  if (host?.isConnected) syncListRole();
  useOnConnected(syncListRole);

  useStyle(() => css`
    :host { display: block; }

    .list {
      background: var(--md-sys-color-surface, #FFFBFE);
    }
  `);

  return html`
    <div class="list" :role="${host ? null : props.role}">
      <slot></slot>
    </div>
  `;
});

component('md-list-item', () => {
  const props = useProps({
    headline: '',
    supportingText: '',
    leadingIcon: '',
    trailingIcon: '',
    trailingSupportingText: '',
    disabled: false,
    selected: false,
    /**
     * Interaction type of the list item.
     * - `'text'`     — standard non-navigating item (default)
     * - `'link'`     — renders as a real `<a>` element; supports href/target,
     *                  CMD+click, middle-click, and right-click context menus
     * - `'checkbox'` — trailing checkbox; toggled by clicking the row
     * - `'radio'`    — trailing radio button; selected by clicking the row
     */
    type: 'text' as 'text' | 'link' | 'checkbox' | 'radio',
    /** href for type="link" — passed directly to the <a> element */
    href: '',
    /** anchor target for type="link", e.g. "_blank" */
    target: '',
    /** indeterminate state for type="checkbox" */
    indeterminate: false,
    /** radio group name for type="radio" */
    name: '',
    /** value emitted on change for type="radio" */
    value: '',
    /**
     * Controls vertical density of the list item.
     * - `'default'`  — MD3 standard 56 px single-line height
     * - `'dense'`    — 48 px, for navigation drawers, TOC, and secondary lists
     * - `'compact'`  — 40 px, for search results, dropdowns, and dense data lists
     */
    density: 'default' as 'default' | 'dense' | 'compact',
  });
  const emit = useEmit();
  const checked = defineModel('checked', false);
  const host = useHost();

  const handleActivate = () => {
    if (props.disabled) return;
    if (props.type === 'checkbox') {
      checked.value = !checked.value;
      emit('change', checked.value);
    } else if (props.type === 'radio') {
      if (!checked.value) {
        checked.value = true;
        emit('change', props.value);
      }
    }
    // The native click from the internal interactive element is composed and
    // reaches the custom-element host. Emitting another `click` here would
    // invoke consumer handlers twice.
  };

  const hostRole =
    props.type === 'checkbox' ? 'checkbox' :
    props.type === 'radio' ? 'radio' :
    'listitem';
  const setHostAttribute = (name: string, value: string | null) => {
    if (!host) return;
    if (value === null) host.removeAttribute(name);
    else if (host.getAttribute(name) !== value) host.setAttribute(name, value);
  };

  const syncHostSemantics = () => {
    if (!host) return;
    setHostAttribute('role', hostRole);
    setHostAttribute('tabindex', props.type === 'link' ? null : String(props.disabled ? -1 : 0));
    setHostAttribute(
      'aria-checked',
      props.type === 'checkbox'
        ? (props.indeterminate ? 'mixed' : String(checked.value))
        : props.type === 'radio'
          ? String(checked.value)
          : null,
    );
    setHostAttribute(
      'aria-disabled',
      props.type !== 'link' && props.disabled ? 'true' : null,
    );
    setHostAttribute(
      'aria-current',
      props.type === 'text' && props.selected ? 'true' : null,
    );
  };

  if (host?.isConnected) syncHostSemantics();

  useOnConnected(() => {
    if (!host) return;
    syncHostSemantics();
    const onClick = () => {
      if (props.type !== 'link') handleActivate();
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (
        props.type !== 'link' &&
        !props.disabled &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        handleActivate();
      }
    };
    host.addEventListener('click', onClick);
    host.addEventListener('keydown', onKeydown);
    return () => {
      host.removeEventListener('click', onClick);
      host.removeEventListener('keydown', onKeydown);
    };
  });

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
      /* Reset <a> defaults so the link variant looks identical to the div variant */
      text-decoration: none;
    }
    /* Density variants */
    .list-item.density-dense   { min-height: 48px; padding: 4px 16px; }
    .list-item.density-compact { min-height: 40px; padding: 4px 16px; font-size: 14px; }
    .list-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .list-item:hover::before         { opacity: 0.08; }
    .list-item:focus-visible::before { opacity: 0.12; }
    .list-item:active::before        { opacity: 0.12; }
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

    /* ── Checkbox control (visual only — row is the hit target) ── */
    .list-checkbox {
      width: 18px;
      height: 18px;
      border-radius: 2px;
      border: 2px solid var(--md-sys-color-on-surface-variant, #49454F);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 200ms, border-color 200ms;
      flex-shrink: 0;
    }
    .list-checkbox.checked,
    .list-checkbox.indeterminate {
      background: var(--md-sys-color-primary, #6750A4);
      border-color: var(--md-sys-color-primary, #6750A4);
    }
    .list-checkbox .check-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 14px;
      font-weight: 700;
      font-style: normal;
      color: var(--md-sys-color-on-primary, #fff);
      line-height: 1;
      font-variation-settings: 'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 20;
    }
    .disabled .list-checkbox { opacity: 0.38; }

    /* ── Radio control (visual only — row is the hit target) ── */
    .list-radio {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--md-sys-color-on-surface-variant, #49454F);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 200ms;
      flex-shrink: 0;
    }
    .list-radio.checked { border-color: var(--md-sys-color-primary, #6750A4); }
    .list-radio .inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--md-sys-color-primary, #6750A4);
      transform: scale(0);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .list-radio.checked .inner { transform: scale(1); }
    .disabled .list-radio { opacity: 0.38; }

    /* Visually hidden but readable by screen readers */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `);

  // Shared inner content — called during render so reactive reads are tracked.
  const renderInner = () => html`
    ${when(!!props.leadingIcon, () => html`
      <div class="leading-slot">
        <span class="leading-icon" aria-hidden="true">${props.leadingIcon}</span>
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
      ${when(props.type !== 'checkbox' && props.type !== 'radio', () => html`
        ${when(!!props.trailingSupportingText, () => html`
          <span class="trailing-text">${props.trailingSupportingText}</span>
        `)}
        ${when(!!props.trailingIcon, () => html`
          <span class="trailing-icon" aria-hidden="true">${props.trailingIcon}</span>
        `)}
        ${when(props.type === 'link' && props.target === '_blank', () => html`
          <span class="sr-only">(opens in new tab)</span>
        `)}
        <slot name="trailing"></slot>
      `)}
      ${when(props.type === 'checkbox', () => html`
        <div :class="${{
          'list-checkbox': true,
          checked: checked.value,
          indeterminate: props.indeterminate,
        }}" aria-hidden="true">
          ${when(checked.value || props.indeterminate, () => html`
            <span class="check-icon">${props.indeterminate ? 'remove' : 'check'}</span>
          `)}
        </div>
      `)}
      ${when(props.type === 'radio', () => html`
        <div :class="${{ 'list-radio': true, checked: checked.value }}" aria-hidden="true">
          <div class="inner"></div>
        </div>
      `)}
    </div>
  `;

  const classObj = {
    'list-item': true,
    selected: props.selected,
    disabled: props.disabled,
    'density-dense': props.density === 'dense',
    'density-compact': props.density === 'compact',
  };

  // type="link" renders as a true <a> element so that CMD+click, middle-click,
  // and the browser's right-click context menu ("Open in new tab" etc.) all work
  // natively.
  //
  // Disabled links keep their href so that role="link" is preserved and screen
  // readers in browse mode can discover the item and read aria-disabled="true".
  // Navigation is blocked by calling preventDefault() in the click handler and
  // pointer-events:none in CSS. tabindex="-1" removes them from the Tab order.
  if (props.type === 'link') {
    return html`
      <div :role="${host ? null : 'listitem'}">
        <a
          :class="${classObj}"
          :href="${props.href || null}"
          :target="${props.target || null}"
          :rel="${props.target === '_blank' ? 'noopener noreferrer' : null}"
          :aria-disabled="${props.disabled ? 'true' : null}"
          :aria-current="${props.selected ? 'page' : null}"
          tabindex="${props.disabled ? -1 : 0}"
          @click="${(e: MouseEvent) => { if (props.disabled) e.preventDefault(); }}"
        >
          ${renderInner()}
        </a>
      </div>
    `;
  }

  return html`
    <div
      :class="${classObj}"
      :role="${host ? null :
        props.type === 'checkbox' ? 'checkbox' :
        props.type === 'radio'    ? 'radio'    :
        'listitem'
      }"
      :aria-checked="${host ? null :
        props.type === 'checkbox'
          ? (props.indeterminate ? 'mixed' : String(checked.value))
          : props.type === 'radio'
            ? String(checked.value)
            : null
      }"
      :aria-disabled="${host ? null :
        (props.type === 'checkbox' || props.type === 'radio') && props.disabled
          ? 'true'
          : null
      }"
      :aria-current="${host ? null : props.type === 'text' && props.selected ? 'true' : null}"
      :tabindex="${host ? null : props.disabled ? -1 : 0}"
    >
      ${renderInner()}
    </div>
  `;
}, { hydrate: 'visible' });
