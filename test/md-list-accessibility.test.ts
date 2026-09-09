// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { renderToStringDSD } from '@jasonshimmy/custom-elements-runtime/ssr';
import '../src/components/md-list';

describe('md-list accessibility semantics', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('puts list ownership on component hosts while retaining a native link', async () => {
    const list = document.createElement('md-list');
    const item = document.createElement('md-list-item') as HTMLElement & {
      type: string;
      href: string;
      headline: string;
    };
    item.type = 'link';
    item.href = '#target';
    item.headline = 'Target';
    list.append(item);
    document.body.append(list);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const link = item.shadowRoot?.querySelector('a');

    expect(list.getAttribute('role')).toBe('list');
    expect(item.getAttribute('role')).toBe('listitem');
    expect(item.shadowRoot?.querySelector('[role="listitem"]')).toBeNull();
    expect(link?.getAttribute('href')).toBe('#target');
    expect(link?.getAttribute('role')).toBeNull();
  });

  it.each([
    ['checkbox', 'checkbox'],
    ['radio', 'radio'],
  ])('exposes %s semantics on the focusable host', async (type, role) => {
    const item = document.createElement('md-list-item') as HTMLElement & {
      type: string;
      headline: string;
    };
    item.type = type;
    item.headline = type;
    document.body.append(item);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(item.getAttribute('role')).toBe(role);
    expect(item.getAttribute('aria-checked')).toBe('false');
    expect(item.getAttribute('tabindex')).toBe('0');
    expect(item.shadowRoot?.querySelector(`[role="${role}"]`)).toBeNull();
  });

  it('hydrates server-rendered list items only when they become visible', () => {
    const html = renderToStringDSD(
      {
        tag: 'md-list-item',
        props: { attrs: { type: 'link', href: '/target', headline: 'Target' } },
        children: [],
      } as never,
      { dsdPolyfill: false },
    );

    expect(html).toContain('<md-list-item');
    expect(html).toContain('data-cer-hydrate="visible"');
    expect(html).toContain('href="/target"');
  });
});
