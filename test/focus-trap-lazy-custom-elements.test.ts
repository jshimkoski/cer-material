// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../src/components/md-side-sheet';

const wait = (ms = 0) => new Promise<void>((resolve) => setTimeout(resolve, ms));

afterEach(() => {
  document.body.replaceChildren();
});

describe('focus trap with lazily registered custom elements', () => {
  it('activates autofocus as soon as a modal overlay starts entering', async () => {
    const sheet = document.createElement('md-side-sheet') as HTMLElement & {
      variant: 'modal';
      open: boolean;
    };
    sheet.variant = 'modal';
    const input = document.createElement('input');
    input.autofocus = true;
    sheet.append(input);
    document.body.append(sheet);
    await wait();
    sheet.open = true;

    await wait(20);

    expect(document.activeElement).toBe(input);
  });

  it('honors autofocus when the nested custom element is defined after the overlay opens', async () => {
    const lateTag = 'test-late-autofocus-control';
    const whenDefined = vi.spyOn(customElements, 'whenDefined');
    const sheet = document.createElement('md-side-sheet') as HTMLElement & {
      variant: 'modal';
      open: boolean;
    };
    sheet.variant = 'modal';

    const lateControl = document.createElement(lateTag);
    lateControl.setAttribute('autofocus', '');
    sheet.append(lateControl);
    document.body.append(sheet);
    await wait();
    sheet.open = true;

    await wait(400);
    expect(sheet.shadowRoot?.querySelector('[role="dialog"]')).toBeTruthy();
    expect(lateControl.shadowRoot).toBeNull();
    expect(sheet.shadowRoot?.activeElement).toBe(
      sheet.shadowRoot?.querySelector('button[aria-label="Close side sheet"]'),
    );
    expect(whenDefined).toHaveBeenCalledWith(lateTag);

    customElements.define(lateTag, class extends HTMLElement {
      connectedCallback() {
        if (!this.shadowRoot) {
          this.attachShadow({ mode: 'open' }).innerHTML = '<input aria-label="Late search">';
        }
      }
    });
    await wait();

    expect(lateControl.shadowRoot?.activeElement).toBe(
      lateControl.shadowRoot?.querySelector('input'),
    );
  });
});
