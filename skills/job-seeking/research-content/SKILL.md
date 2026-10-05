---
name: research-content
description: Investigar un area del banco de entrevistas contra fuentes primarias y producir preguntas nuevas citadas. Usar cuando haya que cubrir temas de una fase del plan de estudios sin preguntas en el banco, o cuando el usuario pida research de contenido de entrevistas. NO disena quizzes ni tricky follow-ups (eso es content-designer) ni captura planes (eso es capture-learning-plan).
---

# Research Content

Investigar el contenido de un area del banco de entrevistas contra fuentes
primarias, sin fabricar, y devolver preguntas nuevas en ingles con sus fuentes
citadas. El output pasa al banco `src/content/interview-questions/` bajo el
schema Zod de `src/schemas/interview-questions.ts`.

## Principios

1. **Fuentes primarias, sin fabricar.** Documentacion oficial, especificaciones,
   libros y articulos del autor original. Cada pregunta lleva de 1 a 3 fuentes
   con label y URL. Si un dato no se puede citar, no entra.
2. **Contenido en ingles.** El banco vive en ingles (regla vigente del repo). La
   UI de `/interview` es la que esta en espanol.
3. **Claims de demanda con dataset y ventana temporal.** Cuando el material
   mencione demanda de mercado ("N ofertas piden X"), citar que dataset y que
   ventana lo respaldan. Hay dos datasets verificados y con denominadores
   distintos, que no se mezclan:
   - AI Engineering Field Guide de Alexey Grigorev:
     `github.com/alexeygrigorev/ai-engineering-field-guide`, 6.964 job
     descriptions de builtin.com en seis mercados, ocho scrapes de 2026.
   - Serie de nothiring.me sobre el rol en Espana:
     `nothiring.me/blog/roles/ai-engineer-espana`, `-perfil-espana` y
     `-salario-espana`, 1.136 ofertas de IA y ML y 1.878 perfiles, julio a
     septiembre de 2026.
   Veredicto de la reevaluacion en `docs/research/ai-learning-reevaluacion-2026-10.md`.
4. **Fuentes primarias de referencia del dominio** para el track de AI: el repo
   del Field Guide (sus secciones role/, interview/ y learning-paths/) y los
   articulos de nothiring.me, ademas de la documentacion oficial de las
   tecnologias (OpenAI, Anthropic, LangChain, LangGraph, MCP, etc.).
5. **Sin duplicados.** Antes de escribir, releer el area actual del banco y no
   repetir pregunta ni id.

## Pasos

1. **Delimitar el area y los temas.** El area del banco (que es 1:1 con una fase
   del plan, ADR-0030) y los temas concretos a cubrir vienen dados por quien
   invoca la skill o por el gap contra el plan de estudios (contrato
   `src/content/learning-plan.json`, ejemplo `src/content/learning-plan.example.json`).
2. **Investigar.** Leer fuentes primarias (fetch de documentacion y articulos;
   para X, el shim de twitter de agent-reach y como fallback browser-skill).
   Anotar para cada hecho la URL exacta.
3. **Escribir preguntas nuevas** en ingles al schema del banco: id con el prefijo
   del area (los id existentes se conservan siempre; los nuevos siguen la
   numeracion del area), topic, level, roles, frequency, question, answer,
   codeBlocks (si aplica) y sources. Una idea por pregunta; respuestas que se
   puedan defender en entrevista.
4. **QA de contenido.** Verificar ids unicos en todo el banco, fuentes que
   abren, claims sin fuente eliminados y que ningun bloque rompe el schema.
5. **Entregar.** JSON validado contra `interviewQuestionBankSchema` para mergear
   en el area, con el resumen de fuentes consultadas y temas cubiertos. El
   guardado en disco lo decide quien invoca (no se commitea sin confirmacion).

## Temas prioritarios del track de AI (del veredicto de reevaluacion)

Si el area es una fase del plan de AI, cubrir si o si estos temas donde falten:
analisis de errores y metricas de evaluacion (incluida la pregunta "cuando tu
sistema empezo a fallar, como lo mediste, sobre cuantos casos y que cambio el
numero"), trade-offs ("cuando NO usarias RAG"), razonamiento de costo y
latencia, guardrails y seguridad del agente (prompt injection, exfiltracion,
tools peligrosas) y fluidez con herramientas de AI (como se promtea y se
verifica el output con agentes).
