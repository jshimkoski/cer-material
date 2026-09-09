// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import '../src/components/md-list';
import '../src/components/md-icon-button';
import '../src/components/md-chip';
import '../src/components/md-card';
import '../src/components/md-fab';
import '../src/components/md-split-button';
import '../src/components/md-button';
import '../src/components/md-search';

const nextRender = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.replaceChildren();
});

describe('native click event forwarding', () => {
  it('delegates focus from md-search to its native input', async () => {
    const search = document.createElement('md-search') as HTMLElement;
    document.body.append(search);
    await nextRender();

    search.focus();

    expect(search.shadowRoot?.activeElement).toBe(
      search.shadowRoot?.querySelector('input[type="search"]'),
    );
  });

  it('forwards autofocus to the native search input', async () => {
    const search = document.createElement('md-search') as HTMLElement & {
      autofocus: boolean;
    };
    search.autofocus = true;
    document.body.append(search);
    await nextRender();

    expect(
      search.shadowRoot?.querySelector('input[type="search"]')?.hasAttribute('autofocus'),
    ).toBe(true);
  });

  it('exposes combobox relationships for an external result list', async () => {
    const search = document.createElement('md-search') as HTMLElement & {
      listboxId: string;
      activeDescendant: string;
      expanded: boolean;
    };
    Object.assign(search, {
      listboxId: 'site-search-results',
      activeDescendant: 'site-search-result-2',
      expanded: true,
    });
    document.body.append(search);
    await nextRender();

    const input = search.shadowRoot?.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input?.getAttribute('role')).toBe('combobox');
    expect(input?.getAttribute('aria-autocomplete')).toBe('list');
    expect(input?.getAttribute('aria-controls')).toBe('site-search-results');
    expect(input?.getAttribute('aria-activedescendant')).toBe('site-search-result-2');
    expect(input?.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps combobox relationships reactive after connection', async () => {
    const search = document.createElement('md-search') as HTMLElement & {
      listboxId: string;
      activeDescendant: string;
      expanded: boolean;
    };
    search.listboxId = 'site-search-results';
    document.body.append(search);
    await nextRender();

    search.expanded = true;
    search.activeDescendant = 'site-search-result-1';
    await nextRender();

    const input = search.shadowRoot?.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input?.getAttribute('aria-expanded')).toBe('true');
    expect(input?.getAttribute('aria-activedescendant')).toBe('site-search-result-1');
  });

  it('renders md-button as a native link when href is provided', async () => {
    const button = document.createElement('md-button') as HTMLElement & {
      href: string;
      target: string;
      rel: string;
    };
    Object.assign(button, {
      href: '/music/amps',
      target: '_self',
      rel: 'nofollow',
    });
    document.body.append(button);
    await nextRender();

    const link = button.shadowRoot?.querySelector<HTMLAnchorElement>('a');
    expect(link?.getAttribute('href')).toBe('/music/amps');
    expect(link?.getAttribute('target')).toBe('_self');
    expect(link?.getAttribute('rel')).toBe('nofollow');
  });

  it('emits one host click when a list item is clicked', async () => {
    const item = document.createElement('md-list-item');
    document.body.append(item);
    await nextRender();
    const clicks: Event[] = [];
    item.addEventListener('click', (event) => clicks.push(event));

    item.shadowRoot?.querySelector<HTMLElement>('.list-item')?.click();

    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toBeInstanceOf(MouseEvent);
  });

  it('emits one host click when an icon button is clicked', async () => {
    const button = document.createElement('md-icon-button');
    document.body.append(button);
    await nextRender();
    const clicks: Event[] = [];
    button.addEventListener('click', (event) => clicks.push(event));

    button.shadowRoot?.querySelector<HTMLButtonElement>('button')?.click();

    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toBeInstanceOf(MouseEvent);
  });

  it('turns keyboard chip activation into one standard click', async () => {
    const chip = document.createElement('md-chip');
    document.body.append(chip);
    await nextRender();
    const clicks: Event[] = [];
    chip.addEventListener('click', (event) => clicks.push(event));
    const interactive = chip.shadowRoot?.querySelector<HTMLElement>('.chip');

    interactive?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toBeInstanceOf(MouseEvent);
  });

  it.each([
    ['md-fab', 'button'],
    ['md-split-button', '.primary-btn'],
  ])('emits one host click from the primary control in %s', async (tag, selector) => {
    const host = document.createElement(tag);
    document.body.append(host);
    await nextRender();
    const clicks: Event[] = [];
    host.addEventListener('click', (event) => clicks.push(event));

    host.shadowRoot?.querySelector<HTMLElement>(selector)?.click();

    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toBeInstanceOf(MouseEvent);
  });

  it('emits one host click from a clickable card', async () => {
    const card = document.createElement('md-card') as HTMLElement & { clickable: boolean };
    card.clickable = true;
    document.body.append(card);
    await nextRender();
    const clicks: Event[] = [];
    card.addEventListener('click', (event) => clicks.push(event));

    card.shadowRoot?.querySelector<HTMLElement>('.card')?.click();

    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toBeInstanceOf(MouseEvent);
  });
});
