# ADR-0021: Isla React para el gestor de ofertas, con excepción al stack sin framework de UI

Estado: Vigente.

## Contexto

El gestor de ofertas dejó de ser un botón decorativo y pasó a ser una mini-app con
estado: borrador de oferta, tres estados por oferta, modales encadenados, validación
de JSON pegado y verificación por fetch. En vanilla JS esto escala como pelota de
nieve dentro de un solo script (los modales existentes ya superan las 400 líneas).
Por otro lado, el CV principal (/) es el producto final ATS-friendly y su stack
vanilla sin framework está decidido y testeado (ADR-0007).

## Decisión

Usar `@astrojs/react` con una isla React solo en `/adapted`: toda la interactividad
de la página de ofertas (sidebar, modales, badges, verificación) vive en la isla,
con datos iniciales inyectados por Astro como props. El CV (`/`) permanece estático
vanilla, sin framework, igual que hoy.

## Opciones consideradas

- React completo (SPA o port total del sitio): descartado, migraría el CV y su CSS
  de impresión ATS que ya funciona, riesgo desproporcionado.
- Seguir vanilla: descartado por el crecimiento del estado del gestor.
- Tailwind o CSS Modules en la isla: descartados, duplicarían el design system CSS
  global existente (custom properties, badges, modales compartidos).

## Stack de la isla

- React 19, TypeScript, `client:idle` (hidratación post-load).
- Formularios: react-hook-form + @hookform/resolvers con Zod (mismo schema compartido
  con el contrato del output del agente).
- Estado: useState/useReducer locales, sin librerías de estado ni data-fetching.
- Estilos: CSS global existente del repo, clases compartidas con los modales actuales.
- React Compiler: solo como plugin de ESLint (detección de patrones), no habilitado
  en build.

## Consecuencias

- ADR-0007 sigue vigente para el CV y el sitio deployado; esta excepción aplica solo
  al gestor de ofertas.

## Addendum (17 sep 2026)

La excepción al stack sin framework se extiende a una segunda isla React, la de
interview prep en `/interview` (ADR-0024). El CV principal (`/`) sigue vanilla.
- La página /adapted requiere JavaScript hidratado para funcionar; es una herramienta
  local de flujo de trabajo, no parte del CV público.
