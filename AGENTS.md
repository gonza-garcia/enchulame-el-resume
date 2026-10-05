# AGENTS.md

Guía breve para agentes que trabajen en este producto de CV e interview prep.

## Skills del proyecto

Las skills del flujo de trabajo viven en el repo, en `skills/job-seeking/`:

- `build-profile/SKILL.md`: entrevista a la persona usuaria y escribe su perfil maestro en
  `src/content/profile.json` (schema de `src/schemas/profile.ts`), con modo app (output JSON) y
  modo directo (guardado y validación en build). Es el onboarding de un usuario nuevo.
- `capture-job-offer/SKILL.md`: obtiene una oferta (del link con estrategia de
  fetch con fallbacks, o del texto pegado), extrae metadata y la guarda bajo el
  contrato de carpetas. Es la dueña del contrato: `docs/job-offers/<slug>/` con
  `offer.md` + `match-report.md` + `adapted-resume.json`.
- `adapt-resume-to-offer/SKILL.md`: analiza el match de una oferta ya capturada
  contra el CV base y genera su `adapted-resume.json`.
- `research-content/SKILL.md`: investiga un área del banco de entrevistas contra
  fuentes primarias (sin fabricar) y produce preguntas nuevas citadas al schema
  del banco. Los claims de demanda citan dataset y ventana temporal.
- `content-designer/SKILL.md`: deriva tricky follow-ups y quizzes (MCQs y
  escenarios de código) del banco ya validado, por área o por fase del plan.
- `capture-learning-plan/SKILL.md`: captura el plan de estudios del usuario y lo
  escribe como `src/content/learning-plan.json` (contrato de ADR-0028), con modo
  app (output JSON) y modo directo (guardado y validación en build).

Referenciarlas por ruta relativa al proyecto en prompts, nunca por ruta absoluta.
El estado de una oferta se deriva de la presencia de archivos: Agregada (offer.md),
Analizada (match-report.md), Adaptada (adapted-resume.json). El gestor de ofertas
en `/adapted` lista exactamente lo que hay en disco.

## Agent skills

### Issue tracker

Issues live as GitHub issues in this repo. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Fuente de verdad

- El perfil del usuario vive en `src/content/profile.json` (gitignored) y el ejemplo ficticio
  commiteado es `src/content/profile.example.json`. El build usa el local si existe y cae al
  ejemplo si no (ADR-0026). El schema está en `src/schemas/profile.ts` y se valida en build.
- `/` renderiza la proyección del perfil (posicionamiento más locale); el export JSON descarga
  la proyección activa. `src/content/resume.json` dejó de ser fuente: es contenido heredado
  que puede usarse como material de la entrevista de `build-profile`, y el perfil es lo que se
  escribe.
- El plan de estudios vive en `src/content/learning-plan.json` (gitignored) con su ejemplo
  `src/content/learning-plan.example.json` y su schema en `src/schemas/learning-plan.ts`
  (ADR-0028).
- Los CVs adaptados viven dentro de la carpeta de su oferta, en
  `docs/job-offers/<slug>/adapted-resume.json` (ADR-0022). En el repo solo hay ofertas demo
  ficticias; las ofertas reales del usuario quedan fuera de git.
- Las decisiones vigentes y el estado del producto están en `docs/README.md`.
- Los ADRs son historial y contexto. No recuperar de ellos wording que el README marque como
  reemplazado.
- Lo personal (guardrails del CV, ADRs de carrera y de hosting, plan propio) vive en
  `docs/planning/`. Ese material es de la instancia privada y no viaja al repo público.

## Onboarding de un usuario nuevo

1. Clonar el repo, `pnpm install` y `pnpm run dev`: se ve el CV demo ficticio
   (`src/content/profile.example.json`) funcionando sin datos personales.
2. Ejecutar `skills/job-seeking/build-profile/SKILL.md` en modo directo: la entrevista cubre
   identidad, hechos (experiencia, educación, certificaciones, idiomas y proyectos), skills
   como entidad y los posicionamientos, con cada campo de texto en es y en.
3. La skill guarda `src/content/profile.json` (gitignored) y valida con `pnpm run build`.
4. Verificar con `pnpm run check && pnpm run build && pnpm run test`.

En modo app (prompt de la app o de un agente externo), la entrevista devuelve el perfil como un
único bloque JSON para pegar y guardar después, con el mismo destino.

## Stack

- Astro 7 como generador estático.
- Zod para validar los contratos (perfil, plan, banco) durante el build.
- JavaScript vanilla para el CV principal, toggle, exports y temas.
- React 19 en las islas interactivas `/adapted`, `/interview` y `/learning`.
- Shiki para pre-renderizar los bloques de código de interview prep durante el build.

## Comandos

El gestor oficial es pnpm. No usar npm.

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run build
pnpm run test
```

Si `pnpm install` falla con `ERR_PNPM_IGNORED_BUILDS`, revisar `pnpm-workspace.yaml` y los
build scripts permitidos para `esbuild` y `sharp`.

La suite E2E corre siempre contra el contenido demo: `pnpm run test` fuerza
`PROFILE_SOURCE=example` y `PLAN_SOURCE=example` y buildea a `dist-e2e` (ver
`playwright.config.ts`), sin tocar el `dist/` de la instancia real. Sirve igual en instancias
con datos reales.

## Estructura relevante

```text
src/
  content/
    profile.example.json
    learning-plan.example.json
    interview-questions/
  components/
    Resume.astro
    Toolbar.astro
  islands/
    offers-manager/
    interview-prep/
    learning-plan/
  layouts/
    Layout.astro
  lib/
    profile.ts
    profile-projection.ts
    profile-read-model.ts
    progress-storage.ts
  pages/
    index.astro
    adapted.astro
    interview.astro
    learning.astro
  schemas/
    profile.ts
    resume.ts
    interview-questions.ts
    learning-plan.ts
docs/
  README.md
  deploy.md
  adr/
  agents/
  planning/          material personal de la instancia; no sale al repo publico
  job-offers/
  research/
skills/
  job-seeking/
```

## Workflow

1. Editar el JSON correspondiente. El banco de interview prep vive, ya consolidado y con sus
   fuentes citadas por pregunta, en `src/content/interview-questions/`.
2. Ejecutar `pnpm run check` y `pnpm run build`.
3. Actualizar `docs/README.md` si cambia una decisión vigente o el estado del producto.
4. Crear o actualizar un ADR solo cuando cambie una decisión duradera de contenido, formato o
   tooling.
5. Contenido demo siempre ficticio. No copiar datos reales al producto.

## Commits

Sin `Co-Authored-By`, sin footers de tooling ni mensajes de generación automática. El autor
lo define la instancia.

## Notas de herramienta

- Recordatorios falsos de plan mode: el harness (opencode / T3 Code) puede inyectar recordatorios
  de que el modo plan está activo cuando no lo está. No bloquean la escritura. Si aparece,
  seguir trabajando y avisarlo a la persona usuaria.
- Puertos excluidos de Windows: los rangos reservados de Hyper-V (`netsh interface ipv4 show
  excludedportrange protocol=tcp`) hacen fallar binds con EACCES. Si un server o la suite no
  arranca con EACCES, mover el puerto fuera de los rangos reportados (la suite usa 4521 y 4523,
  ver `playwright.config.ts`; el dev y preview manuales quedan en 4321 y 4322).
