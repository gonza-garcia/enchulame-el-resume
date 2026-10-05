# Research: cursos y recursos para aprender AI (2026)

Fecha de investigacion: 28 de septiembre de 2026. Metodo: websearch para descubrir, webfetch y
`curl` para abrir la pagina de cada recurso (precio, duracion, rating, temario), `yt-dlp` para
metadatos reales de YouTube (vistas, likes, duracion, canal) y la API publica de GitHub para
estrellas y forks. Los backends de Reddit y Twitter de agent-reach NO estan conectados en este
entorno (verificado con `agent-reach doctor --json`: reddit y twitter sin `active_backend`), asi
que las opiniones de Reddit se leen solo como snippets de busqueda o citas de blogs y estan
marcadas como tales. Los precios de Udemy son volatiles: el widget de precio de la pagina del
curso esta bloqueado por Cloudflare para clientes no navegadores, asi que los precios de Udemy de
este documento vienen de tarjetas de listado de Udemy indexadas hoy y de sitios de cupones
(marcados "reportado por"). Los recursos colgados de las 6 fases del plan de estudios, en el
mismo orden del plan (el plan personal vive en `docs/planning/plan-estudios-ai.md`).

## Resumen ejecutivo

- Fase 1 (Python y backend): el eje es el curso gratuito de freeCodeCamp "Python API Development"
  (19 h, FastAPI, Postgres, pytest, Docker y CI/CD, 3,15 M de vistas y 66.106 likes). CS50P de
  Harvard (15 h57, 9,16 M de vistas) cubre el Python moderno. En espanol, MoureDev (10 h07 en
  YouTube, 3,46 M de vistas, 108.989 likes) es la opcion fuerte.
- Fase 2 (LLMs y prompt engineering): "ChatGPT Prompt Engineering for Developers" de
  DeepLearning.AI (Isa Fulford de OpenAI y Andrew Ng, 1 h40, gratis en audit) sigue siendo el
  estandar. Complemento conceptual gratuito: "Let's build GPT" de Karpathy (1 h56, 7,94 M de
  vistas, 169.932 likes). La guia `dair-ai/Prompt-Engineering-Guide` tiene 78.697 estrellas.
- Fase 3 (embeddings y RAG): el curso "Retrieval Augmented Generation (RAG)" de DeepLearning.AI
  (Zain Hasan, 26 h03, Weaviate y Phoenix/Arize) es el mas completo. La ruta 100% gratuita se
  apoya en "Production RAG with LangChain & Vector Databases" de freeCodeCamp (7 h38, mayo 2026)
  y en el curso de RAG de EDteam en espanol (2 h06, 4,6 de rating, 15 USD de compra unica).
- Fase 4 (agentes, tool calling, MCP): Hugging Face Agents Course (gratis, 32.971 estrellas, con
  reto final sobre el benchmark GAIA y certificado gratis) mas el short course de DeepLearning.AI
  "MCP: Build Rich-Context AI Apps with Anthropic" (1 h58, dictado por el Head of Technical
  Education de Anthropic). El curso "Agentic AI" de Andrew Ng (9 h55) cubre de punta a punta
  reflection, tool use, planning, multi-agent y evals.
- Fase 5 (evals y produccion): el recurso gratuito con mejor ratio senal/costo es "Your AI
  Product Needs Evals" de Hamel Husain mas su curso por email gratis (17 lecciones y 2 ebooks).
  Para observabilidad, Langfuse tiene plan Hobby gratis (50.000 unidades por mes, 2 usuarios) y
  self-host open source. Los short courses de DeepLearning.AI sobre calidad y accuracy (2 h16 y
  1 h41) cierran la parte teorica.
- Fase 6 (especializacion): "LLM Fine-Tuning Course" de freeCodeCamp (11 h56, cubre LoRA y RLHF)
  y `mlabonne/llm-course` (83.194 estrellas) para profundizar fine-tuning y cuantizacion. Red
  teaming con el short course de Giskard (1 h29). Todo gratis.
- Nada de lo esencial cuesta plata. Con 0 USD se cubren las 6 fases. Los pagos que valen la pena
  estan todos por debajo de 15 USD (ofertas de Udemy y compra unica de EDteam) salvo los cursos
  premium de referencia que van en su propia seccion.

## Como leer esta tabla

- "Verificado hoy" significa que se abrio la pagina (o se pidio el video con `yt-dlp`, o se
  consulto la API de GitHub) el 25/9/2026 y los numeros que aparecen se vieron ese dia.
- "Reportado por" significa que el dato viene de una review, un snippet de busqueda o un sitio
  espejo, y no de la pagina del recurso.
- Los precios de Udemy se anotan con la fecha y con la aclaracion de oferta versus precio de
  lista. Las ofertas de 10 a 15 USD de Udemy se repiten cada poco (practicamente todos los meses
  hay una campana de descuentos); el precio de lista es siempre mucho mayor (84 a 199 USD segun
  el curso). Esperar la oferta es parte del juego.
- "Senal de confianza" junta rating y cantidad de alumnos (Udemy), likes y vistas (YouTube),
  estrellas y forks (GitHub) o rating y matriculados (Coursera, EDteam).
- "Opiniones" marca si se pudo leer el texto completo de la fuente externa o solo snippets.
- Idioma: se indica el del material principal. Cuando hay doblaje o subtitulos automaticos se
  anota.

## Recursos por fase del plan

### Fase 1: Python y backend minimo

Skills: Python moderno (type hints, dataclasses), FastAPI, Pytest, SQL, Docker, CI.

| Recurso | Creador | Plataforma | Precio | Duracion | Senal de confianza (hoy) | Opiniones (fuente externa) | Skill que ensena | Idioma | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| [Python API Development - Comprehensive Course for Beginners](https://www.youtube.com/watch?v=0sOvCWFmrtA) | Sanjeev Thiyagarajan, publicado por freeCodeCamp.org | YouTube | Gratis | 19 h00 (68.427 s) | 3.147.119 vistas, 66.106 likes, canal con 11,9 M de subs, 2.900 comentarios | La nota de freeCodeCamp que lo anuncia (freecodecamp.org/news/creating-apis-with-python-free-19-hour-course, leida completa) detalla el temario; sin reviews externas de rating | FastAPI, SQLAlchemy, Postgres, pytest, Docker, deploy y pipeline CI/CD con GitHub Actions | Ingles | Mejor eje de la fase: cubre exactamente el gate (servicio con endpoints, tests en verde y Dockerfile). Verificado hoy |
| [Harvard CS50's Introduction to Programming with Python](https://www.youtube.com/watch?v=nLRL_NcnK-4) | Harvard, CS50 (David Malan); version completa subida a freeCodeCamp.org | YouTube (el curso oficial vive en cs50.harvard.edu/python) | Gratis | 15 h57 (57.468 s) | 9.157.383 vistas, 237.658 likes, 5.300 comentarios | La ruta de cursos de IA de DataCamp (datacamp.com/es/blog/best-free-ai-courses) lo recomienda como base universitaria seria (reportado por) | Python moderno, type hints, errores, testing con Pytest, librerias, SQL basico | Ingles (subtitulos en YouTube) | El mejor Python "en serio" para alguien que ya programa. Verificado hoy |
| [Curso COMPLETO de PYTHON desde CERO para PRINCIPIANTES](https://www.youtube.com/watch?v=Kp4Mvapo5kc) | Brais Moure (MoureDev) | YouTube (y su academia gratuita en moure.dev/cursos, con "Python desde cero" de +44 h y "SQL y Bases de Datos" de 7 h) | Gratis | 10 h07 (36.454 s) | 3.464.481 vistas, 108.989 likes, canal con 993.000 subs, 2.400 comentarios | Los comentarios de YouTube son muy positivos (no se leyeron en profundidad); MoureDev es GitHub Star y Microsoft MVP segun su sitio (reportado por) | Python, POO, buenas practicas | Espanol | Recurso fuerte en espanol para la fase 1. El video esta verificado hoy; los datos de moure.dev/cursos vienen de snippets de busqueda (reportado por) |
| [FastAPI - The Complete Course 2026 (Beginner + Advanced)](https://www.udemy.com/course/fastapi-the-complete-course/) | Eric Roby y Chad Darby | Udemy | Oferta tipica 11,99 a 12,99 USD (las tarjetas de Udemy indexadas hoy mostraban 11,99 USD con precio de lista 84,99 USD; un tracker de cupones reportaba 12,99 USD con lista 169,99 USD el 29/7/2026). Precio de oferta, no de lista | 21 h28, 241 lecciones, 19 secciones | 4,5 de rating con 13.888 calificaciones y 98.814 alumnos, insignia Bestseller (verificado hoy en la pagina del curso) | El analisis "7 Best Udemy Courses to Learn FastAPI" de Medium (javarevisited) lo elige como mejor curso de FastAPI de Udemy (reportado por) | FastAPI, Pydantic, SQLAlchemy, JWT, bcrypt, pytest, deploy | Ingles (con subtitulos auto en 28 idiomas) | La opcion paga de la fase. Solo si preferis video estructurado antes que el curso de 19 h de freeCodeCamp. Rating y alumnos verificados hoy; precio en rango de oferta y volatil |
| [100 Days of Code: The Complete Python Pro Bootcamp](https://www.udemy.com/course/100-days-of-code/) | Dr. Angela Yu (App Brewery) | Udemy | La vista de hoy mostraba 129,99 USD sin descuento (precio de lista volatil); en las campanas de oferta recurrentes baja a 10 a 15 USD | 60+ h segun la descripcion del instructor (el listado de Udemy muestra 57 h y 604 lecciones); reportado por | 4,7 con 436.813 calificaciones y unos 1.880.000 alumnos (verificado hoy; el numero de alumnos fluctua entre vistas) | Ampliamente recomendado en foros; sin lectura directa de Reddit en este entorno (no verificado) | Python desde cero, automatizacion, Flask, pandas, scikit-learn | Ingles (subtitulos auto) | Senal de audiencia enorme, pero el ritmo es de cero absoluto: para alguien con 6 anos de ingenieria es lento. Mejor CS50P mas el curso de API de freeCodeCamp. Como curiosidad: Angela Yu dice "500.000 reviews de 5 estrellas" en la descripcion, cifra que excede su propio rating publicado |

### Fase 2: fundamentos de LLMs y prompt engineering

Skills: proximo token y ventana de contexto, temperatura y top-p, prompts de sistema, JSON
estructurado, few-shot, ReAct y Chain of Thought, fallas tipicas (alucinaciones, prompt
injection).

| Recurso | Creador | Plataforma | Precio | Duracion | Senal de confianza (hoy) | Opiniones (fuente externa) | Skill que ensena | Idioma | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| [ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) | Isa Fulford (OpenAI) y Andrew Ng (DeepLearning.AI) | DeepLearning.AI | Gratis para auditar (videos y notebooks); el certificado y la tarea evaluada requieren el plan PRO. Verificado hoy en la pagina | 1 h40, 9 lecciones en video, 7 ejemplos de codigo | Es el short course fundacional de la plataforma de Andrew Ng; sin rating publico en la pagina | Reddit r/learnmachinelearning "Thoughts on These DeepLearning.AI Short Courses?" (snippets, no se pudo leer el hilo completo): opiniones mixtas, "son como infomerciales de los proveedores de IA" versus "son legitimos, concisos y no desalientan como los cursos de 10 horas" | Prompt engineering, resumir, inferir, transformar, expandir, chatbot con memoria | Ingles | Primer recurso de la fase, el mismo que ya cita el plan. Verificado hoy |
| [Let's build GPT: from scratch, in code, spelled out](https://www.youtube.com/watch?v=kCc8FmEb1nY) | Andrej Karpathy | YouTube | Gratis | 1 h56 | 7.938.822 vistas, 169.932 likes, 3.200 comentarios, canal con 1,7 M de subs (verificado hoy con yt-dlp) | Es el video mas citado en HN y Reddit para entender transformers desde cero (consenso amplio, no verificado hilo por hilo) | Como predice el proximo un token, attention, entrenamiento de un GPT chico | Ingles | El "por que funciona un LLM" mas honesto y barato que existe. Cubre el temario teorico de la fase 2 |
| [Prompt Engineering Tutorial: Master ChatGPT and LLM Responses](https://www.youtube.com/watch?v=_ZvnD73m40o) | freeCodeCamp.org | YouTube | Gratis | 41 min | 2.811.153 vistas, 65.953 likes, 1.100 comentarios (verificado hoy) | Sin reviews externas encontradas | Prompts estructurados, roles, limitaciones | Ingles | Complemento rapido cuando ya se vio el short course. Verificado hoy |
| [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) | DAIR.AI (Elvis Saravia y colaboradores) | GitHub | Gratis, licencia MIT | Guia modular (lectura y notebooks); sin duracion fija | 78.697 estrellas, 8.647 forks, ultimo push 2026-03-11 (verificado hoy con la API de GitHub) | Citada como referencia estandar en multiples listas de 2026 (reportado por) | Prompt engineering, ReAct, Chain of Thought, seguridad de prompts | Ingles (con traducciones) | La referencia de consulta permanente. Verificado hoy |
| [Claude Academy: AI Fluency y AI capabilities and limitations](https://www.anthropic.com/learn) | Anthropic (equipo de educacion) | Anthropic (Claude Academy) | Gratis | AI Fluency: 4 h, 14 lecciones; AI capabilities and limitations: 3 h30, 13 lecciones | Plataforma oficial de Anthropic; Reddit recomienda sus cursos gratuitos con certificado en hilos de junio y marzo de 2026 (segun el resumen de talent.aiinsiders.net, reportado por) | Lo mismo: la fuente es un blog que resume Reddit (reportado por) | Como funciona la IA, limitaciones de los LLM, colaboracion humano-agente, uso etico | Ingles | Cubre el lado "que puede y que no puede hacer un LLM" del temario. Verificado hoy |

### Fase 3: embeddings, vector DBs y RAG

Skills: embeddings y busqueda semantica, chunking y overlap, retrieval hibrido y re-ranking,
metricas de retrieval, grounding, fallas tipicas.

| Recurso | Creador | Plataforma | Precio | Duracion | Senal de confianza (hoy) | Opiniones (fuente externa) | Skill que ensena | Idioma | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| [Retrieval Augmented Generation (RAG)](https://www.deeplearning.ai/courses/retrieval-augmented-generation) | Zain Hasan (Together.ai y University of Toronto), DeepLearning.AI | DeepLearning.AI (tambien en Coursera) | Auditar es gratis (el curso completo de videos, segun el modelo de la plataforma); el certificado y las 10 tareas evaluadas son del plan PRO (25 USD/mes anual o 30 USD/mes mensual, verificado hoy en la FAQ del curso "Agentic AI" de la misma plataforma). La version Coursera anuncia vista previa del modulo 1 gratis y acceso completo de pago. Ojo: la FAQ de esta pagina mezcla texto de Coursera, asi que conviene confirmar al inscribirse | 26 h03, 5 modulos, 49 lecciones en video, 9 ejemplos de codigo, 10 tareas evaluadas | Es el curso largo insignia de DeepLearning.AI sobre RAG; la pagina muestra reseñas de otros cursos de la plataforma, no de este curso en particular (no verificado) | TuringPost "7 Free Courses to Master RAG 2026" y DataCamp "Best RAG Courses in 2026" lo listan entre los mejores (reportado por) | Retrieveres, BM25, busqueda semantica e hibrida, Reciprocal Rank Fusion, Weaviate, chunking, evaluacion y produccion con Phoenix de Arize | Ingles | El recurso mas completo de la fase y el que mejor se cruza con ofertas (RAG es lo mas pedido). Verificado hoy, incluida la duracion exacta que ya figuraba en el plan |
| [Production RAG with LangChain & Vector Databases (Full Course)](https://www.youtube.com/watch?v=mHxLXzYjQRE) | freeCodeCamp.org | YouTube | Gratis | 7 h38 (27.518 s) | 255.857 vistas, 5.758 likes, 224 comentarios, publicado el 26/5/2026 (verificado hoy) | Sin reviews externas encontradas (curso nuevo) | RAG en produccion con LangChain y bases vectoriales, pipeline completo | Ingles | La alternativa 100% gratuita y con codigo, ideal para el proyecto estrella de la fase. Verificado hoy |
| [Curso: RAG: Adapta la IA a tu información](https://ed.team/cursos/rag) | Beto Quiroga (Bolivia), EDteam | EDteam | 15 USD de compra unica del curso (acceso de por vida, con certificado) o suscripcion premium (240 USD anuales en oferta, antes 360; verificado hoy con la pagina en modo USD). El modulo 1 (51 min) es gratis | 2 h06, 3 modulos | 4,6 de rating con 111 calificaciones de 616 alumnos (verificado hoy) | Las 5 reseñas de la pagina se leyeron completas: "buen curso de introduccion, aun a 2026 sigue siendo relevante a pesar de los cambios en AI" (Johnny IV Young Ospino, 18/3/2026), "Bastante claro los temas tocados" (Christian Alberto Castillo, 18/8/2025) y otras 3 positivas | RAG paso a paso, vectores, embeddings, busqueda semantica con Supabase, function calling, problemas comunes | Espanol | El recurso mas solido en espanol de toda la investigacion: barato, con opiniones reales leidas y enfocado en lo que el plan pide. Verificado hoy |
| [Hugging Face NLP Course](https://huggingface.co/learn/nlp-course/chapter1/1) | Hugging Face (Abubakar Abid, Ben Burtenshaw, Matthew Carrigan y otros) | Hugging Face Learn | Gratis y sin publicidad (textual de la pagina) | 12 capitulos, ritmo recomendado de 1 semana por capitulo a 6 a 8 h por semana (72 a 96 h estimadas). La duracion exacta por capitulo no se publica (estimacion propia) | Curso oficial del ecosistema Transformers; sin certificado (la pagina dice que aun no tienen certificacion) | TuringPost lo pone en el primer lugar de su lista de cursos gratuitos de LLM 2026 (reportado por) | Transformers, embeddings, Datasets, Tokenizers, fine-tuning, datos de calidad, modelos de razonamiento, demos | Ingles (traduccion al espanol en progreso, marcada WIP en la pagina) | La mecanica de embeddings y transformers que el plan pide en esta fase. Mas largo de lo necesario si solo se quiere RAG: tomar los capitulos 1 a 4 y los 10 a 12. Verificado hoy |
| [What is Retrieval-Augmented Generation (RAG)?](https://www.youtube.com/watch?v=T-D1OfcDW1M) | IBM Technology | YouTube | Gratis | 6 min | 2.017.581 vistas, 45.807 likes, 1.000 comentarios, canal con 1,8 M de subs (verificado hoy) | Sin reviews externas; es un video explicativo corto | Que es RAG y para que sirve | Ingles | Solo para arrancar la fase con el concepto en 6 minutos. Verificado hoy |
| [Generative AI for Beginners (21 lecciones)](https://github.com/microsoft/generative-ai-for-beginners) | Microsoft Cloud Advocates | GitHub | Gratis, licencia MIT | 21 lecciones autocontenidas (texto y codigo) | 120.717 estrellas, 63.498 forks, ultimo push 2026-09-24 (verificado hoy) | Muy citado como ruta de inicio (reportado por) | Fundamentos de GenAI, embeddings, RAG, agentes; con ejemplos en Python y TypeScript | Ingles (50+ traducciones, incluido espanol) | Dato relevante para este perfil: cada leccion trae codigo en Python y en TypeScript. Verificado hoy |

### Fase 4: agentes, tool calling y MCP

Skills: function calling y diseno de tools, patrones agenticos (ReAct, Plan-and-Execute,
Reflection), memoria, errores y retries, costos, MCP y servidor MCP propio.

| Recurso | Creador | Plataforma | Precio | Duracion | Senal de confianza (hoy) | Opiniones (fuente externa) | Skill que ensena | Idioma | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction) | Hugging Face (Ben Burtenshaw, Sergio Paniego, Thomas Simonini, Pedro Cuenca y otros) | Hugging Face Learn | Gratis; el proceso de certificacion tambien es gratis (texto literal de la pagina). Certificado de fundamentos con completar la unidad 1; certificado de completitud con unidad 1, un caso de uso y el reto final | 4 unidades mas 3 unidades bonus (fine-tuning para function calling, observabilidad y evaluacion de agentes, agentes en Pokemon); ritmo de 1 semana por capitulo a 3 a 4 h por semana | 32.971 estrellas y 2.368 forks en GitHub, ultimo push 2026-09-15; el espacio de la organizacion en HF muestra unos 69.000 seguidores (verificado hoy) | Reddit r/LocalLLaMA (feb 2025, snippets): "35.000 inscriptos en las primeras dos semanas", con escepticismo tipico ("mas bien workflows agenticos que agentes", "echo por gente sin experiencia corporativa real"). Reviews de blog leidas en parte: hysenlabs.com (10/9/2026) y selfmadesuccess.com | Agentes, tools, smolagents, LlamaIndex, LangGraph, Agentic RAG, evaluacion de agentes, benchmark GAIA | Ingles (traducciones al chino y frances confirmadas en la pagina) | El eje de la fase y el unico con certificado gratuito con prueba real. Nota: el umbral de 30% en GAIA que menciona el plan no se re-verifico hoy; lo verificado es que el reto final se evalua contra GAIA con leaderboard publico |
| [MCP: Build Rich-Context AI Apps with Anthropic](https://www.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic) | Elie Schoppik (Head of Technical Education de Anthropic) | DeepLearning.AI | Gratis para inscribirse (la pagina dice "free for a limited time durante la beta de la plataforma"); certificado y tarea evaluada con PRO | 1 h58, 11 lecciones, 6 ejemplos de codigo | Curso en partnership oficial con Anthropic; DeepLearning.AI tiene hoy 106 short courses y 13 cursos largos (verificado hoy en su catalogo) | Reddit valora los short courses como concisos y accesibles, con la critica de que son publicidad de los proveedores (snippets de r/learnmachinelearning) | Arquitectura cliente-servidor de MCP, construir y desplegar un servidor MCP con FastMCP, MCP Inspector, conectar Claude Desktop, servidores remotos | Ingles | El recurso directo para la parte "MCP server propio" del gate de la fase. Verificado hoy |
| [AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) | Harrison Chase (CEO de LangChain) y Rotem Weiss (CEO de Tavily) | DeepLearning.AI | Gratis para auditar; certificado con PRO | 1 h32 segun la pagina de short courses (1 h42 segun la pagina de cursos); 9 lecciones, 6 ejemplos de codigo | Curso dictado por el creador del framework que se ensena | TuringPost lo recomienda para "workflows agenticos con control, estado y routing" (reportado por) | Construir un agente desde cero, reconstruirlo con LangGraph, persistencia, streaming, human-in-the-loop | Ingles | Cubre el diseno controlado de agentes que el plan llama patrones agenticos. Verificado hoy |
| [Agentic AI (curso largo)](https://www.deeplearning.ai/courses/agentic-ai) | Andrew Ng | DeepLearning.AI | Auditar los videos es gratis (lo dice la FAQ de esta misma pagina); certificado, tareas evaluadas y labs con PRO (25 USD/mes anual, 30 USD/mes mensual, verificado hoy) | 9 h55, 31 lecciones, 7 ejemplos de codigo, 8 tareas evaluadas | Curso nuevo del fundador de DeepLearning.AI; las reseñas que muestra la pagina son de otros cursos suyos (no verificado para este) | Sin opiniones externas especificas encontradas hoy (curso reciente) | Reflection, tool use, planning, multi-agent, MCP, evals y error analysis, costo y latencia | Ingles | El curso que mejor ata la fase 4 con la fase 5 (incluye un modulo entero de evals). Verificado hoy |
| [LangChain: Agentic AI Engineering with LangChain & LangGraph](https://www.udemy.com/course/langchain) | Eden Marco (LLM Specialist en Google Cloud, LangChain Ambassador) | Udemy | Oferta tipica de 10 a 15 USD (el listado del topic LangChain de Udemy indexado hoy mostraba 9,99 USD para uno de sus cursos; la pagina del curso no muestra precio a clientes no navegadores). Precio de oferta, no de lista | No verificada hoy (la pagina no la publica en el texto que se pudo leer) | 4,6 con 53.616 calificaciones y 213.785 alumnos, Bestseller, actualizado en 8/2026 (verificado hoy) | Es el curso de LangChain mas recomendado en la comunidad de Udemy (reportado por); sin lectura directa de Reddit | LangChain, LangGraph, RAG, tools, function calling, MCP, produccion | Ingles (subtitulos auto en 28 idiomas) | La opcion paga de la fase, con senal de audiencia de las mas altas de Udemy en el tema. Solo si queres un acompanamiento en video; lo esencial esta gratis en los recursos anteriores |

### Fase 5: evals, observabilidad y produccion

Skills: datasets de evaluacion, graders automaticos y human-in-the-loop, deteccion de regresion,
versionado de prompts, trazas y logging, rate limiting, cache, monitoreo de costo y latencia.

| Recurso | Creador | Plataforma | Precio | Duracion | Senal de confianza (hoy) | Opiniones (fuente externa) | Skill que ensena | Idioma | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| [Your AI Product Needs Evals](https://hamel.dev/evals/) mas [AI Evals Email Course](https://ai.hamel.dev/eval-course) | Hamel Husain (ex Airbnb y GitHub) con Shreya Shankar | Blog personal y curso por email | Gratis (el curso por email incluye 2 ebooks) | El post es largo (lectura de 1 a 2 h); la serie de email son 17 lecciones | Hamel reporta 4.500+ ingenieros y PMs formados con este material, incluidos equipos de OpenAI, Google y Meta (texto de su pagina, verificado hoy) | Es la referencia que mas se cita en 2026 sobre evals; su curso de cohortes pago tiene 4,7 con 897 calificaciones en Maven (verificado hoy) | Tres niveles de evals (unit tests, human y model eval con trazas, A/B testing), error analysis, LLM-as-judge, eval de RAG | Ingles | El mejor recurso de toda la investigacion por ratio senal/costo. Todo el material gratuito se puede leer hoy. Verificado hoy |
| [Quality and Safety for LLM Applications](https://www.deeplearning.ai/courses/quality-safety-llm-applications) | Bernease Herman (WhyLabs) | DeepLearning.AI | Gratis para auditar; certificado con PRO | 2 h16, 7 lecciones, 1 tarea evaluada (PRO) | Short course de la serie oficial de DeepLearning.AI (106 short courses en el catalogo de hoy) | Mismas opiniones generales de Reddit sobre los short courses (snippets) | Detectar alucinaciones (SelfCheckGPT), data leakage, prompt injection, monitoreo pasivo y activo | Ingles | La parte de calidad y seguridad del temario de la fase. Verificado hoy |
| [Improving Accuracy of LLM Applications](https://www.deeplearning.ai/courses/improving-accuracy-of-llm-applications) | Sharon Zhou (AMD, ex Lamini) y Amit Sangani (Meta) | DeepLearning.AI | Gratis para auditar; certificado con PRO | 1 h41, 7 lecciones, 4 ejemplos de codigo | Dictado por VP de IA de AMD y Senior Director de Partner Engineering de Meta | Sin opiniones externas especificas | Como armar un framework de evaluacion, eval cuantitativa, self-reflection, fine-tuning con LoRA y memory tuning para bajar alucinaciones | Ingles | Casi un curso de evals en miniatura, y de paso toca LoRA (puente con la fase 6). Verificado hoy |
| [Langfuse (documentacion y plan Hobby)](https://langfuse.com/pricing) | Langfuse | Plataforma open source | Hobby gratis (50.000 unidades por mes, 30 dias de datos, 2 usuarios, sin tarjeta); Core 29 USD/mes; self-host gratis (open source). Verificado hoy en la pagina de precios | Documentacion y guias (lectura y codigo) | Usado por Hugging Face, Canva, Twilio y otros segun su pagina de precios (verificado hoy) | La propia pagina compara precios con LangSmith, Braintrust y Arize (es su comparacion, con sesgo de vendor) | Trazas de agentes, sesiones, costo por tokens, versionado de prompts, datasets de evaluacion, LLM-as-judge, anotacion humana, alertas | Ingles (docs disponibles en markdown) | La pieza de observabilidad para el proyecto de la fase, con nivel gratis real para aprender y para el portfolio. Verificado hoy |
| [Bonus Unit 2: Agent Observability and Evaluation](https://huggingface.co/learn/agents-course/en/unit0/introduction) | Hugging Face Agents Course | Hugging Face Learn | Gratis | Unidad bonus del curso (unas pocas horas) | Ver la ficha del curso en la fase 4 (32.971 estrellas) | Ver la ficha del curso en la fase 4 | Observabilidad y evaluacion de agentes | Ingles | El atajo si ya se esta haciendo el curso de agentes: cubre el temario de evals de esta fase sin saltar de plataforma |

### Fase 6: especializacion opcional

Skills segun la opcion elegida: fine-tuning y LoRA, multimodal, red teaming y AI safety,
profundidad de modelos.

| Recurso | Creador | Plataforma | Precio | Duracion | Senal de confianza (hoy) | Opiniones (fuente externa) | Skill que ensena | Idioma | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| [LLM Fine-Tuning Course: From Supervised FT to RLHF, LoRA, and Multimodal](https://www.youtube.com/watch?v=CcrC5zSv1iA) | freeCodeCamp.org | YouTube | Gratis | 11 h56 (42.986 s) | 114.300 vistas, 3.078 likes, 79 comentarios, publicado el 10/3/2026 (verificado hoy) | Sin reviews externas encontradas | Fine-tuning supervisado, RLHF, LoRA, multimodal | Ingles | La opcion mas directa para la especializacion de fine-tuning. Verificado hoy |
| [LLM Course](https://github.com/mlabonne/llm-course) | Maxime Labonne | GitHub | Gratis, licencia Apache-2.0 | Rutas con notebooks autocontenidos (colabs de fine-tuning, cuantizacion, merge de modelos) | 83.194 estrellas, 9.686 forks, ultimo push 2026-02-05 (verificado hoy) | Muy citado en r/LocalLLaMA como ruta practica de fine-tuning (reportado por, snippets) | Fine-tuning, QLoRA, DPO, cuantizacion (GPTQ, GGUF, AWQ), evaluacion de modelos | Ingles | La referencia open source para tocar pesos de modelos. Verificado hoy |
| [Practical Deep Learning for Coders (fast.ai)](https://course.fast.ai/) | Jeremy Howard (fast.ai) | fast.ai (videos en YouTube) | Gratis, sin cuenta y sin tarjeta (texto de la pagina) | Parte 1: 9 lecciones de unos 90 min cada una (unas 13 h); Parte 2: 30+ h (reportado por talent.aiinsiders.net, no verificado en la pagina de fast.ai) | Los videos acumulan mas de 6.000.000 de vistas segun su pagina (verificado hoy); libro de referencia con 5 estrellas en Amazon | talent.aiinsiders.net (5/8/2026) y el resumen de Reddit de julio 2026 coinciden: "top-down, construis algo que funciona y despues ves por que funciona", pero fast.ai no emite certificado | Deep learning con PyTorch y fastai, vision, NLP, tabular, deploy | Ingles | Solo si la fase 6 pide profundidad de modelos. Para el objetivo AI Engineer aplicado es opcional de verdad (el plan ya lo dice) |
| [Red Teaming LLM Applications](https://www.deeplearning.ai/courses/red-teaming-llm-applications) | Matteo Dora y Luca Martial (Giskard) | DeepLearning.AI | Gratis para auditar; certificado con PRO | 1 h29, 7 lecciones, 5 ejemplos de codigo | Curso en partnership con Giskard, empresa especializada en testing de LLM | Sin opiniones externas especificas | Vulnerabilidades de aplicaciones LLM, prompt injection, red teaming manual y automatico, red teaming con LLMs | Ingles | La opcion de AI safety y red teaming del menu de especializacion. Verificado hoy |

## Recursos gratuitos completos (rutas largas)

Rutas de principio a fin que no cuestan nada, con su duracion total verificada hoy:

- **Ruta full-stack de AI con una sola herramienta (freeCodeCamp, YouTube, gratis, ingles):**
  GenAI Essentials (22 h53, 947.981 vistas, 30.604 likes, producido por ExamPro) mas
  Production RAG with LangChain (7 h38) mas Agentic AI Complete Course (24 h15, 373.888 vistas)
  mas LLM Fine-Tuning Course (11 h56). Total: unas 66 h de video, todo en el canal de
  freeCodeCamp, cubriendo fundamentos, RAG, agentes y fine-tuning.
  URLs: https://www.youtube.com/watch?v=nJ25yl34Uqw , https://www.youtube.com/watch?v=mHxLXzYjQRE ,
  https://www.youtube.com/watch?v=Zy7EXDONlTY , https://www.youtube.com/watch?v=CcrC5zSv1iA
- **Ruta de backend Python (gratis, ingles y espanol):** CS50P (15 h57) mas Python API
  Development de freeCodeCamp (19 h00) = 35 h, con FastAPI, pytest, Docker y CI/CD.
- **Ruta de conceptos LLM (gratis, ingles):** Karpathy "Let's build GPT" (1 h56) mas la serie de
  3Blue1Brown "Transformers, the tech behind LLMs" (27 min, 11.276.000 vistas, 236.394 likes,
  verificado hoy) mas el Prompt Engineering Guide de DAIR.AI (78.697 estrellas).
  URLs: https://www.youtube.com/watch?v=kCc8FmEb1nY , https://www.youtube.com/watch?v=wjZofJX0v4M ,
  https://github.com/dair-ai/Prompt-Engineering-Guide
- **Ruta de agentes y evaluacion (gratis, ingles):** Hugging Face Agents Course (4 unidades mas 3
  bonus, con certificado gratis) mas los short courses de DeepLearning.AI (MCP 1 h58, LangGraph
  1 h32, Quality and Safety 2 h16, Improving Accuracy 1 h41) mas el blog de evals de Hamel
  Husain. Total: unas 25 a 30 h de contenido guiado.
- **Ruta Microsoft (gratis, ingles con traduccion al espanol):** Generative AI for Beginners,
  21 lecciones con codigo en Python y en TypeScript (relevante para un perfil con 6 anos de JS),
  120.717 estrellas. https://github.com/microsoft/generative-ai-for-beginners
- **Ruta en espanol (gratis):** Curso de Python de MoureDev (10 h07 en YouTube, mas el curso
  completo de +44 h en moure.dev/cursos) mas "Inteligencia Artificial para todos (2026)" de
  EDteam en YouTube (2 h+, gratis) y el primer modulo gratis del curso de RAG de EDteam (51 min).

## Fuera de rango de precio pero vale la pena

Con precio real y por que figuran aca:

- **AI Evals For Engineers & PMs (Hamel Husain y Shreya Shankar, Maven).** 4.200 USD por cohort
  de 4 a 6 semanas (verificado hoy en maven.com/parlance-labs/evals), 4,7 de rating con 897
  calificaciones, mas de 4.500 alumnos de empresas como OpenAI, Google, Meta, Amazon y
  Microsoft. Es la referencia premium del tema de la fase 5. Antes de pagar: su blog y su curso
  por email (gratis) cubren gran parte del contenido. https://maven.com/parlance-labs/evals
- **Frontend Masters (ahora Master.dev).** 39 USD por mes o 390 USD por ano, 33 USD/mes en plan
  anual (verificado hoy en frontendmasters.com/join). Incluye la ruta "Coding with AI" de 23 h47
  y workshops en vivo de agentes y AI engineering, con instructores de Netflix, OpenAI y GitHub.
  No emite certificados. Para este perfil tiene el plus de que habla el idioma del frontend.
  https://frontendmasters.com/join
- **DeepLearning.AI Pro.** 25 USD/mes facturado anual o 30 USD/mes facturado mensual (verificado
  hoy en la FAQ de la pagina del curso "Agentic AI"). Sirve solo para certificados y tareas
  evaluadas: auditar los videos es gratis. Vale la pena si un empleador pide certificado, que es
  poco probable segun el propio plan.
- **Coursera Plus.** 59 USD/mes o 399 USD por ano, o 49 a 79 USD por programa suelto (reportado
  por talent.aiinsiders.net, precios del 5/8/2026; hoy la pagina de Coursera mostraba una
  campana de descuento de temporada, asi que el precio puntual puede variar). Necesario solo si
  se quiere el certificado de la Deep Learning Specialization o del curso de RAG en su version
  Coursera.
- **Platzi (espanol).** Plan Expert anual 199 USD (antes 249, "precio especial" verificado hoy en
  platzi.com/hola). Mas de 1.900 cursos, con cursos de IA y prompt engineering en espanol. El
  curso "Curso de Prompt Engineering con ChatGPT, Codex y Claude" (julio 2026) apunta a context
  engineering. https://platzi.com/precios
- **EDteam premium (espanol).** 240 USD anuales en oferta (antes 360) o cursos sueltos como el
  de RAG por 15 USD (verificado hoy). Su catalogo de IA para programadores incluye MCP, agentes
  con ADK, Hugging Face y API de OpenAI. https://ed.team/
- **Certificaciones de vendor cloud (Azure AI, AWS, Google Cloud).** 99 a 400 USD segun
  proveedor, mas caro que todo el resto del plan junto. Es lo unico que "mueve la aguja como
  papel" segun el plan de estudios, y conviene recien cuando haya proyectos desplegados.

## Opiniones y controversias

Lo que dice la comunidad de los cursos mas citados. Salvo donde se indique, las fuentes de Reddit
son snippets de busqueda (los backends de Reddit no estan conectados en este entorno) y se marcan
como tales.

- **Short courses de DeepLearning.AI:** el hilo r/learnmachinelearning "Thoughts on These
  DeepLearning.AI Short Courses?" (septiembre 2024, https://www.reddit.com/r/learnmachinelearning/comments/1fpt1ik/thoughts_on_these_deeplearningai_short_courses ,
  solo snippets) es explicitamente mixto: "These courses are like infomercials for AI providers.
  I'm not exactly optimistic about their quality or educational content" frente a "They are
  legit, offer concise content and don't discourage newcomers those long, 10-hour courses do".
  Tambien se senala en el mismo hilo que los short courses son gratis y los cursos largos y las
  especializaciones de Coursera son los pagos (coincide con lo verificado hoy: auditar videos es
  gratis y el certificado es PRO).
- **Que recomienda Reddit en 2026:** el resumen de talent.aiinsiders.net "What Reddit Recommends:
  Best AI Courses (July 2026)" (22/7/2026, leido completo, pero es un blog que resume hilos, no
  los hilos originales) da este consenso: Andrew Ng sigue siendo la respuesta por defecto; fast.ai
  gana para quien quiere construir antes que estudiar matematica; la critica recurrente a la Deep
  Learning Specialization es que su ultima actualizacion grande fue en abril de 2021; los cursos
  gratuitos de Anthropic (AI Fluency y Claude 101) aparecen como novedad con certificado gratis;
  y hay una fraccion que dice directamente "salta los cursos" y construi proyectos.
- **Hugging Face Agents Course:** el hilo r/LocalLLaMA "Hugging Face AI Agents course is LIVE!"
  (febrero 2025, https://www.reddit.com/r/LocalLLaMA/comments/1im7un9/hugging_face_ai_agents_course_is_live ,
  solo snippets) registra "35.000 inscriptos en dos semanas" y debates tipicos: si son agentes o
  workflows agenticos, y que "los tutoriales de agentes estan hechos por gente sin experiencia
  corporativa real". Las reviews de blog que si se pudieron leer: hysenlabs.com (10/9/2026)
  concluye que sirve a "desarrolladores que ya saben Python basico y han trabajado con LLMs" y
  que "no es para principiantes absolutos"; selfmadesuccess.com distingue el certificado de
  fundamentos del de completitud, mas exigente.
- **fast.ai:** la comparativa fast.ai contra DeepLearning.AI de talent.aiinsiders.net (5/8/2026,
  leida completa) y el resumen de Reddit de julio 2026 coinciden en el elogio al enfoque top-down
  de Jeremy Howard y en el punto flaco: fast.ai no emite ningun certificado (verificado tambien
  en course.fast.ai: la pagina no ofrece ninguno).
- **Curso de RAG de EDteam:** las 5 reseñas de la pagina se leyeron completas (ver la ficha de la
  fase 3). Son positivas y con una critica util: "buen curso de introduccion", o sea, corto para
  quien busque produccion; para eso esta el curso de DeepLearning.AI de 26 h.
- **Udemy y cursos de FastAPI:** el articulo "I took 7 FastAPI courses on Udemy" de Medium
  (javarevisited, leido parcialmente) elige al curso de Eric Roby y Chad Darby como mejor
  general, y recomienda empezar igual por la documentacion oficial de FastAPI (que es gratis y de
  las mejores del ecosistema Python).
- **Cohortes de evals de Hamel Husain:** el curso pago tiene 4,7 con 897 calificaciones en Maven
  (verificado hoy) y pagina de testimonios publica (testimonial.to/ai-evals-course). El material
  gratuito asociado es el mas citado en conversaciones de ingenieria de AI 2026.

## Que NO recomendar

Con la evidencia que se pudo reunir hoy:

- **Los "full course" de 10 a 12 h de Intellipaat, Simplilearn y Edureka en YouTube.** Son
  embudos de venta hacia masterclasses y programas pagos: los videos abren con "Enroll for
  Artificial Intelligence Course" y "Book your Free Masterclass" (verificado en las descripciones
  de https://www.youtube.com/watch?v=DO-E-vpzT2o y otros). La senal de likes es floja comparada
  con el alcance (604 likes en 22.024 vistas en el video de IA de Intellipaat de abril 2026,
  verificado hoy). Ademas ensenan sobre todo ML clasico (perceptron, gradient descent, Keras),
  que es lo que el plan dice explicitamente que no hace falta. Su contenido de "IA" esta pensado
  para el examen o el bootcamp que venden.
- **Los videos motivacionales de "IA University" y similares.** Ejemplo verificado hoy:
  "Cursos de Inteligencia Artificial GRATIS 2026" (https://www.youtube.com/watch?v=HPGIS9nx_Hc ,
  2 h38, 10.827 vistas): los modulos son mentalidad, monetizacion y contenido viral, no
  ingenieria. 381 comentarios de hype no son senal tecnica.
- **Masterclasses de Udemy con senal debil o contenido generado con IA.** "AI ENGINEERING & LLM
  MASTERCLASS" (https://www.udemy.com/course/ai-engineering-llm-masterclass) dura 3 h56 y admite
  en su propia descripcion que "AI tools were used to assist with script drafting"; "The Complete
  Agentic AI Engineering Masterclass (2026)" (https://www.udemy.com/course/agentic-ai-engineering-design-build-deploy-agents)
  tiene 465 alumnos y 59 calificaciones; "AI Engineer: The Complete Career Roadmap"
  (https://www.udemy.com/course/ai-engineer-the-complete-roadmap-2026) es casi un video de
  posicionamiento profesional (muchas lecciones de 2 a 3 min). Frente a los 213.785 alumnos del
  curso de Eden Marco o los 98.814 del de FastAPI, estos cursos son ruido.
- **La Deep Learning Specialization como primer paso.** 129 h sobre material cuya ultima
  actualizacion grande fue abril de 2021 (segun el resumen de Reddit de talent.aiinsiders.net);
  el propio plan la marca como overkill para AI Engineer aplicado. Sirve despues, si se quiere
  profundidad teorica, no antes de tocar RAG.
- **El Google AI Professional Certificate (unas 8 h).** Es fluidez de IA para usuarios, no
  ingenieria, como ya dice el plan de estudios.
- **Bootcamps de ML/AI de 7.000 a 15.000 USD.** Con la oferta gratuita verificada hoy (freeCodeCamp,
  Hugging Face, DeepLearning.AI en audit, fast.ai), pagar esa cifra no se justifica. El plan ya lo
  documenta con tasas de empleo auto-reportadas e infladas.
- **"Master en n8n + Agentes IA y Automatizacion Inteligente 2026"** (Udemy, español): 625 alumnos
  y 68 calificaciones, enfoque no-code. Si el objetivo es construir, no alcanza.

## Limitaciones de la investigacion

- **Reddit y Twitter no estan conectados** en este entorno (`agent-reach doctor --json` lo
  confirma: ambos sin backend activo). Todas las opiniones de Reddit son snippets de busqueda o
  citas de blogs que resumen Reddit. Ningun hilo se pudo leer completo. Las paginas de YouTube,
  Udemy, Coursera y los blogs si se leyeron.
- **Precios de Udemy:** el widget de precio esta tras Cloudflare y no responde a clientes no
  navegadores (ni con user agent de Googlebot ni via Jina Reader, probado hoy). Los precios de
  Udemy citados vienen de tarjetas de listado de Udemy indexadas hoy y de trackers de cupones
  (CourseSpeak, 29/7/2026). Pueden diferir del precio que ve un usuario hoy. Regla practica:
  esperar la oferta de 10 a 15 USD; el precio de lista (84 a 199 USD) nadie lo paga.
- **Duraciones estimadas, no medidas:** la de 100 Days of Code (60+ h) viene de la descripcion del
  instructor; la del Hugging Face NLP Course (72 a 96 h) es una estimacion propia a partir de su
  ritmo recomendado (6 a 8 h por semana por capitulo, 12 capitulos); la Parte 2 de fast.ai (30+ h)
  viene de un blog externo. Estan marcadas donde aparecen.
- **Umbral GAIA 30% del Hugging Face Agents Course:** figura en el plan de estudios pero no se
  re-verifico hoy (la pagina de introduccion habla del reto y del leaderboard, sin el numero).
- **Resenas internas de plataformas:** DeepLearning.AI y Coursera muestran reseñas de sus
  catalogos generales, no siempre del curso puntual; donde no hay rating del curso especifico se
  marco "no verificado".
- **Precios de Coursera:** cambian con campanas (hoy se veia una campana de temporada). El rango
  citado (49 a 79 USD por programa, 59 USD/mes o 399 USD/ano de Coursera Plus) es del 5/8/2026
  segun un blog externo, no del dia de hoy.
- No se verifico el contenido interno de los videos (solo metadata y descripciones): la calidad
  pedagogica se infiere de las senales de audiencia y de las opiniones externas citadas.

## Fuentes

- Paginas de cursos abiertas hoy: deeplearning.ai (Prompt Engineering for Developers, RAG, MCP
  con Anthropic, AI Agents in LangGraph, Agentic AI, Quality and Safety, Improving Accuracy, Red
  Teaming), huggingface.co/learn (agents-course y nlp-course), ed.team/cursos/rag,
  anthropic.com/learn, course.fast.ai, langfuse.com/pricing, frontendmasters.com/join,
  platzi.com/hola, maven.com/parlance-labs/evals, hamel.dev/evals, ai.hamel.dev/eval-course,
  udemy.com (paginas de curso de FastAPI, 100 Days of Code, LangChain y LangGraph).
- YouTube (metadatos con `yt-dlp`, 25/9/2026): videos de freeCodeCamp (Python API Development,
  CS50 Python, Prompt Engineering, GenAI Essentials, Production RAG, Agentic AI, LLM
  Fine-Tuning), MoureDev, Andrej Karpathy, 3Blue1Brown, IBM Technology.
- GitHub API (25/9/2026): `huggingface/agents-course`, `dair-ai/Prompt-Engineering-Guide`,
  `microsoft/generative-ai-for-beginners`, `mlabonne/llm-course`.
- Opiniones externas: reddit.com/r/learnmachinelearning/comments/1fpt1ik (snippets),
  reddit.com/r/LocalLLaMA/comments/1im7un9 (snippets), talent.aiinsiders.net (2 articulos de
  julio y agosto 2026), hysenlabs.com, selfmadesuccess.com, turingpost.com (7 Free Courses to
  Master RAG y 12 Free Courses to Master LLMs), datacamp.com (Best RAG Courses in 2026 y Los
  mejores cursos gratuitos de IA), classcentral.com, coursespeak.com (tracker de cupones de
  Udemy), medium.com/javarevisited (7 Best Udemy Courses to Learn FastAPI), freecodecamp.org/news
  (notas de lanzamiento de sus cursos), testimonial.to/ai-evals-course.
