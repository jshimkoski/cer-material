import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface PackageManifest {
  peerDependencies?: Record<string, string>;
  exports: Record<string, unknown>;
  sideEffects?: string[];
  scripts?: Record<string, string>;
}

describe('published package entry points', () => {
  it('declares the externalized runtime as a peer dependency', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as PackageManifest;

    expect(manifest.peerDependencies).toHaveProperty(
      '@jasonshimmy/custom-elements-runtime',
    );
  });

  it('supports opt-in component and composable imports', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as PackageManifest;

    expect(manifest.exports).toHaveProperty('./components/*');
    expect(manifest.exports).toHaveProperty('./composables/*');
  });

  it('preserves component registration during source and published builds', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as PackageManifest;

    expect(manifest.sideEffects).toEqual(expect.arrayContaining([
      './src/components/*.ts',
      './dist/components/*.js',
    ]));
  });

  it('runs type checks and tests before a release build', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as PackageManifest;

    expect(manifest.scripts?.validate).toBe(
      'npm run typecheck && npm test && npm run build:all',
    );
  });

  it('makes the conventional build command produce publishable library entries', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as PackageManifest;

    expect(manifest.scripts?.build).toBe('npm run build:lib');
    expect(manifest.scripts?.['build:lib']).toContain('vite build --mode lib');
  });
});
