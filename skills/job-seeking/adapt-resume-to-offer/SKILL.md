---
name: adapt-resume-to-offer
description: Analizar el match de una oferta ya capturada contra el CV base y generar el CV adaptado y la cover letter. Usar cuando el usuario pide "adaptar el CV a una oferta", "analizar el match", "escribir la cover letter", o cuando la app del CV genera un prompt que referencia esta skill. Requiere que la oferta este capturada bajo el contrato de carpetas (skills/job-seeking/capture-job-offer). NO captura ofertas ni las guarda por su cuenta.
---

# Adapt Resume to Offer

Analizar una oferta de trabajo ya capturada contra el CV base de
`src/content/resume.json` y producir dos resultados, segun el modo:

- El **analisis de match** (match fuerte, gaps, ajustes recomendados, temas de
  entrevista, score) que termina en `match-report.md`.
- El **CV adaptado** bilingue que termina en `adapted-resume.json`.

Esta skill NO captura ofertas. Su input es una oferta ya capturada por
`capture-job-offer` (ver su contrato de carpeta en
`skills/job-seeking/capture-job-offer/SKILL.md`).

## Herramientas disponibles

- **browser-skill (BSK)** si es pertinente: revisar la pagina viva de la empresa,
  verificar contexto de la oferta (seniority, equipo, stack real del equipo en
  LinkedIn), o leer paginas con login. Requiere el CLI `bsk` y la extension
  conectada: verificar con `BSK_AUTO_START=0 bsk status --json` (timeout corto).
  Es opt-in: usarla solo si el analisis necesita algo que el offer.md ya capturado
  no trae.
- **agent-reach** si existe en el entorno, para investigar la empresa o el rol
  desde otras fuentes si la oferta es vaga en algo critico.
- Nunca scrapear ni abrir paginas con login solo para "enriquecer" el CV sin
  necesidad: el match se evalua contra el offer.md capturado y el CV base.

## Comunicacion con el usuario

- **Antes de adaptar**, anunciar el plan: que secciones va a tocar (Summary,
  Skills, orden de bullets, fechas), en que locale (es, en, o ambos), y que
  archivos va a crear o reemplazar (match-report.md y adapted-resume.json dentro
  de la carpeta de la oferta; nunca toca offer.md ni el CV base
  src/content/resume.json).
- **Durante**, narrar cada cambio sustantivo: que se mueve, que se agrega, que se
  quita, y con que evidencia del CV base o del match report lo respalda.
- **Preguntas interactivas** (formato de pregunta del entorno del agente) para las
  dudas que cambian el resultado: que items del backlog promover (el usuario
  confirma cada uno), si un ajuste propuesto es defendible o no (el
  usuario decide si se anima a defenderlo en entrevista), si sumar una skill
  aprendible (ej: Zustand en 1 dia), fechas de cierre de experiencia si hay
  ambiguedad, o un score en la frontera. El criterio de defendibilidad es del
  usuario; la evidencia la aporta el agente.
- **Transparencia de limites**: si algo no puede verificarse (una metrica sin
  fuente, una skill sin uso real), decirlo y no usarlo, sin dejar de proponer la
  alternativa defendible.

## Modo de operacion

- **Modo app**: el prompt viene de la app del CV y pide devolver SOLO un bloque
  JSON (de analisis, de CV adaptado, o de cover letter). El usuario lo pega en la
  app, que valida con Zod, compone los archivos y despues pide el guardado
  verbatim.
- **Modo directo**: el usuario pide analizar, adaptar o la cover letter sin la
  app. Aplicas los pasos completos, incluido el guardado en disco. En modo
  directo la cover letter SIEMPRE se muestra al usuario completo y se pide su
  aprobacion explicita antes de escribir el archivo.

## Pasos

### 1. Leer el CV base

Leer `src/content/profile.json` (o `src/content/profile.example.json` si no hay
profile local) y `src/schemas/profile.ts` para entender el perfil, skills,
experiencia, posicionamientos y el schema. Es la fuente de verdad de lo que el
usuario tiene. Nada de claims fuera de ese archivo. `src/schemas/resume.ts` es la
forma del CV adaptado que esta skill produce.

Leer tambien el `backlog` del perfil (ADR-0031): son experiencias en reserva con su
prueba (`proof`) y su techo (`limits`), listas para CV pero no presentes en ninguna
proyeccion. Pueden ser la respuesta a un requisito de la oferta, pero nunca entran
solas: ver paso 4.

Criterio de completado: tenes el perfil, el backlog y ambos schemas en contexto.

### 2. Leer la oferta capturada

Leer `docs/job-offers/<slug>/offer.md` de la oferta objetivo. Si la carpeta no
existe o no tiene offer.md, la oferta no esta capturada: pedir al usuario
ejecutar capture-job-offer primero. No capturar ofertas en esta skill.

Si existe `match-report.md` en la misma carpeta, leerlo: es un analisis previo
que podes refinar o reemplazar.

Criterio de completado: texto verbatim y metadata de la oferta en contexto.

### 3. Analizar el match

Comparar los requisitos de la oferta contra el CV base. Clasificar cada
requisito en:

- **Match fuerte**: el usuario tiene esa skill/experiencia y mapea directo a lo
  pedido. Cada item con evidencia extraida del CV base.
- **Gap parcial**: tiene algo relacionado pero no exactamente lo pedido.
  Explicar la relacion y si es defendible en entrevista.
- **Gap real**: no lo tiene y no puede reclamarlo de forma creible. Evaluacion
  honesta.

Criterio de completado: cada requisito excluyente y deseable de la oferta
clasificado en alguna de las tres categorias.

### 4. Recomendar ajustes del CV

Basado en los gaps, listar cambios concretos para el JSON adaptado:

- Que **promover del backlog** (ADR-0031). Revisar los items en `reserve` y proponer
  solo los que cubren un requisito real de la oferta. Cada propuesta se muestra al
  usuario con su `text`, su `proof` y su `limits`, y entra al CV adaptado solo si el
  usuario lo confirma. Si no lo confirma, no entra y el item sigue en reserva. Esta
  decision es siempre del usuario: la skill propone, no decide.
- Que **agregar** a Skills (solo si es defendible).
- Que **reordenar** (subir lo que matchea).
- Que **reformular** en el Summary con las keywords de la oferta.
- Que **destacar** en bullets.
- Que **atenuar** o quitar para esta version.
- Si conviene **cambiar el titulo** (por defecto no: el titulo es Frontend
  Developer y el nivel se demuestra con detalle, ver ADR-0001).

### 5. Identificar temas de entrevista

Conceptos a repasar para esta oferta en particular: temas del JD que el usuario
tiene y debe refrescar, gaps aprendibles en 1-2 dias, preguntas comunes del rol
y seniority, y contexto de la empresa.

### 6. Calcular el match score

Score de 0 a 100: requisitos cumplidos completos (peso alto), parciales (peso
medio), no cumplidos (cero), con bonus por overscore de experiencia o skills
extra. El score es honesto: un 60/100 esta bien si los gaps son reales.

### 7. Devolver el JSON de analisis (modo app)

Devolver SOLO un bloque JSON fence, sin texto alrededor:

```json
{
  "match_score": 85,
  "match_fuerte": ["item con evidencia del CV"],
  "gaps_parciales": ["item con explicacion"],
  "gaps_reales": ["item con evaluacion honesta"],
  "ajustes_recomendados": ["cambio concreto para el JSON adaptado"],
  "temas_entrevista": ["tema con contexto"],
  "score_explicacion": "desglose del score"
}
```

En modo directo, este analisis se compone como `match-report.md` dentro de la
carpeta de la oferta, con esta forma:

```markdown
---
match_score: 85
---

# Analisis de match

## Match fuerte (tenes y se pide)
- item con evidencia

## Gap parcial (tenes pero no exacto)
- item con explicacion

## Gap real (no tenes y se pide)
- item con evaluacion honesta

## Ajustes recomendados para el CV adaptado
1. cambio concreto

## Temas a repasar para la entrevista
- tema con contexto

## Score: 85/100
- desglose del score
```

En modo app el contenido exacto del archivo viaja en el prompt de guardado:
escribirlo verbatim, sin interpretar.

Criterio de completado: JSON de analisis devuelto (modo app) o match-report.md
escrito en la carpeta de la oferta (modo directo).

### 8. Generar el CV adaptado

Aplicar los ajustes del paso 4 sobre una copia del CV base, en ambos locales
(es y en). Mantener el schema exacto de `src/schemas/resume.ts`: mismo
estructura, mismos campos, sin campos nuevos. Reglas de contenido:

- Solo skills que el usuario pueda defender en entrevista. Si un gap es real,
  queda como gap: no se finge.
- El score de match no se infla y el wording se ajusta a las keywords de la
  oferta solo cuando hay sustento real en el CV base.
- El titulo sigue siendo `Frontend Developer` salvo decision explicita.
- Sin em-dashes, en-dashes ni flechas. "incl." prohibido: escribir
  "including" / "incluyendo" completo.
- Ambos locales obligatorios en el mismo JSON.

Validar el JSON adaptado contra `src/schemas/resume.ts` con un parse de Zod
antes de devolverlo o guardarlo.

### 9. Devolver el JSON del CV adaptado (modo app)

Devolver SOLO un bloque JSON fence con el JSON completo de CV adaptado (misma
forma que resume.json: es + en).

Criterio de completado: el bloque JSON es lo unico en tu respuesta final y
parsea contra el schema.

### 10. Guardar en disco (modo directo)

Escribir `docs/job-offers/<slug>/adapted-resume.json` en la carpeta de la
oferta, mismo JSON devuelto en el paso 9. En modo app, el contenido exacto
viaja en el prompt de guardado: escribirlo verbatim.

Criterio de completado: `adapted-resume.json` existe en la carpeta de la
oferta y pasa la validacion de schema.

## Reglas

- **Claims honestos.** Nunca agregar una skill que el usuario no pueda defender
  en entrevista. Si un gap es real, queda como gap.
- **El backlog se propone, nunca se cuela.** Ningun item de `profile.backlog` entra
  al CV adaptado sin confirmacion explicita del usuario. Mostrar siempre su `text`,
  su `proof` y su `limits` para que la decision sea informada, y respetar el techo:
  lo que `limits` dice que no se reclama, no se escribe en ningun archivo.
- **Match score honesto.** No inflar.
- **El JSON adaptado reusa el schema del CV base.** No inventar campos.
- **Bilingue.** Ambos locales es y en siempre.
- **Nombres de archivo**: el slug de la carpeta lo define capture-job-offer;
  esta skill solo crea archivos dentro de una carpeta ya capturada.
- **No copiar metricas ni nombres desde la documentacion privada del proyecto**
  (ver AGENTS.md: guardrails del CV).
- Sin em-dashes, en-dashes ni flechas.

# Cover letter

Junto con el CV adaptado, esta skill produce la cover letter de la oferta. Es
tarea del mismo dominio: usa la oferta capturada, el match report y el CV
adaptado (o el CV base si todavia no hay adaptado).

## Pasos de la cover letter

### C1. Reunir insumos

Leer de la carpeta de la oferta: `offer.md` (la oferta verbatim),
`match-report.md` (gaps y evidencia) y `adapted-resume.json` si existe (los
claims exactos que se van a defender). Todo claim de la carta debe estar
respaldado por el CV o el match report: la carta no inventa nada nuevo.

Criterio de completado: oferta, analisis y CV en contexto.

### C2. Elegir idioma y tono

Idioma por defecto: el de la oferta (una oferta en ingles, carta en ingles;
una oferta en espanol, carta en espanol). Si la oferta es bilingue o ambigua,
preguntar al usuario. Tonos: professional y directo, primera persona, sin
cliche de motivacion generica.

### C3. Escribir la carta

Estructura en 3 a 4 parrafos cortos, entre 250 y 350 palabras en total:

1. **Apertura concreta**: el rol al que aplica y el gancho mas fuerte del match
   (la evidencia numerada mas relevante, no una frase generica de interes).
2. **Cuerpo**: 2 o 3 logros que mapean directo a los requisitos excluyentes del
   JD, con numeros y contexto (ej: migracion cross-team React 16 a 19, 50+
   versiones de una libreria adoptada por 3+ equipos, corte de bundle ~30%).
3. **Alineacion con lo especifico de la empresa**: 1 o 2 detalles de la oferta
   que demuestren que se leyo (su stack, su escala, su forma de trabajo). Los
   gaps reales del match report NO se disimulan con adjetivos: si conviene,
   mencionar la via de cierre con honesty (ej: migraciones de toolchain como
   base para aprender el framework faltante).
4. **Cierre**: llamado a la accion simple y disponibilidad (remoto, zona,
   idioma).

Reglas de estilo (anti-huella de IA, alineadas con docs/research/README.md):

- Vary la cadencia: parrafos de largo distinto, sin listas paralelas de tres.
- Verbos simples sobre inflados (led, built, shipped antes que spearheaded).
- Numeros reales del CV, ninguno inventado; los redondeos existentes del CV se
  respetan tal cual.
- Sin em-dashes, en-dashes ni flechas; sin "incl." (escribir including o
  incluyendo completo).
- Sin frases "not just X, but Y", sin "I am excited to leverage" y similares.

### C4. Mostrar y pedir aprobacion

SIEMPRE, en ambos modos: mostrar la carta completa al usuario y pedir
aprobacion explicita antes de guardar. En modo directo usar el formato de
pregunta interactiva del entorno (aceptar, o que ajustes quiere). Si el usuario
pide cambios, reescribir y volver a mostrar. La carta final solo se escribe con
su OK.

Criterio de completado: el usuario aprobo el texto final o definio los ajustes.

### C5. Output JSON (modo app)

Devolver SOLO un bloque JSON fence:

```json
{
  "subject": "String con el asunto del email o null si no corresponde",
  "letter": "Texto completo de la carta, parrafos separados por \\n\\n",
  "locale": "en | es"
}
```

La app muestra la carta, permite editarla y descargala, y al confirmar compone
`cover-letter.md` y arma el prompt de guardado verbatim (igual que los demas
archivos).

### C6. Guardar (modo directo, o verbatim en modo app)

Escribir `docs/job-offers/<slug>/cover-letter.md` en la carpeta de la oferta:

```markdown
---
empresa: EMPRESA
rol: ROL
fecha: YYYY-MM-DD
locale: en | es
---

<subject si existe>

<carta completa>
```

En modo app, el contenido exacto viaja en el prompt de guardado: escribirlo
verbatim. La carta es descargable desde la app en cualquier momento (vista
previa y archivo en disco).

Criterio de completado: `cover-letter.md` existe en la carpeta de la oferta con
el texto aprobado.

## Reglas de la cover letter

- La carta no cambia el estado de la oferta (Agregada, Analizada, Adaptada son
  gates de los otros archivos). Es un archivo adicional.
- One page: si el texto supera ~350 palabras, recortar antes de mostrar.
- El asunto (subject) va en el frontmatter y en el JSON; en el cuerpo visible
  de la carta no se repite como heading.
- Mentiras por conveniencia prohibidas: si la carta menciona algo, el CV lo
  respalda.
