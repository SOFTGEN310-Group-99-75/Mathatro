/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        include: ["tests/*.test.ts"],
        setupFiles: ["./tests/setup.ts"],
        server: {
            deps: {
                inline: ['phaser']
            }
        }
    }
});
