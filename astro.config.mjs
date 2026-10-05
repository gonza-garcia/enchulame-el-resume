import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// La suite E2E siempre corre contra el contenido demo (specs con fixtures demo).
// Con E2E_DEMO=1 el build y el preview de Playwright usan dist-e2e y no tocan el
// dist/ del perfil real. Ver playwright.config.ts.
const e2eDemo = process.env.E2E_DEMO === '1';

export default defineConfig({
  // Cambiar por el dominio de la instancia.
  site: 'https://example.com',
  outDir: e2eDemo ? './dist-e2e' : './dist',
  build: {
    format: 'directory'
  },
  vite: {
    build: {
      // lightningcss rechaza @page ("Unknown at rule") usado por el CSS de impresion.
      esbuild: false,
      cssMinify: 'esbuild'
    }
  },
  integrations: [react()]
});
