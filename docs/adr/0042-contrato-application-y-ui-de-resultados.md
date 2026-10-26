# ADR-0042: Contrato de postulación (`application.md`) y UI de resultados

Estado: Vigente.

## Contexto

Los resultados del pipeline de postulaciones (qué se envió, a qué empresa y rol, con
qué documentos, qué confirmación devolvió cada ATS y qué quedó vetado/descartado y
por qué) solo vivían fuera del producto. La Fase F los lleva a la app como su centro:
la UI de resultados se diseñó con la persona usuaria (variante D, aprobada el 26 oct
2026) y necesita un contrato por oferta para leer el resultado, y un vocabulario
estable ("Ofertas", "postulación", "Mis Perfiles").

El estado del flujo de postulaciones vive fuera del producto, en las herramientas
personales del usuario; la app no lo duplica ni lo reescribe: solo describe el
resultado por oferta y lo muestra.

## Decisión

1. **`application.md` es el contrato de resultado** de una postulación
   (`docs/job-offers/<slug>/application.md`). El frontmatter es el contrato validado
   por schema Zod (`src/schemas/application.ts`) y leído por el read model de ofertas
   (`parseApplicationFile`):
   - Requeridos: `empresa`, `rol`, `fecha` (alias legacy `fecha_envio`) y `estado`.
   - Estados: `borrador | en preparacion | enviada | confirmada | vetada |
     descartada` (los dos primeros existen en datos reales de instancias).
   - `motivo` es requerido cuando el estado es `vetada` o `descartada`.
   - Opcionales: `ats`, `confirmacion` (texto devuelto por el ATS), `cv_enviado`,
     `cover_enviado`, `outcome` (`rechazada | entrevista | oferta`) y
     `outcome_fecha`.
   - El parser tolera alias y campos ausentes (los valores `pendiente` / `N/A` se
     leen como vacíos) pero falla ruidosamente en build ante valores inválidos, y el
     error nombra el archivo.
2. **`perfiles` en el frontmatter de `offer.md`** (addendum aprobado el mismo día):
   ids de los posicionamientos del perfil a los que apunta la oferta, separados por
   coma (`perfiles: frontend, ai`). Es **dato declarado**, opcional y **multi-perfil**:
   una oferta puede apuntar a varios perfiles y un perfil tiene varias ofertas. Sin el
   campo, la oferta no se asigna a ningún perfil y solo aparece en "Todas". El read
   model lo expone en `OfferMeta.perfiles` y `capture-job-offer` (dueña del contrato de
   carpetas) lo documenta y lo extrae en su modo app.
3. **La UI de resultados es la página "Ofertas"** (variante D): navbar de 4 destinos
   ("Mis perfiles" · "Ofertas" · "Prep entrevistas" · "Plan de estudios"; "Mis CVs"
   pasa a "Mis Perfiles" y los posicionamientos del perfil son los perfiles), sidebar
   de filtros (Estado: Todas / Capturadas / Postuladas + los estados del contrato con
   counts; Perfil con toggle y "+ Agregar perfil" con puente de prompts a
   `build-profile`; Top matches con score ≥ 80), cards compactas (score, `rol -
   empresa`, estado/fecha/ATS, chips de metadata y 1 línea de motivo o confirmación) y
   visor a la derecha con segmented de **4 vistas** — "Oferta original / CV adaptado /
   Cover letter / Postulación" — y menú de tres puntos con "Cargar repaso" (deep link
   `?repaso=` hacia `/interview`) y "Descargar". El chip de estado de la postulación y
   la sección "Postulación" también viven en el gestor de ofertas (tab "CVs
   adaptados"), con deep link `?tab=adaptados&oferta=<slug>`.
4. **Reglas de UI unificadas**: pills solo para etiquetas (chips/badges), rectángulos
   solo para acciones (botón base + primario/secundario/ghost), segmented para las
   vistas del visor, navbar como links con subrayado (el activo subrayado), checklist
   de accesibilidad (`focus-visible`, transiciones 150ms, `prefers-reduced-motion`) y
   escala tipográfica 11/12/13.
5. **Vocabulario**: "postulación" (no "aplicación", anglicismo del nombre de archivo
   `application.md`, que no cambia) y "Ofertas" como destino unificado (antes Ofertas
   + Postulaciones). "Ver postulación" es una **vista** del visor, no una acción.
6. **Líneas rojas**: el tracker del pipeline sigue siendo el dueño del estado del
   flujo de postulaciones (este contrato no lo duplica); el score que muestra la app
   es el `match_score` del match-report; el **Submit de cualquier postulación lo
   aprieta siempre el usuario** (la UI no tiene acciones de envío ni seguimiento);
   los vetos anteriores a la captura no tienen carpeta y quedan fuera del ledger por
   diseño; las convenciones privadas del pipeline no se escriben en el producto.

## Alternativas descartadas

- **Heurística de coincidencia de skills oferta↔perfil** para el filtro de perfiles:
  clasificación errónea posible y magia oculta. El dato declarado `perfiles` es
  verificable y editable por la persona usuaria.
- **Filtro de perfiles solo visual** (esperar datos para hacerlo funcional): dejaba un
  filtro muerto en la UI aprobada.
- **Estado de la postulación dentro de `offer.md`** o un schema de estado duplicado:
  `offer.md` es la oferta capturada verbatim, y duplicar estado inventaría estado.
- **"Ver postulación" como acción** en el visor: la persona usuaria pidió el ajuste el
  26-oct; es una vista más del segmented.

## Consecuencias

- La carpeta por oferta queda con seis piezas: `offer.md` (con `perfiles` opcional),
  `match-report.md`, `adapted-resume.json`, `cover-letter.md`,
  `interview-review-plan.json` y `application.md`. La dueña del contrato es la skill
  `capture-job-offer`.
- El estado derivado del disco incluye la postulación: Agregada (`offer.md`),
  Analizada (`match-report.md`), Adaptada (`adapted-resume.json`) y Postulada
  (`application.md`, con su estado del contrato).
- Un `application.md` inválido rompe el build nombrando el archivo: el error se
  arregla editando el archivo, no ocultándolo.
- Backfill en instancias existentes: el campo `perfiles` se completó en las carpetas
  de ofertas (regla: `frontend` por defecto y `+ ai` cuando el rol o las skills de la
  oferta lo indiquen); `application.md` solo existe donde hubo postulación.
- El prototipo descartable del diseño se capturó como fuente primaria en la rama
  `prototipo/ui-resultados-fase-f` (commit `5add501`); el árbol principal queda solo
  con la decisión validada.
