# ADR-0026: Modelo de perfil en capas con posicionamientos y fallback al ejemplo

Estado: Vigente.

## Contexto

El producto pasa a ser genérico: otro usuario clona el repo, un agente lo entrevista y arma
su CV maestro. `resume.json` con datos propios no puede seguir siendo el contrato de la app,
y el contenido de hechos (experiencia, educación, certificaciones) no puede duplicarse por
idioma ni por posicionamiento. Además `/learning` necesita skills como entidad propia y dos
posicionamientos sobre los mismos hechos, sin depender del shape de `resume.json`.

## Decisión

El perfil del usuario (`profile.json`, schema Zod) es la fuente única de datos y se modela
en cuatro capas: identidad (nombre y contacto), hechos (experiencia, educación,
certificaciones, idiomas y proyectos, una sola vez), skills como entidades (id estable,
nombre, categoría, nivel defendible y evidencia opcional) y posicionamientos (array; v1 con
dos: frontend y AI, cada uno con título, summary, selección y orden de skills, y selección y
orden de bullets). La localización es/en por campo de texto, no por bloque de locale.

`resume.json` deja de ser fuente: la página del CV renderiza una proyección del perfil
(posicionamiento más locale) y el export JSON descarga esa proyección. El build carga el
profile local si existe y cae al `profile.example.json` (persona demo ficticia) si no. La
skill de onboarding (patrón de `capture-job-offer`, modo app y modo directo) entrevista al
usuario y escribe el profile validado. `/learning` consume un read model del perfil (skills
con id y nivel, posicionamiento activo, hechos para gaps), nunca el shape del CV.

## Consecuencias

- El schema del perfil se vuelve el contrato más estable del producto; cambiarlo rompe
  onboarding, render, export y `/learning` a la vez.
- Un solo contenido de hechos elimina la desincronización entre idiomas y entre
  posicionamientos, al costo de escribir cada campo de texto con sus traducciones.
- El clone del repo buildea verde sin datos del usuario, y los tests corren contra la demo.
- El perfil real de cada usuario se excluye por gitignore; quien quiera versionarlo lo hace
  en su propia instancia privada.

## Addendum: contrato resuelto (30 sep 2026, ticket #28)

La implementación de #28 concretó las formas que este ADR no fijaba:

- Localización: cada campo de texto es `{ es, en }` con ambos obligatorios, incluidas las
  fechas visibles del CV. Los identificadores (id, url, email, teléfono) no se localizan.
- Hechos: cada bullet de experiencia tiene un id estable (para que el posicionamiento lo
  seleccione y ordene) y `skillIds` opcionales. Los proyectos personales también llevan
  `skillIds` opcionales. Es la interfaz que alimenta las sugerencias desde hechos de
  `/learning`.
- Skills como entidad: id estable, name, category, level (texto defendible en los dos
  locales) y evidence opcional. El level no se imprime en el CV; la evidence sí, entre
  paréntesis.
- Posicionamientos: id, title, summary, `skillIds` (selección y orden de skills) y `bulletIds`
  (selección y orden de bullets). Un proyecto de trabajo sin bullets seleccionados no aparece
  en esa proyección.
- Proyección: la proyección de un posicionamiento y un locale es un documento con el shape de
  `src/schemas/resume.ts` (el que usan el render y el export). Los idiomas del perfil se
  proyectan como una línea de skills propia. El export JSON descarga la proyección activa
  (posicionamiento más locale), un solo locale por descarga.
- Carga en build: `src/lib/profile.ts` usa `src/content/profile.json` si existe y cae a
  `src/content/profile.example.json` (persona demo ficticia) si no. `PROFILE_SOURCE=example`
  fuerza el ejemplo.
- Read model para `/learning`: `src/lib/profile-read-model.ts` expone skills (id, name,
  category, level, evidence opcional), posicionamiento activo y hechos aplanados
  (experience-bullet y project) con label, text y skillIds.
