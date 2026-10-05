---
name: content-designer
description: Disenar tricky follow-ups y quizzes (MCQs y escenarios de codigo) a partir de un banco de entrevistas ya validado. Usar cuando haya que derivar material de practica por area o por fase del plan de estudios. NO investiga contenido nuevo (eso es research-content) ni captura planes (eso es capture-learning-plan).
---

# Content Designer

Disenar los derivados de practica de un area del banco de entrevistas: tricky
follow-ups por pregunta y quizzes (MCQs y escenarios de codigo) para esa area,
a partir de preguntas ya validadas. El output pasa al archivo
`<area>.tricky-quiz.json` bajo el schema Zod de
`src/schemas/interview-questions.ts` (`interviewTrickyQuizSchema`).

## Principios

1. **Derivar, no inventar.** Cada tricky y cada pregunta de quiz sale de una
   pregunta real del banco de ese area. El contenido nuevo es la formulacion de
   la trampa, no el tema.
2. **Contenido en ingles**, igual que el banco.
3. **Fidelidad al schema**: `trickies` son grupos por id de pregunta con 1 a 2
   items (question, answer, trap); el quiz tiene 10 a 12 MCQs (4 opciones, una
   correcta, con explanation) y 3 a 4 escenarios (prompt, code, modelAnswer,
   rubric de 3 a 5 criterios).
4. **Calidad de distractor.** Los MCQs se aprueban con la pregunta "una persona
   que estudio el tema la acierta; una que solo imita vocabulario la falla".
   Las opciones incorrectas son errores tipicos reales, no relleno.
5. **Escenarios de codigo chicos y ejecutables en la cabeza**: una pieza de
   codigo, una falla o decision concreta, un modelAnswer que justifique.

## Pasos

1. **Leer el area del banco** (`src/content/interview-questions/<area>.json`)
   y su tricky-quiz actual si existe.
2. **Elegir la cobertura**: cada pregunta con tricky merece al menos un item; los
   MCQs cubren los topic de mayor frequency primero; los escenarios eligen los
   temas donde hay codeBlocks o decisiones de diseno.
3. **Disenar** tricky groups, MCQs y escenarios en ingles, derivados de las
   respuestas del banco (que ya tienen fuentes citadas).
4. **QA**: ids unicos, respuestas correctas verificadas contra la fuente de la
   pregunta original, rubrics evaluables, sin duplicados respecto del archivo
   existente.
5. **Entregar** el JSON validado contra `interviewTrickyQuizSchema`, con el
   mapeo tricky/pregunta de origen. El guardado en disco lo decide quien invoca.

## Relacion con las fases del plan

Cuando el area corresponda a una fase del plan de estudios (`interviewArea` de
la fase en el contrato del plan), el quiz de ese area es el quiz por fase que
`/learning` enlaza (ADR-0029). Disenar pensando en que sirva como cierre
practico de la fase: los topic mas pedidos de esa fase primero.
