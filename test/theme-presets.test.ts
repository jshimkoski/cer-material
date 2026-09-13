import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { materialThemeFamilies } from '../src/theme-presets';

function variables(css: string): Record<string, string> {
  return Object.fromEntries(
    [...css.matchAll(/(--[\w-]+):\s*(#[\da-f]{6})\s*;/gi)]
      .map(match => [match[1], match[2].toLowerCase()]),
  );
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const [red, green, blue] = channels.map(channel =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const light = Math.max(first, second);
  const dark = Math.min(first, second);
  return (light + 0.05) / (dark + 0.05);
}

const contrastPairs = [
  ['primary', 'on-primary'],
  ['primary-container', 'on-primary-container'],
  ['secondary', 'on-secondary'],
  ['secondary-container', 'on-secondary-container'],
  ['tertiary', 'on-tertiary'],
  ['tertiary-container', 'on-tertiary-container'],
  ['error', 'on-error'],
  ['error-container', 'on-error-container'],
  ['background', 'on-background'],
  ['surface', 'on-surface'],
  ['surface', 'primary'],
  ['surface-container', 'on-surface'],
  ['surface-variant', 'on-surface-variant'],
  ['inverse-surface', 'inverse-on-surface'],
] as const;

describe('static Material theme presets', () => {
  const themeDirectory = new URL('../src/themes/', import.meta.url);
  const files = readdirSync(themeDirectory).filter(file => file.endsWith('.css')).sort();

  it('ships exactly one preset for every advertised CER family', () => {
    expect(files).toEqual(materialThemeFamilies.map(family => `${family}.css`).sort());
  });

  it.each(materialThemeFamilies)('%s stays within the static CSS budget', family => {
    const theme = readFileSync(new URL(`${family}.css`, themeDirectory));
    const prose = readFileSync(new URL('../src/prose.css', import.meta.url));

    expect(theme.byteLength).toBeLessThanOrEqual(6_500);
    expect(gzipSync(Buffer.concat([theme, prose])).byteLength).toBeLessThanOrEqual(1_800);
  });

  it.each(materialThemeFamilies)('%s has synchronized, accessible light and dark roles', family => {
    const css = readFileSync(new URL(`${family}.css`, themeDirectory), 'utf8');
    const [lightCss, darkCss] = css.split('@media (prefers-color-scheme: dark)');
    const light = variables(lightCss);
    const dark = variables(darkCss);

    for (const scheme of [light, dark]) {
      for (const [backgroundRole, foregroundRole] of contrastPairs) {
        const background = scheme[`--md-sys-color-${backgroundRole}`];
        const foreground = scheme[`--md-sys-color-${foregroundRole}`];
        expect(contrast(foreground, background), `${family}: ${foregroundRole} on ${backgroundRole}`)
          .toBeGreaterThanOrEqual(4.5);
      }
    }

    expect(light['--cer-color-primary-700']).toBe(light['--md-sys-color-primary']);
    expect(light['--cer-color-secondary-700']).toBe(light['--md-sys-color-secondary']);
    expect(light['--cer-color-error-700']).toBe(light['--md-sys-color-error']);
    expect(light['--cer-color-neutral-950']).toBe(light['--md-sys-color-on-surface']);
    expect(dark['--md-sys-color-primary']).toBe(light['--cer-color-primary-300']);
    expect(dark['--md-sys-color-on-surface']).toBe(light['--cer-color-neutral-200']);
  });
});

describe('Material prose bridge', () => {
  const css = readFileSync(new URL('../src/prose.css', import.meta.url), 'utf8');

  it('maps inherited CER prose tokens to semantic Material roles', () => {
    expect(css).toContain('--cer-prose-body: var(--md-sys-color-on-surface);');
    expect(css).toContain('--cer-prose-links: var(--md-sys-color-primary);');
    expect(css).toContain('--cer-prose-code-bg: var(--md-sys-color-surface-container);');
    expect(css).toContain('--cer-prose-table-border: var(--md-sys-color-outline-variant);');
  });

  it('keeps the default theme synchronized with CER semantic utilities', () => {
    const css = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
    const [lightCss, darkCss] = css.split('@media (prefers-color-scheme: dark)');
    const light = variables(lightCss);
    const dark = variables(darkCss);

    expect(light['--cer-color-primary-700']).toBe(light['--md-sys-color-primary']);
    expect(light['--cer-color-secondary-700']).toBe(light['--md-sys-color-secondary']);
    expect(light['--cer-color-error-700']).toBe(light['--md-sys-color-error']);
    expect(light['--cer-color-neutral-950']).toBe(light['--md-sys-color-on-surface']);
    expect(light['--cer-color-primary-300']).toBe(dark['--md-sys-color-primary']);
    expect(light['--cer-color-secondary-300']).toBe(dark['--md-sys-color-secondary']);
    expect(light['--cer-color-error-300']).toBe(dark['--md-sys-color-error']);
    expect(light['--cer-color-neutral-200']).toBe(dark['--md-sys-color-on-surface']);
  });
});
