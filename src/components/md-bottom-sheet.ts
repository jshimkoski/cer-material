import { component, html, css, useProps, useEmit, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';

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
  // Set to true by the drag dismiss path so onBeforeLeave skips a redundant animation.
  let dragDismissed = false;
  // Holds the element reference between transitionend and onBeforeLeave so
  // the hook can disable the leave transition without relying on sheetEl
  // (which is nulled out at the end of onHandlePointerUp).
  let dismissedEl: HTMLElement | null = null;

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

    // Re-enable the CSS transition for snap-back.
    sheetEl.style.transition = '';

    if (shouldDismiss) {
      // Explicitly set the transition inline for the off-screen slide — the
      // CER leave classes (sheet-leave-active) haven't been applied yet at
      // this point, so clearing the inline transition above would leave no
      // active transition and the transform change would be instant.
      sheetEl.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      sheetEl.style.transform = 'translateY(100%)';
      const target = sheetEl;
      const onEnd = () => {
        target.removeEventListener('transitionend', onEnd);
        // Mark as drag-dismissed so the Transition onBeforeLeave hook skips
        // its own animation — the sheet is already off-screen at this point.
        // Do NOT clear the inline transform here; clearing it would snap the
        // sheet back to translateY(0) before the leave animation begins.
        dragDismissed = true;
        dismissedEl = target;
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
      /* Base = fully visible; opacity: 1 and pointer-events: auto are defaults */
    }
    .scrim-enter-from, .scrim-leave-to {
      opacity: 0;
      pointer-events: none;
    }
    .scrim-enter-active, .scrim-leave-active {
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
      /* Base = fully open; transform: none and pointer-events: auto are defaults */
    }
    .sheet-enter-from, .sheet-leave-to {
      transform: translateY(100%);
      pointer-events: none;
    }
    .sheet-enter-active, .sheet-leave-active {
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

  // Scrim and sheet panel are conditionally mounted via Transition so the DOM
  // is clean when closed. The drag-dismiss flag prevents a double leave animation.
  return html`
    ${Transition({
      show: props.open,
      name: 'md-scrim',
      enterFrom: 'scrim-enter-from',
      enterActive: 'scrim-enter-active',
      leaveActive: 'scrim-leave-active',
      leaveTo: 'scrim-leave-to',
    }, html`
      <div
        class="scrim"
        @click="${() => emit('close')}"
      ></div>
    `)}
    ${Transition({
      show: props.open,
      name: 'md-sheet',
      enterFrom: 'sheet-enter-from',
      enterActive: 'sheet-enter-active',
      leaveActive: 'sheet-leave-active',
      leaveTo: 'sheet-leave-to',
      onBeforeLeave: () => {
        if (dragDismissed) {
          dragDismissed = false;
          if (dismissedEl) {
            // Sheet is already at translateY(100%) from the drag animation.
            // Kill the transition so CER detects duration 0s and removes the
            // element immediately instead of waiting for a leave animation.
            dismissedEl.style.transition = 'none';
            dismissedEl = null;
          }
        }
      },
    }, html`
      <div
        class="bottom-sheet"
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
    `)}
  `;
});
