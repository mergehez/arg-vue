import {defineConfig} from "vite";

import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [vue()],
    build: {
        emptyOutDir: false,
        outDir: "dist",
        sourcemap: true,
        lib: {
            entry: {
                Components: "./lib/Components/index.ts",
                utils: "./lib/utils/index.ts",
            },
        },
    },

    resolve: {
        dedupe: ['@inertiajs/vue3', 'pinia'],
    },
});