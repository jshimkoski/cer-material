import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-bottom-sheet', () => {
  const props = useProps({
    open: false,
    headline: '',
    showHandle: true,
  });
  const emit = useEmit();

  // ── Drag-to-dismiss (plain mutable state — no re-renders needed) ──────
  let sheetEl: HTMLElement | null = null;
  let dragStartY = 0;
  let dragStartTime = 0;
  let isDragging = false;

  // Thresholds per MD3 spec guidance:
  // dismiss if dragged more than 40% of sheet height, or flicked fast.
  const DISMISS_RATIO    = 0.4;   // fraction of sheet height
  const DISMISS_VELOCITY = 500;   // px / s

  function onHandlePointerDown(e: PointerEvent) {
    if (!props.open) return;
    const handle = e.currentTarget as HTMLElement;
    // .drag-handle is a direct child of .bottom-sheet, so closest() finds it immediately.
    sheetEl = handle.closest('.bottom-sheet') as HTMLElement | null;
    if (!sheetEl) return;

    isDragging    = true;
    dragStartY    = e.clientY;
    dragStartTime = performance.now();

    // Disable the CSS transition while the finger is down so the sheet
    // tracks the pointer with zero lag.
    sheetEl.style.transition = 'none';
    // Route all subsequent pointer events to this element (works across
    // shadow-DOM boundary and when the pointer leaves the handle bounds).
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onHandlePointerMove(e: PointerEvent) {
    if (!isDragging || !sheetEl) return;
    // Only allow downward translation (clamp negative deltas to 0).
    const delta = Math.max(0, e.clientY - dragStartY);
    sheetEl.style.transform = `translateY(${delta}px)`;
  }

  function onHandlePointerUp(e: PointerEvent) {
    if (!isDragging || !sheetEl) return;
    isDragging = false;

    const delta    = Math.max(0, e.clientY - dragStartY);
    const elapsed  = (performance.now() - dragStartTime) / 1000; // seconds
    const velocity = elapsed > 0 ? delta / elapsed : 0;

    const shouldDismiss =
      delta    > sheetEl.offsetHeight * DISMISS_RATIO ||
      velocity > DISMISS_VELOCITY;

    // Re-enable the CSS transition for the snap-back or dismiss animation.
    sheetEl.style.transition = '';

    if (shouldDismiss) {
      // Animate off-screen, then tell the parent to set open=false.
      sheetEl.style.transform = 'translateY(100%)';
      const target = sheetEl;
      const onEnd = () => {
        target.removeEventListener('transitionend', onEnd);
        // Reset inline transform so the CSS class-driven state takes over cleanly.
        target.style.transform = '';
        emit('close');
      };
      target.addEventListener('transitionend', onEnd);
    } else {
      // Snap back to fully open.
      sheetEl.style.transform = '';
    }
    sheetEl = null;
  }

  useStyle(() => css`
    :host { display: contents; }

    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
      z-index: 700;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transition: opacity 250ms ease-out, visibility 0s linear 250ms;
    }
    .scrim.open {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transition: opacity 250ms ease-out;
    }

    .bottom-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 90vh;
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      border-radius: 28px 28px 0 0;
      z-index: 701;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(100%);
      pointer-events: none;
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bottom-sheet.open {
      transform: translateY(0);
      pointer-events: auto;
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .drag-handle {
      display: flex;
      justify-content: center;
      align-items: center;
      /* 48px minimum touch target (MD3 spec). Pill is vertically centred inside. */
      min-height: 48px;
      flex-shrink: 0;
      cursor: grab;
      /* Prevent the browser from hijacking the vertical gesture as a page scroll. */
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }
    .drag-handle:active { cursor: grabbing; }
    .drag-handle-bar {
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background: var(--md-sys-color-on-surface-variant, #49454F);
      opacity: 0.4;
      /* Slightly scale up on active for tactile feedback. */
      transition: transform 100ms ease, opacity 100ms ease;
    }
    .drag-handle:active .drag-handle-bar {
      transform: scaleX(1.15);
      opacity: 0.6;
    }

    .sheet-header {
      padding: 16px 24px 8px;
      flex-shrink: 0;
    }
    .sheet-headline {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 24px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      margin: 0;
    }

    .sheet-content {
      overflow-y: auto;
      padding: 8px 24px 24px;
      flex: 1;
    }
  `);

  // Sheet is always in the DOM; .open class drives CSS enter/exit transitions.
  return html`
    <div
      :class="${{ scrim: true, open: props.open }}"
      @click="${() => emit('close')}"
    ></div>
    <div
      :class="${{ 'bottom-sheet': true, open: props.open }}"
      role="dialog"
      aria-modal="true"
    >
      ${when(props.showHandle, () => html`
        <div
          class="drag-handle"
          role="button"
          aria-label="Drag down to dismiss"
          tabindex="0"
          @pointerdown="${onHandlePointerDown}"
          @pointermove="${onHandlePointerMove}"
          @pointerup="${onHandlePointerUp}"
          @pointercancel="${onHandlePointerUp}"
          @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit('close'); } }}"
        >
          <div class="drag-handle-bar"></div>
        </div>
      `)}
      ${when(!!props.headline, () => html`
        <div class="sheet-header">
          <h2 class="sheet-headline">${props.headline}</h2>
        </div>
      `)}
      <div class="sheet-content">
        <slot></slot>
      </div>
    </div>
  `;
});
