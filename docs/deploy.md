# Guía de deploy

El sitio es estático: Astro genera HTML, CSS y JavaScript en `dist/` y cualquier host
estático sirve. El camino probado es Cloudflare Pages; Vercel, Netlify o GitHub Pages
funcionan igual porque no hay server que mantener.

## Build

```bash
pnpm install
pnpm run build
```

El resultado es `dist/`. Publicar ese directorio tal cual.

- `pnpm run build` valida los contratos (perfil y plan) con Zod y falla ruidosamente si los
  datos están mal formados.
- Si no hay `src/content/profile.json` ni `src/content/learning-plan.json`, el build usa los
  ejemplos ficticios (`src/content/profile.example.json` y
  `src/content/learning-plan.example.json`). Eso permite desplegar la demo sin datos de nadie.
- En una instancia propia, el perfil y el plan del usuario se escriben con las skills
  `build-profile` y `capture-learning-plan` (ver `skills/job-seeking/`) antes del build.

## Cloudflare Pages (probado)

1. Conectar el repo en Cloudflare Pages.
2. Build command: `pnpm run build`. Output directory: `dist/`.
3. Node version: la del repo (`.nvmrc` si existe; si no, Node 20 o superior).
4. El deploy corre en cada push a la rama principal.

## Cualquier otro host estático

El único requisito es servir `dist/` con HTTPS. Notas comunes:

- Servir `index.html` ante rutas desconocidas no hace falta: el sitio genera una carpeta por
  página (`/adapted/index.html`, `/interview/index.html`, `/learning/index.html`).
- La página `/adapted` es una herramienta local de trabajo: sus flujos de creación de ofertas
  viven en el dev server (ADR-0023). En el sitio publicado no hay backend de ofertas.
- Si el host permite headers, mantener el cache de los assets con hash y el HTML sin cache
  largo.

## Variables de entorno del build

- `PROFILE_SOURCE=example` fuerza el perfil demo aunque exista un `profile.json` local.
- `PLAN_SOURCE=example` fuerza el plan demo aunque exista un `learning-plan.json` local.
- `E2E_DEMO=1` cambia el directorio de salida (lo usa la suite E2E).

En un deploy normal no se setea ninguna: el build toma los datos del usuario si existen y
cae a la demo si no.

## Dónde no deployear

La carpeta `docs/job-offers/` con ofertas reales es material de trabajo local: no forma parte
del build estático y no debe publicarse en otro lado. En el repo público solo existen las
ofertas demo (fixtures ficticias).
