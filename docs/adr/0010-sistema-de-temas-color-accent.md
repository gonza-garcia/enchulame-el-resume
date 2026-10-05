# ADR-0010: Sistema visual de temas y accent color

Estado: Vigente.

## Decisión

- La vista de pantalla puede usar un accent oscuro y contenido sobre fondo claro.
- Hay presets Navy, Teal y Charcoal, más un color custom.
- El color custom debe cumplir contraste AAA de al menos 7:1 contra blanco.
- El usuario puede aplicar el accent a nombre, headings, URLs y categorías de skills.
- La preferencia se persiste en `localStorage` y se restaura sin flash visible.
- La impresión conserva el accent elegido para headings y URLs, usando `print-color-adjust:
  exact` para evitar que el navegador lo elimine automáticamente.

## Límites

Un solo accent global. Sin fondos coloreados, gradientes ni iconos coloreados. El sistema visual
no cambia el contenido de `resume.json`.
