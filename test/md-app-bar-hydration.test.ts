// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import {
  component,
  html,
  ref,
} from '@jasonshimmy/custom-elements-runtime';

describe('Material shell server hydration', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('opens a model-bound navigation drawer from a hydrated app bar', async () => {
    const shell = document.createElement('test-material-hydration-shell');
    const shellRoot = shell.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    const appBar = document.createElement('md-app-bar');
    const appBarRoot = appBar.attachShadow({ mode: 'open' });
    appBarRoot.innerHTML = '<header><button type="button" aria-label="Navigation">menu</button></header>';
    const drawer = document.createElement('md-navigation-drawer');
    const drawerRoot = drawer.attachShadow({ mode: 'open' });
    drawerRoot.innerHTML = '<span>closed</span>';
    wrapper.append(appBar, drawer);
    shellRoot.append(wrapper);
    document.body.append(shell);

    await Promise.all([
      import('../src/components/md-app-bar'),
      import('../src/components/md-navigation-drawer'),
    ]);
    expect(customElements.get('md-app-bar')).toBeDefined();
    expect(customElements.get('md-navigation-drawer')).toBeDefined();
    component('test-material-hydration-shell', () => {
      const open = ref(false);
      return html`<div><md-app-bar variant="small" leading-icon="menu" title="Test" :bind="${{ trailingIcons: ['search'] }}" @nav="${() => (open.value = true)}"></md-app-bar><md-navigation-drawer variant="modal" :model:open="${open}" :items="${[{ id: 'home', label: 'Home', icon: 'home' }]}"></md-navigation-drawer></div>`;
    });
    customElements.upgrade(appBar);
    customElements.upgrade(drawer);
    customElements.upgrade(shell);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const liveAppBar = shell.shadowRoot?.querySelector('md-app-bar');
    const liveDrawer = shell.shadowRoot?.querySelector('md-navigation-drawer');
    expect(liveAppBar).toBeInstanceOf(customElements.get('md-app-bar')!);
    expect(liveDrawer).toBeInstanceOf(customElements.get('md-navigation-drawer')!);
    expect(liveAppBar?.isConnected).toBe(true);
    (liveAppBar?.shadowRoot?.querySelector('button') as HTMLButtonElement | null)?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(liveDrawer?.shadowRoot?.querySelector('[role="dialog"]')).not.toBeNull();
  });
});
