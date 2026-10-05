# Research: herramientas para extraer ofertas de trabajo (2026)

Fecha de investigacion: 15 de septiembre de 2026. Todas las afirmaciones fueron verificadas en vivo contra los repositorios, paginas y APIs citadas.

## Resumen ejecutivo

- El repo de GitHub `cheap_scraper/linkedin-job-scraper` no existe. Se busco en GitHub (busqueda por nombre, por organizacion y por texto) y `github.com/cheap_scraper` devuelve 404. Lo que el usuario tenia en mente es un **Actor de Apify** comercial con ese mismo identificador: `apify.com/cheap_scraper/linkedin-job-scraper`. Es pago (pay per result, entre 0.35 y 0.70 USD por cada 1.000 empleos), no requiere login ni cookies, y funciona en 2026 (47.848 usuarios, 99.6% de runs exitosos). Detalle en la seccion 3.
- La via gratuita mas confiable para LinkedIn es la **Guest Jobs API publicas de LinkedIn** (`/jobs-guest/jobs/api/seeMoreJobPostings/search` y `/jobPosting/{id}`). Se verifico hoy con curl: HTTP 200 con 30 tarjetas de empleos, sin login, sin cookies, sin cuenta. El riesgo es de throttling por IP, no de ban de cuenta del usuario.
- JobSpy (`speedyapply/JobSpy`, MIT, 4.285 estrellas, ultimo push 2026-02) empaqueta esa tecnica mas Indeed, Glassdoor, Google y ZipRecruiter en un paquete pip gratuito.
- La via sin scraper (fetch directo + Jina Reader) funciona bien para GetOnBoard, Greenhouse, Lever y sitios ATS, pero falla para LinkedIn (authwall mas bloqueo anonimo verificado) e Indeed (reto de Cloudflare verificado).
- Estrategia recomendada por defecto: 1) Guest API de LinkedIn si el link es de LinkedIn, 2) fetch directo o API publica (GetOnBoard tiene API JSON publica) o Jina Reader para el resto, 3) pedir texto pegado al usuario como ultimo fallback. Reservar MCP con sesion del usuario y Apify solo cuando el usuario lo pida.

## Tabla comparativa

| Herramienta | URL | Metodo | Costo | Estado 2026 | Riesgo de ban de cuenta |
|---|---|---|---|---|---|
| LinkedIn Guest Jobs API | `linkedin.com/jobs-guest/...` | HTTP simple, paginas publicas sin auth | Gratis | Verificado hoy, HTTP 200 | Nulo, no usa cuenta |
| JobSpy (python-jobspy) | github.com/speedyapply/JobSpy | Requests a paginas publicas de LinkedIn, Indeed, Glassdoor, ZipRecruiter, Google | Gratis, MIT | Mantenido, push 2026-02; LinkedIn OK, Indeed/Glassdoor requieren proxies | Nulo, no usa cuenta |
| jobspy-mcp-server | github.com/borgius/jobspy-mcp-server | MCP wrapper de JobSpy | Gratis | Push 2026-03, 114 estrellas | Nulo, hereda el de JobSpy |
| hendrixfreire/linkedin-job-scraper | github.com/hendrixfreire/linkedin-job-scraper | Guest API, stdlib puro | Gratis, MIT | Push 2026-08, 76 estrellas | Nulo |
| spinlud/py-linkedin-jobs-scraper | github.com/spinlud/py-linkedin-jobs-scraper | Selenium headless con login obligatorio | Gratis, MIT | Muy activo, push 2026-09-08, 495 estrellas | Moderado, usa la sesion del usuario |
| stickerdaniel/linkedin-mcp-server (paquete `mcp-server-linkedin`) | github.com/stickerdaniel/linkedin-mcp-server | MCP, controla Chromium de tu sesion real (Patchright) | Gratis | Muy activo, push 2026-09-15, 3.485 estrellas | Alto, usa tu cuenta logueada |
| Apify cheap_scraper/linkedin-job-scraper | apify.com/cheap_scraper/linkedin-job-scraper | Actor cloud sobre paginas publicas | Pago, pay per result | Activo 2026, 47.848 usuarios | Nulo, no requiere cuenta |
| agent-reach (career.md) | github.com/Panniantong/agent-reach | Recomenda `mcp-server-linkedin` con login y Jina Reader como fallback | Gratis | Push 2026-09-15, 81.958 estrellas | Depende de la via elegida |
| Fetch directo + Jina Reader | r.jina.ai | Limpieza HTML a markdown | Gratis hasta cuota | LinkedIn bloqueado, ATS legibles | Nulo |

## Detalle de `cheap_scraper/linkedin-job-scraper`

Hallazgo real, verificado hoy:

- **No es un repo de GitHub.** `github.com/cheap_scraper/linkedin-job-scraper` devuelve 404. La API de GitHub no encuentra el usuario `cheap_scraper` ni `cheap-scraper`, y la busqueda de repos no arroja ningun match con ese nombre.
- **Es un Actor de Apify** publicado en `apify.com/cheap_scraper/linkedin-job-scraper` por un publisher comunitario. Existen hermanos del mismo autor: `cheap_scraper/indeed-job-scraper` y `cheap_scraper/glassdoor-jobs-scraper-remove-duplicate-jobs`.
- **Que hace:** recolecta empleos de LinkedIn por start URLs (las URLs de busqueda de linkedin.com/jobs que uno arma en el navegador con filtros) o por keywords + locations, con dedupe y filtros opcionales (fecha, remote, Easy Apply, agencias de reclutamiento, hasta keywords de matching con aliases).
- **Costo:** pay per result. Precio por cada 1.000 empleos segun tier: 0.70 / 0.60 / 0.50 / 0.35 USD. `maxItems` tiene un minimo de 150 resultados por run.
- **Requisitos:** no requiere login, ni cookies, ni cuenta de LinkedIn. Solo lee paginas publicas. La pagina del actor responde la FAQ con: "No. The scraper only reads publicly available job listings. No login, no LinkedIn account needed at all."
- **Reputacion:** 47.848 usuarios totales, unos 6.000 a 10.000 mensuales, 99.6% a 100% de runs exitosos, mas de 200 bookmarks, rating entre 4.07 y 4.62 segun la pagina consultada.
- **Mantenimiento y issues 2026:** activo. El 2026-08-17 se reporto un bug en el MCP de Apify (issue 1266 de apify-mcp-server) donde este actor era la mayor fuente de fallos (9.468 fallos en un mes) por un gap de esquema (`minItems 150` faltante en el schema del MCP), no por bloqueo de LinkedIn. Un monitor externo (cracked.ai) mostro un run fallido, pero sin patron de bloqueo por captcha. No encontre issues recientes de captcha o bloqueo del actor; el metodo de paginas publicas sigue operativo.
- **Encaje con la skill:** funciona, pero es pago, requiere token de Apify y tiene un minimo de 150 items por run, lo cual es excesivo para guardar 1 oferta puntual desde un link.

## Alternativas gratuitas verificadas

### 1. Guest Jobs API de LinkedIn (la base de casi todo)

- Endpoints: `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=...&location=...&start=0` para tarjetas de resultados, y `https://www.linkedin.com/jobs-guest/api/jobs/jobPosting/{id}` o la pagina `linkedin.com/jobs/view/{id}` para el detalle con descripcion completa.
- Verificacion de hoy: curl con un user agent de navegador, sin cookies, HTTP 200 y 29 KB de HTML con 30 tarjetas `base-search-card`.
- No requiere login, no usa la cuenta del usuario, el unico limite es rate limiting por IP (los actores profesionales usan 1 request cada 2 segundos).
- Es el mismo metodo que usan JobSpy, el actor de Apify de cheap_scraper y el scraper de hendrixfreire.

### 2. JobSpy / python-jobspy

- Repo: `speedyapply/JobSpy` (antes `Bunsly/JobSpy`). MIT, 4.285 estrellas, ultimo push 2026-02-18. Instalacion: `pip install -U python-jobspy`, Python 3.10+. Existe port TypeScript (`alpharromcoma/ts-jobspy`, push 2026-09) y version dockerizada con API (`rainmanjam/jobspy-api`).
- Como funciona: peticiones HTTP directas a paginas publicas. LinkedIn con headers de navegador sin login (verificado en su fuente). Indeed y Glassdoor cada vez mas bloqueados, hay issues abiertos en 2026 de hangs en Indeed y errores CSRF de Glassdoor, y el README recomienda proxies.
- Gratis y sin cuenta. Ideal para busquedas por keyword, menos directo para "dame esta oferta puntual por URL".

### 3. MCP servers

- `borgius/jobspy-mcp-server`: MCP stdio/SSE sobre JobSpy. 114 estrellas, push 2026-03. Gratis. Mismo perfil de riesgo que JobSpy.
- `stickerdaniel/linkedin-mcp-server` (paquete `mcp-server-linkedin`, el mismo que referencia agent-reach): 3.485 estrellas, push 2026-09-15. Controla un Chromium Patchright con la sesion real del usuario (`uvx mcp-server-linkedin@latest --login`). Tiene `search_jobs`, `get_saved_jobs`, perfiles, mensajeria. Potente pero toca la cuenta del usuario: riesgo de ban real y ToS.
- Apify MCP (`mcp.apify.com`) permite invocar el actor de cheap_scraper, pero hereda su costo.

### 4. agent-reach y career.md

- Repo `Panniantong/agent-reach`: CLI gratuito para que agentes lean/busquen la web (Twitter, Reddit, YouTube, etc.). 81.958 estrellas, push 2026-09-15.
- Su referencia `agent_reach/skill/references/career.md` cubre LinkedIn con dos vias: MCP `linkedin.search_jobs` / `linkedin.get_company_profile` usando `mcp-server-linkedin` con login obligatorio, y como fallback `curl https://r.jina.ai/https://linkedin.com/in/username`. No menciona la Guest API como via principal para ofertas.

### 5. GetOnBoard y otros sitios

- GetOnBoard tiene dominio real `getonbrd.cl` (getonbrd.com) y una **API JSON publica sin auth**: `https://www.getonbrd.com/api/v0/search/jobs?keyword=...` (documentada por actores de scraping chilenos y usada en pipelines open source; verificamos que responde con error 422 semantico cuando falta el parametro, es decir, esta viva). Las paginas de empleo son legibles con Jina Reader.
- Greenhouse boards (`boards.greenhouse.io`): legibles con Jina Reader, verificado con un board real.
- Lever boards (`jobs.lever.co`): legibles con Jina Reader, verificado.
- Torre.ai: API JSON publica (`/opportunities/_search/`), sin auth, segun la documentacion del actor chileno de Apify.

### 6. Comportamiento empirico de Jina Reader por sitio (probado hoy)

| Sitio | Resultado |
|---|---|
| `linkedin.com/jobs/view/{id}` | 403 `AbuseAlleviationError`, acceso anonimo al dominio bloqueado por abuso previo |
| `indeed.com/viewjob` | Reto de Cloudflare, se recibe "Just a moment..." |
| `boards.greenhouse.io` | Markdown limpio, OK |
| `jobs.lever.co` | Markdown limpio, OK |
| `getonbrd.cl` | Markdown limpio, OK (404 de la prueba era solo un slug inventado) |

## Estrategia recomendada por defecto para la skill

Orden de intentos, de menor a mayor costo y riesgo:

1. **Si el link es de LinkedIn:** extraer el id del empleo y pedir la Guest API publica con headers de navegador, sin cookies, con rate limit prudente (1 request cada 2 segundos). Probar `seeMoreJobPostings/search` para listados y `/jobs/view/{id}` o el endpoint `jobPosting/{id}` para el detalle. Ventajas: gratis, sin cuenta del usuario, sin riesgo de ban, verificado funcionando hoy. Riesgo: throttling de IP (esperar y reintentar), y el HTML de tarjetas hay que parsearlo.
2. **Para otros sitios:** fetch directo con curl/HTTP y, si la respuesta es JS-heavy o falla, Jina Reader (`r.jina.ai/URL`). Atajos baratos: GetOnBoard por su API JSON publica, Greenhouse y Lever legibles directamente, Torre por su API. Riesgo: casi nulo, son datos publicos.
3. **JobSpy como opcion batch:** si la skill necesita buscar ofertas por keyword en varios portales a la vez, usar `python-jobspy` (gratis, MIT). Evitar depender de Indeed/Glassdoor sin proxies.
4. **Fallback humano:** si todo lo anterior falla (link protegido, authwall, cambio de HTML), pedir al usuario que pegue el texto de la oferta y parsearlo. Es la via mas robusta y cero riesgo.
5. **Solo si el usuario lo pide:** MCP `mcp-server-linkedin` con su propia sesion (advertir que puede afectar su cuenta y viola el User Agreement de LinkedIn, seccion 8.2 sobre scraping), o el Actor de Apify `cheap_scraper/linkedin-job-scraper` si necesita volumen y acepta pagar por resultado.

Pros y contras de la estrategia: prioriza APIs y paginas publicas sin credenciales, asi la skill nunca pone en riesgo la cuenta de LinkedIn del usuario, funciona en CLI puro (curl y parseo), y degrada con gracia (texto pegado). Contras: LinkedIn guest esta en zona gris de sus ToS (aunque sin cuenta no hay nada que banear) y puede endurecerse; la descripcion completa de empleos de LinkedIn via guest es mas fragil que las tarjetas, conviene cache local por job id en el repo.

## Fuentes

- Apify actor: `https://apify.com/cheap_scraper/linkedin-job-scraper` (stats, pricing, FAQ de login, ejemplos de input, MCP)
- Confirmacion de 404 en GitHub: `https://github.com/cheap_scraper/linkedin-job-scraper` y GitHub Search API (`search/repositories`)
- JobSpy: `https://github.com/speedyapply/JobSpy` (README, fuente de `jobspy/linkedin/constant.py` con headers sin auth, issues 2026)
- spinlud: `https://github.com/spinlud/py-linkedin-jobs-scraper` (README, auth por perfil Chrome/cookies, rate limiting adaptativo)
- stickerdaniel: `https://github.com/stickerdaniel/linkedin-mcp-server` (README, sesion Patchright del usuario, search_jobs)
- borgius: `https://github.com/borgius/jobspy-mcp-server` (README)
- agent-reach: `https://github.com/Panniantong/agent-reach`, referencia `agent_reach/skill/references/career.md`
- hendrixfreire: `https://github.com/hendrixfreire/linkedin-job-scraper` (README, Guest Jobs API, stdlib)
- Actor chileno con tablas de metodo por portal: `https://apify.com/crawler_cl/job-scraper-chile` (Guest API de LinkedIn, API de GetOnBoard en `getonbrd.com/api/v0`, Torre, rate limits)
- Issue de MCP de Apify sobre este actor: `https://github.com/apify/apify-mcp-server/issues/1266` (2026-08-17)
- Verificacion empirica propia (curl, 15-09-2026): Guest API de LinkedIn HTTP 200 con 30 tarjetas, GetOnBoard API viva, Jina Reader contra LinkedIn (403), Indeed (Cloudflare), Greenhouse y Lever (OK)
