import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : entry.isFile() && path.endsWith('.ts')
        ? [path]
        : [];
  });
}

describe('CER template syntax', () => {
  it('does not use unsupported Lit boolean bindings', () => {
    const offenders = sourceFiles(join(import.meta.dirname, '../src')).flatMap((path) => {
      const lines = readFileSync(path, 'utf8').split('\n');
      return lines.flatMap((line, index) =>
        /\?[a-zA-Z_][\w:-]*\s*=/.test(line)
          ? [`${path}:${index + 1}: ${line.trim()}`]
          : [],
      );
    });

    expect(offenders, 'Use CER :property bindings instead').toEqual([]);
  });
});
