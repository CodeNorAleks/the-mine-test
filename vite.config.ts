import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lifter.png'],
      manifest: {
        name: 'The Mine', short_name: 'The Mine', description: 'Mining strength with iron',
        theme_color: '#cfcdc8', background_color: '#cfcdc8', display: 'standalone', start_url: base, scope: base,
        icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg}'] },
    }),
  ],
  server: { host: true, port: 5173 },
});
