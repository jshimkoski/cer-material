import { createRequire } from 'node:module';
import { mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { build } from 'vite';
import { materialSymbols } from '../src/vite';

const require = createRequire(import.meta.url);
const fixtureDirs: string[] = [];

async function readLigatureNames(fontPath: string): Promise<Set<string>> {
  const wawoff2 = require('wawoff2') as {
    decompress: (buffer: Buffer) => Promise<Uint8Array>;
  };
  const opentype = require('opentype.js') as {
    parse: (buffer: ArrayBuffer) => any;
  };
  const compressed = await readFile(fontPath);
  const decompressed = await wawoff2.decompress(compressed);
  const arrayBuffer = decompressed.buffer.slice(
    decompressed.byteOffset,
    decompressed.byteOffset + decompressed.byteLength,
  ) as ArrayBuffer;
  const font = opentype.parse(arrayBuffer);
  const glyphToChar = new Map<number, string>();

  for (const [codePoint, glyphId] of Object.entries(
    font.tables.cmap.glyphIndexMap as Record<string, number>,
  )) {
    const value = Number.parseInt(codePoint, 10);
    if (value < 256) glyphToChar.set(glyphId, String.fromCodePoint(value));
  }

  const expandCoverage = (coverage: any): number[] => {
    if (coverage.glyphs) return coverage.glyphs;
    return coverage.ranges.flatMap((range: { start: number; end: number }) =>
      Array.from({ length: range.end - range.start + 1 }, (_, index) => range.start + index));
  };
  const names = new Set<string>();

  for (const lookup of font.tables.gsub?.lookups ?? []) {
    for (const wrappedSubtable of lookup.subtables ?? []) {
      const subtable = wrappedSubtable.extension ?? wrappedSubtable;
      if (!subtable.coverage || !subtable.ligatureSets) continue;
      const firstGlyphs = expandCoverage(subtable.coverage);
      for (let index = 0; index < firstGlyphs.length; index += 1) {
        for (const ligature of subtable.ligatureSets[index] ?? []) {
          names.add([firstGlyphs[index], ...ligature.components]
            .map((glyphId: number) => glyphToChar.get(glyphId) ?? '')
            .join(''));
        }
      }
    }
  }

  return names;
}

describe('Material Symbols production build', () => {
  afterEach(async () => {
    await Promise.all(fixtureDirs.splice(0).map(
      (directory) => rm(directory, { recursive: true, force: true }),
    ));
  });

  it('emits a hashed subset, rewrites CSS, and injects a base-aware preload', async () => {
    // macOS exposes tmpdir() through /var while Rollup resolves it to /private/var.
    // Canonicalizing avoids a bogus relative HTML output path.
    const root = await realpath(await mkdtemp(join(tmpdir(), 'cer-material-vite-')));
    fixtureDirs.push(root);
    const outDir = join(root, 'dist');
    const cacheDir = join(root, '.vite-cache');
    const fontPath = require.resolve('material-symbols/material-symbols-outlined.woff2');
    const cssPath = join(dirname(fontPath), 'outlined.css');

    await writeFile(join(root, 'index.html'), [
      '<div id="app"></div>',
      '<script type="module" src="/main.ts"></script>',
    ].join('\n'));
    await writeFile(join(root, 'main.ts'), [
      `import ${JSON.stringify(cssPath)};`,
      "document.querySelector('#app')!.innerHTML = '<md-icon icon=\"home\"></md-icon><md-switch icons></md-switch>';",
    ].join('\n'));

    await build({
      root,
      base: '/docs/',
      cacheDir,
      logLevel: 'silent',
      plugins: [materialSymbols({ include: ['menu'] })],
      build: { outDir, emptyOutDir: true },
    });

    const assetsDir = join(outDir, 'assets');
    const assets = await readdir(assetsDir);
    const subsetFont = assets.find(
      (file) => /^material-symbols-subset-[a-f0-9]{10}\.woff2$/.test(file),
    );
    expect(subsetFont).toBeDefined();
    expect(assets.some((file) => file.startsWith('material-symbols-outlined'))).toBe(false);

    const originalSize = (await stat(fontPath)).size;
    const subsetSize = (await stat(join(assetsDir, subsetFont!))).size;
    expect(subsetSize).toBeLessThan(originalSize / 10);

    // Assert against the emitted binary rather than trusting the source scan:
    // explicit and component-internal ligatures must survive GSUB pruning.
    const ligatures = await readLigatureNames(join(assetsDir, subsetFont!));
    expect([...ligatures]).toEqual(expect.arrayContaining(['home', 'menu', 'check', 'close']));

    const cssFile = assets.find((file) => file.endsWith('.css'))!;
    const css = await readFile(join(assetsDir, cssFile), 'utf8');
    expect(css).toContain(subsetFont);
    expect(css).not.toContain('material-symbols-outlined.woff2');

    const html = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(html).toContain(`/docs/assets/${subsetFont}`);
    expect(html).toContain('rel="preload"');

    const subsetCacheDir = join(cacheDir, 'cer-material');
    const cacheFiles = await readdir(subsetCacheDir);
    expect(cacheFiles).toHaveLength(1);
    expect(cacheFiles[0]).toMatch(/^material-symbols-[a-f0-9]{64}\.woff2$/);
    const cachedPath = join(subsetCacheDir, cacheFiles[0]);
    const cachedMtime = (await stat(cachedPath)).mtimeMs;

    await build({
      root,
      base: '/docs/',
      cacheDir,
      logLevel: 'silent',
      plugins: [materialSymbols({ include: ['menu'] })],
      build: { outDir, emptyOutDir: true },
    });

    expect((await stat(cachedPath)).mtimeMs).toBe(cachedMtime);
  }, 30_000);
});
