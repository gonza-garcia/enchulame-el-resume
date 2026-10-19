# ADR-0030: Banco de entrevistas reorganizado por fases del plan de estudios

Estado: Vigente.

## Contexto

El banco de `/interview` tiene 20 áreas y la rama de AI está concentrada en una sola
(`ai-agents`), que mezcla fundamentos de LLM, prompting, RAG, agentes y evals. No refleja las
fases del plan de estudios, `/learning` necesita quizzes por fase, y hay preguntas repetidas o
mal ubicadas. Los id de pregunta llevan prefijo de área y el progreso de estudio se guarda por
id en `localStorage`, así que mover preguntas sin conservar id borraría el avance del usuario.

## Decisión

La rama de AI del banco se reorganiza en áreas nuevas 1:1 con las fases del plan, sin tag por
pregunta: el área es la fase y una sola fuente de verdad por pregunta. Las preguntas repetidas o
mal ubicadas se reubican una sola vez, en el lugar de mejor encaje con su fase, conservando su
id actual. Se agregan preguntas nuevas donde las fases tienen temas sin cobertura, siguiendo la
skill `research-content` (fuentes primarias, sin fabricar, salida citada en inglés), y salen
tricky y quizzes nuevos por fase siguiendo la skill `content-designer`. Las áreas de frontend
del banco quedan como están.

## Consecuencias

- La taxonomía de áreas del banco pasa a depender del plan de estudios: renombrar una fase
  arrastra un área.
- Conservar los id protege el progreso guardado, al costo de ids con prefijo histórico que ya
  no refleja el área actual.
- El reescaneo del banco es trabajo de contenido con QA, del porte del research original que lo
  armó, y queda registrado como ticket con las skills del repo como protocolo.

## Addendum: temas de preguntas nuevas fijados por la reevaluación (5 oct 2026)

La reevaluación del plan (`docs/research/ai-learning-reevaluacion-2026-10.md`) confirma esta
decisión sin cambios de forma (las fases del plan conservan sus id y la relación 1:1 con áreas)
y fija los temas que las preguntas nuevas deben cubrir sí o sí, porque las fuentes los marcan
como lo que se prueba en entrevistas y el banco actual no cubre: análisis de errores y métricas
de evaluación (incluida la pregunta "cuando tu sistema empezó a fallar, ¿cómo lo mediste, sobre
cuántos casos y qué cambió el número?"), trade-offs ("¿cuándo NO usarías RAG?"), razonamiento
de costo y latencia, guardrails y seguridad del agente (prompt injection, exfiltración, tools
peligrosas) y fluidez con herramientas de AI. El resto del alcance del ticket del banco sigue
igual: reubicar conservando id, eliminar duplicados y derivar tricky y quizzes por fase.

## Cierre de la Fase C (16 oct 2026)

Los temas de este addendum quedaron cubiertos con preguntas nuevas citadas y sus derivados:
evals (métricas con denominadores, origen del dataset de evals, CI vs monitoreo de
producción, confianza en un salto de score, y las preguntas de error analysis ya estaban),
RAG (long-context vs RAG, búsqueda híbrida con reranking, índice vencido y permisos),
costo y latencia (latencia percibida y shipping de GenAI en producto), seguridad (gates de
aprobación humana, la "lethal trifecta" de la inyección, calibración de autonomía) y
fluidez con herramientas de AI. Además se cubrieron con fuentes primarias los huecos que
marcan los planes de repaso (Angular, RxJS, NgRx, Storybook, Chart.js/D3) y se sumaron
memoria persistente de agentes, redacción de PII, caché semántica y LoRA a nivel concepto.
El alcance del ticket no cambió: los id existentes se conservaron, el contrato del banco no
se tocó y todo tema sin fuente primaria citable quedó fuera. El banco cerró la fase en 379
preguntas.
