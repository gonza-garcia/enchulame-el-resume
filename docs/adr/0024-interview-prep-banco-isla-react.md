# ADR-0024: Banco de interview prep e isla React

## Estado

Vigente

## Contexto

El repo necesita una página pública de preparación para entrevistas que reúna un banco
curado de preguntas técnicas y behavioral, follow-ups tricky, quizzes y escenarios de
código. El volumen actual es de 345 preguntas repartidas en 20 áreas. La interacción
requiere filtros combinables, búsqueda, orden, detalle seleccionado y práctica guiada.

## Decisión

- La página pública vive en `/interview/` y se enlaza desde la navegación del CV como
  `Prep entrevistas`.
- Los JSON promovidos a `src/content/interview-questions/` se validan con Zod durante el
  build. El contenido del banco permanece en inglés y la UI se presenta en español.
- El detalle, los filtros, los quizzes y los escenarios se implementan como una isla React
  independiente de la isla de ofertas. La lógica de filtrado y orden se mantiene en funciones
  puras.
- Los bloques de código se convierten a HTML con Shiki durante el build. El único HTML
  inyectado en React es ese output generado en build; el resto del contenido se renderiza como
  texto o un subconjunto seguro de Markdown.
- v1 persiste únicamente el estilo de colores por nivel en `localStorage`. El estado de
  aprendizaje, notas y export/import quedan para una fase posterior.

## Consecuencias

- La página puede servir el banco como HTML estático y evitar un highlighter en runtime.
- Agregar o corregir preguntas exige pasar la validación de contenido y regenerar el build.
- React queda justificado como excepción para una segunda superficie de interacción, mientras
  el CV principal conserva su arquitectura vanilla y ATS-friendly.

## Addendum (28 sep 2026)

La fase 2 quedó implementada (issue #25): estado de aprendizaje por pregunta (Sin marcar,
Sé, Repasar), notas de texto plano, y export/import JSON con `version: 1` validado con Zod.
Todo vive en `localStorage` con claves propias (`interview-progress` para el progreso,
`interview-level-style` para los colores), separadas del tema del CV. El import inválido
rechaza con mensaje claro sin romper la UI.
