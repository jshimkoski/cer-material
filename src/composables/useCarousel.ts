import { ref } from '@jasonshimmy/custom-elements-runtime';

/** Selected-slide behavior independent of responsive picture / caption markup. */
export function useCarousel(count: () => number) {
  const selected = ref(0);
  const length = Math.max(0, count());
  if (selected.peek() >= length) selected.initSilent(Math.max(0, length - 1));
  const select = (index: number) => {
    const length = count();
    selected.value = length > 0 ? ((index % length) + length) % length : 0;
  };
  const move = (offset: number) => select(selected.value + offset);
  const onKeydown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (event.key === 'ArrowRight') move(1);
    else if (event.key === 'ArrowLeft') move(-1);
    else if (event.key === 'Home') select(0);
    else if (event.key === 'End') select(count() - 1);
    else return;
    event.preventDefault();
  };
  const touchStart = ref<{ x: number; y: number } | undefined>(undefined);
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.value = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : undefined;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    if (touchStart.value && touch) {
      const dx = touch.clientX - touchStart.value.x, dy = touch.clientY - touchStart.value.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    }
    touchStart.value = undefined;
  };
  const onTouchCancel = () => { touchStart.value = undefined; };
  return { selected, select, move, onKeydown, onTouchStart, onTouchEnd, onTouchCancel };
}
