// Apply MD3 design tokens to the document.
// Also exported so advanced consumers can call it lazily.
export { applyTheme } from './theme.ts';

// Material Design 3 Components
// Each import is a side-effect that registers the custom element.
import './components/md-app-bar.ts';
import './components/md-badge.ts';
import './components/md-bottom-sheet.ts';
import './components/md-button-group.ts';
import './components/md-button.ts';
import './components/md-card.ts';
import './components/md-carousel.ts';
import './components/md-checkbox.ts';
import './components/md-chip.ts';
import './components/md-date-picker.ts';
import './components/md-dialog.ts';
import './components/md-divider.ts';
import './components/md-fab-menu.ts';
import './components/md-fab.ts';
import './components/md-icon-button.ts';
import './components/md-list.ts';
import './components/md-loading-indicator.ts';
import './components/md-menu.ts';
import './components/md-navigation-bar.ts';
import './components/md-navigation-drawer.ts';
import './components/md-navigation-rail.ts';
import './components/md-progress.ts';
import './components/md-radio.ts';
import './components/md-search.ts';
import './components/md-segmented-button.ts';
import './components/md-side-sheet.ts';
import './components/md-slider.ts';
import './components/md-snackbar.ts';
import './components/md-split-button.ts';
import './components/md-switch.ts';
import './components/md-tabs.ts';
import './components/md-text-field.ts';
import './components/md-time-picker.ts';
import './components/md-tooltip.ts';

// Composables — reusable logic available for advanced consumers
export * from './composables/useControlledValue.ts';
export * from './composables/useEscapeKey.ts';
export * from './composables/useFocusReturn.ts';
export * from './composables/useFocusTrap.ts';
export * from './composables/useListKeyNav.ts';
export * from './composables/useScrollLock.ts';
