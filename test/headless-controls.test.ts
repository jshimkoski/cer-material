// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { component, html, ref } from '@jasonshimmy/custom-elements-runtime';
import { useCarousel } from '../src/composables/useCarousel';
import { useCombobox } from '../src/composables/useCombobox';
const tick = () => new Promise((done) => setTimeout(done, 0));
afterEach(() => document.body.replaceChildren());

describe('headless controls across renders', () => {
  it('retains carousel selection, wraps and ignores modified shortcuts', async () => {
    component('test-headless-carousel', () => {
      const control = useCarousel(() => 3);
      return html`<button @keydown="${control.onKeydown}" @click="${() => control.move(1)}">${control.selected.value}</button>`;
    });
    const host = document.createElement('test-headless-carousel'); document.body.append(host); await tick();
    const button = () => host.shadowRoot!.querySelector('button')!;
    button().click(); await tick(); expect(button().textContent).toBe('1');
    button().click(); await tick(); expect(button().textContent).toBe('2');
    button().click(); await tick(); expect(button().textContent).toBe('0');
    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'End' })); await tick(); expect(button().textContent).toBe('2');
    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true })); await tick(); expect(button().textContent).toBe('2');
  });
  it('selects the keyboard result and resets on Escape', async () => {
    let selected = '';
    component('test-headless-combobox', () => {
      const query = ref('');
      const control = useCombobox({ items: () => ['Alpha', 'Beta'], onSelect: (item) => { selected = item; }, onEscape: () => { query.value = ''; } });
      return html`<input @keydown="${control.onKeydown}" :data-active="${control.activeIndex.value}">`;
    });
    const host = document.createElement('test-headless-combobox'); document.body.append(host); await tick();
    const input = () => host.shadowRoot!.querySelector('input')!;
    for (const key of ['ArrowDown', 'ArrowDown', 'Enter']) { input().dispatchEvent(new KeyboardEvent('keydown', { key })); await tick(); }
    expect(selected).toBe('Beta');
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await tick(); expect(input().dataset.active).toBe('-1');
  });
});

it('selects falsy combobox items and notifies active-state reset', async () => {
  let selected: number | undefined, active = 99;
  component('test-falsy-combobox', () => {
    const control = useCombobox({ items: () => [0, 1], onSelect: (item) => { selected = item; }, onActive: (index) => { active = index; } });
    return html`<input @keydown="${control.onKeydown}">`;
  });
  const host = document.createElement('test-falsy-combobox'); document.body.append(host); await tick();
  const input = host.shadowRoot!.querySelector('input')!;
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  expect(selected).toBe(0);
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(active).toBe(-1);
});

it('clamps carousel selection when its items shrink', async () => {
  let count: ReturnType<typeof ref<number>>;
  component('test-shrinking-carousel', () => {
    count = ref(3);
    const control = useCarousel(() => count.value);
    return html`<button @click="${() => control.select(2)}">${control.selected.value}</button>`;
  });
  const host = document.createElement('test-shrinking-carousel'); document.body.append(host); await tick();
  host.shadowRoot!.querySelector('button')!.click(); await tick();
  count!.value = 1; await tick();
  expect(host.shadowRoot!.querySelector('button')!.textContent).toBe('0');
});
