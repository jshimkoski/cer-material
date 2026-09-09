import { ref } from '@jasonshimmy/custom-elements-runtime';

// Global reference counter so multiple overlays stacking don't conflict.
let lockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

export function useScrollLock() {
  // Each caller owns at most one lock. Transition callbacks and disconnect
  // cleanup can legitimately fire more than once; without per-owner tracking,
  // one overlay could decrement the global count and unlock another overlay.
  // Component setup functions are re-evaluated by CER. A hook-backed ref
  // preserves ownership across those renders; a plain closure boolean would
  // be replaced, making the closing render unable to release the opening
  // render's lock.
  const locked = ref(false);

  return {
    lock() {
      if (locked.value) return;
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
      locked.value = true;
    },
    unlock() {
      if (!locked.value) return;
      locked.value = false;
      if (lockCount <= 0) return;
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow;
        document.body.style.paddingRight = savedPaddingRight;
      }
    },
  };
}
