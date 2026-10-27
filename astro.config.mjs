import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// La suite E2E siempre corre contra el contenido demo (specs con fixtures demo).
// Con E2E_DEMO=1 el build y el preview de Playwright usan dist-e2e y no tocan el
// dist/ del perfil real. Ver playwright.config.ts.
const e2eDemo = process.env.E2E_DEMO === '1';
// BUILD_MODE=personal arma el build con los datos reales del usuario y escribe
// en dist-personal/. El build por defecto es generico y va a dist/ (ver
// scripts/build.mjs).
const personal = process.env.BUILD_MODE === 'personal';

export default defineConfig({
  // Sin `site`: el deploy publico es el producto generico del repo publico y la
  // URL la define ese repo. El dominio custom propio esta diferido
  // (ADR-0017), asi que no figura aca.
  outDir: e2eDemo ? './dist-e2e' : personal ? './dist-personal' : './dist',
  build: {
    format: 'directory'
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // lightningcss rechaza @page ("Unknown at rule") usado por el CSS de impresion.
      esbuild: false,
      cssMinify: 'esbuild'
    }
  },
  integrations: [react()]
});
