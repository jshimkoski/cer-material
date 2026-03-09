import { component, html, css, useProps, useEmit, useStyle, useOnDisconnected, useTeleport } from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

component('md-snackbar', () => {
  const props = useProps({
    open: false,
    message: '',
    actionLabel: '',
    duration: 4000,
  });
  const emit = useEmit();

  // Teleport to body so the snackbar always renders above every stacking context.
  const { portal, destroy } = useTeleport('body');
  useOnDisconnected(destroy);

  // Always portal — CSS transitions on .md-snackbar-bar handle enter/exit animation.
  portal(html`
    <div
      :class="${{ 'md-snackbar-bar': true, open: props.open }}"
      role="status"
      aria-live="polite"
    >
      <span class="md-snackbar-message">${props.message}</span>
      ${when(!!props.actionLabel, () => html`
        <button class="md-snackbar-action" @click="${() => emit('action')}">
          ${props.actionLabel}
        </button>
      `)}
      <button class="md-snackbar-close" aria-label="Dismiss" @click="${() => emit('close')}">
        <span class="md-snackbar-close-icon" aria-hidden="true">close</span>
      </button>
    </div>
  `);

  // Host element has no visual footprint.
  useStyle(() => css`:host { display: contents; }`);
  return html``;
});
