import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    test: {
        globals: true,
        root: './',
        include: ['test/**/*.e2e-spec.ts'],
        setupFiles: ['./test/setup-e2e.ts'],
        fileParallelism: false,
    },
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
        tsConfigPaths(),
    ],
});
