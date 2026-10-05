# ADR-0020: Upgrade de Astro 5 a la versión estable actual antes del feature del gestor de ofertas

Estado: Vigente.

## Contexto

El gestor de ofertas requiere una isla React. El repo estaba en Astro ^5.0.0. Al
momento de decidir, la version estable vigente era 6; durante el upgrade aparecio
el issue conocido de Astro 6.4.8 con la integracion de React en dev
(`Missing field moduleType`, conastro/issues 17147 y 17148, corregido en Astro 7),
por lo que el upgrade termino directo en Astro 7.3.2.

## Decisión

Ejecutar primero el upgrade de Astro (paso previo aislado, con check, build y tests
Playwright en verde) y construir la isla React sobre la version estable final:
Astro 7.

## Consecuencias

- El feature nuevo hereda una base actualizada, no una deuda de migracion.
- Cualquier breaking change se resolvio en el cambio aislado del upgrade.
- El upgrade no cambia contenido del CV ni decisiones de ADRs anteriores.

## Alternativas consideradas

- Construir sobre Astro 5 y migrar despues: descartado porque el feature nuevo
  habria heredado el riesgo de la migracion.
- Quedar en Astro 6.4.8: descartado porque su dev server tiene el issue conocido
  con la integracion React (rolldown), corregido en 7.

