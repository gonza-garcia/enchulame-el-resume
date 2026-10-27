# Enchula mi Resume

Producto de CV e interview prep: un sitio Astro estático, bilingüe (ES/EN), ATS friendly,
con gestor de ofertas, banco de preguntas y plan de estudios navegable. Clonás el repo, un
agente te entrevista para armar tu perfil y el build cae en una demo ficticia si todavía no
cargaste datos.

## Empezar

```bash
pnpm install
pnpm run dev        # http://localhost:4321
pnpm run build      # build genérico (demo) en dist/
pnpm run test       # suite E2E (Playwright)
pnpm run check      # astro check
```

El build por defecto es siempre genérico y deployable: usa el contenido demo ficticio. Los
datos reales se validan con `pnpm run build:personal` (escribe en `dist-personal/`, no
publicable). El sitio es estático: deploy a cualquier static host (detalle en
`docs/deploy.md`).

## Tus datos

- `src/content/profile.json`: tu perfil maestro (identidad, hechos, skills y posicionamientos).
- `src/content/learning-plan.json`: tu plan de estudios.
- `docs/job-offers/<slug>/`: tus ofertas, con `offer.md`, `match-report.md`,
  `adapted-resume.json` y, cuando hay postulación, `application.md`.

Los tres quedan fuera de git en este repo: solo viajan los ejemplos `*.example.json` y las
dos ofertas demo (Aurora Labs y Nimbus Software, ficticias). En tu fork privado los
commiteás si querés.

## De clonar a CV maestro

1. `pnpm install` y `pnpm run dev`: se ve el CV demo ficticio funcionando sin datos personales.
2. Ejecutar `skills/job-seeking/build-profile/SKILL.md` en modo directo: un agente te
   entrevista y escribe `src/content/profile.json`.
3. Con cada oferta: `capture-job-offer` la captura, `adapt-resume-to-offer` arma el CV
   adaptado y `application.md` registra la postulación (el submit siempre lo apretás vos).

El flujo completo vive en `docs/README.md`.

## Documentación

- `docs/README.md`: readme de producto (estado, decisiones, onboarding, deploy).
- `docs/adr/`: decisiones de arquitectura y producto.
- `docs/research/`: investigación citada (mercado, ATS, recursos de estudio).
- `skills/job-seeking/`: skills del flujo para agentes.
- `AGENTS.md` y `CONTEXT.md`: guía para agentes y glosario del dominio.

## Stack

Astro 7 (sitio estático), islas React, Zod (validación en build), Shiki (bloques de código
pre-renderizados), Playwright (suite E2E) y pnpm.

## Licencia

MIT
