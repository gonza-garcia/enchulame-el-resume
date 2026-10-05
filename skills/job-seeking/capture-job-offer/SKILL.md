---
name: capture-job-offer
description: Obtener y guardar una oferta de trabajo en el repo. Usar cuando el usuario comparte un link de oferta (LinkedIn, Indeed, GetOnBoard, Greenhouse, Lever, etc.), pega el texto de una oferta, pide "capturar una oferta", o cuando la app del CV genera un prompt que referencia esta skill. Se encarga de fetch con fallbacks, extraccion de metadata y guardado bajo el contrato de carpetas. NO analiza el match ni adapta el CV: para eso es adapt-resume-to-offer.
---

# Capture Job Offer

Capturar una oferta de trabajo: obtenerla (de un link o de texto pegado), extraer
su metadata y texto verbatim, y dejarla guardada bajo el contrato de carpeta del
repo. El resultado siempre converge a lo mismo: una carpeta de oferta valida que
la app y la skill adapt-resume-to-offer puedan consumir.

## Modo de operacion

La skill corre en dos modos, decididos por quien la invoca:

- **Modo app**: el prompt viene de la app del CV y pide devolver SOLO un bloque
  JSON de captura. El usuario lo pega en la app, que valida, compone y despues
  pide el guardado verbatim. No escribas archivos en este modo salvo que el
  prompt lo pida explicitamente.
- **Modo directo**: el usuario pide capturar y guardar. Aplicas todos los pasos,
  incluido el guardado en disco.

El output JSON del modo app y el archivo guardado en modo directo producen la
misma informacion: mismos campos, mismos formatos, mismo destino.

## Pasos

### 1. Identificar el input

Tres casos posibles:

- **Hay link** de la oferta. Continuar en paso 2.
- **Hay texto** de la oferta (pegado en el prompt, en un placeholder como
  `[INSERTAR TEXTO DE OFERTA AQUI]` completado, o en el mensaje del usuario).
  Saltar directo al paso 3 con ese texto como texto verbatim.
- **No hay nada util** (link roto, fetch fallido y sin texto). Pedir al usuario
  el texto completo de la oferta como lo recibio. Es el fallback final.

Criterio de completado: tenes texto verbatim de la oferta en tu contexto, venga
del camino que venga.

### 2. Obtener la oferta del link

Estrategia por orden, cortando en el primer intento que devuelva el contenido
real de la oferta (no una pagina de login, no un authwall, no basura):

1. **API Guest de LinkedIn**: si el link es de linkedin.com/jobs, extraer el
   job id de la URL y consultar la API publica de guest de LinkedIn
   (`https://www.linkedin.com/jobs/guest/jobs/api/jobPosting/{id}`). Sin
   cookies ni cuenta.
2. **Fetch directo o Jina Reader**: `curl https://r.jina.ai/<URL>` para cualquier
   otro sitio (GetOnBoard, Greenhouse, Lever suelen ser legibles asi; LinkedIn
   e Indeed suelen bloquear con 403/Cloudflare).
3. **API publica del sitio**: algunos sitios la tienen (GetOnBoard:
   `getonbrd.com/api/v0/search/jobs`).
4. **JobSpy**: `pip install python-jobspy` / `python-jobspy` para LinkedIn,
   Indeed, Glassdoor (LinkedIn funciona sin login; los otros cada vez mas
   bloqueados). Solo si los anteriores fallan o si el usuario pide buscar
   ofertas nuevas.
5. **Scraper con sesion del usuario** (riesgo de ban de cuenta, solo si el
   usuario lo pide): MCP de LinkedIn con sesion (p.ej. linkedin-mcp-server) o
   el actor de Apify `cheap_scraper/linkedin-job-scraper` (pago por resultado,
   no es gratis).
6. **Fallback final**: pedir al usuario el texto completo de la oferta.

Herramientas del entorno a usar en orden: la skill agent-reach si existe (si la
ruta `J:/.webdev/.ia/.skills/Research/agent-reach/SKILL.md` no existe cuando la
busques, preguntarle al usuario donde vive y usarla desde ahi), curl, `gh` si
esta autenticado.

Ademas: la skill browser-skill (BSK) para paginas con authwall o login (un
perfil de LinkedIn que no abre con la Guest API, un portal que exige sesion).
Requiere el CLI `bsk` y la extension del navegador conectada: verificar con
`BSK_AUTO_START=0 bsk status --json` (con timeout corto; un autostart sin limite
se cuelga). Si el daemon no responde o no hay navegador conectado, no bloquees la
tarea: segui con el fetch sin sesion y avisale al usuario que browser-skill
estaba disponible pero no operativa, y que la activaria para el caso que la
necesite.

Investigacion de referencia con el estado y el riesgo de cada via:
`docs/research/job-scrapers.md` (en el repo). Consultarla si un intento falla y
hay que elegir el siguiente.

Criterio de completado: texto verbatim de la oferta obtenido, o queda claro que
ningun intento funciona y se pidio el texto al usuario.

### 2b. Reglas de limpieza

El texto verbatim se conserva lo mas fiel posible. Recortar navegacion, banners
y botones de aplicacion. Mantener secciones, bullets y saltos de linea. No
resumir, no parafrasear, no traducir: el texto original es la materia prima del
analisis de match posterior.

### 3. Extraer metadata

Del texto y del link:

- `empresa`: nombre de la empresa (como aparece en la oferta).
- `rol`: titulo del puesto (como aparece; no inventar seniority).
- `fecha`: fecha de hoy en formato YYYY-MM-DD salvo que la oferta indique otra.
- `url`: el link de la oferta, o null si vino de un texto pegado sin link.
- `modalidad`: remote | hybrid | onsite | unknown (según la oferta).
- `location`: ciudad y pais, o null.
- `salario`: rango o monto tal como aparece (moneda, periodo y bandas incluidos), o null.
- `recruiter`: nombre del recruiter, agencia o contacto si aparece, o null.
- `descripcion_empresa`: descripcion de la empresa si la oferta la trae
  (seccion About, primer parrafo institucional). Opcional.
- `oferta_texto`: el texto completo verbatim limpio.

Criterio de completado: los 10 campos resueltos (algunos pueden ser null, el
texto nunca).

En modo directo, antes de guardar: si algun campo de metadata quedo en blanco
(null o unknown) y es un dato que el usuario puede conocer (modalidad, location,
salario, recruiter), preguntarle si lo sabe. Si no lo sabe, guardar el valor en
blanco tal cual, sin inventar.

### 4. Devolver el JSON (modo app)

Devolver SOLO un bloque JSON fence, sin texto alrededor, con esta forma exacta:

```json
{
  "empresa": "string",
  "rol": "string",
  "fecha": "YYYY-MM-DD",
  "url": "string o null",
  "modalidad": "remote | hybrid | onsite | unknown",
  "location": "string o null",
  "salario": "string o null",
  "recruiter": "string o null",
  "descripcion_empresa": "string o null",
  "oferta_texto": "texto verbatim completo de la oferta"
}
```

Sin em-dashes ni en-dashes en el contenido: usar guiones simples, comas o
palabras. Sin flechas.

Criterio de completado: el bloque JSON es lo unico en tu respuesta final.

### 5. Guardar en disco (modo directo, o cuando el prompt de la app lo pida)

Contrato de carpeta, vigente para la app y para agentes:

```
docs/job-offers/
└── <slug>/
    ├── offer.md             este paso crea este archivo
    ├── match-report.md      lo crea adapt-resume-to-offer al analizar
    └── adapted-resume.json  lo crea adapt-resume-to-offer
```

- **Slug**: `fecha-empresa-rol`, minusculas, guiones por espacios, sin acentos
  ni caracteres especiales. Ejemplo: `2026-10-05-aurora-labs-reactjs-frontend-developer`.
- **Colision**: si la carpeta ya existe y es una oferta distinta, sufijar con
  `-2`, `-3`, etc.
- **offer.md**: frontmatter con los campos de metadata (empresa, rol, fecha,
  url, modalidad, location, salario, recruiter) seguido del heading
  `# Oferta original` y el texto verbatim completo debajo.
- `cover-letter.md` (opcional) lo genera adapt-resume-to-offer cuando el usuario
  la pide: la carta aprobada para esa oferta. No cambia el estado de la oferta.

```markdown
---
empresa: EMPRESA
rol: ROL
fecha: YYYY-MM-DD
url: URL o N/A
modalidad: remote | hybrid | onsite
location: Ciudad, Pais
salario: Rango o N/A
recruiter: Nombre o N/A
---

# Oferta original

<texto verbatim>
```

En modo app, el contenido exacto del archivo viaja en el prompt de guardado:
escribirlo verbatim, sin interpretar ni mejorar nada.

Criterio de completado: la carpeta `<slug>/offer.md` existe en disco con el
frontmatter y el texto verbatim, o en modo app el JSON fue devuelto.

## Contrato de carpeta (referencia para las demas skills)

Esta skill es la duena del contrato de carpetas de ofertas:

- Carpeta por oferta bajo `docs/job-offers/<slug>/`.
- `offer.md` = oferta capturada (esta skill).
- `match-report.md` = analisis de match (lo genera adapt-resume-to-offer).
- `adapted-resume.json` = CV adaptado (lo genera adapt-resume-to-offer).
- El estado de una oferta se deriva de la presencia de esos archivos: Agregada
  (offer.md), Analizada (match-report.md), Adaptada (adapted-resume.json).
- La ruta del contrato siempre relativa a la raiz del proyecto, nunca absoluta.

## Comunicacion con el usuario

Trabajar de forma transparente y hacer preguntas cuando la duda es real:

- **Antes de empezar**, declarar en una linea el plan y las herramientas que va a
  intentar usar (ej: "voy a probar la Guest API de LinkedIn, despues Jina; bsk
  disponible si hay authwall").
- **Mientras trabaja**, decir que herramienta esta usando en cada intento y por
  que descarto la anterior.
- **Transparencia de limites**: si una herramienta que ayudaria no esta
  disponible (agent-reach sin Exa configurado, bsk sin navegador conectado), decirlo
  tal cual: que no se puede usar, que haria, y con que la reemplaza.
- **Preguntas interactivas** (el formato de pregunta del entorno del agente) para
  dudas que cambian el resultado: metadata ambigua (dos empresas posibles, rol
  ambiguo), datos que la oferta no declara y el usuario puede completar
  (recruiter, salario, modalidad, location), o si conviene guardar una variante del slug cuando el
  nombre se pisa con una oferta existente distinta. No preguntar trivia que el
  agente puede decidir solo.
- Nunca inventar un dato dudoso en silencio: o lo resuelve con evidencia de la
  oferta, o lo pregunta.

## Reglas

- Claims y datos verbatim: no inventar campos que la oferta no declara.
- `salario` se copia tal cual aparece (moneda, periodo y bandas incluidas): no
  convertir, estimar ni completar cifras.
- Sin em-dashes, en-dashes ni flechas en archivos ni JSON.
- `match_score` no es parte de la captura: pertenece al analisis de
  adapt-resume-to-offer.
- Si la oferta no es de internet (referida por contacto, grupo de Telegram,
  etc.) no hay link: es el caso de texto pegado y funciona igual.
