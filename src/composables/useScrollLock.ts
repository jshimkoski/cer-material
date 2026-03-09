// Global reference counter so multiple overlays stacking don't conflict.
let lockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

export function useScrollLock() {
  return {
    lock() {
      if (lockCount === 0) {
        // Measure scrollbar width before hiding overflow so we can compensate
        // and prevent layout shift when the scrollbar disappears.
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        savedOverflow = document.body.style.overflow;
        savedPaddingRight = document.body.style.paddingRight;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
          const current = parseFloat(savedPaddingRight) || 0;
          document.body.style.paddingRight = `${current + scrollbarWidth}px`;
        }
      }
      lockCount++;
    },
    unlock() {
      if (lockCount <= 0) return;
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow;
        document.body.style.paddingRight = savedPaddingRight;
      }
    },
  };
}
