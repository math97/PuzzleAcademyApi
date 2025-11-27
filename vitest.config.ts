import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    test: {
        globals: true,
        root: './',
        include: ['src/**/*.spec.ts'],
    },
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
        tsConfigPaths(),
    ],
});
