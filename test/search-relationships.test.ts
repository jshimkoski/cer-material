// @vitest-environment happy-dom
import { afterEach, expect, it } from 'vitest';
import '../src/components/md-search';
const tick = () => new Promise((done) => setTimeout(done, 0));
afterEach(() => document.body.replaceChildren());

it('clears removed element relationships and restores legacy IDs', async () => {
  const host = document.createElement('md-search') as HTMLElement & { controlsElement: HTMLElement | null; activeDescendantElement: HTMLElement | null; listboxId: string; activeDescendant: string };
  document.body.append(host); await tick();
  const input = host.shadowRoot!.querySelector('input')! as HTMLInputElement & { ariaActiveDescendantElement: HTMLElement | null };
  Object.defineProperty(input, 'ariaControlsElements', { configurable: true, writable: true, value: [] });
  Object.defineProperty(input, 'ariaActiveDescendantElement', { configurable: true, writable: true, value: null });
  const list = document.createElement('div'), option = document.createElement('div');
  host.controlsElement = list; host.activeDescendantElement = option; await tick();
  expect(input.ariaControlsElements).toEqual([list]); expect(input.ariaActiveDescendantElement).toBe(option);
  host.controlsElement = null; host.activeDescendantElement = null; host.listboxId = 'results'; host.activeDescendant = 'option-1'; await tick();
  expect(input.ariaControlsElements).toEqual([]); expect(input.ariaActiveDescendantElement).toBeNull();
  expect(input.getAttribute('aria-controls')).toBe('results'); expect(input.getAttribute('aria-activedescendant')).toBe('option-1');
});
