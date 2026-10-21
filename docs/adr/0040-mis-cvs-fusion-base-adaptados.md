# ADR-0040: "Mis CVs": fusión de `/` y `/adapted` con tabs y navbar consistente

Estado: Vigente (Fase D, 21 oct 2026).

## Contexto

El CV base y los CVs adaptados vivían en dos páginas separadas (`/` y `/adapted`),
con el toggle de posicionamiento metido en el toolbar y una navbar que solo existía
en esas dos páginas: `/interview` y `/learning` no tenían navegación al resto del
sitio. La Fase A dejó la navbar consistente pendiente "para no hacerla dos veces"
justamente porque esta fusión iba a rehacer la estructura de páginas.

## Decisión

1. **"Mis CVs" es una sola página en `/`**, con tabs "CVs base" (default) y
   "CVs adaptados". El CV base canónico imprimible sigue en `/`: sin JavaScript se
   renderiza el CV base y el print emite solo el documento activo; el chrome de tabs
   y cards no se imprime.
2. **La isla del gestor de ofertas vive en la tab "CVs adaptados"** de `/` (ajusta
   el alcance del ADR-0021: la isla sigue siendo la excepción al stack sin framework
   y el CV base sigue vanilla, ADR-0007 intacto). Estado de ofertas y carpeta por
   oferta sin cambios (ADR-0022).
3. **Cards por posicionamiento** como selector de la proyección del CV base (título,
   resumen corto y acciones "Imprimir PDF" / "Exportar"), reemplazando el toggle del
   toolbar, que queda con idioma / export / tema. Cada card es una proyección del
   perfil (ADR-0026): cambia la selección, no el contrato.
4. **La ruta `/adapted` se elimina sin stub.** Deep link canónico: `/?tab=adaptados`
   (se acepta también `?tab=adapted`). Los 404 de bookmarks viejos se aceptan: es una
   herramienta personal + demo. El back-link del gestor pasa a "← CVs base", un botón
   que activa la tab.
5. **Navbar consistente de 3 destinos en todas las páginas** ("Mis CVs" · "Prep
   entrevistas" · "Plan de estudios"), desde el componente `SiteNav` compartido: el
   Toolbar lo compone en "Mis CVs" y `/interview` y `/learning` lo usan como barra
   slim sobre su header propio (que no se toca). Los destinos viven fijos en el
   componente para no repetirlos.
6. **Print/export invariantes**: imprimir emite solo el documento activo (tab base:
   proyección activa; tab adaptados: CV de la oferta seleccionada); el diálogo de PDF
   sugiere el nombre neutro del ADR-0036 en ambas tabs; los exports actúan sobre el
   documento activo, resuelto por tab (`window.__exportResume` para la proyección
   base y `window.__adaptedExportResume` para el CV adaptado).
7. **ADR-0033 sin cambios de decisión**: el build genérico sigue filtrando ofertas con
   `OFFERS_SOURCE=demo`, así que la tab de adaptados del deployable solo muestra las
   ofertas demo.

## Consecuencias

- `/` deja de ser solo el CV: es el destino "Mis CVs" con dos vistas, aunque el CV
  base imprimible sigue siendo lo que se ve por default.
- Una sola URL para los CVs (`/`); los deep links de las skills y de los flujos del
  gestor apuntan a `/?tab=adaptados`.
- Specs: las specs del gestor, del print y del header se re-apuntan a `/?tab=adaptados`
  o al click de tab; los locators de `article.lang` se acotan al panel base (o usan
  `data-positioning`) porque la isla del gestor también renderiza artículos `lang`.
- Los ADRs 0007, 0021, 0022, 0026, 0033 y 0036 siguen vigentes; este ADR registra el
  cambio de estructura de páginas y de navegación, no de contratos.
