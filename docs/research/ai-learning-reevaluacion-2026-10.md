# Research: reevaluacion del plan de estudios AI con dos fuentes nuevas (2026-10)

Fecha de investigacion: 5 de octubre de 2026. Fuentes nuevas contra las que se reevalua el plan
de estudios y el diseno de `/learning` (spec #34, ADR-0028, ADR-0029, ADR-0030).

Canales de obtencion: hilos de X leidos con el shim de twitter de agent-reach (2026-10-05),
articulos de nothiring.me y repo publico de GitHub leidos con fetch directo. En los entregables
la cita de canal es "X via agent-reach twitter shim" para los hilos y URL directa para el resto.

## Resumen ejecutivo del veredicto

**Ninguna de las dos fuentes trae un plan de estudios terminado mejor que el nuestro**: Grigorev
trae una ruta ordenada de skills sin gates ni proyectos personalizados, y nothiring.me trae datos
de mercado, no un curriculo. Lo que si traen es mejor demanda medida, mejor mapa de skills y
patrones de entrevista que el plan actual no cubre. Por lo tanto el veredicto es una fusion por
calidad: **la estructura del plan (fases 0 a 6, gates, roles puerta, anti-lista) se conserva y
el contenido se actualiza en siete puntos concretos**. El plan actualizado pasa a ser la guia
principal del re-grilling de `/learning`. Los ADR-0028, ADR-0029 y ADR-0030 y la spec #34
**no cambian de forma** (contrato, pagina, progreso y banco por fases siguen igual); lo que
cambia es el contenido del seed del plan, los temas de preguntas nuevas del banco y las fuentes
de demanda con que se siembra el contrato.

Validado por las fuentes (se conserva): el objetivo es AI Engineer aplicado sobre modelos
ajenos, no ML Engineer ni research; anti-lista de bootcamps, matematica primero y titulo de
Prompt Engineer; RAG y agentes como nucleo; evals como diferenciador; portfolio sobre
certificados; horizonte honesto y puerta de entrada comprimida; la via mas fuerte desde un
perfil senior de software es agregar la capa de AI encima del oficio, no bajar de senioridad.

Lo que las fuentes aportan de nuevo (se integra): cloud como skill obligatoria (AWS primero),
rama TypeScript full-stack como alternativa de primera clase, error analysis de trazas como
artefacto demostrable de evaluacion, grounding mas alla del RAG vectorial, operacion en
produccion con guardrails y adversarios, skills transversales de oficio (trabajar con agentes y
dar forma a especificaciones), y preparacion de entrevista y busqueda alineada a lo que se
prueba en las rondas.

## Fuente 1: AI Engineering Field Guide (Alexey Grigorev, DataTalksClub)

Hilo: https://x.com/Al_Grigor/status/2104926079458943225 (29 sep 2026, leido via shim). Repo:
https://github.com/alexeygrigorev/ai-engineering-field-guide (WIP, 5,8k stars al 2026-10-05).
Datos: 6.964 job descriptions de builtin.com en seis mercados (Los Angeles global, Nueva York,
Londres, Amsterdam, Berlin e India), ocho scrapes mensuales de 2026 (el repo dice 4 feb a 25
ago; el hilo dice enero a agosto), mas experiencias de entrevista de mas de 100 fuentes, rutas
de aprendizaje por origen profesional y guia de portfolio. Las skills se extraen con un modelo
y se normalizan sinonimos; el autor avisa que las cifras marcan direccion, no decimales.

### Demanda medida (cuota sobre 6.964 descripciones, o sobre AI-First donde se indique)

- Tipos de trabajo: AI-First 70,0% (construyen sobre AI: RAG, agentes, prompting, fine-tuning),
  AI-Support 24,2% (plataforma, infra, datos, y 161 puestos de Frontend/UI para productos AI),
  ML reetiquetado 4,9%. Research 2,9% contra applied/production 97,1%: "el mercado quiere gente
  que entrega, no gente que publica".
- GenAI: LLMs 62,2%, cualquier skill de agentes 55,4% (AI-First 71,6%), RAG 39,8% (AI-First
  53,9%), prompt engineering 34,7%, LangChain 22,0%, OpenAI API 15,2%, Anthropic API 14,4%, MCP
  14,1% (el que mas crece: 9,9% en febrero a 17,6% en agosto), LangGraph 13,8%, LlamaIndex 8,3%.
  RAG y agentes se piden juntos en 2.213 ofertas: dominando esos dos patrones se cubre la mayoria
  de los casos de uso.
- Lenguajes: Python 70,8% (75,6% en AI-First), TypeScript 19,3% (el segundo), Java 17,7%, SQL
  14,4%. Cloud: AWS 40,3% > Azure 29,6% > GCP 27,4%. Ops: CI/CD 2.560, Docker 1.700, Kubernetes
  1.666, observabilidad 1.547. Bases: vector databases 1.647, PostgreSQL 775.
- El 86,8% de AI-First pide skills mas alla de GenAI; solo 3,9% es GenAI puro. Expectativa
  full-stack: backend 60,2%, frontend 30,7%, ambos 22,6%. Conclusion del repo: "AI Engineers are
  full-stack engineers who specialize in AI".
- Evaluacion: 59,7% de AI-First pide skills de evaluacion (LLM evaluation 30,9%, observabilidad
  24,5%, guardrails 17,9%). Cita textual del repo: "This is the differentiator. RAG and agents
  are now baseline expectations. The ability to measure whether an AI system actually works
  ... is what separates candidates."
- Fine-tuning: lo menciona 27,3% de AI-First, pero es responsabilidad principal solo en 3,6% y
  el 84,6% no lo incluye en responsabilidades. "Focus on RAG and agents first". ML practico:
  54,0% de AI-First pide algo de ML (fine-tuning 24,8%, embeddings 22,9%, PyTorch 19,5%).

### Ruta de aprendizaje del repo

Orden del nucleo: LLM Fundamentals, RAG and Search, AI Agents, Testing, Monitoring and
Observability, Evaluation, Production. Skills de prioridad: obligatorias Python, prompt
engineering, patrones RAG, una cloud al menos y Docker; de alto valor LangChain o PydanticAI,
TypeScript, FastAPI, Kubernetes, CI/CD y PyTorch basico; diferenciadores agent frameworks,
fine-tuning, frameworks de evaluacion, bases vectoriales y patrones multi-agente.

Ruta desde frontend (learning-paths/from-frontend-engineer.md, decisiva para este perfil):
primero backend, dos caminos, TypeScript "Recommended" y Python "Strongly Recommended", y "si
hay tiempo, hacer los dos: TypeScript como respaldo, Python para profundidad"; despues Docker y
despliegue, APIs de LLM, una app AI full-stack, evaluacion y agentes. Ventaja declarada: cerrar
el stack completo de punta a punta, y "cuando hablamos de a quien contratar primero para un
equipo de AI, una persona full stack es probablemente el mejor candidato". El timeline es mas
largo que para un backend porque la fundacion de backend va primero.

### Patrones de entrevista (interview/03-get-hired.md, 100+ fuentes)

- Lo que se prueba de verdad: frameworks de evaluacion por encima de construccion de modelos
  (Hamel Husain: "Unsuccessful LLM products almost always share a common root cause: a failure
  to create robust evaluation systems"), razonamiento de costo y latencia (estimaciones tipo
  tokens por dia y su factura), fluidez de trade-offs ("cuando NO usarias RAG?"), pensamiento de
  sistemas en ciclos, observabilidad desde el dia uno, seguridad y guardrails (prompt injection,
  exfiltracion, tools peligrosas), fluidez con herramientas de AI (como se promtea y se verifica
  con Cursor o Claude Code), profundidad Python y capacidad full-stack.
- Errores comunes: saltar a fine-tuning demasiado pronto, tratar al LLM como fuente de verdad,
  saltarse evaluacion y monitoreo, nombrar herramientas sin trade-offs, ignorar modos de fallo,
  sobrediseñar desde el arranque, bluffear sobre huecos.
- Portfolio: 2 o 3 proyectos end-to-end (app RAG, agente, algo desplegado) con metricas y
  decisiones documentadas; "start the job before you have it"; hackathons y construir en publico
  rinden mas que cursos. Segmentar la busqueda en empresas de producto, de infraestructura y de
  modelos.

## Fuente 2: serie del rol AI Engineer en Espana (Eusebio Graciani, nothiring.me)

Hilo: https://x.com/egraciani/status/2105308965248925902 (30 sep 2026, leido via shim).
Articulos (30 sep 2026): que es el rol (http://nothiring.me/blog/roles/ai-engineer-espana),
quien lo ocupa (http://nothiring.me/blog/roles/ai-engineer-perfil-espana) y cuanto cobra
(http://nothiring.me/blog/roles/ai-engineer-salario-espana). Corpus propio: 142.936 perfiles en
Espana (ventana 2 may 2025 a 24 sep 2026) y 19.940 ofertas de tecnologia (27 jul a 18 sep 2026),
de los que se aislaron 1.878 perfiles con titulo AI Engineer (o variante) y 476 ofertas del rol.
No es un censo: es el sourcing de una agencia, y ellos mismos declaran los sesgos.

### Perfil de quien ocupa el rol (n = 1.878)

- Solo 2,3% esta open to work; 53,2% lleva menos de un ano en el puesto. Mediana de 6,4 anos de
  experiencia total y mediana de 6 anos de carrera antes del primer puesto con titulo de AI:
  el rol lo ocupa gente con oficio, no recien llegados. Solo 3,2% es junior, intern o becario.
- Origen inmediato: software engineering 27,0%, data (science, ML, engineering) cerca del 29%,
  academia 7,1%, y frontend solo 14 personas de 1.807 (0,8%). El 81,2% cambio de empresa para
  entrar. El articulo lo dice claro: "la puerta de entrada casi no existe" (16 de 476 ofertas
  llevan junior, becario o trainee en el titulo) y "la ruta que describen los roadmaps,
  empezar por los fundamentos de modelos y bajar hacia el producto, es la que menos gente ha
  recorrido".
- El 85,8% de quienes declaran skills de IA generativa no lleva AI Engineer en el titulo; el
  grupo mas grande que construye con LLMs se llama Software Engineer (31,4%). Buscar por titulo
  deja fuera al 85% del talento.
- Skills declaradas: Python 72,9%, SQL 58,6%, cloud 54,0%, JavaScript/TypeScript 33,5%,
  Docker/Kubernetes 32,6%, PyTorch/TensorFlow 31,6%, RAG 26,8%, agentes 25,9%, frameworks LLM
  25,5%, FastAPI 14,6%, MLOps 13,5%, prompting 12,9%, bases vectoriales 8,3%, MCP 7,6%,
  fine-tuning 2,9%. En autodescripciones: 46,6% habla de produccion, despliegue o escalabilidad
  y 43,1% de negocio o impacto; solo 14,1% menciona evaluacion o monitorizacion.
- Tipos de trabajo: 60% en la capa de aplicacion (RAG/LLM app 27,4%, LLM app 21,8%, agent
  builder 10,3%), 10% plataforma, 2,9% entrena modelos. Educacion: 66% con master y 49,3% con
  formacion formal en AI o data science (mercado espanol de corporativo y consultora).
- Recomendacion central del articulo para entrar: demostrar sin permiso de nadie, con error
  analysis sobre un sistema real (leer al menos 100 trazas, etiquetar a mano cada fallo y
  publicar la taxonomia con un numero antes y despues; practica de Hamel Husain). "Es lo que
  las ofertas piden cuando dicen evaluacion".

### Ofertas del rol (n = 476) y comparacion internacional

- Menciones: agentes 73,3%, RAG 56,7%, LLM 78,8%, Python 78,8%, LangChain/LangGraph 36,3%, SQL
  solo 23,3% (menos que en una oferta tech cualquiera, 27,8%). Los frameworks de LLM son el
  diferenciador real: aparecen 21 veces mas que en el resto del mercado; RAG, 15 veces.
- Evaluacion: entre 51,5% y 68,9% de las ofertas del rol la nombran, segun donde se corte la
  definicion. No marginal.
- Comparacion con el dataset de Grigorev (ofertas de IA y ML de ambos lados): agentes 60,9% vs
  55,4%, Python 75,7% vs 70,8%, RAG 39,9% vs 39,8%, MCP 11,4% vs 14,1%. El articulo concluye:
  "Lo que se pide en una oferta de IA en Espana se parece bastante a lo que se pide fuera".
- Salario (n = 31 bandas de 476 ofertas): mediana 52.500 euros, producto 69.000 contra
  consultora 49.400 (brecha de 19.600 por el mismo titulo), rango 30k a 130k. El 42,6% de las
  ofertas las publica consultora o staffing. Competencia: mediana de 67 candidaturas por oferta
  contra 45 del mercado (el frontend en Espana llega a 105).
- Taxonomia de cuatro trabajos bajo el mismo titulo (sintesis de Yarchi sobre el dataset de
  Grigorev): Modelo (ML Engineer), Plataforma (AI Platform Engineer), Aplicacion (LLM
  Application Engineer) y Negocio (Forward-Deployed / AI Product Engineer). El Forward-Deployed
  es el titulo que mas crece. La evaluacion atraviesa los cuatro.
- El mapa de skills de Andrew Ng (10.000+ ofertas, entrevistas y encuestas, citado y resumido
  por nothiring) tiene cuatro habilidades de primer nivel: construir y desplegar aplicaciones de
  AI (con seis piezas: fundamentos de LLM, anclar el modelo en datos, sistemas agenticos,
  desarrollo dirigido por evaluacion, operar en produccion y fundamentos de ML), fundamentos de
  ingenieria de software con fluidez de trade-offs (contrapuesto al vibe coding sin entender que
  decide el agente), programar con agentes (modelo mental, limites, cuanta autonomia dar) y dar
  forma al trabajo (especificaciones, criterio de producto, entender el negocio). La pieza que
  mas distingue a un buen constructor es la de desarrollo dirigido por evaluacion. Pregunta de
  entrevista asociada: "cuando tu sistema empezo a fallar, como lo mediste, sobre cuantos casos
  y que cambio el numero?".

## Aplicabilidad del mercado espanol al target remoto internacional

El propio articulo de salarios valida la transferencia de la demanda de skills: las ofertas
espanolas de IA piden practicamente lo mismo que las internacionales (diferencias de menos de 6
puntos en agentes, Python, RAG y MCP). Por lo tanto las prioridades de skills de esta fuente
sirven para el target internacional.

Lo que NO se transfiere y no se usa como guia: bandas salariales espanolas (52.500 euros de
mediana y la brecha producto contra consultora), concentracion geografica (Madrid 43,6%),
tamanos de empresa (64,4% en empresas de mas de mil personas), educacion formal (66% con
master, sesgo de corporativo y consultora espanola) y volumen de candidaturas por oferta. Para
Argentina y el remoto internacional se conservan las bandas y riesgos ya declarados en el plan
personal. El aprendizaje estructural que si viaja: mirar quien publica la oferta (producto
contra consultora cambia la banda por el mismo titulo) y buscar mas alla del titulo, porque el
85% del talento con skills de GenAI no se llama AI Engineer.

## Comparacion contra lo decidido

### Se valida (no cambia)

| Decision vigente | Evidencia nueva |
|---|---|
| Objetivo AI Engineer aplicado, no ML ni research | Applied 97,1% contra research 2,9% (Grigorev); entrenar modelos 2,9-3,6% (ambas); "el mercado quiere gente que entrega" |
| Anti-lista: bootcamps, matematica primero, Prompt Engineer | Grigorev deja fine-tuning y ML profundo fuera del camino critico; nothiring: la ruta de roadmaps desde fundamentos es la menos recorrida |
| RAG y agentes como nucleo del plan | RAG 53,9% y agentes 71,6% en AI-First; "si aprendes esos dos patrones a fondo cubres la mayoria de los casos" |
| Evals como diferenciador (fases 3 y 5) | 59,7% de AI-First pide evaluacion; "this is the differentiator"; 51,5-68,9% en ofertas del rol en Espana |
| Portfolio sobre certificados | "Start the job before you have it"; hackathons y construir en publico sobre cursos; portfolio con metricas |
| Puerta de entrada comprimida y horizonte honesto | 3,4% de ofertas junior en Espana; 3,2% de juniors en la muestra; mediana 6 anos de oficio previo |
| Via de SWE senior sumando la capa de AI | Origen mas frecuente: software engineering 27,0%; "el perfil se parece a un backend senior con cloud" |
| Proyecto MCP server en la fase de agentes | MCP 14,1% internacional y la skill que mas crece (9,9% a 17,6%) |
| Fases 0 a 6 con gates y proyectos | El orden del nucleo de Grigorev y las seis piezas de Ng mapean al mismo esqueleto |

### Cambia (se integra en el plan)

1. **Cloud como skill obligatoria.** Ambas fuentes la ponen en el must-have (AWS 40,3% > Azure
   29,6% > GCP 27,4%; 54% de perfiles espanoles la declaran; "al menos una cloud" en la lista de
   Grigorev). El plan actual solo habla de Docker y de despliegue en la fase 5. Se agrega cloud
   (AWS primero, al menos una) a la fase 1 como tema y a la fase 5 como despliegue real.
2. **Rama TypeScript full-stack como alternativa de primera clase.** Grigorev dice para frontend
   TypeScript "Recommended" y Python "Strongly Recommended", y aconseja hacer los dos con
   TypeScript como respaldo y Python para profundidad, porque Python domina la demanda (70,8%).
   El plan conserva Python como via principal (la demanda manda) pero la variante TypeScript
   queda documentada como alternativa valida, sobre todo para el rol de AI Product Engineer en
   equipos TS-first, y como velocidad de prototipado.
3. **Error analysis de trazas como artefacto demostrable de evaluacion.** Metodo concreto de
   Hamel Husain (leer al menos 100 trazas reales de un sistema, etiquetar a mano cada fallo,
   publicar la taxonomia con un numero antes y despues) como entrega explicita del proyecto RAG
   (fase 3) y del asistente (fase 5), mas la pregunta de entrevista asociada ("cuando tu sistema
   empezo a fallar, como lo mediste, sobre cuantos casos y que cambio el numero?"). Es lo que
   las ofertas entienden por evaluacion y se puede demostrar sin permiso de nadie.
4. **Grounding mas alla del RAG vectorial** (pieza 02 de Ng). La fase 3 se amplia: procesamiento
   de fuentes (texto, PDF, HTML, imagenes) a algo que el modelo pueda leer, pipelines de indexado
   que se mantengan limpios y al dia, indice vectorial contra grafo de conocimiento contra capa
   semantica sobre datos estructurados, y decidir que va en el prompt y que recupera el modelo.
5. **Operacion en produccion con guardrails y adversarios** (pieza 05 de Ng). La fase 5 se
   amplia: guardrails, respuesta a inyecciones de prompt y a fallos del modelo, deteccion de
   drift, regresion estadistica calibrada al riesgo del error, y reduccion de costo y latencia
   (eleccion de modelo, destilacion, simplificar el workflow).
6. **Skills transversales de oficio** (habilidades 3 y 4 de Ng). Programar con agentes (modelo
   mental de los agentes, limites, cuanto intervenir) y dar forma al trabajo (escribir
   especificaciones con criterio de producto y de negocio). El usuario ya usa agentes intensivo;
   el plan lo convierte en material defendible de entrevista y suma la practica de
   especificacion, que las fuentes marcan como creciente. Viven como notas transversales y como
   tema de las senales de salida, no como fase nueva.
7. **Preparacion de entrevista y de busqueda alineada a lo que se prueba.** El plan suma una
   seccion con los patrones de Grigorev (evaluacion por encima de construccion, costo y
   latencia, trade-offs tipo "cuando NO usarias RAG", observabilidad, guardrails, fluidez con
   herramientas de AI, full-stack) y con la pregunta de evaluacion de nothiring; mas la
   segmentacion de busqueda (producto, infraestructura, modelos) y la regla de mirar quien
   publica la oferta. Refuerza la utilidad de `/interview` como practica de estas rondas.

### Se conserva porque las fuentes no lo cubren

- La disciplina de gates por fase, la fase 0 de decision y foco, y el diagnostico personal.
- El veredicto honesto de recursos y certificados, el costo estimado y las bandas de salario
  argentino (las fuentes nuevas no miden ese mercado).
- La anti-lista con datos de comunidad (Hacker News y Reddit) y el formato de plan bilingue.
- El contrato del plan (ADR-0028), el diseno de la pagina y del progreso (ADR-0029) y el banco
  por fases conservando id (ADR-0030): las fuentes son contenido, no formas de contrato. La
  reevaluacion no encontro en las fuentes ningun modelo de producto que justifique cambiarlos.

### Correcciones menores al plan anterior

- La cifra de demanda de RAG queda citada con precision por fuente: 56,7% de las ofertas del
  rol en Espana, 39,8% de todas las de Grigorev y 53,9% de las AI-First. Antes el plan mezclaba
  un "39%" sin distinguir denominador.
- El diagnostico de "ML clasico, deep learning, PyTorch, matematicas: no hace falta" pasa a un
  matiz honesto: no hace falta para entrar, pero el 54% de AI-First pide algo de ML, PyTorch
  basico es de alto valor en la lista de Grigorev, y el minimo de fundamentos (embeddings,
  sesgo y varianza, analisis de errores, ingenieria de datos) si entra como lectura ligera.
- Los roles puerta se etiquetan con la taxonomia del mercado: el rol 1 se alinea con
  Aplicacion y Negocio (AI Product Engineer y Forward-Deployed, el titulo que mas crece) y se
  anota la realidad medida de la ruta frontend (0,8% llega al titulo directamente en Espana; la
  via funciona como ingenieria de software mas capa de AI o como full-stack AI, no como cambio
  de titulo puro).

## Impacto en la documentacion y en los tickets

- `docs/planning/plan-estudios-ai.md`: se reemplaza la seccion de reevaluacion pendiente por este
  veredicto resumido y se integran los siete cambios en fases, diagnostico, senales de salida y
  citas de demanda.
- ADR-0028: se agrega addendum con las fuentes de demanda verificadas (Grigorev y nothiring) y
  el reforzamiento del criterio de demanda por skill. La forma del contrato no cambia.
- ADR-0029 y ADR-0030: se les agrega una nota de que la reevaluacion los confirma sin cambios
  de forma. La pagina, el progreso compartido y el banco por fases siguen vigentes.
- Spec #34 y tickets #35 a #42: el alcance se mantiene; se ajustan dos cosas. En #35,
  `research-content` toma estas dos fuentes como fuentes primarias de referencia del dominio y
  exige citar dataset y ventana temporal en cada claim de demanda. En #38, las preguntas nuevas
  cubren si o si los temas que las fuentes marcan como ausentes en el material actual:
  analisis de errores y metricas de evaluacion, trade-offs ("cuando NO usar RAG"), costo y
  latencia, guardrails y seguridad del agente, y fluidez con herramientas de AI. El seed del
  plan (#31) sale de la version actualizada del plan personal desidentificada.
- `/learning` (re-grilling): las decisiones de la spec quedan confirmadas; el contenido que se
  navega es el plan actualizado. La nota de "material de investigacion como lista de lectura"
  del diseno puede incluir los tres articulos de nothiring y el repo de Grigorev como lecturas
  del dominio, sin contaminar el perfil.

## Limitaciones

- El dataset de Grigorev es builtin.com en seis mercados y no cubre oferta remota global ni
  Latam; las cifras de salario de ese repo (EE.UU.) no aplican al plan.
- Los datos de nothiring son de una agencia espanola con su sesgo de sourcing declarado; las
  skills de LinkedIn son autodeclaradas; las bandas salariales son de 31 ofertas. Usados aqui
  solo para demanda de skills, realidad del rol y patrones de entrevista, no para salario ni
  estrategia de candidaturas.
- El repo de Grigorev es WIP y sus cifras son de conteo por keyword o extraccion con modelo:
  direccion, no decimales. Los hilos de X aportan contexto y enlaces, no datos nuevos respecto
  de los repos y articulos.
- No se verificaron en profundidad las secciones de portfolio del repo ni las 51 fichas de
  entrevistas por empresa; para los fines de esta reevaluacion alcanza lo leido de role/,
  learning-paths/ e interview/03-get-hired.md.

## Fuentes

1. X via agent-reach twitter shim: https://x.com/Al_Grigor/status/2104926079458943225 (leido
   2026-10-05).
2. https://github.com/alexeygrigorev/ai-engineering-field-guide (README, role/02-skills.md,
   learning-paths/README.md, learning-paths/from-frontend-engineer.md,
   interview/03-get-hired.md; leidos 2026-10-05).
3. X via agent-reach twitter shim: https://x.com/egraciani/status/2105308965248925902 (leido
   2026-10-05).
4. http://nothiring.me/blog/roles/ai-engineer-espana (leido 2026-10-05).
5. http://nothiring.me/blog/roles/ai-engineer-perfil-espana (leido 2026-10-05).
6. http://nothiring.me/blog/roles/ai-engineer-salario-espana (leido 2026-10-05).
7. Citas internas de esas fuentes usadas tal cual: mapa de skills de Andrew Ng
   (https://x.com/AndrewYNg/status/2088302050706686198 y
   https://x.com/AndrewYNg/status/2090840747738374568), taxonomia de cuatro trabajos de Yarchi
   (https://x.com/undefinedKi/status/2083549085076701434), error analysis de Hamel Husain
   (https://hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html),
   The AI Engineering Stack de Chip Huyen
   (https://newsletter.pragmaticengineer.com/p/the-ai-engineering-stack).
