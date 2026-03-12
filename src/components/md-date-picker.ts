import { component, html, css, ref, watch, computed, defineModel, useProps, useEmit, useStyle, useOnDisconnected } from '@jasonshimmy/custom-elements-runtime';
import { when, each } from '@jasonshimmy/custom-elements-runtime/directives';
import { Transition } from '@jasonshimmy/custom-elements-runtime/transitions';
import { useEscapeKey } from '../composables/useEscapeKey';
import { createFocusTrap } from '../composables/useFocusTrap';
import { useScrollLock } from '../composables/useScrollLock';

// ── helpers ────────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

/** Format ISO date as "Mon, Mar 9" for dialog headline (MD3 spec). */
function formatHeadline(iso: string): string {
  const d = isoToDate(iso);
  if (!d) return '——/——/————';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Format ISO date as "Mar 9" for range endpoints in headline. */
function formatRangeDate(iso: string): string {
  const d = isoToDate(iso);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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
  const startOffset = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: CalendarDay[] = [];

  // Fill leading days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    cells.push(makeCell(d, false, today, selected, rangeStart, rangeEnd, minDate, maxDate));
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push(makeCell(date, true, today, selected, rangeStart, rangeEnd, minDate, maxDate));
  }

  // Trailing days to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    cells.push(makeCell(date, false, today, selected, rangeStart, rangeEnd, minDate, maxDate));
  }

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
  const isSelected = selected ? sameDay(date, selected) : false;
  const isRangeStart = rangeStart ? sameDay(date, rangeStart) : false;
  const isRangeEnd = rangeEnd ? sameDay(date, rangeEnd) : false;
  let isInRange = false;
  if (rangeStart && rangeEnd) {
    isInRange = t > rangeStart.getTime() && t < rangeEnd.getTime();
  }
  const disabled = (minDate ? t < minDate.getTime() : false) ||
                   (maxDate ? t > maxDate.getTime() : false);
  return {
    key: dateToIso(date),
    date,
    inMonth,
    isToday: sameDay(date, today),
    isSelected,
    isRangeStart,
    isRangeEnd,
    isInRange,
    disabled,
    label: String(date.getDate()),
  };
}

// ── component ──────────────────────────────────────────────────────────────
component('md-date-picker', () => {
  const props = useProps({
    /** 'dialog' | 'docked' */
    variant: 'dialog' as 'dialog' | 'docked',
    /** ISO date string for range start */
    rangeStart: '',
    /** ISO date string for range end */
    rangeEnd: '',
    /** min selectable date (ISO) */
    min: '',
    /** max selectable date (ISO) */
    max: '',
    /** label shown on the trigger text field */
    label: 'Select date',
    ariaLabel: 'Date picker',
    open: false,
  });
  const emit = useEmit();
  const modelValue = defineModel('');
  const open = ref(props.open);
  watch(() => props.open, v => { open.value = v; });

  // ── view state ────────────────────────────────────────────────────────
  // 'day' | 'month' | 'year'
  const view = ref<'day' | 'month' | 'year'>('day');
  // currently viewed month/year
  const viewYear  = ref(new Date().getFullYear());
  const viewMonth = ref(new Date().getMonth());

  // initialize from value prop
  const initFromValue = () => {
    const d = isoToDate(modelValue.value);
    if (d) { viewYear.value = d.getFullYear(); viewMonth.value = d.getMonth(); }
  };
  initFromValue();
  watch(() => modelValue.value, initFromValue);

  // ── pending selection (dialog mode) ──────────────────────────────────
  // Dialog mode: day clicks update a pending value; OK confirms, Cancel discards.
  const pendingValue = ref(modelValue.value);
  watch(() => modelValue.value, (v) => { pendingValue.value = v; });
  watch(() => open.value, (isOpen) => { if (isOpen) pendingValue.value = modelValue.value; });

  // ── docked mode open state ──────────────────────────────────────────
  const toggleDocked = () => { const v = !open.value; open.value = v; emit('update:open', v); };

  // ── computed helpers ──────────────────────────────────────────────────
  const selectedDate  = computed(() =>
    isoToDate(props.variant === 'dialog' ? pendingValue.value : modelValue.value));
  const rangeStartDt  = computed(() => isoToDate(props.rangeStart));
  const rangeEndDt    = computed(() => isoToDate(props.rangeEnd));
  const minDt         = computed(() => isoToDate(props.min));
  const maxDt         = computed(() => isoToDate(props.max));

  const calendarDays  = computed(() =>
    buildCalendar(
      viewYear.value, viewMonth.value,
      selectedDate.value,
      rangeStartDt.value, rangeEndDt.value,
      minDt.value, maxDt.value,
    )
  );

  const monthLabel = computed(() =>
    `${MONTH_NAMES[viewMonth.value]} ${viewYear.value}`
  );

  // years list for year picker (current-20 … current+20)
  const yearList = computed(() => {
    const base = viewYear.value;
    const years: number[] = [];
    for (let y = base - 20; y <= base + 20; y++) years.push(y);
    return years;
  });

  // ── navigation ────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value--; }
    else viewMonth.value--;
  };
  const nextMonth = () => {
    if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++; }
    else viewMonth.value++;
  };

  // ── selection ─────────────────────────────────────────────────────────
  const selectDay = (day: CalendarDay) => {
    if (day.disabled) return;
    const iso = dateToIso(day.date);
    if (props.variant === 'dialog') {
      // Stage selection; confirmed by OK button
      pendingValue.value = iso;
    } else {
      emit('change', iso);
      modelValue.value = iso;
      open.value = false;
      emit('update:open', false);
    }
  };

  const selectYear = (y: number) => {
    viewYear.value = y;
    view.value = 'day';
  };

  // ── modal focus/scroll ────────────────────────────────────────────────
  const isModal = computed(() => props.variant === 'dialog');
  useEscapeKey(
    () => (open.value && isModal.value) || open.value,
    () => { open.value = false; emit('update:open', false); emit('close'); })();
  const trap = createFocusTrap();
  useOnDisconnected(() => trap.cleanup());
  const scrollLock = useScrollLock();

  // ── styles ────────────────────────────────────────────────────────────
  useStyle(() => css`
    :host { display: contents; }

    /* ── Scrim (modal only) ── */
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
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

    /* ── Docked (inline open) ── */
    .docked-enter-from { opacity: 0; transform: translateY(-4px); }
    .docked-enter-active { transition: opacity 150ms cubic-bezier(0.4,0,0.2,1), transform 150ms cubic-bezier(0.4,0,0.2,1); }
    .docked-leave-to { opacity: 0; transform: translateY(-4px); }
    .docked-leave-active { transition: opacity 100ms cubic-bezier(0.4,0,0.2,1), transform 100ms cubic-bezier(0.4,0,0.2,1); }

    /* ── Picker container ── */
    .picker {
      background: var(--md-sys-color-surface-container-high, #ECE6F0);
      border-radius: 28px;
      width: 360px;
      max-width: calc(100vw - 48px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--md-sys-elevation-3, 0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.3));
    }

    /* ── Headline ── */
    .picker-headline {
      padding: 24px 24px 0;
    }
    .picker-headline-label {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 12px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      margin: 0 0 4px;
    }
    .picker-headline-value {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 36px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      margin: 0 0 16px;
    }

    /* ── Divider ── */
    .picker-divider {
      height: 1px;
      background: var(--md-sys-color-outline-variant, #CAC4D0);
      margin: 0 0 8px;
    }

    /* ── Calendar header ── */
    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 12px 4px 24px;
    }
    .cal-header-month {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      border: none;
      background: transparent;
      padding: 4px 8px;
      border-radius: 8px;
      outline: none;
    }
    .cal-header-month:hover {
      background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent);
    }
    .cal-header-month:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, #6750A4);
      outline-offset: 2px;
    }
    .cal-header-month-label {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      padding: 4px 4px 4px 0;
    }
    .cal-header-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 18;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .cal-header-nav {
      display: flex;
      gap: 4px;
    }
    .cal-header-nav.nav-hidden { visibility: hidden; pointer-events: none; }

    /* ── Fixed-height body for consistent layout ── */
    .cal-body {
      height: 304px;
      overflow-y: auto;
    }

    /* ── Weekday labels ── */
    .cal-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 0 12px;
      margin-bottom: 2px;
    }
    .cal-weekday {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 12px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      text-align: center;
      height: 40px;
      line-height: 40px;
    }

    /* ── Calendar grid ── */
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 0 12px;
    }
    .cal-day {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      justify-self: center;
      cursor: pointer;
      border-radius: 50%;
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      outline: none;
      background: transparent;
      border: none;
      padding: 0;
      user-select: none;
    }
    .cal-day:focus-visible { outline: 2px solid var(--md-sys-color-primary, #6750A4); outline-offset: 2px; }
    .cal-day.outside { color: var(--md-sys-color-on-surface-variant, #49454F); opacity: 0.38; }
    .cal-day.today::before {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      border: 1px solid var(--md-sys-color-primary, #6750A4);
      pointer-events: none;
    }
    .cal-day.selected {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }
    .cal-day.range-start,
    .cal-day.range-end {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }
    .cal-day.in-range {
      background: var(--md-sys-color-secondary-container, #E8DEF8);
      color: var(--md-sys-color-on-secondary-container, #21005D);
      border-radius: 0;
      width: 100%;
      justify-self: stretch;
    }
    .cal-day.range-start { border-radius: 50% 0 0 50%; width: 100%; justify-self: stretch; }
    .cal-day.range-end   { border-radius: 0 50% 50% 0; width: 100%; justify-self: stretch; }
    .cal-day:hover:not(.selected):not(.range-start):not(.range-end):not(.disabled) {
      background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent);
    }
    .cal-day.disabled { color: var(--md-sys-color-on-surface, #1C1B1F); opacity: 0.38; cursor: not-allowed; }

    /* ── Year list ── */
    .year-list {
      padding: 8px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      justify-content: center;
    }
    .year-item {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      border: none;
      background: transparent;
      outline: none;
    }
    .year-item:hover {
      background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent);
    }
    .year-item.selected {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }
    .year-item:focus-visible { outline: 2px solid var(--md-sys-color-primary, #6750A4); outline-offset: 2px; }

    /* ── Month list ── */
    .month-list {
      padding: 8px 12px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
    }
    .month-item {
      font-family: var(--md-sys-typescale-font,'Roboto',sans-serif);
      font-size: 14px;
      padding: 10px 8px;
      border-radius: 20px;
      cursor: pointer;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      border: none;
      background: transparent;
      text-align: center;
      outline: none;
    }
    .month-item:hover {
      background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent);
    }
    .month-item.selected {
      background: var(--md-sys-color-primary, #6750A4);
      color: var(--md-sys-color-on-primary, #FFFFFF);
    }
    .month-item:focus-visible { outline: 2px solid var(--md-sys-color-primary, #6750A4); outline-offset: 2px; }

    /* ── Navigation icon button ── */
    .nav-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      padding: 0;
      outline: none;
    }
    .nav-btn:hover { background: color-mix(in srgb, var(--md-sys-color-on-surface, #1C1B1F) 8%, transparent); }
    .nav-btn:focus-visible { outline: 2px solid var(--md-sys-color-primary, #6750A4); outline-offset: 2px; }
    .nav-btn-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 20px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20;
    }

    /* ── Actions ── */
    .picker-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 12px 20px;
    }

    /* ── Docked trigger ── */
    .docked-wrapper { position: relative; }
    .docked-picker {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: 100;
    }

    /* ── Docked input field ── */
    .docked-field {
      display: flex;
      align-items: center;
      height: 56px;
      border-radius: 4px;
      border: 1px solid var(--md-sys-color-outline, #79747E);
      padding: 0 12px;
      cursor: pointer;
      background: transparent;
      position: relative;
      width: 100%;
      box-sizing: border-box;
    }
    .docked-field:hover { border-color: var(--md-sys-color-on-surface, #1C1B1F); }
    .docked-field:focus-within { border-color: var(--md-sys-color-primary, #6750A4); border-width: 2px; padding: 0 11px; }
    .docked-field-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 16px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      cursor: pointer;
    }
    .docked-field-input::placeholder {
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .docked-field-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      margin-left: 8px;
    }
    .docked-field-label {
      position: absolute;
      left: 12px;
      top: -8px;
      background: var(--md-sys-color-surface, #FFFBFE);
      padding: 0 4px;
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .docked-field:focus-within .docked-field-label {
      color: var(--md-sys-color-primary, #6750A4);
    }
  `);

  // ── headline display ──────────────────────────────────────────────────
  const headlineValue = computed(() => {
    if (props.rangeStart || props.rangeEnd) {
      const s = props.rangeStart ? formatRangeDate(props.rangeStart) : '—';
      const e = props.rangeEnd   ? formatRangeDate(props.rangeEnd)   : '—';
      return `${s}  –  ${e}`;
    }
    const val = props.variant === 'dialog' ? pendingValue.value : modelValue.value;
    return val ? formatHeadline(val) : '——/——/————';
  });

  // ── calendar body ─────────────────────────────────────────────────────
  const renderCalendar = () => html`
    <div class="cal-header">
      <button
        type="button"
        class="cal-header-month"
        @click="${() => { view.value = view.value === 'year' ? 'day' : 'year'; }}"
        aria-label="Switch to year view"
        aria-expanded="${view.value === 'year'}"
      >
        <span class="cal-header-month-label">${monthLabel.value}</span>
        <span class="cal-header-icon" aria-hidden="true">
          ${view.value === 'year' ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </button>
      <div :class="${{ 'cal-header-nav': true, 'nav-hidden': view.value !== 'day' }}">
        <button type="button" class="nav-btn" aria-label="Previous month"
          @click="${(e: Event) => { e.stopPropagation(); if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value--; } else { viewMonth.value--; } }}"
        >
          <span class="nav-btn-icon" aria-hidden="true">chevron_left</span>
        </button>
        <button type="button" class="nav-btn" aria-label="Next month"
          @click="${(e: Event) => { e.stopPropagation(); if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++; } else { viewMonth.value++; } }}"
        >
          <span class="nav-btn-icon" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </div>
    <div class="cal-body">
    ${when(view.value === 'year', () => html`
      <div class="year-list" role="listbox" aria-label="Year selection">
          ${each(yearList.value.map((y) => ({ key: String(y), year: y })), (item: {key:string;year:number}) => html`
          <button
            :class="${{ 'year-item': true, selected: item.year === viewYear.value }}"
            role="option"
            aria-selected="${item.year === viewYear.value}"
            @click="${() => selectYear(item.year)}"
          >${String(item.year)}</button>
        `)}
      </div>
    `)}
    ${when(view.value === 'month', () => html`
      <div class="month-list" role="listbox" aria-label="Month selection">
          ${each(MONTH_NAMES.map((m, i) => ({ key: String(i), name: m, index: i })), (item: {key:string;name:string;index:number}) => html`
          <button
            :class="${{ 'month-item': true, selected: item.index === viewMonth.value }}"
            role="option"
            aria-selected="${item.index === viewMonth.value}"
            @click="${() => { viewMonth.value = item.index; view.value = 'day'; }}"
          >${item.name.slice(0, 3)}</button>
        `)}
      </div>
    `)}
    ${when(view.value === 'day', () => html`
      <div class="cal-weekdays" role="row">
          ${each(DAYS_OF_WEEK.map((d, i) => ({ key: String(i), label: d })), (item: {key:string;label:string}) => html`
          <div class="cal-weekday" role="columnheader" aria-label="${item.label}">${item.label}</div>
        `)}
      </div>
      <div
        class="cal-grid"
        role="grid"
        aria-label="${monthLabel.value}"
        @keydown="${(e: KeyboardEvent) => {
          const focused = document.activeElement;
          // find focused index in grid
          const cells = (e.currentTarget as HTMLElement).querySelectorAll('[role=gridcell]');
          let idx = Array.from(cells).findIndex(c => c === focused);
          if (idx < 0) return;
          let next = idx;
          if (e.key === 'ArrowRight') next = Math.min(idx + 1, cells.length - 1);
          else if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0);
          else if (e.key === 'ArrowDown') next = Math.min(idx + 7, cells.length - 1);
          else if (e.key === 'ArrowUp') next = Math.max(idx - 7, 0);
          else if (e.key === 'PageDown') nextMonth();
          else if (e.key === 'PageUp') prevMonth();
          else return;
          e.preventDefault();
          (cells[next] as HTMLElement).focus();
        }}"
      >
        ${each(calendarDays.value, (day: CalendarDay) => html`
          <button
            :class="${{ 'cal-day': true, outside: !day.inMonth, today: day.isToday, selected: day.isSelected, 'range-start': day.isRangeStart, 'range-end': day.isRangeEnd, 'in-range': day.isInRange, disabled: day.disabled }}"
              role="gridcell"
              aria-label="${day.date.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })}"
              aria-selected="${day.isSelected || day.isRangeStart || day.isRangeEnd}"
              aria-disabled="${day.disabled}"
              tabindex="${day.isSelected ? '0' : '-1'}"
              @click="${() => selectDay(day)}"
          >${day.label}</button>
        `)}
      </div>
    `)}
    </div>
  `;

  const renderActions = () => html`
    <div class="picker-actions">
      <md-button variant="text" @click="${() => { open.value = false; emit('update:open', false); emit('close'); }}">Cancel</md-button>
      <md-button variant="text" @click="${() => { if (props.variant === 'dialog' && pendingValue.value) { emit('change', pendingValue.value); modelValue.value = pendingValue.value; } open.value = false; emit('update:open', false); emit('close'); }}">OK</md-button>
    </div>
  `;

  const renderPicker = () => html`
    <div class="picker" role="dialog" aria-modal="true" aria-label="${props.ariaLabel}">
      <div class="picker-headline">
        <p class="picker-headline-label">Select date</p>
        <p class="picker-headline-value">${headlineValue.value}</p>
      </div>
      <div class="picker-divider"></div>
      ${renderCalendar()}
      ${renderActions()}
    </div>
  `;

  return html`
    ${Transition({ show: open.value && props.variant === 'dialog',
      enterFrom: 'scrim-enter-from', enterActive: 'scrim-enter-active',
      leaveActive: 'scrim-leave-active', leaveTo: 'scrim-leave-to',
      onBeforeEnter: scrollLock.lock,
      onAfterEnter: trap.onAfterEnter,
      onAfterLeave: () => { trap.onAfterLeave(); scrollLock.unlock(); },
    }, html`
      <div
        class="scrim"
        @click="${(e: Event) => { if (e.target === e.currentTarget) { emit('close'); open.value = false; emit('update:open', false); } }}"
      >
        ${renderPicker()}
      </div>
    `)}
    ${when(props.variant === 'docked', () => html`
      <div class="docked-wrapper">
        <div class="docked-field" @click="${() => toggleDocked()}">
          <span class="docked-field-label">${props.label}</span>
          <input
            class="docked-field-input"
            type="text"
            readonly
            :value="${modelValue.value ? formatHeadline(modelValue.value) : ''}"
            placeholder="mm/dd/yyyy"
            aria-label="${props.label}"
          />
          <span class="docked-field-icon" aria-hidden="true">calendar_today</span>
        </div>
        ${Transition({ show: open.value,
          enterFrom: 'docked-enter-from', enterActive: 'docked-enter-active',
          leaveActive: 'docked-leave-active', leaveTo: 'docked-leave-to',
        }, html`
          <div class="docked-picker">
            <div class="picker" role="dialog" aria-label="${props.ariaLabel}">
              ${renderCalendar()}
              ${renderActions()}
            </div>
          </div>
        `)}
      </div>
    `)}
  `;
});
