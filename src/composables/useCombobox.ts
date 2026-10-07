import { ref } from '@jasonshimmy/custom-elements-runtime';

export interface ComboboxOptions<T> {
  items: () => readonly T[];
  onSelect: (item: T) => void;
  onActive?: (index: number) => void;
  onEscape?: () => void;
}
/** Native input/results should share a tree scope; focus stays on the input. */
export function useCombobox<T>(options: ComboboxOptions<T>) {
  const activeIndex = ref(-1);
  const reset = () => { activeIndex.value = -1; options.onActive?.(-1); };
  const onKeydown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    const items = options.items();
    if (event.key === 'Escape') { reset(); options.onEscape?.(); return; }
    if (event.key === 'Enter') {
      const item = items[Math.max(0, activeIndex.value)];
      if (item !== undefined) { event.preventDefault(); options.onSelect(item); }
      return;
    }
    if (!items.length) return;
    if (event.key === 'ArrowDown') activeIndex.value = Math.min(activeIndex.value + 1, items.length - 1);
    else if (event.key === 'ArrowUp') activeIndex.value = Math.max(activeIndex.value - 1, -1);
    else if (event.key === 'Home' && activeIndex.value >= 0) activeIndex.value = 0;
    else if (event.key === 'End' && activeIndex.value >= 0) activeIndex.value = items.length - 1;
    else return;
    event.preventDefault();
    options.onActive?.(activeIndex.value);
  };
  return { activeIndex, reset, onKeydown };
}
