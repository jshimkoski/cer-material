// md-date-picker — MD3 Date Picker
// Variants:
//   'docked'      — Outlined text field with a dropdown calendar below it.
//                   Commits immediately on day tap; no OK/Cancel.
//   'modal'       — Dialog overlay with a calendar grid. OK commits, Cancel dismisses.
//   'modal-input' — Dialog overlay with a text input for manual date entry.
//                   Toggle button switches to the calendar view.
import {
  component,
  html,
  css,
  ref,
  watch,
  computed,
  nextTick,
  defineModel,
  useProps,
  useEmit,
  useStyle,
  useOnDisconnected,
} from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { createFocusTrap } from '../composables/useFocusTrap';
import { useScrollLock } from '../composables/useScrollLock';

// ── Module-level constants ──────────────────────────────────────────────────
// Never recreated — safe to reference in render functions without causing
// the each() differ to see "new" arrays on every render pass.

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_HEADERS: { key: string; short: string; long: string }[] = [
  { key: '0', short: 'S', long: 'Sunday' },
  { key: '1', short: 'M', long: 'Monday' },
  { key: '2', short: 'T', long: 'Tuesday' },
  { key: '3', short: 'W', long: 'Wednesday' },
  { key: '4', short: 'T', long: 'Thursday' },
  { key: '5', short: 'F', long: 'Friday' },
  { key: '6', short: 'S', long: 'Saturday' },
];

// ── Pure helpers ────────────────────────────────────────────────────────────

function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mon}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "Mon, Mar 9" — shown in the modal headline */
function fmtHeadline(iso: string): string {
  const d = isoToDate(iso);
  if (!d) return 'Select date';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** "03/09/2026" — shown in text inputs */
function fmtDisplay(iso: string): string {
  const d = isoToDate(iso);
  if (!d) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}/${day}/${d.getFullYear()}`;
}

/**
 * Parse a user-typed date → ISO string, or null on failure.
 * Accepts: MM/DD/YYYY, MM-DD-YYYY, M/D/YYYY, MMDDYYYY (no separator).
 * Does NOT auto-insert separators while typing (accessibility best practice).
 */
function parseDisplay(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let mo: number, da: number, yr: number;
  if (/[/\-.\s]/.test(s)) {
    const parts = s.split(/[/\-.\s]+/).filter(Boolean);
    if (parts.length !== 3) return null;
    [mo, da, yr] = parts.map(Number);
  } else if (s.length === 8) {
    mo = parseInt(s.slice(0, 2), 10);
    da = parseInt(s.slice(2, 4), 10);
    yr = parseInt(s.slice(4), 10);
  } else {
    return null;
  }
  if (!Number.isFinite(mo) || !Number.isFinite(da) || !Number.isFinite(yr))
    return null;
  if (mo < 1 || mo > 12 || da < 1 || da > 31 || yr < 1000 || yr > 9999)
    return null;
  const dt = new Date(yr, mo - 1, da);
  if (dt.getMonth() !== mo - 1 || dt.getDate() !== da) return null;
  return dateToIso(dt);
}

// ── Calendar day model ──────────────────────────────────────────────────────

interface CalendarDay {
  key: string;
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  disabled: boolean;
  label: string;
  ariaLabel: string; // pre-computed — avoids toLocaleDateString() on every render
}

function buildCalendar(
  year: number,
  month: number,
  selected: Date | null,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  minDate: Date | null,
  maxDate: Date | null,
): CalendarDay[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevLen = new Date(year, month, 0).getDate();
  const cells: CalendarDay[] = [];

  for (let i = startOffset - 1; i >= 0; i--)
    cells.push(
      makeCell(
        new Date(year, month - 1, prevLen - i),
        false,
        today,
        selected,
        rangeStart,
        rangeEnd,
        minDate,
        maxDate,
      ),
    );
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(
      makeCell(
        new Date(year, month, d),
        true,
        today,
        selected,
        rangeStart,
        rangeEnd,
        minDate,
        maxDate,
      ),
    );
  const trailing = 42 - cells.length;
  for (let d = 1; d <= trailing; d++)
    cells.push(
      makeCell(
        new Date(year, month + 1, d),
        false,
        today,
        selected,
        rangeStart,
        rangeEnd,
        minDate,
        maxDate,
      ),
    );

  return cells;
}

function makeCell(
  date: Date,
  inMonth: boolean,
  today: Date,
  selected: Date | null,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  minDate: Date | null,
  maxDate: Date | null,
): CalendarDay {
  const t = date.getTime();
  return {
    key: dateToIso(date),
    date,
    inMonth,
    isToday: sameDay(date, today),
    isSelected: selected ? sameDay(date, selected) : false,
    isRangeStart: rangeStart ? sameDay(date, rangeStart) : false,
    isRangeEnd: rangeEnd ? sameDay(date, rangeEnd) : false,
    isInRange:
      rangeStart && rangeEnd
        ? t > rangeStart.getTime() && t < rangeEnd.getTime()
        : false,
    disabled:
      (minDate ? t < minDate.getTime() : false) ||
      (maxDate ? t > maxDate.getTime() : false),
    label: String(date.getDate()),
    ariaLabel: date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}

// ── Component ───────────────────────────────────────────────────────────────

component('md-date-picker', () => {
  const props = useProps({
    /**
     * Picker variant:
     *   'docked'      — Outlined text field with a dropdown calendar below.
     *   'modal'       — Dialog overlay with a calendar grid and OK/Cancel.
     *   'modal-input' — Dialog overlay with a text field and OK/Cancel;
     *                   toggle button switches to the calendar view.
     */
    variant: 'modal' as 'docked' | 'modal' | 'modal-input',
    /** ISO date string for start of an optional range highlight */
    rangeStart: '',
    /** ISO date string for end of an optional range highlight */
    rangeEnd: '',
    /** Minimum selectable date (ISO string) */
    min: '',
    /** Maximum selectable date (ISO string) */
    max: '',
    /** Floating label on the docked text field */
    label: 'Date',
    /** Accessible label for the picker dialog / group */
    ariaLabel: 'Date picker',
    /** Controls whether the modal / modal-input picker is visible */
    open: false,
  });

  const emit = useEmit();
  const modelValue = defineModel('');

  // ── Open / close ────────────────────────────────────────────────────
  const open = ref(props.open);
  watch(
    () => props.open,
    (v) => {
      if (open.value !== v) open.value = v;
    },
  );
  const closeModal = () => {
    open.value = false;
    emit('update:open', false);
  };

  // Docked calendar dropdown (independent of modal open)
  const dockedOpen = ref(false);

  // ── Calendar navigation ──────────────────────────────────────────────
  const view = ref<'day' | 'year'>('day');
  const viewYear = ref(new Date().getFullYear());
  const viewMonth = ref(new Date().getMonth());

  const syncView = (iso: string) => {
    const d = isoToDate(iso);
    if (d) {
      const y = d.getFullYear();
      const m = d.getMonth();
      if (viewYear.value !== y) viewYear.value = y;
      if (viewMonth.value !== m) viewMonth.value = m;
    }
  };

  // Initialise from current model value; keep in sync with external changes.
  syncView(modelValue.value);
  watch(() => modelValue.value, syncView);

  // When the docked dropdown opens, reset the calendar to the current selection.
  watch(
    () => dockedOpen.value,
    (isOpen) => {
      if (isOpen) {
        if (view.value !== 'day') view.value = 'day';
        syncView(modelValue.value);
      }
    },
  );

  // ── Pending / staging (modal variants) ──────────────────────────────
  const pendingValue = ref(modelValue.value);

  // ── Non-reactive text buffer ─────────────────────────────────────────
  // Plain `let` variable: @input writes to it without triggering re-renders,
  // so the input element's cursor position is never reset mid-typing.
  let inputBuffer = '';

  // Reactive source for the input field's displayed value — updated only
  // when the modal opens or when switching to input mode so the field is
  // initialised correctly without disrupting the cursor during typing.
  const inputDisplayValue = ref('');

  // Reactive error state for the modal-input text field.
  const inputError = ref(false);

  // Reference to the live modal-input <input> element, assigned via :ref.
  // This is always the current DOM node — no querySelector needed.
  const inputElRef = ref<HTMLInputElement | null>(null);

  // ── Modal body mode ──────────────────────────────────────────────────
  const modalMode = ref<'calendar' | 'input'>('calendar');

  // On modal open: sync pending value, reset view, set mode + buffer.
  watch(
    () => open.value,
    (isOpen) => {
      if (!isOpen) return;
      const mv = modelValue.value;
      if (pendingValue.value !== mv) pendingValue.value = mv;
      inputBuffer = fmtDisplay(mv);
      inputDisplayValue.value = inputBuffer;
      inputError.value = false;
      if (view.value !== 'day') view.value = 'day';
      const nextMode = props.variant === 'modal-input' ? 'input' : 'calendar';
      if (modalMode.value !== nextMode) modalMode.value = nextMode;
      syncView(mv);
    },
  );

  watch(
    () => props.variant,
    (v) => {
      modalMode.value = v === 'modal-input' ? 'input' : 'calendar';
      inputBuffer = fmtDisplay(pendingValue.value);
      inputDisplayValue.value = inputBuffer;
      inputError.value = false;
    },
  );

  // ── Derived flags ────────────────────────────────────────────────────
  const isDocked = computed(() => props.variant === 'docked');
  const isModal = computed(
    () => props.variant === 'modal' || props.variant === 'modal-input',
  );

  // Docked: highlights committed model value; modal: highlights staged pending value.
  const displayValue = computed(() =>
    isDocked.value ? modelValue.value : pendingValue.value,
  );
  const selectedDate = computed(() => isoToDate(displayValue.value));
  const rangeStartDt = computed(() => isoToDate(props.rangeStart));
  const rangeEndDt = computed(() => isoToDate(props.rangeEnd));
  const minDt = computed(() => isoToDate(props.min));
  const maxDt = computed(() => isoToDate(props.max));

  const calDays = computed(() =>
    buildCalendar(
      viewYear.value,
      viewMonth.value,
      selectedDate.value,
      rangeStartDt.value,
      rangeEndDt.value,
      minDt.value,
      maxDt.value,
    ),
  );

  const monthLabel = computed(
    () => `${MONTH_NAMES[viewMonth.value]} ${viewYear.value}`,
  );

  // Pre-keyed list: current year ± 100. Stable object references → efficient each() diff.
  const yearList = computed(() => {
    const items: { key: string; year: number }[] = [];
    for (let y = viewYear.value - 100; y <= viewYear.value + 100; y++)
      items.push({ key: String(y), year: y });
    return items;
  });

  const headlineText = computed(() => {
    if (props.rangeStart || props.rangeEnd) {
      const fmt = (iso: string) => {
        const d = isoToDate(iso);
        return d
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '\u2014';
      };
      return `${fmt(props.rangeStart)}  \u2013  ${fmt(props.rangeEnd)}`;
    }
    return pendingValue.value ? fmtHeadline(pendingValue.value) : 'Select date';
  });

  // ── Month navigation ─────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth.value === 0) {
      viewMonth.value = 11;
      viewYear.value--;
    } else viewMonth.value--;
  };
  const nextMonth = () => {
    if (viewMonth.value === 11) {
      viewMonth.value = 0;
      viewYear.value++;
    } else viewMonth.value++;
  };

  // ── Selection ────────────────────────────────────────────────────────
  const selectDay = (day: CalendarDay) => {
    if (day.disabled) return;
    const iso = dateToIso(day.date);
    if (isDocked.value) {
      // Docked: commit immediately and close the dropdown.
      modelValue.value = iso;
      emit('change', iso);
      dockedOpen.value = false;
    } else {
      // Modal: stage the selection; OK cements it.
      pendingValue.value = iso;
    }
  };

  const selectYear = (y: number) => {
    viewYear.value = y;
    view.value = 'day';
  };

  // ── Modal OK / Cancel ────────────────────────────────────────────────
  const handleOk = () => {
    if (modalMode.value === 'input') {
      // Guard 1: blur may have already detected an error — block close immediately.
      if (inputError.value) {
        nextTick().then(() => inputElRef.value?.focus());
        return;
      }

      // Guard 2: read the live DOM value via the :ref-bound element so we
      // never depend on inputBuffer being in sync.
      const raw = (inputElRef.value ? inputElRef.value.value : inputBuffer).trim();
      if (raw) {
        const parsed = parseDisplay(raw);
        if (!parsed) {
          inputDisplayValue.value = raw;
          inputError.value = true;
          nextTick().then(() => inputElRef.value?.focus());
          return;
        }
        // Valid — normalise, stage, and commit.
        inputError.value = false;
        inputBuffer = fmtDisplay(parsed);
        inputDisplayValue.value = inputBuffer;
        pendingValue.value = parsed;
        syncView(parsed);
      }
    }
    const iso = pendingValue.value;
    if (iso) {
      modelValue.value = iso;
      emit('change', iso);
    }
    closeModal();
    emit('close');
  };

  const handleCancel = () => {
    closeModal();
    emit('close');
  };

  // ── Focus trap / escape / scroll lock (modal) ─────────────────────
  useEscapeKey(
    () => open.value && isModal.value,
    () => handleCancel(),
  )();
  const trap = createFocusTrap();
  useOnDisconnected(() => trap.cleanup());
  const scrollLock = useScrollLock();

  // Stable references — defined once at setup scope so they are not recreated
  // on every render, preventing event listener churn on every re-render.
  const handleScrimClick = (e: Event) => {
    if (e.target === e.currentTarget) handleCancel();
  };

  const transitionHooks = {
    onBeforeEnter: (el: HTMLElement) => {
      scrollLock.lock();
      const pk = el.querySelector<HTMLElement>('.picker');
      el.style.opacity = '0';
      if (pk) { pk.style.transform = 'scale(0.92)'; pk.style.opacity = '0'; }
    },
    onEnter: (el: HTMLElement, done: () => void) => {
      const pk = el.querySelector<HTMLElement>('.picker');
      const ease = 'cubic-bezier(0.4,0,0.2,1)';
      el.offsetHeight;
      el.style.transition = `opacity 200ms ${ease}`;
      el.style.opacity = '';
      if (pk) {
        pk.style.transition = `opacity 200ms ${ease}, transform 200ms ${ease}`;
        pk.style.transform = '';
        pk.style.opacity = '';
      }
      let finished = false;
      const finish = () => { if (!finished) { finished = true; done(); } };
      el.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 250);
    },
    onAfterEnter: (el: HTMLElement) => {
      el.style.transition = '';
      el.querySelector<HTMLElement>('.picker')?.style.setProperty('transition', '');
      trap.onAfterEnter(el);
      if (modalMode.value === 'input') {
        nextTick().then(() => inputElRef.value?.focus());
      }
    },
    onLeave: (el: HTMLElement, done: () => void) => {
      const pk = el.querySelector<HTMLElement>('.picker');
      const ease = 'cubic-bezier(0.4,0,0.2,1)';
      el.offsetHeight;
      el.style.transition = `opacity 200ms ${ease}`;
      el.style.opacity = '0';
      if (pk) {
        pk.style.transition = `opacity 200ms ${ease}, transform 200ms ${ease}`;
        pk.style.transform = 'scale(0.92)';
        pk.style.opacity = '0';
      }
      let finished = false;
      const finish = () => { if (!finished) { finished = true; done(); } };
      el.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 250);
    },
    onAfterLeave: () => { trap.onAfterLeave(); scrollLock.unlock(); },
  };

  // ── Styles ────────────────────────────────────────────────────────────
  useStyle(
    () => css`
      :host {
        display: contents;
      }

      /* ── Modal scrim ────────────────────────────────────────── */
      .scrim {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.32);
        z-index: 600;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* ── Modal picker container ─────────────────────────────── */
      .picker {
        background: var(--md-sys-color-surface-container-high, #ece6f0);
        border-radius: 28px;
        width: 360px;
        max-width: calc(100vw - 48px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: var(
          --md-sys-elevation-3,
          0 4px 8px 3px rgba(0, 0, 0, 0.15),
          0 1px 3px rgba(0, 0, 0, 0.3)
        );
      }

      /* ── Headline ───────────────────────────────────────────── */
      .headline {
        padding: 20px 12px 12px 24px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 4px;
      }
      .headline-text {
        flex: 1;
        min-width: 0;
      }
      .headline-support {
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        margin: 0 0 4px;
      }
      .headline-value {
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 36px;
        font-weight: 400;
        line-height: 44px;
        color: var(--md-sys-color-on-surface, #1c1b1f);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .headline-toggle {
        width: 48px;
        height: 48px;
        border: none;
        background: transparent;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        outline: none;
        padding: 0;
      }
      .headline-toggle:hover {
        background: color-mix(
          in srgb,
          var(--md-sys-color-on-surface, #1c1b1f) 8%,
          transparent
        );
      }
      .headline-toggle:focus-visible {
        outline: 2px solid var(--md-sys-color-primary, #6750a4);
        outline-offset: 2px;
      }
      .headline-toggle-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 20px;
        font-style: normal;
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 20;
        user-select: none;
      }

      /* ── Divider ────────────────────────────────────────────── */
      .divider {
        height: 1px;
        background: var(--md-sys-color-outline-variant, #cac4d0);
        flex-shrink: 0;
      }

      /* ── Calendar header ────────────────────────────────────── */
      .cal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 12px 4px 24px;
        min-height: 52px;
        box-sizing: border-box;
      }
      .cal-month-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: none;
        background: transparent;
        padding: 4px 8px;
        border-radius: 8px;
        cursor: pointer;
        outline: none;
      }
      .cal-month-btn:hover {
        background: color-mix(
          in srgb,
          var(--md-sys-color-on-surface, #1c1b1f) 8%,
          transparent
        );
      }
      .cal-month-btn:focus-visible {
        outline: 2px solid var(--md-sys-color-primary, #6750a4);
        outline-offset: 2px;
      }
      .cal-month-label {
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 14px;
        font-weight: 500;
        color: var(--md-sys-color-on-surface, #1c1b1f);
      }
      .cal-month-arrow {
        font-family: 'Material Symbols Outlined';
        font-size: 18px;
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 18;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        user-select: none;
      }
      .cal-nav {
        display: flex;
      }
      /* Kept in layout when hidden so the header width stays stable */
      .cal-nav-hidden {
        visibility: hidden;
        pointer-events: none;
      }

      /* ── Icon button (prev/next month) ──────────────────────── */
      .icon-btn {
        width: 48px;
        height: 48px;
        border: none;
        background: transparent;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        padding: 0;
        outline: none;
        flex-shrink: 0;
      }
      .icon-btn:hover {
        background: color-mix(
          in srgb,
          var(--md-sys-color-on-surface, #1c1b1f) 8%,
          transparent
        );
      }
      .icon-btn:focus-visible {
        outline: 2px solid var(--md-sys-color-primary, #6750a4);
        outline-offset: 2px;
      }
      .icon-btn-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 20px;
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 20;
        user-select: none;
      }

      /* ── Weekday row ────────────────────────────────────────── */
      .cal-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 40px);
        justify-content: center;
        padding: 0 12px;
      }
      .cal-weekday {
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 12px;
        font-weight: 400;
        color: var(--md-sys-color-on-surface, #1c1b1f);
        text-align: center;
        height: 40px;
        line-height: 40px;
      }

      /* ── Day grid ───────────────────────────────────────────── */
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 40px);
        justify-content: center;
        padding: 0 12px;
        margin-bottom: 12px;
      }
      .cal-day {
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 14px;
        color: var(--md-sys-color-on-surface, #1c1b1f);
        outline: none;
        background: transparent;
        border: none;
        padding: 0;
        user-select: none;
        box-sizing: border-box;
      }
      .cal-day:focus-visible {
        outline: 2px solid var(--md-sys-color-primary, #6750a4);
        outline-offset: 2px;
      }
      .cal-day.outside {
        color: var(--md-sys-color-on-surface-variant, #49454f);
        opacity: 0.38;
      }
      /* Today ring — only when not also selected or at range boundary */
      .cal-day.today:not(.selected):not(.range-start):not(.range-end)::before {
        content: '';
        position: absolute;
        inset: 4px;
        border-radius: 50%;
        border: 1px solid var(--md-sys-color-primary, #6750a4);
        pointer-events: none;
      }
      .cal-day.selected,
      .cal-day.range-start,
      .cal-day.range-end {
        background: var(--md-sys-color-primary, #6750a4);
        color: var(--md-sys-color-on-primary, #ffffff);
      }
      .cal-day.in-range {
        background: var(--md-sys-color-secondary-container, #e8def8);
        color: var(--md-sys-color-on-secondary-container, #21005d);
        border-radius: 0;
        width: 40px;
      }
      .cal-day.range-start {
        border-radius: 50% 0 0 50%;
      }
      .cal-day.range-end {
        border-radius: 0 50% 50% 0;
      }
      .cal-day:hover:not(.selected):not(.range-start):not(.range-end):not(
          .disabled
        ) {
        background: color-mix(
          in srgb,
          var(--md-sys-color-on-surface, #1c1b1f) 8%,
          transparent
        );
      }
      .cal-day.disabled {
        opacity: 0.38;
        cursor: not-allowed;
      }

      /* ── Year selector ──────────────────────────────────────── */
      .year-list {
        padding: 8px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-height: 280px;
        overflow-y: auto;
      }
      .year-item {
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 14px;
        height: 36px;
        line-height: 36px;
        min-width: 72px;
        padding: 0 20px;
        border-radius: 18px;
        cursor: pointer;
        color: var(--md-sys-color-on-surface, #1c1b1f);
        border: none;
        background: transparent;
        outline: none;
        text-align: center;
      }
      .year-item:hover {
        background: color-mix(
          in srgb,
          var(--md-sys-color-on-surface, #1c1b1f) 8%,
          transparent
        );
      }
      .year-item.selected {
        background: var(--md-sys-color-primary, #6750a4);
        color: var(--md-sys-color-on-primary, #ffffff);
      }
      .year-item:focus-visible {
        outline: 2px solid var(--md-sys-color-primary, #6750a4);
        outline-offset: 2px;
      }

      /* ── Modal input body ───────────────────────────────────── */
      .input-body {
        padding: 20px 24px 24px;
      }
      .input-field-label {
        display: block;
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 12px;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        margin-bottom: 8px;
      }
      .input-wrap {
        height: 56px;
        border-radius: 4px;
        border: 1px solid var(--md-sys-color-outline, #79747e);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        padding: 0 12px;
      }
      .input-wrap:focus-within {
        border-color: var(--md-sys-color-primary, #6750a4);
        border-width: 2px;
        padding: 0 11px;
      }
      .input-wrap.error {
        border-color: var(--md-sys-color-error, #b3261e);
      }
      .input-wrap.error:focus-within {
        border-color: var(--md-sys-color-error, #b3261e);
      }
      .input-field-label.error {
        color: var(--md-sys-color-error, #b3261e);
      }
      .input-wrap input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 16px;
        color: var(--md-sys-color-on-surface, #1c1b1f);
        min-width: 0;
      }
      .input-wrap input::placeholder {
        color: var(--md-sys-color-on-surface-variant, #49454f);
      }
      .input-error-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 20px;
        font-style: normal;
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
        color: var(--md-sys-color-error, #b3261e);
        flex-shrink: 0;
        user-select: none;
        pointer-events: none;
      }
      .input-hint {
        display: block;
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 12px;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        margin-top: 4px;
      }
      .input-hint.error {
        color: var(--md-sys-color-error, #b3261e);
      }

      /* ── Modal action bar ───────────────────────────────────── */
      .picker-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 8px 12px 20px;
        flex-shrink: 0;
      }

      /* ── Docked wrapper ─────────────────────────────────────── */
      .docked-wrapper {
        display: inline-flex;
        flex-direction: column;
        width: 360px;
        max-width: 100%;
        position: relative;
        /* z-index 500 keeps the wrapper above the transparent docked-scrim (499),
         so the text field remains clickable while the dropdown is open. */
        z-index: 500;
      }

      /* Outlined text field */
      .docked-field {
        position: relative;
        height: 56px;
        border-radius: 4px;
        border: 1px solid var(--md-sys-color-outline, #79747e);
        display: flex;
        align-items: center;
        padding: 0 16px;
        box-sizing: border-box;
        background: transparent;
      }
      .docked-field.open,
      .docked-field:focus-within {
        border-color: var(--md-sys-color-primary, #6750a4);
        border-width: 2px;
        padding: 0 15px;
      }
      /* Floating label sits on the top border line */
      .docked-label {
        position: absolute;
        top: 0;
        left: 8px;
        transform: translateY(-50%);
        background: var(--md-sys-color-background, #fffbfe);
        padding: 0 4px;
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 12px;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        pointer-events: none;
        white-space: nowrap;
      }
      .docked-field.open .docked-label,
      .docked-field:focus-within .docked-label {
        color: var(--md-sys-color-primary, #6750a4);
      }
      .docked-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 16px;
        color: var(--md-sys-color-on-surface, #1c1b1f);
        min-width: 0;
      }
      .docked-input::placeholder {
        color: var(--md-sys-color-on-surface-variant, #49454f);
      }
      .docked-cal-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 20px;
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 20;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        flex-shrink: 0;
        user-select: none;
        pointer-events: none;
      }
      .docked-hint {
        font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
        font-size: 12px;
        color: var(--md-sys-color-on-surface-variant, #49454f);
        padding: 4px 16px 0;
      }

      /* Transparent full-page overlay — clicking it closes the docked dropdown */
      .docked-scrim {
        position: fixed;
        inset: 0;
        z-index: 499;
      }

      /* Dropdown calendar card */
      .docked-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        width: 360px;
        max-width: 100vw;
        z-index: 500;
        background: var(--md-sys-color-surface-container-high, #ece6f0);
        border-radius: 12px;
        border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
        overflow: hidden;
      }
    `,
  );

  // ── Calendar body ──────────────────────────────────────────────────────
  const renderCalendar = () => html`
    <div class="cal-header">
      <button
        type="button"
        class="cal-month-btn"
        aria-label="${view.value === 'year'
          ? 'Switch to day view'
          : 'Switch to year view'}"
        aria-expanded="${String(view.value === 'year')}"
        @click="${() => {
          view.value = view.value === 'year' ? 'day' : 'year';
        }}"
      >
        <span class="cal-month-label">${monthLabel.value}</span>
        <span class="cal-month-arrow" aria-hidden="true">
          ${view.value === 'year' ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </button>
      <div
        :class="${{ 'cal-nav': true, 'cal-nav-hidden': view.value === 'year' }}"
      >
        <button
          type="button"
          class="icon-btn"
          aria-label="Previous month"
          @click="${(e: Event) => {
            e.stopPropagation();
            prevMonth();
          }}"
        >
          <span class="icon-btn-icon" aria-hidden="true">chevron_left</span>
        </button>
        <button
          type="button"
          class="icon-btn"
          aria-label="Next month"
          @click="${(e: Event) => {
            e.stopPropagation();
            nextMonth();
          }}"
        >
          <span class="icon-btn-icon" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </div>
    ${when(
      view.value === 'year',
      () => html`
        <div class="year-list" role="listbox" aria-label="Year selection">
          ${each(
            yearList.value,
            (item: { key: string; year: number }) => html`
              <button
                :class="${{
                  'year-item': true,
                  selected: item.year === viewYear.value,
                }}"
                role="option"
                aria-selected="${String(item.year === viewYear.value)}"
                @click="${() => selectYear(item.year)}"
              >
                ${String(item.year)}
              </button>
            `,
          )}
        </div>
      `,
    )}
    ${when(
      view.value === 'day',
      () => html`
        <div class="cal-weekdays" role="row">
          ${each(
            WEEKDAY_HEADERS,
            (w: { key: string; short: string; long: string }) => html`
              <div
                class="cal-weekday"
                role="columnheader"
                aria-label="${w.long}"
              >
                ${w.short}
              </div>
            `,
          )}
        </div>
        <div
          class="cal-grid"
          role="grid"
          aria-label="${monthLabel.value}"
          @keydown="${(e: KeyboardEvent) => {
            const cells = Array.from(
              (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
                '[role=gridcell]',
              ),
            );
            const idx = cells.indexOf(document.activeElement as HTMLElement);
            if (idx < 0) return;
            let next = idx;
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              next = Math.min(idx + 1, cells.length - 1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              next = Math.max(idx - 1, 0);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              next = Math.min(idx + 7, cells.length - 1);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              next = Math.max(idx - 7, 0);
            } else if (e.key === 'PageDown') {
              e.preventDefault();
              nextMonth();
              return;
            } else if (e.key === 'PageUp') {
              e.preventDefault();
              prevMonth();
              return;
            } else return;
            cells[next]?.focus();
          }}"
        >
          ${each(
            calDays.value,
            (day: CalendarDay) => html`
              <button
                :class="${{
                  'cal-day': true,
                  outside: !day.inMonth,
                  today: day.isToday,
                  selected: day.isSelected,
                  'range-start': day.isRangeStart,
                  'range-end': day.isRangeEnd,
                  'in-range': day.isInRange,
                  disabled: day.disabled,
                }}"
                role="gridcell"
                aria-label="${day.ariaLabel}"
                aria-selected="${String(
                  day.isSelected || day.isRangeStart || day.isRangeEnd,
                )}"
                aria-disabled="${String(day.disabled)}"
                tabindex="${day.isSelected || day.isRangeStart ? '0' : '-1'}"
                @click="${() => selectDay(day)}"
              >
                ${day.label}
              </button>
            `,
          )}
        </div>
      `,
    )}
  `;

  // ── Modal input body ───────────────────────────────────────────────────
  // `inputDisplayValue` (reactive) initialises the field on open / mode-switch.
  // `inputBuffer` (plain let) captures every keystroke without triggering
  // re-renders, preserving cursor position.  Validation runs on blur and Enter.
  const renderInputBody = () => html`
    <div class="input-body">
      <label :class="${{ 'input-field-label': true, error: inputError.value }}"
        >Date</label
      >
      <div :class="${{ 'input-wrap': true, error: inputError.value }}">
        <input
          type="text"
          placeholder="MM/DD/YYYY"
          aria-label="Enter date in MM/DD/YYYY format"
          aria-describedby="input-hint"
          aria-invalid="${String(inputError.value)}"
          value="${inputDisplayValue.value}"
          :ref="${inputElRef}"
          @input="${(e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            inputBuffer = val;
            if (inputError.value) {
              // Keep inputDisplayValue fresh while in error state so the
              // re-render triggered by clearing the error uses the current text
              // and doesn't reset the cursor or blank the field.
              inputDisplayValue.value = val;
              inputError.value = false;
            }
          }}"
          @blur="${(e: FocusEvent) => {
            const val = (e.target as HTMLInputElement).value;
            inputBuffer = val;
            if (!val.trim()) {
              inputError.value = false;
              return;
            }
            const iso = parseDisplay(val);
            if (iso) {
              inputError.value = false;
              inputBuffer = fmtDisplay(iso);
              inputDisplayValue.value = inputBuffer;
              pendingValue.value = iso;
              syncView(iso);
            } else {
              // Preserve the invalid text in inputDisplayValue so the re-render
              // triggered by setting inputError doesn't blank the field.
              inputDisplayValue.value = val;
              inputError.value = true;
            }
          }}"
          @keydown="${(e: KeyboardEvent) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const val = (e.target as HTMLInputElement).value;
            inputBuffer = val;
            if (!val.trim()) return;
            const iso = parseDisplay(val);
            if (iso) {
              inputError.value = false;
              inputBuffer = fmtDisplay(iso);
              inputDisplayValue.value = inputBuffer;
              Promise.resolve().then(() => {
                pendingValue.value = iso;
                syncView(iso);
              });
            } else {
              inputDisplayValue.value = val;
              inputError.value = true;
            }
          }}"
        />
        ${when(
          inputError.value,
          () => html`<span class="input-error-icon" aria-hidden="true">error</span>`,
        )}
      </div>
      <span
        id="input-hint"
        :class="${{ 'input-hint': true, error: inputError.value }}"
        >${inputError.value ? 'Invalid date' : 'MM/DD/YYYY'}</span
      >
    </div>
  `;

  // ── Modal picker ───────────────────────────────────────────────────────
  const renderModal = () => html`
    <div
      class="picker"
      role="dialog"
      aria-modal="true"
      aria-label="${props.ariaLabel}"
    >
      <div class="headline">
        <div class="headline-text">
          <p class="headline-support">Select date</p>
          <p class="headline-value">${headlineText.value}</p>
        </div>
        <button
          type="button"
          class="headline-toggle"
          aria-label="${modalMode.value === 'input'
            ? 'Switch to calendar view'
            : 'Switch to text input'}"
          @click="${() => {
            if (modalMode.value === 'calendar') {
              inputBuffer = fmtDisplay(pendingValue.value);
              inputDisplayValue.value = inputBuffer;
              inputError.value = false;
              modalMode.value = 'input';
              nextTick().then(() => inputElRef.value?.focus());
            } else {
              const iso = parseDisplay(inputBuffer);
              if (iso) {
                pendingValue.value = iso;
                syncView(iso);
              }
              modalMode.value = 'calendar';
            }
          }}"
        >
          <span class="headline-toggle-icon" aria-hidden="true">
            ${modalMode.value === 'input' ? 'calendar_today' : 'keyboard'}
          </span>
        </button>
      </div>
      <div class="divider"></div>
      ${when(modalMode.value === 'calendar', () => renderCalendar())}
      ${when(modalMode.value === 'input', () => renderInputBody())}
      <div class="picker-actions">
        <md-button variant="text" @click="${handleCancel}">Cancel</md-button>
        <md-button variant="text" @click="${handleOk}">OK</md-button>
      </div>
    </div>
  `;

  // ── Docked picker ──────────────────────────────────────────────────────
  // The outlined text field is always visible. Focusing it opens the dropdown
  // calendar card below. Clicking the transparent scrim or pressing Escape
  // closes it. Selecting a day commits immediately and closes the dropdown.
  const renderDocked = () => html`
    <div class="docked-wrapper" role="group" aria-label="${props.ariaLabel}">
      <div :class="${{ 'docked-field': true, open: dockedOpen.value }}">
        <span class="docked-label">${props.label}</span>
        <input
          type="text"
          class="docked-input"
          placeholder="MM/DD/YYYY"
          aria-label="${props.label}"
          value="${fmtDisplay(modelValue.value)}"
          @focus="${() => {
            dockedOpen.value = true;
          }}"
          @blur="${(e: FocusEvent) => {
            const iso = parseDisplay((e.target as HTMLInputElement).value);
            if (iso) {
              modelValue.value = iso;
              emit('change', iso);
            } else {
              (e.target as HTMLInputElement).value = fmtDisplay(
                modelValue.value,
              );
            }
          }}"
          @keydown="${(e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              const iso = parseDisplay((e.target as HTMLInputElement).value);
              if (iso) {
                modelValue.value = iso;
                emit('change', iso);
              }
            } else if (e.key === 'Escape') {
              dockedOpen.value = false;
              (e.target as HTMLInputElement).blur();
            }
          }}"
        />
        <span class="docked-cal-icon" aria-hidden="true">calendar_today</span>
      </div>
      <span class="docked-hint">MM/DD/YYYY</span>
      ${when(
        dockedOpen.value,
        () => html`
          <div
            class="docked-scrim"
            @click="${() => {
              dockedOpen.value = false;
            }}"
          ></div>
          <div class="docked-dropdown">${renderCalendar()}</div>
        `,
      )}
    </div>
  `;

  // ── Root template ──────────────────────────────────────────────────────
  // IMPORTANT: Transition must be a *direct* child in the top-level render
  // loop — not nested inside a `when()` anchor. The patcher matches anchor
  // VNodes to their existing DOM boundary markers via "key:start" / "key:end"
  // lookups in the top-level DOM map (h). When a Transition anchor is nested
  // inside a when-block anchor it is processed by `j`'s keyed-diff instead,
  // which only matches by the bare key ("transition") — and the DOM markers
  // are stored as "transition:start" / "transition:end" — so no match is
  // found and the anchor is destroyed and rebuilt on every open/close cycle,
  // completely bypassing the transition engine.
  return html`
    ${Transition(
      { show: open.value, css: false, ...transitionHooks },
      // CRITICAL: only evaluate renderModal() when the modal is actually
      // open. The html template argument to Transition is eagerly evaluated
      // (it is a JS expression, not a lazy factory), so if renderModal()
      // were always called here it would run buildCalendar() + 42
      // toLocaleDateString() calls + 42 template parses on every render,
      // even when open.value === false, producing a VNode tree that
      // Transition immediately discards. The leave animation fires on
      // existing DOM nodes and does not need the content VNode.
      open.value
        ? html`
            <div class="scrim" @click="${handleScrimClick}">
              ${renderModal()}
            </div>
          `
        : [],
    )}
    ${when(isDocked.value, () => renderDocked())}
  `;
});
