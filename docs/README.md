# Enchulame el Resume

Producto de CV e interview prep: un sitio Astro estático, bilingüe, ATS friendly, con gestor
de ofertas, banco de preguntas y plan de estudios navegable. Cualquier usuario clona el repo,
un agente lo entrevista para armar su perfil y el build cae en una demo ficticia si todavía no
cargó datos.

Este documento es el readme de producto: estado, decisiones de producto, onboarding, deploy y
protocolo de salida. La documentación personal de su autora vive en `docs/planning/` (repo
privado de planning) y no forma parte del producto.

## Estado actual

- El CV principal se renderiza desde la proyección del perfil: `src/content/profile.json` si
  existe y, si no, el contenido demo ficticio de `src/content/profile.example.json`
  (ADR-0026). El perfil es la fuente única de datos, en capas: identidad, hechos, skills como
  entidad y posicionamientos.
- El contenido base tiene dos locales: `es` y `en`. La UI de las islas queda en español.
- El sitio es Astro 7 (upgrade documentado en ADR-0020). El CV (`/`) es estático vanilla;
  `/adapted`, `/interview` y `/learning` son islas React (ADR-0021, ADR-0024 y ADR-0029).
- `/interview` publica el banco de prep de entrevistas en inglés, con filtros por área, nivel,
  rol y frecuencia, búsqueda, tricky follow-ups, quizzes y escenarios de código. El contenido
  se valida con Zod durante el build y los bloques de código se pre-renderizan con Shiki. El
  banco está reorganizado en áreas 1:1 con las fases del plan (ADR-0030).
- `/learning` navega el plan de estudios por fases, con progreso por recurso, gate por fase,
  panel de perfil frente al plan y enlaces bidireccionales con `/interview` (ADR-0028 y
  ADR-0029).
- Cada oferta vive en su carpeta `docs/job-offers/<slug>/` con `offer.md`, `match-report.md`
  y `adapted-resume.json`; el estado se deriva del disco (ADR-0022). El repo lleva dos ofertas
  demo ficticias (Aurora Labs y Nimbus Software) como fixtures del producto; en una instancia
  propias, las ofertas reales del usuario quedan fuera de git.
- El gestor de ofertas en `/adapted` lista exactamente lo que hay en disco y sus flujos de
  creación usan el puente de prompts con las skills del repo (ADR-0023).
- Las skills del flujo viven en `skills/job-seeking/`: `build-profile`, `capture-job-offer`,
  `adapt-resume-to-offer`, `research-content`, `content-designer` y `capture-learning-plan`.

## Fuente de verdad

El perfil (`src/content/profile.json`, schema Zod en `src/schemas/profile.ts`) es la fuente
única de datos del CV. El build carga el profile local si existe y cae al ejemplo ficticio
`src/content/profile.example.json` si no. La validación ocurre en build y falla ruidosamente
con datos mal formados (ids de skill o de bullet huérfanos, campos sin los dos locales, ids
duplicados).

La página `/` y el export JSON renderizan y descargan la proyección activa del perfil
(posicionamiento más locale), calculada en `src/lib/profile-projection.ts`. El brand y el
título PDF salen del perfil. `/learning` consume el read model del perfil
(`src/lib/profile-read-model.ts`).

`src/content/resume.json` dejó de ser fuente: es contenido heredado que puede usarse como
material de la entrevista de `build-profile`, y la salida al repo público lo retira
(ADR-0027). No editar ese archivo esperando cambios en el sitio.

El plan de estudios vive en `src/content/learning-plan.json` (gitignored) con su ejemplo
commiteado `src/content/learning-plan.example.json` y su schema en
`src/schemas/learning-plan.ts` (ADR-0028).

No duplicar el contenido del CV en README, ADRs o documentos de ofertas. Esos archivos
explican decisiones, contexto y restricciones. Si hay una diferencia, el perfil validado y la
decisión vigente de este README tienen prioridad sobre el texto histórico de un ADR.

## Onboarding: de clonar a CV maestro

1. Clonar el repo, `pnpm install` y `pnpm run dev`: se ve el CV demo ficticio funcionando sin
   datos personales.
2. Ejecutar la skill `build-profile` (`skills/job-seeking/build-profile/SKILL.md`) en modo
   directo. La entrevista cubre identidad, hechos (experiencia, educación, certificaciones,
   idiomas y proyectos), skills como entidad y los posicionamientos, con cada campo de texto
   en es y en. El perfil se guarda en `src/content/profile.json` (gitignored) y se valida con
   `pnpm run build`.
3. Opcional: `capture-learning-plan` escribe `src/content/learning-plan.json` con el plan de
   estudios propio.
4. Verificar con `pnpm run check && pnpm run build && pnpm run test`.

En modo app (prompt de la app o de un agente externo), las skills devuelven el JSON para
pegar y guardar después, con el mismo destino.

## Decisiones vigentes

### Formato y arquitectura

- Astro 7 genera HTML, CSS y JavaScript estáticos.
- El CV principal mantiene interactividad vanilla. Las páginas `/adapted`, `/interview` y
  `/learning` usan islas React porque administran estados y flujos de interacción más
  complejos.
- El layout principal es single column para mantener la lectura ATS.
- El toggle de idioma, los exports y el panel de tema funcionan del lado cliente.
- El PDF se genera con `window.print()` y CSS de impresión, sin una librería de PDF.
- La impresión conserva el accent elegido para headings y URLs, con texto y fondo claros para
  mantener legibilidad y parsing.
- `/interview` mantiene UI en español y contenido del banco en inglés. El progreso de estudio
  se persiste en `localStorage` con claves propias (`interview-progress`) y se exporta/importa
  como JSON versionado validado con Zod.

### Producto genérico (decisión de #26)

- El perfil del usuario es la fuente única de datos, en capas: identidad, hechos, skills como
  entidad y posicionamientos. `/` renderiza la proyección del perfil (posicionamiento más
  locale) y el export JSON descarga esa proyección (ADR-0026).
- El perfil lleva además un `backlog` de experiencias en reserva: fragmentos listos para CV con
  su prueba y su techo (`proof` y `limits`), que no se renderizan mientras están en `reserve`.
  Se promueven a un CV adaptado por decisión de la persona usuaria, o al CV base
  materializándolos en hechos (ADR-0031).
- El build carga el profile local si existe y cae al `profile.example.json` si no. El contenido
  demo es siempre ficticio (persona y empresas inventadas).
- El plan de estudios es un contrato JSON propio con la demanda colgada de la skill y no del
  curso (ADR-0028).
- El onboarding de un usuario nuevo es la skill de agente `build-profile`, con modo app y modo
  directo. El camino de clonar a CV maestro está documentado arriba.
- La salida al repo público sigue el protocolo del ADR-0027.

### Página `/learning` (ADR-0029 y ADR-0030)

- `/learning` navega el plan por fases ordenadas por los roles que habilitan, con recursos
  mapeados por skill a la demanda del mercado, marcas de progreso por recurso (hecho, en curso,
  skipped), gate por fase, panel de perfil frente al plan (cubiertas, gaps por presencia,
  prioridades por demanda dentro del orden de fases y sugerencias desde hechos) y material de
  investigación como lista de lectura ordenada, fuera del contrato y del perfil.
- El contenido del plan es bilingüe es/en por campo con ambos obligatorios; se renderiza según
  el toggle del sitio y la UI queda en español.
- El progreso del plan es dato del usuario: clave propia `learning-progress` en `localStorage`,
  export/import versionado validado con Zod, sobre un módulo de persistencia compartido con
  `/interview` (`src/lib/progress-storage.ts`).
- `/learning` e `/interview` quedan conectadas con enlaces de datos bidireccionales y quizzes
  por fase, sobre el banco reorganizado en áreas 1:1 con las fases (los id de pregunta se
  conservan para no perder el progreso guardado).

## Comandos

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run build
pnpm run test
```

El gestor oficial es pnpm. No usar npm. Si `pnpm install` falla con
`ERR_PNPM_IGNORED_BUILDS`, revisar `pnpm-workspace.yaml` y los build scripts permitidos para
`esbuild` y `sharp`.

La suite E2E corre siempre contra el contenido demo: `pnpm run test` fuerza
`PROFILE_SOURCE=example` y `PLAN_SOURCE=example` y buildea a `dist-e2e` (ver
`playwright.config.ts` y `astro.config.mjs`), sin tocar el `dist/` de la instancia real. Así
la suite pasa igual en instancias con datos de usuario y ninguna spec depende de datos reales.

## Deploy

Sitio estático: cualquier host sirve. El camino probado es Cloudflare Pages y las notas
están en `docs/deploy.md`.

## Workflow de cambios

1. Editar el perfil (`src/content/profile.json`) o el contenido correspondiente.
2. Ejecutar `pnpm run check` y `pnpm run build`.
3. Si cambia una decisión duradera de contenido, privacidad o formato, actualizar este README
   y agregar o actualizar el ADR correspondiente.
4. Si es solo un ajuste de wording dentro de una decisión vigente, actualizar la sección
   afectada sin crear un ADR innecesario.
5. Contenido demo siempre ficticio. Nada de datos reales en el producto.

## Mapa de ADRs de producto

| ADR | Estado | Tema |
|---|---|---|
| 0007 | Vigente | Formato Astro, fuente JSON, ATS, idioma y exports |
| 0010 | Vigente | Sistema visual de temas y restricciones de impresión |
| 0011 | Vigente | Migración a pnpm y convención de AGENTS.md |
| 0016 | Vigente | Frontends estáticos en cualquier host; Cloudflare Pages probado |
| 0020 | Vigente | Upgrade de Astro antes del gestor de ofertas (terminó en Astro 7) |
| 0021 | Vigente | Isla React para el gestor de ofertas, excepción al stack sin framework |
| 0022 | Vigente | Carpeta por oferta con estados derivados del disco |
| 0023 | Vigente | Puente de prompts para escribir archivos y verificación por endpoint |
| 0024 | Vigente | Banco de interview prep, validación Zod, Shiki e isla React |
| 0025 | Vigente | Salario y recruiter en el contrato de captura de ofertas |
| 0026 | Vigente | Modelo de perfil en capas con posicionamientos y fallback al ejemplo |
| 0027 | Vigente | Protocolo de salida al repo público |
| 0028 | Vigente | Contrato del plan de estudios con demanda colgada de la skill |
| 0029 | Vigente | Página `/learning`, contrato del plan bilingüe y progreso compartido |
| 0030 | Vigente | Banco de entrevistas reorganizado por fases del plan |
| 0031 | Vigente | Banco de experiencias en reserva (backlog) en el perfil |

Los ADRs personales (decisiones del CV y hosting de las apps personales) están en
`docs/planning/adr/` y son legado del planning. Los ADRs históricos se conservan como
contexto y no contradecir las decisiones vigentes de este README.

## Producto genérico: protocolo de salida (ADR-0027)

1. El repo público del producto se crea como repo nuevo desde un commit huérfano con solo
   código genérico, schemas y contenido demo. La historia personal jamás se hace push ahí;
   `git filter-repo` queda descartado.
2. El repo de desarrollo se renombra `enchulame-el-resume-planning`, queda privado para
   siempre y conserva los issues, los documentos personales y la historia como legado.
3. El contenido de perfil real, las ofertas reales, las cover letters, los ADRs personales y
   de hosting y el plan de estudios personal viven en el planning o en la instancia privada de
   cada usuario.
4. Cada usuario despliega desde su instancia: fork privado del repo público con sus datos. El
   criterio de clasificación genérico vs personal y la regla de contenido demo ficticio están
   en el ADR-0027.

## Changelog de producto

- 16 sep 2026: gestor de ofertas con carpeta por oferta (ADR-0020 a 0023), upgrade a Astro 7,
  skills del flujo en `skills/job-seeking/` e isla React en `/adapted`.
- 22 sep 2026: header unificado (Toolbar compartido) en `/` y `/adapted`, y flujo de cover
  letters en la adaptación.
- 17 sep 2026: `/interview` con el banco validado, filtros, quizzes y escenarios de código.
- 23 sep 2026: metadata de salario y recruiter en el contrato de ofertas (ADR-0025).
- 28 sep 2026: progreso de estudio en `/interview` con export/import versionado.
- 28 sep 2026: investigación de mercado AI junior/trainee y rutas de aprendizaje para el
  diseño de `/learning`.
- 28 sep 2026: definición del producto genérico (ADR-0026 a 0028): perfil en capas, criterio
  de genérico vs personal, contrato del plan y protocolo de salida.
- 30 sep 2026: spec de `/learning` (#34) y tickets de implementación (#35 a #42).
- 30 sep 2026: perfil en capas con fallback al ejemplo (#28) y onboarding con skill
  `build-profile` (#29).
- 5 oct 2026: reevaluación del plan de estudios con fuentes nuevas y confirmación de
  ADR-0028/0029/0030 sin cambios de forma.
- 5 oct 2026: implementación de `/learning` (#35 a #42): contrato del plan, página, gaps,
  progreso compartido, banco por fases y enlaces con `/interview`.
- 5 oct 2026: QA del banco de AI contra sus fuentes (#43), nav "Plan de estudios" en el
  Toolbar, contenido demo de ofertas y specs contra fixtures (#30) y split documental de lo
  genérico y lo personal (#32).
- 6 oct 2026: banco de experiencias en reserva (`backlog`) en el perfil, con contrato de
  defensabilidad por item y promoción a CV por confirmación (ADR-0031).
