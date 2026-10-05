# ADR-0025: Salario y recruiter como metadata estructurada de la oferta

Estado: Vigente.

## Contexto

El contrato de captura guardaba seis campos de metadata en el frontmatter de
`offer.md`: empresa, rol, fecha, url, modalidad y location. El salario y el
contacto del recruiter solo podían anotarse como texto suelto en la sección
`# Notas de captura` del cuerpo (cuando se cargaban a mano en la app) o quedar
perdidos dentro del texto verbatim. La app no los mostraba de forma
estructurada y la skill de captura no los extraía del JSON del agente.

## Decisión

`salario` y `recruiter` pasan a ser campos de primera clase del contrato de
captura:

- La skill `capture-job-offer` los extrae como texto tal como aparecen en la
  oferta (moneda, periodo y bandas incluidos), o `null` si no están.
- El JSON de captura (modo app) los incluye. La validación Zod los acepta como
  opcionales para no romper capturas viejas.
- El frontmatter de `offer.md` los escribe siempre, con `N/A` cuando no están
  (misma convención que `url` y `location`).
- `OfferMeta` (endpoint, isla y tarjetas) los expone; la tarjeta de la oferta
  muestra el salario cuando existe.
- Las notas de captura dejan de duplicar salario y contacto; `seniority` y
  `stack` siguen como extras del formulario.

## Consecuencias

- Las ofertas ya capturadas sin estos campos siguen parseando: el frontmatter
  ausente o `N/A` se normaliza a `null`.
- El salario no se estructura en campos numéricos (min, max, moneda, periodo)
  porque las ofertas lo declaran de forma heterogénea y con bandas múltiples;
  el texto es la representación más fiel.
- El análisis de match y la cover letter pueden citar el rango desde
  `offer.md` sin depender de un parseo.
