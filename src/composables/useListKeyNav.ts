/**
 * Options for useListKeyNav.
 */
export interface ListKeyNavOptions {
  /** Whether arrow keys navigate left/right or up/down. */
  orientation: 'horizontal' | 'vertical';
  /**
   * CSS selector (relative to the container) used to find navigable items.
   * Disabled items should be excluded, e.g. `'[role="menuitem"]:not([disabled])'`.
   */
  itemSelector: string;
  /**
   * Optional callback invoked after focus moves to the new item.
   * Use this to update component state in addition to focus movement,
   * e.g. activating a tab or selecting a radio segment.
   */
  onNavigate?: (item: HTMLElement, index: number) => void;
}

/**
 * Returns a `keydown` event handler that implements arrow-key, Home, and End
 * navigation within a container element.  Attach the handler to the container
 * element via `@keydown`.
 *
 * The handler queries `:focus` within the container to determine the current
 * item.  This correctly resolves focus inside shadow DOM where
 * `document.activeElement` would only return the host element.
 *
 * @example
 * // Vertical list (menu):
 * const handleKeyDown = useListKeyNav({
 *   orientation: 'vertical',
 *   itemSelector: '[role="menuitem"]:not([disabled])',
 * });
 *
 * // Horizontal list with activation callback (tabs):
 * const handleKeyDown = useListKeyNav({
 *   orientation: 'horizontal',
 *   itemSelector: '[role="tab"]',
 *   onNavigate: (_, idx) => { active.value = tabs[idx].id; emit('tab-change', tabs[idx].id); },
 * });
 */
export function useListKeyNav(options: ListKeyNavOptions): (e: KeyboardEvent) => void {
  const prevKey = options.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
  const nextKey = options.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

  return (e: KeyboardEvent) => {
    const container = e.currentTarget as HTMLElement;
    const items = Array.from(container.querySelectorAll<HTMLElement>(options.itemSelector));
    if (!items.length) return;

    const focused = container.querySelector<HTMLElement>(':focus');
    const focusedItem = focused ? (items.find(i => i === focused || i.contains(focused)) ?? null) : null;
    const currentIdx = focusedItem ? items.indexOf(focusedItem) : -1;
    let newIdx = currentIdx;

    if (e.key === nextKey)      { newIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % items.length; }
    else if (e.key === prevKey) { newIdx = currentIdx < 0 ? items.length - 1 : (currentIdx - 1 + items.length) % items.length; }
    else if (e.key === 'Home')  { newIdx = 0; }
    else if (e.key === 'End')   { newIdx = items.length - 1; }
    else { return; }

    e.preventDefault();
    const item = items[newIdx];
    item?.focus();
    if (item) options.onNavigate?.(item, newIdx);
  };
}
