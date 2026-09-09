// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { component, html, ref } from '@jasonshimmy/custom-elements-runtime';
import '../src/components/md-bottom-sheet';
import '../src/components/md-fab-menu';

const nextRender = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.replaceChildren();
});

describe('mobile overlay components', () => {
  it('exposes menu semantics and emits one selection from a FAB action', async () => {
    const menu = document.createElement('md-fab-menu') as HTMLElement & {
      items: Array<{ id: string; icon: string; label: string }>;
    };
    menu.items = [{ id: 'toc', icon: 'toc', label: 'Contents' }];
    const selected = vi.fn();
    menu.addEventListener('select', selected);
    document.body.append(menu);
    await nextRender();

    const trigger = menu.shadowRoot?.querySelector<HTMLButtonElement>('.fab-trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    trigger?.click();
    await nextRender();

    menu.shadowRoot?.querySelector<HTMLButtonElement>('.menu-item')?.click();
    await nextRender();

    expect(selected).toHaveBeenCalledOnce();
    expect((selected.mock.calls[0][0] as CustomEvent).detail).toEqual({ id: 'toc' });
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not retain a disconnected FAB menu as the global active menu', async () => {
    const first = document.createElement('md-fab-menu');
    const second = document.createElement('md-fab-menu');
    const firstClosed = vi.fn();
    first.addEventListener('close', firstClosed);
    document.body.append(first, second);
    await nextRender();

    first.shadowRoot?.querySelector<HTMLButtonElement>('.fab-trigger')?.click();
    await nextRender();
    first.remove();
    await nextRender();
    second.shadowRoot?.querySelector<HTMLButtonElement>('.fab-trigger')?.click();
    await nextRender();

    expect(firstClosed).not.toHaveBeenCalled();
  });

  it('gives every open bottom-sheet dialog its own direct accessible name', async () => {
    const first = document.createElement('md-bottom-sheet') as HTMLElement & {
      open: boolean;
      variant: string;
      headline: string;
    };
    const second = document.createElement('md-bottom-sheet') as typeof first;
    Object.assign(first, { open: true, variant: 'modal', headline: 'Contents' });
    Object.assign(second, { open: true, variant: 'modal', headline: 'Filters' });
    document.body.append(first, second);
    await nextRender();
    await nextRender();

    const firstDialog = first.shadowRoot?.querySelector('[role="dialog"]');
    const secondDialog = second.shadowRoot?.querySelector('[role="dialog"]');
    expect(firstDialog?.getAttribute('aria-label')).toBe('Contents');
    expect(secondDialog?.getAttribute('aria-label')).toBe('Filters');
    expect(first.shadowRoot?.querySelector('[id="bottom-sheet-headline"]')).toBeNull();
    expect(second.shadowRoot?.querySelector('[id="bottom-sheet-headline"]')).toBeNull();
  });

  it('releases the page scroll lock as soon as a modal bottom sheet closes', async () => {
    let open!: ReturnType<typeof ref<boolean>>;
    component('test-bottom-sheet-scroll-lock', () => {
      open = ref(false);
      return html`
        <md-bottom-sheet
          variant="modal"
          headline="Contents"
          :model:open="${open}"
        ></md-bottom-sheet>
      `;
    });

    const fixture = document.createElement('test-bottom-sheet-scroll-lock');
    document.body.append(fixture);
    await nextRender();
    open.value = true;
    await nextRender();

    expect(document.body.style.overflow).toBe('hidden');

    open.value = false;
    await nextRender();

    expect(document.body.style.overflow).toBe('');
  });

  it('keeps an active bottom-sheet drag intact across a reactive render', async () => {
    const sheet = document.createElement('md-bottom-sheet') as HTMLElement & {
      open: boolean;
      variant: string;
      headline: string;
    };
    Object.assign(sheet, { open: true, variant: 'standard', headline: 'Contents' });
    document.body.append(sheet);
    await nextRender();
    await nextRender();

    const handle = sheet.shadowRoot?.querySelector<HTMLElement>('.drag-handle');
    expect(handle).toBeTruthy();
    Object.defineProperty(handle, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    handle?.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, clientY: 100, pointerId: 1 }),
    );

    sheet.headline = 'Updated contents';
    await nextRender();
    sheet.shadowRoot?.querySelector<HTMLElement>('.drag-handle')?.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, clientY: 160, pointerId: 1 }),
    );

    expect(
      sheet.shadowRoot?.querySelector<HTMLElement>('.standard-bottom-sheet')?.style.transform,
    ).toBe('translateY(60px)');
  });
});
