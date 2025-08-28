import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // własny service worker (src/sw.js)
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      // auto rejestracja i aktualizacja SW
      registerType: 'autoUpdate',

      // pliki statyczne do dołączenia
      includeAssets: [
        'favicon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-512.png'
      ],

      // manifest PWA
      manifest: {
        name: 'Festival PWA',
        short_name: 'Festival',
        description: 'PWA dla międzynarodowego festiwalu (harmonogram, mapa, powiadomienia).',
        theme_color: '#fbb800',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' }
        ]
      },

      // dev: pozwala testować SW/push lokalnie
      devOptions: {
        enabled: true
      }
    })
  ]
});
