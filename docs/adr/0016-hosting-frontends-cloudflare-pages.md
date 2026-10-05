# ADR-0016: Frontends estáticos en cualquier host, Cloudflare Pages probado

Estado: Vigente. Reescrito en genérico para la salida al repo público (ADR-0027): el
portfolio de apps personales del texto original vive en el planning.

## Contexto

El sitio es estático (Astro genera HTML, CSS y JavaScript): cualquier host estático
gratuito lo sirve, sin server que mantener. Se compararon Cloudflare Pages, Vercel y
GitHub Pages.

## Decisión

Hostear el frontend estático en **Cloudflare Pages** como camino probado. Cualquier host
estático sirve: la decisión es sobre el default documentado, no sobre un lock-in.

- Dominio/subdominio: el que provea el host (por ejemplo `*.pages.dev`); el dominio custom
  es una decisión posterior de cada usuario.
- GitHub Pages queda descartado como default por latencia medido desde América del Sur en la
  evaluación original (más lejos que las PoP de Cloudflare y Vercel en esa región).
- Vercel queda como alternativa cercana si la DX pesa más que la latencia.

## Por qué Cloudflare Pages

- Buena latencia regional (PoP cercanas en América Latina) para una audiencia remota.
- Bandwidth ilimitado (sin techo de sorpresa).
- $0/mes sin tarjeta (cero fricción de pago).
- Adapter oficial de Astro: el sitio deploya limpio y zero-config.
- Mismo ecosistema que D1/Workers, disponible gratis si más adelante se necesita un
  serverless complementario.

## Trade-offs aceptados

- Empujar GitHub Pages/Actions (todo en GitHub) se descarta en favor de la latencia y el
  bandwidth. Los dominios gratuitos del host son menos "premium" que un dominio propio; el
  dominio custom queda a criterio de cada usuario.
- Menor DX teórica que Vercel en casos rebuscados, aunque para un sitio Astro simple es
  equivalente.

## Consecuencias

- El deploy es estático: `pnpm run build` y publicar `dist/` (guía en `docs/deploy.md`).
- El sitio no necesita backend: los flujos de creación de ofertas son herramienta local del
  dev server (ADR-0023) y no viajan al deploy.

## Referencias

- Guía de deploy del producto: `docs/deploy.md`
- Adapter Astro CF Pages: https://docs.astro.build/en/guides/deploy/cloudflare/
