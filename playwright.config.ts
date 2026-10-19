import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /__tests__\/offers-manager/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4533' }
    },
    {
      // El gestor de ofertas es una herramienta local: los flujos de creacion
      // viven en el dev server (los botones estan deshabilitados en build,
      // ver ADR-0023).
      name: 'offers-chromium',
      testMatch: /__tests__\/offers-manager\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4531' }
    }
  ],
  webServer: [
    {
      // La suite siempre corre contra el contenido demo, tambien en instancias
      // con perfil real: el build se fuerza a PROFILE_SOURCE=example y escribe
      // en dist-e2e (E2E_DEMO=1, ver astro.config.mjs), sin tocar el dist/ del
      // perfil real.
      //
      // Puertos propios de la suite (4531 y 4533): no reutiliza un dev o preview
      // manual del usuario (4321 y 4322), evitan la UI del harness de agentes
      // (OpenCode / T3 Code sirve su UI en 4523) y quedan fuera de los rangos de
      // puertos excluidos de Windows (netsh interface ipv4 show excludedportrange).
      // Si un bind falla con EACCES o el puerto esta tomado, moverlo fuera de los
      // rangos reportados.
      command: 'pnpm run build && pnpm exec astro preview --port 4533',
      url: 'http://localhost:4533',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      // Astro 7 auto-daemoniza dev/preview cuando detecta un agente de IA:
      // en foreground es lo que espera el webServer de Playwright.
      env: {
        ...process.env,
        ASTRO_PREVIEW_BACKGROUND: '0',
        E2E_DEMO: '1',
        PROFILE_SOURCE: 'example',
        PLAN_SOURCE: 'example'
      }
    },
    {
      command: 'pnpm exec astro dev --port 4531',
      url: 'http://localhost:4531',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      // El dev server de la suite tambien corre contra la demo.
      env: {
        ...process.env,
        ASTRO_DEV_BACKGROUND: '0',
        PROFILE_SOURCE: 'example',
        PLAN_SOURCE: 'example'
      }
    }
  ]
});
