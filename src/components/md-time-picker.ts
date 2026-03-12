import { component, html, css, ref, watch, computed, defineModel, useProps, useEmit, useStyle, useOnDisconnected } from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { createFocusTrap } from '../composables/useFocusTrap';
import { useScrollLock } from '../composables/useScrollLock';

// ── helpers ────────────────────────────────────────────────────────────────

/** Parse "HH:MM" → {hours, minutes}. Returns null on failure. */
function parseTime(value: string): { hours: number; minutes: number } | null {
  if (!value) return null;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { hours: h, minutes: min };
}

function pad2(n: number): string { return String(n).padStart(2, '0'); }

/**
 * Convert polar angle (0 = top, clockwise) to {x, y} coordinates on a circle
 * of given radius, centred at cx/cy.
 */
function polarToCartesian(
  cx: number, cy: number, r: number, angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── constants ──────────────────────────────────────────────────────────────
const DIAL_SIZE   = 256;  // px  (MD3 spec: 256dp clock dial container)
const DIAL_CENTER = DIAL_SIZE / 2;
const DIAL_RADIUS = 100;  // radius of number ring

// ── component ──────────────────────────────────────────────────────────────
component('md-time-picker', () => {
  const props = useProps({
    /** 'dial' | 'input' */
    variant: 'dial' as 'dial' | 'input',
    /** 12 or 24-hour format */
    hour24: false,
    ariaLabel: 'Time picker',
  });
  const emit = useEmit();
  const modelValue = defineModel('');
  const open = defineModel('open', false);

  // ── internal state ────────────────────────────────────────────────────
  const parsed = computed(() => parseTime(modelValue.value));

  // Local mutable copies
  const hours   = ref(parsed.value?.hours   ?? 12);
  const minutes = ref(parsed.value?.minutes ?? 0);
  const period  = ref<'AM' | 'PM'>(
    (parsed.value?.hours ?? 12) < 12 ? 'AM' : 'PM'
  );

  // Which part of the dial we're editing: 'hours' | 'minutes'
  const dialMode = ref<'hours' | 'minutes'>('hours');

  // Input-mode typed strings
  const inputH = ref(pad2(hours.value));
  const inputM = ref(pad2(minutes.value));

  // Sync when prop changes externally
  watch(() => modelValue.value, (v) => {
    const p = parseTime(v);
    if (p) {
      hours.value   = p.hours;
      minutes.value = p.minutes;
      period.value  = p.hours < 12 ? 'AM' : 'PM';
      inputH.value  = pad2(p.hours);
      inputM.value  = pad2(p.minutes);
    }
  });

  // ── keyboard / dial interaction ───────────────────────────────────────
  /**
   * Given a mouse/touch clientX/Y over the dial SVG, map to the nearest
   * hour (1-12 or 0-23) or minute (0-55 in steps of 5).
   */
  const dialDragging = ref(false);

  const hitTestDial = (e: MouseEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - DIAL_CENTER;
    const y = e.clientY - rect.top  - DIAL_CENTER;
    // angle in degrees, 0 at top, clockwise
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    if (dialMode.value === 'hours') {
      const total = props.hour24 ? 24 : 12;
      const step  = 360 / total;
      let val = Math.round(angle / step) % total;
      if (!props.hour24 && val === 0) val = 12;
      if (props.hour24 && period.value === 'PM' && val < 12) val += 12;
      hours.value = val;
    } else {
      const step = 360 / 60;
      const val = Math.round(angle / step) % 60;
      minutes.value = val;
    }
  };

  const onDialPointerDown = (e: PointerEvent) => {
    dialDragging.value = true;
    hitTestDial(e as unknown as MouseEvent, e.currentTarget as HTMLElement);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDialPointerMove = (e: PointerEvent) => {
    if (!dialDragging.value) return;
    hitTestDial(e as unknown as MouseEvent, e.currentTarget as HTMLElement);
  };
  const onDialPointerUp = (_e: PointerEvent) => {
    dialDragging.value = false;
    // After setting hours, auto-switch to minutes
    if (dialMode.value === 'hours') dialMode.value = 'minutes';
  };

  // ── computed display values ───────────────────────────────────────────
  const displayHours = computed(() => {
    if (props.hour24) return pad2(hours.value);
    const h = hours.value % 12 || 12;
    return pad2(h);
  });

  const dialAngle = computed(() => {
    if (dialMode.value === 'hours') {
      const total = props.hour24 ? 24 : 12;
      const h = props.hour24 ? hours.value : (hours.value % 12 || 12);
      return (h / total) * 360;
    }
    return (minutes.value / 60) * 360;
  });

  // Dial numbers to render
  const dialNumbers = computed(() => {
    if (dialMode.value === 'hours') {
      const count = props.hour24 ? 24 : 12;
      return Array.from({ length: count }, (_, i) => {
        const n = props.hour24 ? i : (i === 0 ? 12 : i);
        const angle = (n / count) * 360;
        const pos = polarToCartesian(DIAL_CENTER, DIAL_CENTER, DIAL_RADIUS, angle);
        const isSelected = hours.value === (props.hour24 ? i : n);
        return { key: String(n), n, pos, isSelected };
      });
    } else {
      // minutes: show 0 5 10 … 55
      return Array.from({ length: 12 }, (_, i) => {
        const n = i * 5;
        const angle = (n / 60) * 360;
        const pos = polarToCartesian(DIAL_CENTER, DIAL_CENTER, DIAL_RADIUS, angle);
        const isSelected = minutes.value === n;
        return { key: String(n), n, pos, isSelected };
      });
    }
  });

  // Hand end position (kept for potential future use)
  // const handEnd = computed(() => {
  //   return polarToCartesian(DIAL_CENTER, DIAL_CENTER, DIAL_RADIUS, dialAngle.value);
  // });

  // ── input validation ──────────────────────────────────────────────────
  const hoursError = computed(() => {
    const h = parseInt(inputH.value, 10);
    return isNaN(h) || (props.hour24 ? h < 0 || h > 23 : h < 1 || h > 12);
  });
  const minutesError = computed(() => {
    const m = parseInt(inputM.value, 10);
    return isNaN(m) || m < 0 || m > 59;
  });

  // ── input mode handlers ───────────────────────────────────────────────
  const commitInputH = () => {
    const h = parseInt(inputH.value, 10);
    if (!isNaN(h)) hours.value = Math.max(props.hour24 ? 0 : 1, Math.min(props.hour24 ? 23 : 12, h));
    inputH.value = pad2(hours.value);
  };
  const commitInputM = () => {
    const m = parseInt(inputM.value, 10);
    if (!isNaN(m)) minutes.value = Math.max(0, Math.min(59, m));
    inputM.value = pad2(minutes.value);
  };

  // ── confirm / cancel ──────────────────────────────────────────────────
  const handleOK = () => {
    if (currentVariant.value === 'input') { commitInputH(); commitInputM(); }
    let h = hours.value;
    if (!props.hour24) {
      if (period.value === 'AM' && h === 12) h = 0;
      if (period.value === 'PM' && h !== 12) h = h + 12;
    }
    emit('change', `${pad2(h)}:${pad2(minutes.value)}`);
    modelValue.value = `${pad2(h)}:${pad2(minutes.value)}`;
    emit('close');
    open.value = false;
  };

  // ── focus/scroll management ───────────────────────────────────────────
  useEscapeKey(() => open.value, () => { emit('close'); open.value = false; })();
  const trap = createFocusTrap();
  useOnDisconnected(() => trap.cleanup());
  const scrollLock = useScrollLock();

  // ── styles ────────────────────────────────────────────────────────────
  useStyle(() => css`
    :host { display: contents; }

    /* ── Scrim ── */
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.32);
      z-index: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .scrim-enter-from { opacity: 0; }
    .scrim-enter-from .picker { transform: scale(0.92); opacity: 0; }
    .scrim-enter-active { transition: opacity 200ms cubic-bezier(0.4,0,0.2,1); }
    .scrim-enter-active .picker { transition: opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1); }
    .scrim-leave-to { opacity: 0; pointer-events: none; }
    .scrim-leave-to .picker { transform: scale(0.92); opacity: 0; }
    .scrim-leave-active { transition: opacity 200ms cubic-bezier(0.4,0,0.2,1); }
    .scrim-leave-active .picker { transition: opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1); }

    /* ── Picker container ── */
    .picker {
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      border-radius: 28px;
      width: 328px;
      max-width: calc(100vw - 48px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--md-sys-elevation-3, 0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.3));
    }

    /* ── Headline ── */
    .picker-headline {
      padding: 24px 24px 20px;
    }
    .picker-headline-label {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 12px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      margin: 0 0 16px;
    }

    /* ── Time selector row ── */
    .time-selector {
      display: flex;
      align-items: center;
      gap: 0;
    }
    .time-seg-btn {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 57px;
      font-weight: 400;
      padding: 0 8px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      background: transparent;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      line-height: 1;
      outline: none;
      min-width: 96px;
      text-align: center;
      transition: background 200ms;
    }
    .time-seg-btn:hover {
      background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent);
    }
    .time-seg-btn.active {
      background: var(--md-sys-color-primary-container, #EADDFF);
      color: var(--md-sys-color-on-primary-container, #21005D);
    }
    .time-seg-btn:focus-visible { outline: 2px solid var(--md-sys-color-primary, #6750A4); }
    .time-separator {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 57px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      padding: 0 4px;
      line-height: 1;
      user-select: none;
    }

    /* ── Period (AM/PM) ── */
    .period-container {
      display: flex;
      flex-direction: column;
      margin-left: 12px;
      border: 1px solid var(--md-sys-color-outline, #79747E);
      border-radius: 8px;
      overflow: hidden;
      height: 80px;
    }
    .period-btn {
      flex: 1;
      border: none;
      background: transparent;
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      cursor: pointer;
      padding: 0 12px;
      outline: none;
      transition: background 200ms;
    }
    .period-btn:hover {
      background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent);
    }
    .period-btn.active {
      background: var(--md-sys-color-tertiary-container, #FFD8E4);
      color: var(--md-sys-color-on-tertiary-container, #31111D);
    }
    .period-btn:focus-visible { outline: 2px solid var(--md-sys-color-primary, #6750A4); }
    .period-divider {
      height: 1px;
      background: var(--md-sys-color-outline, #79747E);
    }

    /* ── Dial ── */
    .dial-wrapper {
      padding: 0 24px 20px;
      display: flex;
      justify-content: center;
    }
    .dial-ring {
      position: relative;
      width: ${DIAL_SIZE}px;
      height: ${DIAL_SIZE}px;
      border-radius: 50%;
      background: var(--md-sys-color-surface-container-highest, #E6E0E9);
      cursor: pointer;
      touch-action: none;
      flex-shrink: 0;
    }
    .dial-hand-pivot {
      position: absolute;
      width: 0;
      height: 0;
      top: 50%;
      left: 50%;
      transform-origin: 0 0;
      pointer-events: none;
    }
    .dial-hand-bar {
      position: absolute;
      width: 2px;
      background: var(--md-sys-color-primary, #6750A4);
      height: ${DIAL_RADIUS}px;
      top: ${-DIAL_RADIUS}px;
      left: -1px;
    }
    .dial-handle-circle {
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--md-sys-color-primary, #6750A4);
      top: ${-(DIAL_RADIUS + 24)}px;
      left: -24px;
    }
    .dial-center-dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--md-sys-color-primary, #6750A4);
      top: calc(50% - 4px);
      left: calc(50% - 4px);
      pointer-events: none;
    }
    .dial-label {
      position: absolute;
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 13px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      user-select: none;
      border-radius: 50%;
    }
    .dial-label.active {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }

    /* ── Input mode fields ── */
    .input-fields {
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 4px;
      margin-bottom: 16px;
    }
    .input-field-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .input-field {
      width: 96px;
      height: 72px;
      border-radius: 8px;
      border: none;
      background: var(--md-sys-color-surface-container-highest, #E6E0E9);
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 45px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      text-align: center;
      outline: none;
      caret-color: var(--md-sys-color-primary, #6750A4);
    }
    .input-field:focus { box-shadow: 0 0 0 2px var(--md-sys-color-primary, #6750A4); }
    .input-field.error {
      box-shadow: 0 0 0 2px var(--md-sys-color-error, #B3261E);
      color: var(--md-sys-color-error, #B3261E);
    }
    .input-field.error:focus { box-shadow: 0 0 0 2px var(--md-sys-color-error, #B3261E); }
    .input-error-text {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 11px;
      color: var(--md-sys-color-error, #B3261E);
      display: none;
      margin-top: 2px;
      white-space: nowrap;
    }
    .input-error-text.show { display: block; }
    .input-field-label {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .input-colon {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 45px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      padding: 0 4px;
      user-select: none;
    }

    /* ── Mode toggle icon ── */
    .mode-row {
      display: flex;
      justify-content: flex-start;
      padding: 0 12px 8px;
    }
    .mode-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      padding: 0;
      outline: none;
    }
    .mode-btn:hover { background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent); }
    .mode-btn:focus-visible { outline: 2px solid var(--md-sys-color-primary, #6750A4); }
    .mode-btn-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 20px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20;
    }

    /* ── Divider ── */
    .picker-divider {
      height: 1px;
      background: var(--md-sys-color-outline-variant, #CAC4D0);
      margin: 0;
    }

    /* ── Actions ── */
    .picker-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 12px 20px;
    }
  `);

  // ── local variant toggle (dial ↔ input) ───────────────────────────────
  // Use a computed so the displayed variant is synchronously derived from props.
  // userVariant stores an explicit in-session toggle; null means “follow props”.
  const userVariant = ref<'dial' | 'input' | null>(null);
  // Clear user override whenever the picker opens so it always starts with props.variant
  watch(() => open.value, (isOpen) => { if (isOpen) userVariant.value = null; });
  const currentVariant = computed(() => userVariant.value ?? props.variant);

  // Helper to toggle between dial/input within an open session
  const toggleVariant = () => {
    userVariant.value = currentVariant.value === 'dial' ? 'input' : 'dial';
  };

  // ── render ────────────────────────────────────────────────────────────
  const renderContent = () => html`
    <div class="picker" role="dialog" aria-modal="true" aria-label="${props.ariaLabel}">

      <!-- Headline: label + time display (dial mode) OR just label (input mode) -->
      <div class="picker-headline">
        <p class="picker-headline-label">${currentVariant.value === 'input' ? 'Enter time' : 'Select time'}</p>
        ${when(currentVariant.value === 'dial', () => html`
          <div class="time-selector" aria-label="Current time: ${displayHours.value}:${pad2(minutes.value)} ${props.hour24 ? '' : period.value}">
            <button
              :class="${{ 'time-seg-btn': true, active: dialMode.value === 'hours' }}"
              aria-label="Hours: ${displayHours.value}. Click to edit hours."
              @click="${() => { dialMode.value = 'hours'; }}"
            >${displayHours.value}</button>
            <span class="time-separator" aria-hidden="true">:</span>
            <button
              :class="${{ 'time-seg-btn': true, active: dialMode.value === 'minutes' }}"
              aria-label="Minutes: ${pad2(minutes.value)}. Click to edit minutes."
              @click="${() => { dialMode.value = 'minutes'; }}"
            >${pad2(minutes.value)}</button>
            ${when(!props.hour24, () => html`
              <div class="period-container" role="group" aria-label="Period">
                <button
                  :class="${{ 'period-btn': true, active: period.value === 'AM' }}"
                  aria-pressed="${period.value === 'AM'}"
                  @click="${() => { period.value = 'AM'; }}"
                >AM</button>
                <div class="period-divider" aria-hidden="true"></div>
                <button
                  :class="${{ 'period-btn': true, active: period.value === 'PM' }}"
                  aria-pressed="${period.value === 'PM'}"
                  @click="${() => { period.value = 'PM'; }}"
                >PM</button>
              </div>
            `)}
          </div>
        `)}
      </div>

      <!-- Input fields — replaces dial area when in input mode -->
      ${when(currentVariant.value === 'input', () => html`
        <div class="input-fields">
          <div class="input-field-wrap">
            <input
              :class="${{ 'input-field': true, error: hoursError.value }}"
              type="text"
              inputmode="numeric"
              maxlength="2"
              aria-label="Hours"
              :model="${inputH}"
              @input="${(e: Event) => e.stopPropagation()}"
              @blur="${commitInputH}"
              @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') { commitInputH(); (e.currentTarget as HTMLElement).blur(); } }}"
            />
            <span class="input-field-label">Hour</span>
            <span :class="${{ 'input-error-text': true, show: hoursError.value }}">${props.hour24 ? '0–23' : '1–12'}</span>
          </div>
          <span class="input-colon" aria-hidden="true">:</span>
          <div class="input-field-wrap">
            <input
              :class="${{ 'input-field': true, error: minutesError.value }}"
              type="text"
              inputmode="numeric"
              maxlength="2"
              aria-label="Minutes"
              :model="${inputM}"
              @input="${(e: Event) => e.stopPropagation()}"
              @blur="${commitInputM}"
              @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') { commitInputM(); (e.currentTarget as HTMLElement).blur(); } }}"
            />
            <span class="input-field-label">Minute</span>
            <span :class="${{ 'input-error-text': true, show: minutesError.value }}">0–59</span>
          </div>
          ${when(!props.hour24, () => html`
            <div class="period-container" role="group" aria-label="Period" style="margin-left:8px">
              <button
                :class="${{ 'period-btn': true, active: period.value === 'AM' }}"
                aria-pressed="${period.value === 'AM'}"
                @click="${() => { period.value = 'AM'; }}"
              >AM</button>
              <div class="period-divider" aria-hidden="true"></div>
              <button
                :class="${{ 'period-btn': true, active: period.value === 'PM' }}"
                aria-pressed="${period.value === 'PM'}"
                @click="${() => { period.value = 'PM'; }}"
              >PM</button>
            </div>
          `)}
        </div>
      `)}

      <!-- Dial — shown only in dial mode, includes its own divider -->
      ${when(currentVariant.value === 'dial', () => html`
        <div class="picker-divider"></div>
        <div class="dial-wrapper">
          <div
            class="dial-ring"
            role="img"
            aria-label="${dialMode.value === 'hours' ? 'Hour selection dial' : 'Minute selection dial'}"
            @pointerdown="${onDialPointerDown}"
            @pointermove="${onDialPointerMove}"
            @pointerup="${onDialPointerUp}"
          >
            <div class="dial-hand-pivot" :style="${{ transform: `rotate(${dialAngle.value}deg)` }}">
              <div class="dial-hand-bar"></div>
              <div class="dial-handle-circle"></div>
            </div>
            <div class="dial-center-dot"></div>
            ${each(dialNumbers.value, ({ n, pos, isSelected }) => html`
              <span
                :class="${{ 'dial-label': true, active: isSelected }}"
                :style="${{ left: pos.x + 'px', top: pos.y + 'px' }}"
                aria-hidden="true"
              >${n === 0 && dialMode.value === 'minutes' ? '00' : String(n)}</span>
            `)}
          </div>
        </div>
      `)}

      <!-- Mode toggle + actions -->
      <div class="mode-row">
        <button
          class="mode-btn"
          aria-label="${currentVariant.value === 'dial' ? 'Switch to keyboard input' : 'Switch to dial'}"
          @click="${() => { toggleVariant(); }}"
        >
          <span class="mode-btn-icon" aria-hidden="true">
            ${currentVariant.value === 'dial' ? 'keyboard' : 'schedule'}
          </span>
        </button>
      </div>
      <div class="picker-actions">
        <md-button variant="text" @click="${() => { emit('close'); open.value = false; }}">Cancel</md-button>
        <md-button variant="text" @click="${handleOK}">OK</md-button>
      </div>
    </div>
  `;

  return html`
    ${Transition({ show: open.value,
      enterFrom: 'scrim-enter-from', enterActive: 'scrim-enter-active',
      leaveActive: 'scrim-leave-active', leaveTo: 'scrim-leave-to',
      onBeforeEnter: scrollLock.lock,
      onAfterEnter: trap.onAfterEnter,
      onAfterLeave: () => { trap.onAfterLeave(); scrollLock.unlock(); },
    }, html`
      <div
        class="scrim"
        @click="${(e: Event) => { if (e.target === e.currentTarget) { emit('close'); open.value = false; } }}"
      >
        ${renderContent()}
      </div>
    `)}
  `;
});
