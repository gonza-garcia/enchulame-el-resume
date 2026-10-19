# ADR-0035: Plan de repaso por oferta

Estado: Vigente.

## Contexto

El match-report de cada oferta trae una sección "Temas a repasar para la entrevista",
pero como texto: `/interview` no puede cargar esa selección. A la vez, el banco tiene
ids de pregunta estables (ADR-0030) y la práctica real mostró que lo útil para repasar
una oferta es una lista de prioridades ordenadas, cada una con tema, por qué importa y
los ids concretos del banco, más los temas que el banco no cubre. Ese formato quedó
probado a mano en `interview-review-plan.md` de una oferta real (10 prioridades con ids
y huecos del banco) y hacía falta volverlo contrato.

Restricción de fondo: el contrato del banco no se toca (los id de pregunta se conservan
y no se agregan preguntas: eso es Fase C).

## Decisión

1. **Contrato JSON por oferta**: `docs/job-offers/<slug>/interview-review-plan.json`,
   uno por oferta, al lado de `offer.md`, `match-report.md` y `adapted-resume.json`.
   Schema Zod en `src/schemas/interview-review-plan.ts`, validado en build.
2. **Forma** (version 1): `version`, `slug`, `empresa`, `rol`, `generatedAt`
   (YYYY-MM-DD), `matchScore` (nullable), `items` y `gaps`.
   - `items` son las prioridades de repaso **en orden** (el orden del array es la
     prioridad). Cada item: `id` estable kebab-case (único por plan), `tema` visible,
     `why` opcional (nullable) y `questionIds` con ids **completos** del banco (mínimo
     uno; sin abreviar con guion inicial).
   - `gaps` son los temas que el banco no cubre: `topic` y `note` opcional. Se repasan
     fuera de `/interview`.
   - Los textos van en español, como el match-report. El banco sigue en inglés y la UI
     de `/interview` en español.
3. **El contrato del banco no se toca**: el plan solo referencia ids de pregunta
   existentes y no agrega preguntas. La validación cruzada corre en build: todo
   `questionId` tiene que existir en el banco, y si no el build falla nombrando el id y
   el plan (mismo criterio que el check de tricky groups de `/interview`).
4. **La genera la skill `build-interview-review-plan`** en el pipeline del agente:
   lee el match-report, cruza contra el banco y escribe el archivo en la carpeta de
   la oferta. La app no compone ni escribe el plan: `/adapted` solo muestra su estado
   y navega a `/interview`, y `/interview` lo consume. La skill es la dueña del
   contrato.
5. **Lo consume `/interview`**: los planes se cargan respetando `OFFERS_SOURCE` (en el
   build genérico solo entran los de ofertas `demo: true`, igual que las ofertas) y la
   página ofrece cargar el repaso de una oferta.
6. **Estado del repaso en clave propia**: `interview-review` en `localStorage`, sobre el
   módulo compartido `progress-storage`, con `{ version: 1, activeSlug, marks }`. Las
   `marks` son marcas por tema con clave `<slug>/<itemId>` (`pendiente` | `dominado`).
   El repaso **no pisa `interview-progress`**: el estado de estudio por pregunta del
   banco (Sé / Repasar y notas) solo se lee, nunca se escribe desde el repaso.

## Opciones consideradas

- **Tag por pregunta dentro del banco**: descartado, toca el contrato del banco y
  mezcla estado por oferta con contenido global.
- **Markdown validado a mano** (el `interview-review-plan.md` de referencia): descartado
  como contrato, no es machine-readable ni validable en build. Queda como referencia
  histórica del formato.
- **Hardcodear la selección en la app**: descartado, no es por oferta ni generable por
  un agente a partir del match-report.
- **Estado del repaso dentro de `interview-progress`**: descartado, pisaría el estado de
  estudio del banco que el usuario ya tiene guardado.
- **Puente de prompts (ADR-0023) para generar el plan desde `/adapted`**: descartado, el
  plan no tiene ediciones de formulario que la app deba componer. La skill lo escribe
  directo en el pipeline, mismo criterio que la cover letter (ADR-0032).

## Consecuencias

- Un plan con ids que el banco ya no tiene rompe el build, nombrando el id. Los id del
  banco son estables por política (ADR-0030), así que el drift queda raro y ruidoso.
- Los huecos del banco se modelan aparte (`gaps`) y se repasan fuera de `/interview`;
  la Fase C puede cubrirlos con preguntas nuevas citadas.
- El plan es generable por un agente desde el match-report y consumible por `/interview`
  sin backend: mismo reparto de roles que el resto del flujo (ADR-0023).
