import { describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import {
  cerMaterial,
  findMaterialSymbolNames,
  materialComponentResolver,
  materialSymbols,
} from '../src/vite';

describe('CER Material application integration', () => {
  it('resolves every public Material component to its tree-shakeable entry', () => {
    expect(materialComponentResolver('md-button')).toBe(
      '@jasonshimmy/cer-material/components/md-button',
    );
    expect(materialComponentResolver('md-bottom-sheet')).toBe(
      '@jasonshimmy/cer-material/components/md-bottom-sheet',
    );
    expect(materialComponentResolver('md-list-item')).toBe(
      '@jasonshimmy/cer-material/components/md-list',
    );
    expect(materialComponentResolver('md-not-a-component')).toBeUndefined();
    expect(materialComponentResolver('my-button')).toBeUndefined();
  });

  it('keeps the resolver synchronized with every public component registration', () => {
    const componentDirectory = new URL('../src/components/', import.meta.url);
    const registrations = readdirSync(componentDirectory)
      .filter(file => file.endsWith('.ts') && file !== 'md-showcase.ts')
      .flatMap(file => {
        const source = readFileSync(new URL(file, componentDirectory), 'utf8');
        const tags = [...source.matchAll(/component\(['"](md-[^'"]+)['"]/g)];
        return tags.map(match => ({
          tag: match[1],
          module: file.replace(/\.ts$/, ''),
        }));
      });

    expect(registrations.length).toBeGreaterThan(0);
    for (const registration of registrations) {
      expect(materialComponentResolver(registration.tag), registration.tag).toBe(
        `@jasonshimmy/cer-material/components/${registration.module}`,
      );
    }
  });

  it('provides theme, symbols, component resolution, and build plugins by default', () => {
    const integration = cerMaterial();

    expect(integration.name).toBe('cer-material');
    expect(integration.globalImports).toEqual([
      'material-symbols/outlined.css',
      '@jasonshimmy/cer-material/theme.css',
    ]);
    expect(integration.componentResolver('md-card')).toBe(
      '@jasonshimmy/cer-material/components/md-card',
    );
    expect(integration.plugins.map((plugin) => plugin.name)).toContain(
      'cer-material-symbols-subset',
    );
  });

  it('can disable optional global styling and symbol processing', () => {
    const integration = cerMaterial({ theme: false, symbols: false });

    expect(integration.globalImports).toEqual([]);
    expect(integration.plugins).toEqual([]);
  });
});

describe('Material Symbols Vite integration', () => {
  it('finds static HTML and object-property icon names', () => {
    expect(findMaterialSymbolNames(`
      <md-button leading-icon="add" trailingIcon='arrow_forward'></md-button>
      <md-dialog :icon="warning"></md-dialog>
      <md-switch icons></md-switch>
      <md-checkbox></md-checkbox>
      const datePicker = { tag: 'md-date-picker', props: {} }
      document.createElement('md-text-field')
      const navItem = { icon: 'music_note' }
      const props = { closeIcon: 'close', 'selected-icon': "check" }
      const navigation = { trailingIcons: ['search', "more_vert"] }
    `)).toEqual(new Set([
      'add', 'arrow_forward', 'warning', 'music_note', 'close', 'check', 'search', 'more_vert',
      'remove', 'arrow_drop_down', 'arrow_drop_up', 'calendar_today',
      'chevron_left', 'chevron_right', 'error', 'keyboard',
    ]));
  });

  it('supports explicit icons for dynamic application values', () => {
    const plugin = materialSymbols({ include: ['home', 'account_circle'] });
    expect(plugin.name).toBe('cer-material-symbols-subset');
  });

  it('rejects invalid explicit icon names early', () => {
    expect(() => materialSymbols({ include: ['${dynamic}'] })).toThrow(
      /invalid Material Symbol/i,
    );
  });

  it('does not scan or warn during an SSR bundle', async () => {
    const plugin = materialSymbols({ include: ['home'] });
    const warn = vi.fn();

    await (plugin.configResolved as Function)({
      base: '/',
      build: { ssr: true },
      cacheDir: '/tmp/cer-material-vite-test-cache',
    });
    await (plugin.buildStart as Function).call({});
    await (plugin.generateBundle as Function).call({ warn }, {}, {});

    expect(warn).not.toHaveBeenCalled();
  });
});
