import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // `.claude/worktrees` enthaelt Kopien des Repos aus Agent-Sitzungen und
        // `.firebase` deployte Build-Artefakte. Beide wuerden veraltete Tests
        // mitlaufen lassen und die Ergebnisse verfaelschen.
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**',
            '**/.claude/**',
            '**/.firebase/**',
            '**/.worktrees/**',
            '**/frontend/**',
        ],
    },
});
