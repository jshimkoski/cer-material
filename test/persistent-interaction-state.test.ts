// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { component, html, ref } from '@jasonshimmy/custom-elements-runtime';
import '../src/components/md-app-bar';
import '../src/components/md-tooltip';
import '../src/components/md-button';
import '../src/components/md-date-picker';
import { useEscapeKey } from '../src/composables/useEscapeKey';

const nextRender = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('persistent interaction state across renders', () => {
  it('cancels a pending tooltip show after a re-render and pointer leave', async () => {
    const tooltip = document.createElement('md-tooltip');
    tooltip.setAttribute('text', 'Helpful text');
    document.body.append(tooltip);
    await nextRender();

    tooltip.shadowRoot
      ?.querySelector<HTMLElement>('.anchor')
      ?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    // Prop changes force a component render while the delayed show timer is live.
    tooltip.setAttribute('text', 'Updated text');
    await nextRender();
    tooltip.shadowRoot
      ?.querySelector<HTMLElement>('.anchor')
      ?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 650));
    expect(tooltip.shadowRoot?.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('removes the exact app-bar scroll listener after a re-render', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const appBar = document.createElement('md-app-bar');
    document.body.append(appBar);
    await nextRender();

    appBar.setAttribute('title', 'Updated title');
    await nextRender();
    appBar.remove();
    await nextRender();

    const addedScrollHandler = addSpy.mock.calls.find(([type]) => type === 'scroll')?.[1];
    expect(addedScrollHandler).toBeTypeOf('function');
    expect(removeSpy).toHaveBeenCalledWith('scroll', addedScrollHandler);
  });

  it('removes the exact Escape listener after a reactive re-render', async () => {
    let escapeCount = 0;
    if (!customElements.get('md-test-escape-cleanup')) {
      component('md-test-escape-cleanup', () => {
        const enabled = ref(false);
        useEscapeKey(
          () => enabled.value,
          () => escapeCount++,
        )();
        return html`
          <button @click="${() => (enabled.value = true)}">Enable</button>
        `;
      });
    }

    const host = document.createElement('md-test-escape-cleanup');
    document.body.append(host);
    await nextRender();
    host.shadowRoot?.querySelector<HTMLButtonElement>('button')?.click();
    await nextRender();
    host.remove();
    await nextRender();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(escapeCount).toBe(0);
  });

  it('preserves a typed modal date across an unrelated reactive render', async () => {
    const picker = document.createElement('md-date-picker') as HTMLElement & {
      open: boolean;
      variant: string;
      ariaLabel: string;
    };
    Object.assign(picker, {
      open: true,
      variant: 'modal-input',
      ariaLabel: 'Choose date',
    });
    const changes = vi.fn();
    picker.addEventListener('change', changes);
    document.body.append(picker);
    await nextRender();
    await nextRender();

    const input = picker.shadowRoot?.querySelector<HTMLInputElement>(
      'input[placeholder="MM/DD/YYYY"]',
    );
    expect(input).toBeTruthy();
    if (!input) return;
    input.value = '01/15/2026';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    picker.ariaLabel = 'Choose an updated date';
    await nextRender();
    picker.shadowRoot?.querySelector<HTMLButtonElement>('button.headline-toggle')?.click();
    await nextRender();

    const ok = [...(picker.shadowRoot?.querySelectorAll('md-button') ?? [])]
      .find((button) => button.textContent?.trim() === 'OK');
    ok?.shadowRoot?.querySelector<HTMLButtonElement>('button')?.click();
    await nextRender();

    expect(changes).toHaveBeenCalledOnce();
    expect((changes.mock.calls[0][0] as CustomEvent).detail).toBe('2026-01-15');
  });
});
