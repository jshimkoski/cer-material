import {
  component,
  html,
  css,
  useProps,
  useEmit,
  useStyle,
  ref,
  computed,
  useOnConnected,
  useOnDisconnected,
  watch,
} from '@jasonshimmy/custom-elements-runtime';

component('md-app-bar', () => {
  const props = useProps({
    variant: 'small' as 'small' | 'medium' | 'large' | 'center',
    title: '',
    leadingIcon: 'menu',
    trailingIcons: [] as string[],
  });

  const emit = useEmit();

  const collapsed = ref(false);
  const isCollapsible = computed(
    () => props.variant === 'medium' || props.variant === 'large',
  );

  // Persistent: page has been scrolled past top (scrollY > 0).
  // Drives the surface-container color fill on all variants.
  const isScrolled = ref(false);

  // Transient: user is actively scrolling right now.
  // Drives the box-shadow — it must disappear once scrolling stops,
  // so it never shows in a static collapsed/expanded state.
  const isScrolling = ref(false);
  let scrollingTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Collapse / expand state machine ──────────────────────────────────────
  //
  // Problem: the app bar is `position: sticky`. When its height changes via
  // CSS transition, the browser adjusts the sticky element's layout, which
  // changes `window.scrollY`, which fires the scroll event handler again.
  // Without a lock this creates a feedback loop that races the transition.
  //
  // Solution: one shared timer. When `collapsed` changes we start a 220ms
  // lock (CSS transition is 200ms + 20ms margin). While locked, all scroll
  // events are silently ignored. When the timer fires we read `window.scrollY`
  // as ground truth and correct the state if it drifted. If the state needs
  // correcting, we apply it and restart the timer once — a second correction
  // cycle cannot happen because `scrollY > 0` is a boolean that can only
  // differ from `collapsed` in one direction at a time.
  //
  // Using a single `animationTimer` reference (cleared on reassignment) means
  // rapid collapses never stack timers — only the most-recent one fires.

  let animationTimer: ReturnType<typeof setTimeout> | null = null;

  const startAnimationLock = () => {
    if (animationTimer !== null) clearTimeout(animationTimer);
    // 300ms covers the 250ms height transition plus a small layout-settle buffer.
    animationTimer = setTimeout(() => {
      animationTimer = null;
      const scrolled = window.scrollY > 0;
      isScrolled.value = scrolled;
      if (!isCollapsible.value) return;
      if (collapsed.value !== scrolled) {
        collapsed.value = scrolled;
        // watch fires synchronously above and calls startAnimationLock,
        // which sets the new timer. Do NOT set another timer here — that
        // would overwrite the one watch just set, creating an orphaned timer
        // that prematurely releases the lock.
      }
    }, 300);
  };

  watch(collapsed, startAnimationLock);

  const onScroll = () => {
    const scrolled = window.scrollY > 0;

    // Color fill: persistent — always reflects real scrollY.
    isScrolled.value = scrolled;

    // Shadow: transient — true only while the user is actively scrolling.
    // A debounce timer clears it ~150 ms after the last scroll event so the
    // shadow disappears once the user stops, even if the bar is still collapsed.
    // This runs unconditionally (not blocked by animationTimer) so the shadow
    // is never left on by animation-induced scroll events.
    isScrolling.value = true;
    if (scrollingTimer !== null) clearTimeout(scrollingTimer);
    scrollingTimer = setTimeout(() => {
      scrollingTimer = null;
      isScrolling.value = false;
    }, 150);

    // Collapse toggle needs the animation lock to prevent height-transition
    // re-entrancy from toggling collapsed back and forth.
    if (animationTimer !== null) return;

    const next = isCollapsible.value && scrolled;
    if (collapsed.value !== next) {
      collapsed.value = next;
      // `watch(collapsed)` fires synchronously here and calls startAnimationLock.
    }
  };

  useOnConnected(() => {
    // Sync initial state without triggering the animation lock.
    const scrolled = window.scrollY > 0;
    isScrolled.value = scrolled;
    collapsed.value = isCollapsible.value && scrolled;
    window.addEventListener('scroll', onScroll);
  });

  useOnDisconnected(() => {
    window.removeEventListener('scroll', onScroll);
    if (animationTimer !== null) clearTimeout(animationTimer);
    if (scrollingTimer !== null) clearTimeout(scrollingTimer);
  });

  const safeTrailingIcons = computed(() =>
    Array.isArray(props.trailingIcons) ? props.trailingIcons : [],
  );

  useStyle(
    () => css`
      :host {
        display: block;
      }

      /* ── Base bar ────────────────────────────────────────────────────────── */
      .app-bar {
        background: var(--md-sys-color-surface, #fffbfe);
        width: 100%;
        position: relative;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0), 0 2px 6px rgba(0, 0, 0, 0);
        transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Background fill when page is scrolled */
      .app-bar.scrolled {
        background: var(--md-sys-color-surface-container, #ece6f0);
      }
      /* Shadow while actively scrolling */
      .app-bar.scrolling {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15);
      }

      .app-bar.small,
      .app-bar.center {
        height: 64px;
        display: flex;
        align-items: center;
      }
      .app-bar.center {
        justify-content: center;
      }

      /* medium/large: flex column with animated height.
       * A 300ms JS animation lock prevents the height-transition-induced scroll
       * events from feeding back into the collapse state machine.
       * box-shadow listed here too because this selector has higher specificity
       * than .app-bar, so transition must be repeated to include both properties.
       * Heights per M3 Expressive flexible tokens:
       *   medium flexible ContainerHeight = 112dp
       *   large flexible  ContainerHeight = 120dp */
      .app-bar.medium {
        height: 112px;
        display: flex;
        flex-direction: column;
        transition: height 250ms cubic-bezier(0.2, 0, 0, 1),
                    background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
        will-change: height;
      }
      .app-bar.large {
        height: 120px;
        display: flex;
        flex-direction: column;
        transition: height 250ms cubic-bezier(0.2, 0, 0, 1),
                    background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
        will-change: height;
      }
      .app-bar.medium.collapsed,
      .app-bar.large.collapsed {
        height: 64px;
      }

      .top-row {
        height: 64px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding: 0 4px;
        box-sizing: border-box;
        width: 100%;
      }

      /* ── Inline title (inside top-row) ─────────────────────────── */
      /* Shown for small, center, and collapsed medium/large.
       * It is a flex item so it occupies exactly the space between the
       * leading button and trailing-actions — no absolute positioning,
       * no pointer-events overlap. */

      .app-bar.center .title-area-inline {
        text-align: center;
      }

      /* Hide the inline title for expanded medium/large — the block title
       * below the top-row takes over. visibility:hidden removes it from the
       * a11y tree to prevent a duplicate heading.
       * transition override: delay visibility until after opacity fades out
       * (200ms delay) so the fade-out is visible, not an instant snap. */
      .app-bar.medium:not(.collapsed) .title-area-inline,
      .app-bar.large:not(.collapsed) .title-area-inline {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
                    visibility 0s 200ms;
      }

      /* Animate the inline title fade.
       * visibility delay = 0 so it becomes visible immediately when .collapsed
       * is added, allowing the opacity to then animate from 0 → 1. */
      .title-area-inline {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        align-self: center;
        pointer-events: none;
        transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
                    visibility 0s 0ms;
      }

      /* Title Large (22sp) — used for small/center and collapsed medium/large.
       * width: 100% ensures the block fills the flex parent so that
       * overflow:hidden + text-overflow:ellipsis has a boundary to clip to. */
      .title {
        display: block;
        width: 100%;
        box-sizing: border-box;
        font-size: 22px;
        line-height: 28px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 4px;
        color: var(--md-sys-color-on-surface, #1c1b1f);
      }

      /* ── Block title (below top-row, medium/large expanded) ───────── */
      /* flex:1 fills the remaining height in the column-flex parent (.app-bar).
       * transform is GPU-composited and does not affect layout, so it never
       * perturbs scrollY. The JS animation lock absorbs the single layout-shift
       * event caused by the height transition. */
      .title-expand-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        overflow: hidden;
        transform: translateY(0);
        transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
                    transform 250ms cubic-bezier(0.2, 0, 0, 1);
      }

      /* Not needed for small/center — those variants have no block title */
      .app-bar.small .title-expand-wrapper,
      .app-bar.center .title-expand-wrapper {
        display: none;
      }

      /* Collapsed: slide title upward, fade out, and disable pointer events.
       * The upward translate creates a directional morph toward the top-row
       * position; overflow:hidden on .app-bar clips it as the height shrinks. */
      .app-bar.collapsed .title-expand-wrapper {
        opacity: 0;
        transform: translateY(-24px);
        pointer-events: none;
      }

      /* Spec padding: 16dp sides, 12dp bottom (top is against the icon row) */
      .title-area-block {
        padding: 0 16px 12px;
      }

      /* Medium flexible expanded — Headline Medium (28sp / 36sp).
       * The remaining height after the 64px top-row and 12px bottom padding
       * is exactly one line tall (36px), so single-line ellipsis is correct. */
      .title-block {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 28px;
        line-height: 36px;
        font-weight: 400;
        color: var(--md-sys-color-on-surface, #1c1b1f);
      }

      /* Large flexible expanded — Headline Large (32sp / 40sp) */
      .app-bar.large .title-block {
        font-size: 32px;
        line-height: 40px;
      }

      /* ── Icon button ─────────────────────────────────────────────── */
      .icon-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        padding: 0;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--md-sys-color-on-surface, #1c1b1f);
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
      }
      .icon-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: var(--md-sys-color-on-surface, #1c1b1f);
        opacity: 0;
        transition: opacity 200ms;
      }
      .icon-btn:hover::before {
        opacity: 0.08;
      }
      .icon-btn:focus::before {
        opacity: 0.12;
      }
      .icon-btn:active::before {
        opacity: 0.12;
      }
      /* M3 accessibility: keyboard focus ring (state layer overlay alone is
       * insufficient — an outline is required for WCAG 2.4.7). */
      .icon-btn:focus-visible {
        outline: 3px solid var(--md-sys-color-secondary, #625b71);
        outline-offset: 2px;
      }

      .nav-icon,
      .action-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 24px;
        font-weight: normal;
        font-style: normal;
        line-height: 1;
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
        user-select: none;
        pointer-events: none;
      }

      .trailing-actions {
        margin-inline-start: auto;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      /* Spec color roles: leading nav icon = on-surface,
       * trailing action icons = on-surface-variant. */
      .trailing-actions .icon-btn {
        color: var(--md-sys-color-on-surface-variant, #49454f);
      }
    `,
  );

  return html`
    <header
      :class="${{
        'app-bar': true,
        [props.variant]: true,
        collapsed: collapsed.value,
        scrolled: isScrolled.value,
        scrolling: isScrolling.value,
      }}"
    >
      <div class="top-row">
        <button
          :when="${!!props.leadingIcon}"
          type="button"
          class="icon-btn"
          aria-label="Navigation"
          @click="${() => emit('nav')}"
        >
          <span class="nav-icon" aria-hidden="true">${props.leadingIcon}</span>
        </button>

        <div class="title-area-inline">
          <span class="title" role="heading" aria-level="1">${props.title}</span>
        </div>

        <div class="trailing-actions">
          <slot name="trailing"></slot>
          ${safeTrailingIcons.value.map(
            (icon: string) => html`
              <button
                type="button"
                class="icon-btn"
                aria-label="${icon}"
                @click="${() => emit('action', icon)}"
              >
                <span class="action-icon" aria-hidden="true">${icon}</span>
              </button>
            `,
          )}
        </div>
      </div>

      <div class="title-expand-wrapper">
        <div class="title-area-block">
          <span
            class="title-block"
            role="heading"
            aria-level="1"
            :aria-hidden="${collapsed.value}"
          >${props.title}<slot name="title"></slot></span>
        </div>
      </div>
    </header>
  `;
});
