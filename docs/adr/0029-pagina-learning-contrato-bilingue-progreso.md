# ADR-0029: Página `/learning` con contrato del plan bilingüe y progreso compartido

Estado: Vigente.

## Contexto

`/learning` se diseñó después de cerrar el modelo de perfil (ADR-0026) y el contrato del plan
(ADR-0028). Faltaba definir cómo se presenta el plan (fases, recursos, demanda y progreso),
cómo se derivan los gaps del read model del perfil, en qué idioma vive el contenido del plan y
cómo se relaciona con `/interview`. ADR-0028 dejó el progreso fuera del contrato justamente
para decidirlo en este grilling.

## Decisión

La página navega el plan por fases ordenadas por los roles que habilitan, con fichas de
recursos (link, creador, plataforma, precio, duración, idioma del material, confidence opcional
y opinión) mapeadas por skill a la demanda del mercado, anti-lista y señales de salida del plan,
y material de investigación como sección estática de lectura ordenada, fuera del contrato del
plan y del perfil. El orden de ataque de roles se modela con id, name y summary, y cada rol
muestra la fase que lo habilita.

El texto del plan es bilingüe es/en por campo con ambos obligatorios (mismo formato de
localización del perfil) y se renderiza según el toggle del sitio; la UI queda en español fijo.
El contrato tiene catálogo plano de recursos en muchos a muchos con skills, y la demanda
(label, source, asOf) sigue colgada de la skill (ADR-0028).

El progreso es dato del usuario: marcas por recurso (hecho, en curso, skipped) y gate por fase
(pendiente, cumplido), en localStorage con clave propia, export y import JSON versionado
validado con Zod, sobre un módulo de persistencia compartido con `/interview` extraído del
patrón que ya usaba esa página.

Los gaps son por presencia de skill id entre plan y perfil. Las prioridades ordenan los gaps por
demanda dentro del orden de fases. Las sugerencias relacionan hechos del perfil (que suman
referencias opcionales a skill id) con skills del plan no declaradas. Las skills del perfil que
el plan no toca se muestran en sección propia; si una skill tiene distinto nombre en plan y
perfil se muestran los dos. El posicionamiento activo es solo una nota de contexto.

Las skills del repo para este flujo viven en `skills/job-seeking/`: `research-content`,
`content-designer` y `capture-learning-plan`, siguiendo el patrón de `capture-job-offer` con
modo app y modo directo.

## Consecuencias

- El contrato del plan se vuelve dependencia de la página, del progreso y de los joins con el
  perfil: cambiar sus campos rompe todo a la vez.
- La obligación de ambos idiomas encarece la escritura del plan y de su seed de ejemplo, y
  elimina el riesgo de contenido a medias en un idioma.
- El módulo compartido de persistencia obliga a un refactor sobre `/interview` antes de
  cualquier cambio visible de `/learning`.
- Los hechos con skill id extienden el contrato del perfil (interfaz con #28): el onboarding
  debe cubrirlos para que las sugerencias tengan datos.

## Addendum: reevaluación del plan (5 oct 2026)

La reevaluación con las fuentes nuevas (`docs/research/ai-learning-reevaluacion-2026-10.md`)
confirma esta decisión sin cambios de forma: ninguna de las fuentes trae un modelo de producto
que justifique alterar la página, el contrato bilingüe, el progreso compartido ni los gaps por
presencia. Lo que cambia es el contenido que se navega (el plan de estudios se actualizó en su
contenido, no en su forma) y una enmienda menor de alcance: la sección de material de
investigación puede incluir las lecturas del dominio que las fuentes dejan (artículos de
nothiring.me y repo del AI Engineering Field Guide), siempre fuera del contrato del plan y del
perfil, tal como esta decisión ya lo exige.
