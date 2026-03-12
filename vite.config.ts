import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Shared externals — never bundle the runtime; consumers provide it.
const external = [
  '@jasonshimmy/custom-elements-runtime',
  /^@jasonshimmy\/custom-elements-runtime\/.*/,
];

export default defineConfig(({ command, mode }) => {
  // `vite dev` and `vite preview` use the showcase entry as usual.
  if (command === 'serve') {
    return {};
  }

  // `vite build` in default mode builds the showcase app.
  // `vite build --mode lib` (or `npm run build:lib`) builds the library.
  // `vite build --mode cdn` (or `npm run build:cdn`) builds a self-contained IIFE for CDN use.
  if (mode === 'cdn') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'CerMaterial',
          formats: ['iife'],
          fileName: () => 'cer-material.iife.js',
        },
        // No `external` — bundle the runtime and all its subpaths so the
        // output is a fully self-contained file usable from a CDN <script> tag.
        sourcemap: true,
        emptyOutDir: false,
        outDir: 'dist',
      },
    };
  }

  if (mode !== 'lib') {
    return {};
  }

  return {
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          theme: resolve(__dirname, 'src/theme.ts'),
        },
        formats: ['es', 'cjs'],
        fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external,
      },
      sourcemap: true,
      emptyOutDir: true,
      outDir: 'dist',
    },
    plugins: [
      dts({
        include: ['src/index.ts', 'src/theme.ts', 'src/components/**', 'src/composables/**'],
        exclude: ['src/main.ts', 'src/components/md-showcase.ts'],
        rollupTypes: false,
        tsconfigPath: './tsconfig.json',
      }),
    ],
  };
});
