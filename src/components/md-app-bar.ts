import { component, html, css, useProps, useEmit, useStyle, useOnConnected, useOnDisconnected, watch } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-app-bar', () => {
  const props = useProps({
    variant: 'small' as 'small' | 'medium' | 'large' | 'center',
    title: '',
    leadingIcon: 'menu',
    trailingIcons: [] as string[],
  });
  const emit = useEmit();

  useStyle(() => css`
    :host { display: block; }

    /* ── Base bar ────────────────────────────────────────────────── */
    .app-bar {
      background: var(--md-sys-color-surface, #FFFBFE);
      width: 100%;
      overflow: hidden;
      position: relative;
      isolation: isolate;
      transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Elevation lift on scroll (all variants) ─────────────────── */
    /* The background colour change uses a ::before overlay animated
     * via opacity rather than background-color. Opacity is GPU-
     * composited (no repaint) so it cannot flicker alongside the
     * simultaneous height transition on medium/large variants.
     * isolation: isolate on .app-bar keeps z-index: -1 contained.  */
    .app-bar::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--md-sys-color-surface-container, #ECE6F0);
      opacity: 0;
      will-change: opacity;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      z-index: -1;
    }
    :host([data-scrolled]) .app-bar::before { opacity: 1; }

    :host([data-scrolled]) .app-bar {
      box-shadow: 0 1px 2px 0 rgba(0,0,0,.3),
                  0 2px 6px 2px rgba(0,0,0,.15);
    }

    /* ── Small / Center ──────────────────────────────────────────── */
    .small, .center {
      height: 64px;
      display: flex;
      align-items: center;
    }

    /* Center-aligned: title is absolutely centered across the full bar
     * width regardless of leading/trailing icon widths.               */
    .center { position: relative; }
    .center .title-area {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    /* ── Medium (112 → 64 px) / Large (152 → 64 px) ─────────────── */
    /* No height transition — height is a layout property that forces
     * a full document reflow on every frame, which is the root cause
     * of scroll jitter. Height snaps instantly instead; the visual
     * change is imperceptible because the expanded title layer
     * simultaneously fades + slides out via compositor-only properties
     * (opacity + transform), masking the snap.
     * By the time collapse fires the content has already scrolled
     * collapseAt px, so the instant height reduction causes no
     * visible layout jump.                                            */
    .medium {
      height: 112px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .large {
      height: 152px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Instant snap — no transition on height */
    :host([data-collapsed]) .medium,
    :host([data-collapsed]) .large {
      height: 64px;
    }

    /* ── Top row: always 64 px ───────────────────────────────────── */
    .top-row {
      height: 64px;
      min-height: 64px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 0 4px;
      width: 100%;
      box-sizing: border-box;
    }

    /* ── Small / center title area ───────────────────────────────── */
    .title-area { flex: 1; min-width: 0; overflow: hidden; }

    /* ── Collapsed title (medium / large top row) ────────────────── */
    /* Invisible by default; fades in when scrolled.
     * will-change promotes this to a GPU layer so opacity animation
     * never triggers a repaint.                                      */
    .collapsed-title-area {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      opacity: 0;
      will-change: opacity;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host([data-collapsed]) .collapsed-title-area { opacity: 1; }

    /* ── Expanded title layer ─────────────────────────────────────
     * Slides up and fades out using only compositor-friendly
     * properties (transform + opacity). Neither triggers reflow or
     * repaint so they cannot cause jitter even during slow scrolling.
     * will-change ensures the GPU layer is ready before the first
     * scroll event arrives.                                          */
    .expanded-title-layer {
      position: absolute;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      pointer-events: none;
      opacity: 1;
      transform: translateY(0);
      will-change: transform, opacity;
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  opacity   150ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host([data-collapsed]) .expanded-title-layer {
      transform: translateY(-100%);
      opacity: 0;
    }

    /* Title pinned to the bottom of the bar. */
    .expanded-title {
      position: absolute;
      left: 16px;
      right: 16px;
      /* Large: 88 px area; 36 px line-height; 28 px bottom → 24 px above */
      bottom: 28px;
      font-size: 28px;
      line-height: 36px;
      font-family: var(--md-sys-typescale-headline-medium-font, var(--md-sys-typescale-font, 'Roboto'), sans-serif);
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
    /* Medium: 48 px area; 32 px line-height; 8 px bottom → 8 px above */
    .medium .expanded-title {
      bottom: 8px;
      font-size: 24px;
      line-height: 32px;
      font-family: var(--md-sys-typescale-headline-small-font, var(--md-sys-typescale-font, 'Roboto'), sans-serif);
    }

    /* ── Collapsed / small title text ────────────────────────────── */
    .title {
      font-family: var(--md-sys-typescale-title-large-font, var(--md-sys-typescale-font, 'Roboto'), sans-serif);
      font-size: 22px;
      line-height: 28px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      padding: 0 4px;
    }

    /* ── Icon button ─────────────────────────────────────────────── */
    .icon-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      outline: none;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    .icon-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--md-sys-color-on-surface, #1C1B1F);
      opacity: 0;
      transition: opacity 200ms;
    }
    .icon-btn:hover::before  { opacity: 0.08; }
    .icon-btn:focus::before  { opacity: 0.12; }
    .icon-btn:active::before { opacity: 0.12; }

    .nav-icon, .action-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      user-select: none;
    }

    .trailing-actions {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
  `);

  /* ── Scroll behaviour ────────────────────────────────────────────────
   *
   * This component uses two state axes:
   * - data-scrolled: true when content is under the bar (scrollY > 0)
   * - data-collapsed: true when medium/large app bars have passed their collapse threshold
   */
  let isScrolledState = false;
  let isCollapsedState = false;
  let hostElement: HTMLElement | null = null;

  const collapseAt = (): number => {
    const variant = props.variant || 'small';
    return variant === 'large' ? 88 : variant === 'medium' ? 48 : 0;
  };

  const isVariantCollapsible = (): boolean => props.variant === 'medium' || props.variant === 'large';

  const shouldScroll = (): boolean => window.scrollY > 0;

  const shouldCollapse = (): boolean => isVariantCollapsible() && window.scrollY > collapseAt();

  const syncScrollState = (host: HTMLElement): void => {
    const scrolled = shouldScroll();
    const collapsed = shouldCollapse();

    if (scrolled !== isScrolledState) {
      isScrolledState = scrolled;
      if (scrolled) host.setAttribute('data-scrolled', '');
      else host.removeAttribute('data-scrolled');
    }

    if (collapsed !== isCollapsedState) {
      isCollapsedState = collapsed;
      if (collapsed) host.setAttribute('data-collapsed', '');
      else host.removeAttribute('data-collapsed');
    }
  };

  useOnConnected(((context: any) => {
    const host = context._host as HTMLElement;
    if (!host) return;
    hostElement = host;

    let rafId: number | null = null;

    // Runs once per animation frame (after layout is settled) so that
    // reading scrollY never forces a synchronous reflow mid-transition.
    const update = (): void => {
      rafId = null;
      syncScrollState(host);
    };

    const onScroll = (): void => {
      if (rafId === null) rafId = requestAnimationFrame(update);
    };

    // Sync immediately in case page loaded mid-scroll.
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    context.__mdAppBarCleanup = (): void => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    };
  }) as unknown as () => void);

  watch(() => props.variant, () => { if (hostElement) syncScrollState(hostElement); });

  useOnDisconnected(((context: any) => {
    context.__mdAppBarCleanup?.();
    context.__mdAppBarCleanup = null;
    hostElement = null;
  }) as unknown as () => void);

  /* ── Template ─────────────────────────────────────────────────────── */
  const isColumn = props.variant === 'medium' || props.variant === 'large';
  const safeTrailingIcons = Array.isArray(props.trailingIcons) ? props.trailingIcons : [];

  return html`
    <header :class="${{ 'app-bar': true, [props.variant]: true }}">

      <div class="top-row">

        ${when(!!props.leadingIcon, () => html`
          <button type="button" class="icon-btn" aria-label="Navigation" @click="${() => emit('nav')}">
            <span class="nav-icon" aria-hidden="true">${props.leadingIcon}</span>
          </button>
        `)}

        ${when(!isColumn, () => html`
          <div class="title-area">
            <span class="title">${props.title}<slot name="title"></slot></span>
          </div>
        `)}

        ${when(isColumn, () => html`
          <div class="collapsed-title-area" aria-hidden="true">
            <span class="title">${props.title}</span>
          </div>
        `)}

        <div class="trailing-actions">
          <slot name="trailing"></slot>
          ${safeTrailingIcons.map((icon: string) => html`
            <button type="button" class="icon-btn" aria-label="${icon}" @click="${() => emit('action', icon)}">
              <span class="action-icon" aria-hidden="true">${icon}</span>
            </button>
          `)}
        </div>

      </div>

      ${when(isColumn, () => html`
        <div class="expanded-title-layer">
          <span class="expanded-title">${props.title}<slot name="title"></slot></span>
        </div>
      `)}

    </header>
  `;
});
