---
name: build-profile
description: Entrevistar a la persona usuaria y escribir su perfil maestro en src/content/profile.json bajo el schema del repo. Usar cuando el usuario pide "armar mi perfil", "crear mi CV maestro", "onboarding", "entrevistarme para el perfil", o cuando la app del CV genera un prompt que referencia esta skill. Produce identidad, hechos, skills como entidad y los dos posicionamientos (frontend y AI), con cada campo de texto en es y en. NO captura ofertas ni adapta CVs: para eso estan capture-job-offer y adapt-resume-to-offer.
---

# Build Profile

Entrevistar a la persona usuaria y producir su perfil maestro: identidad, hechos
(experiencia, educacion, certificaciones, idiomas y proyectos personales), skills
como entidad y los dos posicionamientos (frontend y AI), con cada campo de texto
en es y en. El resultado siempre converge a lo mismo: `src/content/profile.json`,
un documento que pasa la validacion Zod del build (`src/schemas/profile.ts`).

## Modo de operacion

La skill corre en dos modos, decididos por quien la invoca:

- **Modo app**: el prompt viene de la app del CV y pide devolver SOLO un bloque
  JSON con el perfil completo. El usuario lo pega en la app, que valida y despues
  pide el guardado verbatim. No escribas archivos en este modo salvo que el prompt
  lo pida explicitamente.
- **Modo directo**: el usuario pide armar y guardar su perfil. Aplicas todos los
  pasos, incluido el guardado en disco.

El output JSON del modo app y el archivo guardado en modo directo producen la
misma informacion: mismos campos, mismos formatos, mismo destino.

## Contrato

El perfil es la fuente unica de datos del CV, del export JSON y de /learning.
Antes de entrevistar, leer `src/schemas/profile.ts` (el contrato exacto) y
`src/content/profile.example.json` (una forma completa de referencia, con persona
ficticia). No inventar campos fuera del schema.

Cuatro capas:

- **Identidad**: `identity.name` y `identity.contact` (phone, email, location,
  linkedin, github).
- **Hechos** (`facts`): `experience`, `education`, `certifications`, `languages`
  y `projects`. Una sola vez, compartidos por todos los posicionamientos.
- **Skills como entidad** (`skills`): id estable, name, category, level
  defendible y evidence opcional.
- **Posicionamientos** (`positionings`): v1 con dos, id `frontend` y id `ai`.
  Cada uno con title, summary, `skillIds` (seleccion y orden de skills) y
  `bulletIds` (seleccion y orden de bullets).

Localizacion: cada campo de texto es `{ "es": "...", "en": "..." }` con ambos
obligatorios. Los identificadores (id, url, email, telefono) no se localizan. Las
fechas visibles del CV si: `startDate`, `endDate` y `date` son texto localizado
con mes y ano legibles ("Abr 2021" / "Apr 2021"), no formato ISO.

Interfaz con /learning: cada bullet de experiencia y cada proyecto personal puede
llevar `skillIds` opcionales. Es lo que alimenta las sugerencias "esto ya lo
tocaste en X". Los bullets necesitan id estable porque el posicionamiento los
selecciona y ordena, y porque /learning los referencia.

## Pasos

### 1. Preparar el material

- Leer `src/schemas/profile.ts` y `src/content/profile.example.json`.
- Si existe `src/content/resume.json`, leerlo. Es contenido personal heredado:
  sirve de material de la entrevista para no re-preguntar lo que ya esta escrito
  (nombre, contacto, fechas, bullets, skills, summaries), pero el perfil es lo
  que se escribe. No copiar su shape ni tratarlo como fuente.
- Leer los guardrails de `AGENTS.md`: claims defendibles, sin nombres internos ni
  metricas exactas del codigo privado.

Criterio de completado: el schema, la forma de referencia y el material heredado
estan en tu contexto.

### 2. Entrevistar

Trabajar por tandas con preguntas interactivas (el formato de pregunta del
entorno del agente). Cubrir SIEMPRE los cuatro bloques, los dos posicionamientos
y los dos locales:

1. **Identidad**: nombre completo, telefono, email, ubicacion (es y en), LinkedIn
   y GitHub.
2. **Hechos**:
   - Experiencia: por empleo (empresa, rol, fechas, ubicacion opcional) y, dentro
     de cada empleo, por proyecto de trabajo (nombre, url opcional, fechas) con
     sus bullets. Cada bullet es un logro concreto y defendible, con texto en es
     y en y `skillIds` opcionales.
   - Educacion: institucion, titulo, fechas y note opcional (por ejemplo, una
     carrera incompleta declarada de forma honesta).
   - Certificaciones: nombre y note opcional. El uso diario de herramientas no es
     una certificacion.
   - Idiomas: nombre, nivel y evidence opcional que respalde el nivel.
   - Proyectos personales: nombre, url, fecha opcional, descripcion y `skillIds`
     opcionales. Solo entran los desplegados con URL viva (guardrail de
     `AGENTS.md`).
3. **Skills como entidad**: id estable, name, category, level defendible y
   evidence opcional. Solo lo que la persona pueda explicar en entrevista, sin
   skill salad: no agregar una tecnologia solo porque aparezca en ofertas.
4. **Posicionamientos** (siempre los dos, `frontend` y `ai`): title y summary en
   es y en, `skillIds` en orden de importancia y `bulletIds` en orden de impacto.
   El summary se redacta en parrafos separados por doble salto (tipicamente 4:
   quien sos y que hiciste, lo mas destacado, idiomas y forma de trabajo, que
   buscas). Un empleo sin bullets seleccionados desaparece de esa proyeccion, y
   eso esta bien: cada posicionamiento elige sus bullets.

Sobre los dos locales: entrevistar en el idioma de la persona usuaria y escribir
los dos campos con traduccion fiel. Si redacta en un solo idioma, proponer la
traduccion y pedir revision.

Preguntar solo lo que cambia el resultado: fechas ambiguas, si un claim es
defendible (el criterio es de la persona usuaria), como redactar un bullet, que
`skillIds` relacionar. No re-preguntar lo que el material heredado ya responde.

Criterio de completado: los cuatro bloques cubiertos, con los dos posicionamientos
y los dos locales resueltos.

### 3. Armar el documento

- **Ids de skill y de bullet**: kebab-case en minusculas, cortos, derivados del
  contenido (`freightline-modernizacion`, `react-query`). Estables entre sesiones:
  el posicionamiento y /learning los referencian. Sin duplicados.
- **Referencias resueltas**: todo `skillIds` apunta a una skill declarada y todo
  `bulletIds` apunta a un bullet declarado. Nada huerfano.
- **Campos opcionales**: si no aplican, se omiten. Nunca mandar null ni strings
  vacios.
- **Ambos locales**: cada campo de texto con sus dos variantes, sin excepciones.

Criterio de completado: el documento pasa `profileSchema` (se confirma en el
paso 5).

### 4. Devolver el JSON (modo app)

Devolver SOLO un bloque JSON fence, sin texto alrededor, con el perfil completo.
La forma exacta es la de `src/schemas/profile.ts`; esta es la estructura:

```json
{
  "identity": {
    "name": { "es": "...", "en": "..." },
    "contact": {
      "phone": "...",
      "email": "...",
      "location": { "es": "...", "en": "..." },
      "linkedin": "...",
      "github": "..."
    }
  },
  "facts": {
    "experience": [
      {
        "company": { "es": "...", "en": "..." },
        "role": { "es": "...", "en": "..." },
        "startDate": { "es": "...", "en": "..." },
        "endDate": { "es": "...", "en": "..." },
        "location": { "es": "...", "en": "..." },
        "projects": [
          {
            "name": { "es": "...", "en": "..." },
            "url": "...",
            "startDate": { "es": "...", "en": "..." },
            "endDate": { "es": "...", "en": "..." },
            "bullets": [
              {
                "id": "kebab-id",
                "text": { "es": "...", "en": "..." },
                "skillIds": ["skill-id"]
              }
            ]
          }
        ]
      }
    ],
    "education": [
      {
        "institution": { "es": "...", "en": "..." },
        "degree": { "es": "...", "en": "..." },
        "startDate": { "es": "...", "en": "..." },
        "endDate": { "es": "...", "en": "..." },
        "note": { "es": "...", "en": "..." }
      }
    ],
    "certifications": [
      { "name": { "es": "...", "en": "..." }, "note": { "es": "...", "en": "..." } }
    ],
    "languages": [
      {
        "name": { "es": "...", "en": "..." },
        "level": { "es": "...", "en": "..." },
        "evidence": { "es": "...", "en": "..." }
      }
    ],
    "projects": [
      {
        "name": { "es": "...", "en": "..." },
        "url": "...",
        "date": { "es": "...", "en": "..." },
        "description": { "es": "...", "en": "..." },
        "skillIds": ["skill-id"]
      }
    ]
  },
  "skills": [
    {
      "id": "kebab-id",
      "name": { "es": "...", "en": "..." },
      "category": { "es": "...", "en": "..." },
      "level": { "es": "...", "en": "..." },
      "evidence": { "es": "...", "en": "..." }
    }
  ],
  "positionings": [
    {
      "id": "frontend",
      "title": { "es": "...", "en": "..." },
      "summary": { "es": "...", "en": "..." },
      "skillIds": ["skill-id"],
      "bulletIds": ["bullet-id"]
    },
    {
      "id": "ai",
      "title": { "es": "...", "en": "..." },
      "summary": { "es": "...", "en": "..." },
      "skillIds": ["skill-id"],
      "bulletIds": ["bullet-id"]
    }
  ]
}
```

Los campos opcionales del schema (`location` de experiencia, `url`, `note`,
`evidence`, `date` y `skillIds`) se omiten cuando no aplican. Los id de
posicionamiento son exactamente `frontend` y `ai`. Sin em-dashes, en-dashes ni
flechas en el contenido: usar guiones simples, comas o palabras.

Criterio de completado: el bloque JSON es lo unico en tu respuesta final.

### 5. Guardar en disco (modo directo, o cuando el prompt de la app lo pida)

Contrato de guardado:

- **Destino**: `src/content/profile.json`. Es el mismo archivo que el build carga
  primero (`src/lib/profile.ts`); esta en el gitignore (el perfil real no se
  commitea) y el ejemplo ficticio `src/content/profile.example.json` queda como
  fallback del build.
- **Si ya existe un perfil**: leerlo primero y tratar la entrevista como
  actualizacion. No pisar en silencio datos que la persona no menciono.
- **Validacion**: correr `pnpm run build`. La validacion Zod del build falla
  ruidosamente con ids huerfanos, ids duplicados o campos sin los dos locales, y
  el error lista los issues. Corregir y reintentar hasta que pase.

En modo app, el contenido exacto del archivo viaja en el prompt de guardado:
escribirlo verbatim, sin interpretar ni mejorar nada.

Criterio de completado: `src/content/profile.json` existe en disco y el build
pasa, o en modo app el JSON fue devuelto.

## Comunicacion con el usuario

Trabajar de forma transparente y hacer preguntas cuando la duda es real:

- **Antes de empezar**, declarar en una linea el plan: que tandas va a cubrir,
  que material heredado va a usar y que archivo va a escribir.
- **Mientras trabaja**, decir en que tanda esta y que queda pendiente.
- **Preguntas interactivas** para las dudas que cambian el resultado (fechas,
  defendibilidad de un claim, redaccion de un bullet, relacion de `skillIds`). No
  preguntar trivia que el agente puede decidir solo.
- **Transparencia de limites**: si un dato no se puede verificar o la persona no
  lo recuerda, decirlo y dejar el campo opcional afuera. Nunca inventar.

## Reglas

- Claims defendibles segun los guardrails de `AGENTS.md`: lo que escriba la
  entrevista tiene que sostenerse en una entrevista tecnica.
- Sin nombres internos ni metricas exactas del codigo privado. Redondear las
  metricas publicas ("mas de X", "decenas de").
- El level de la skill no se imprime en el CV; la evidence si, entre parentesis.
- Proyectos personales solo con despliegue y URL viva.
- Fechas visibles como texto localizado, no como ISO.
- Ids estables: no renombrar ni reutilizar ids ya escritos.
- Sin em-dashes, en-dashes ni flechas en archivos ni JSON.
- El contenido demo (`profile.example.json`) es ficticio y se conserva tal cual:
  nunca reemplazarlo con datos reales.
