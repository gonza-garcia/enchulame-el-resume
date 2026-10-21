# ADR-0039: Formato de experiencia ATS-safe

Estado: Vigente.

## Contexto

El CV se define "ATS friendly" desde el formato single column (ADR-0007), pero la
experiencia laboral se renderizaba como un empleo con subproyectos que tienen nombre de
cliente/empleador y su propio rango de fechas ("Aeronix (cargo operations console)
February 2023 - July 2026" dentro de Aurora Labs). En una prueba real sobre un portal Workday
(oct 2026) el parser dividió la experiencia en 4 empleos (Aeronix, Solmar, Aurora Labs,
Nimbus) con fechas cruzadas, roles faltantes y la permanencia de 6+ años en Aurora Labs
apareciendo como 3 saltos cortos: exactamente lo que un filtro automático de años de
experiencia lee mal.

Los proyectos internos son además la estructura del producto (el perfil modela
experiencia por empleo con proyectos y bullets, y los CV adaptados se ordenan por
proyecto), así que no se pueden simplemente borrar del CV.

## Decisión

1. **Empleo en dos líneas**: la línea uno es el título del rol, la dos
   `Empresa | fecha inicio - fecha fin` del empleo. El único rango de fechas largo que se
   muestra por entrada es el del empleo.
2. **Proyectos etiquetados sin rango largo**: cada proyecto se muestra como
   `Project:` (o `Proyecto:`) + nombre + años compactos (`2023-2026`) derivados de sus
   `startDate`/`endDate`, que siguen viviendo en el JSON. Los parsers casi nunca confunden
   un rango de años compactos con un empleo.
3. **Nombre de proyecto `Marca cliente - descriptor`** (ej: "Aeronix - cargo operations
   console"): la marca del cliente primero para el escaneo rápido de recruiters
   y el descriptor después para mostrar alcance técnico. El patrón `Empresa - Título` sin
   etiqueta no se usa: la etiqueta `Project:` es lo que lo desambigua.
4. El formato aplica por igual en las tres superficies de render: CV principal
   (`Resume.astro`), CV adaptado (`OfferPanel.tsx`) y export DOCX
   (`docx-export.ts`). Los datos no cambian de forma: `startDate`/`endDate` de proyecto
   siguen siendo obligatorios en los schemas.
5. Las skills del pipeline escriben el contrato: `build-profile` nombró los proyectos con
   la convención y `adapt-resume-to-offer` la mantiene en los CV adaptados.

## Alternativas descartadas

- **Borrar los subproyectos del CV**: perdería la estructura de proyectos que sostiene el
  producto (adaptación por oferta, orden por relevancia, planes de repaso).
- **Dejar el formato y solo renombrar proyectos**: el rango de fechas por proyecto seguía
  haciendo que los parsers los lean como empleos.
- **Mover los proyectos a bullets sin nombre propio**: parse perfecto pero se pierde el
  escaneo rápido de la marca del cliente (Aeronix, Solmar), que es señal fuerte de
  seniority.
- **Fechas de proyecto en rango largo al estilo "Feb 2023 - Jul 2026"**: es justamente el
  disparador del misparse.

## Consecuencias

- Un parser típico lee una entrada por empleo con la permanencia completa; los proyectos
  quedan dentro del empleo como texto etiquetado.
- La marca del cliente sigue visible en la línea del proyecto, pero el formato "marca
  primero" puede verse como "Empresa - Título" si alguien quita la etiqueta `Project:`:
  la etiqueta es parte del contrato de render, no decorativa.
- Los años compactos pierden el mes exacto de cada proyecto: el detalle sigue en el JSON
  (`startDate`/`endDate`) y en las historias de entrevista.
- Los PDFs y DOCX ya generados quedan con el formato anterior hasta regenerarlos.

## Evidencia posterior (20 oct 2026): el formato v2 falla en el ATS de Compassion

Prueba real con el PDF ya en formato ATS-safe contra el parser de Compassion
International (captura del paso "My Experience" de su portal). Resultados:

- **La suposición del punto 2 quedó falsada**: los años compactos del proyecto
  ("2023-2026") sí se convirtieron en fechas de empleo (el formulario quedó con
  From 01/2023 To 01/2026) y la línea del proyecto se segmentó como empleo nuevo
  (Company: "Aeronix"), con el label `PROJECT:` ignorado.
- **`Empresa | fechas del empleo` en una sola línea perdió la empresa**: el parser
  tomó la línea como línea de fechas (From 02/2020 To 07/2026 quedó bien) y dejó
  Company vacío.
- **Los links del contacto se colaron en Role Description** como texto
  (`mailto:...`, `https://...`): son anotaciones de link del PDF y los extractores
  las leen.
- Lo que sí funcionó: el rango largo del empleo asociado a su entrada y los bullets
  del proyecto como descripción.

Pendiente (formato v3): resuelto en la revisión siguiente.

## Revisión v3 (21 oct 2026): formato vigente tras la evidencia de Compassion

La evidencia de arriba falsó parte de los puntos 1 y 2. El formato vigente es:

1. **Empleo en tres líneas**: título del rol, empresa y `fecha inicio - fecha fin`
   del empleo, cada uno en su línea. `Empresa | fechas` en una sola línea hizo que
   el parser tomara la línea como línea de fechas y descartara la empresa.
2. **Proyectos como bullets**: la línea del proyecto se renderiza como bullet con
   la etiqueta `Project:` dentro de la descripción del empleo, **sin fechas
   propias** (`startDate`/`endDate` siguen en el JSON). Ninguna línea suelta del
   CV lleva un rango de fechas además del del empleo: los años compactos del
   formato v2 se probaron y disparan empleos falsos, así que quedan descartados
   por defecto (pueden volver como años en paréntesis solo por decisión
   explícita del usuario).
3. **Contacto en texto plano**: la línea de contacto no lleva links, para que el
   extractor no lea anotaciones `mailto:` ni `https://` dentro de la descripción
   del empleo.

El nombre de proyecto `Marca cliente - descriptor` se mantiene. Aplica igual en
CV principal, CV adaptado y export DOCX.
