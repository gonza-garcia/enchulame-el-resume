# ADR-0007: Formato del CV y fuente JSON

Estado: Vigente.

## Decisión

- Astro genera un sitio estático sin backend.
- `src/content/resume.json` es la fuente bilingüe de datos.
- `src/pages/index.astro` valida el JSON con Zod antes de renderizar.
- JavaScript vanilla controla idioma, exports y temas.
- El layout es single column para favorecer lectura ATS.
- `window.print()` genera el PDF con CSS de impresión y texto seleccionable.
- La página incluye Download JSON, Print PDF y Export to LinkedIn.
- El orden base es Header, Summary, Skills, Experience, Education, Certifications y
  Personal Projects.

## Límites

No usar un schema externo, un builder visual de dos columnas ni un framework de UI para esta
versión. La sección Personal Projects solo aparece cuando `projects` no está vacía.
