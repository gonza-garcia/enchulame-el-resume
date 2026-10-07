# ADR-0031: Banco de experiencias en reserva (backlog) en el perfil

Estado: Vigente.

## Contexto

Hay experiencias reales y defendables que no entran al CV: quedan afuera por
posicionamiento, por el espacio de una página, o porque su techo no justifica ponerlas
en la versión base. El caso disparador fue Docker. Hay evidencia propia (el Dockerfile
de un proyecto de producción mantenido en varios cambios), pero no corresponde como
bullet del CV principal y sí hace falta cuando una oferta lo pide, con el techo claro
de qué se puede reclamar (imagen de build y deploy, no desarrollo diario en
contenedores ni Kubernetes).

Hoy el banco existe solo de forma implícita: los bullets viven todos en
`facts.experience[].projects[].bullets[]` y cada posicionamiento selecciona con
`bulletIds`; los skills viven todos en `skills[]` y se seleccionan con `skillIds`. Lo
que ningún posicionamiento selecciona no se renderiza ni se exporta, pero tampoco
tiene dónde registrar por qué es defendable ni hasta dónde llega. Ese registro es lo
que faltaba.

## Decisión

Agregar un array `backlog` al perfil (`src/schemas/profile.ts`), opcional y con default
`[]`, de modo que un profile sin la clave sigue validando. Cada item es un fragmento
listo para CV con su contrato de defensabilidad:

- `id`: identificador estable.
- `kind`: `experience` | `skill` | `project`, es decir dónde aterrizaría al promoverse.
- `origin`: contexto de dónde pasó (empresa y proyecto, o proyecto personal).
- `text`: cómo se lee en el CV, bilingüe es/en. Es lo que se promueve.
- `proof` (opcional): por qué es defendable. Nunca se imprime en el CV.
- `limits` (opcional): el techo, qué NO reclamar. Nunca se imprime en el CV.
- `skillIds` (opcional): skills que ejercita, referencias al catálogo `skills[]`.
- `status`: `reserve` | `promoted`.

El campo se llama `proof` y no `evidence` para no chocar con el `evidence` de
`skills[]`, que sí se imprime en el CV entre paréntesis (ADR-0026). Son nombres
parecidos con propósito distinto: `skills[].evidence` es visible, `backlog[].proof` es
interno.

La promoción de un item ocurre por cualquiera de los dos caminos, y siempre con
confirmación explícita de la persona usuaria:

1. **A un CV adaptado de una oferta**: `adapt-resume-to-offer` lee el backlog, propone
   los items pertinentes y el usuario confirma cuáles entran. El texto va a
   `docs/job-offers/<slug>/adapted-resume.json` y el item queda en `reserve`, porque es
   reutilizable en otras ofertas.
2. **Al CV base**: el item se materializa en la capa que corresponda (un bullet en
   `facts`, una skill en `skills[]`, un proyecto en `facts.projects`) reusando su `id`,
   y pasa a `status: promoted`. Recién entonces un posicionamiento lo puede seleccionar
   con `bulletIds` o `skillIds` y la proyección lo renderiza.

La colisión de `id` entre un item del backlog y un bullet es esperada en el camino 2 y
por eso no se valida como error. Lo único que se valida es la unicidad dentro del
backlog y que los `skillIds` existan en `skills[]`.

## Consecuencias

- El contrato del perfil crece de forma aditiva: los profiles existentes y el ejemplo
  siguen validando sin la clave, y el render, el export y `/learning` no cambian hasta
  que elijan consumir el backlog.
- La defensabilidad de cada experiencia queda escrita una vez y se reutiliza en cada
  oferta, que es lo que hace repetible la respuesta a preguntas de screening (como la
  de Docker en un formulario de aplicación).
- La promoción al CV base es manual (materializar en `facts`) y así `facts` sigue siendo
  la única fuente de lo que se renderiza. El costo es que el texto queda en dos lugares
  cuando hay promoción, y en ese caso manda `facts`.
- El contenido demo lleva items ficticios: nada de datos reales en
  `profile.example.json`.
