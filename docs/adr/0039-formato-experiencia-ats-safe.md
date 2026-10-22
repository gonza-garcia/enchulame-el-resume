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

## Revisión v4 (21 oct 2026): bloques de cliente y bullets de texto literal

Decisión del usuario, con investigación de referencia (patrón "umbrella and
placements" para empleados de consultora con múltiples clientes; el formato
`Assignment: ... (Duration)` de las guías de temp/contract work; y las reglas de
delimitadores de bullet de los parsers ATS: estándar `•`, `-`, `*`; símbolos
decorativos se pierden):

1. **Bloques de cliente explícitos**: la línea del proyecto se renderiza como
   `Client: <cliente> (<años compactos>) | <descriptor>` (o `Cliente:` en es),
   en negrita como mini-encabezado dentro de la descripción del empleo. Los años
   vuelven entre paréntesis por decisión explícita del usuario, aceptando el
   riesgo residual que documenta la evidencia de Compassion: la línea va como
   bullet y no como línea suelta para minimizarlo. El patrón "umbrella" (un solo
   empleador con las asignaciones adentro) es lo que evita el flag de job-hop que
   generan las entradas separadas por cliente.
2. **Bullets de texto literal**: los marcadores son caracteres en el texto
   (`•` para los bloques de cliente, `-` para los logros), con `list-style: none`
   en el render. El marker de lista CSS no está en la capa de texto del PDF (se
   pierde al copiar y los parsers no siempre lo ven como delimitador); un
   carácter literal se copia y se parsea. Sin `::before` posicionados (reordenan
   la extracción del PDF en Chromium). En el export DOCX aplica lo mismo: los
   marcadores van como texto de los runs y no como listas nativas de Word, cuyo
   numbering tampoco llega a la capa de texto que leen los extractores.
3. El empleo sigue en tres líneas (rol, empresa, fechas del empleo) y el contacto
   en texto plano sin links. El label de la línea de cliente se rotula por idioma
   (`Client:` / `Cliente:`) también en el DOCX, que exporta la proyección activa.

La revisión v3 queda superada en su punto 2: los años del proyecto vuelven a la
vista, entre paréntesis.

## Corolario de contenido (21 oct 2026): el demo demuestra la convención

Los proyectos del contenido de ejemplo (`src/content/profile.example.json` y los
`adapted-resume.json` demo) usaban la forma heredada `Marca (descriptor)` y el
render v4 los mostraba con el nombre completo y los años después del
paréntesis. Quedaron alineados a `Marca cliente - descriptor` (decisión 3), que
es lo que escriben las skills: el ejemplo demuestra el contrato y las specs de
render afirman la línea completa `Client: <cliente> (<años>) | <descriptor>`.
`clientBlock` conserva el fallback "sin separador, el nombre va completo" para
proyectos internos sin cliente.
