/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// De repository heet "trainersapp", dus GitHub Pages serveert de app op /trainersapp/.
// Andere repositorynaam? Alleen deze regel aanpassen.
const BASE = '/trainersapp/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // Updates niet zomaar toepassen: de app toont een melding "Bijwerken".
      registerType: 'prompt',
      injectRegister: false,
      pwaAssets: { config: true, overrideManifestIcons: true, injectThemeColor: false },
      manifest: {
        id: BASE,
        name: 'TrainersApp',
        short_name: 'TrainersApp',
        description: 'Voetbaloefeningen voor veld en keepers, met bewegende uitleg.',
        lang: 'nl',
        dir: 'ltr',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'any',
        background_color: '#f4f7f5',
        theme_color: '#0f6b3a',
        categories: ['sports', 'education'],
      },
      workbox: {
        // Het manifest voegt de plugin zelf al toe; niet nog eens opnemen.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/*-vietnamese-*', '**/*-cyrillic*', '**/*-greek*'],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
