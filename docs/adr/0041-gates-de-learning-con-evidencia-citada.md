# ADR-0041: Gates de `/learning` con evidencia citada

Estado: Vigente.

## Contexto

El acuerdo de coordinación con el agente de evidencias (proyecto externo del
autor, fuera de este repo) le da a ese agente la dueñía del estado y de
la evidencia de los gates que sus rebanadas producen (Fases 3, 5 y 1-cloud del
plan). `/learning` agrega y presenta **citando esa evidencia** (commit / URL /
archivo) y **nunca inventa estado**.

La brecha era que los gates se marcaban a mano por el usuario
(`learning-progress` en `localStorage`, ADR-0029) y no existía ninguna capa que
presentara evidencia externa: el "cumplido" era una afirmación sin respaldo
visible.

## Decisión

1. **La evidencia es una cita, no un boolean**: cada cita lleva `type`
   (`commit` | `url` | `file`), `ref` (el puntero verificable: hash, URL o
   ruta), `label` (qué demuestra, localizado), `asOf` (fecha de la evidencia) y
   `source` (quién la produjo). El contrato vive en `planEvidenceSchema`
   (`src/schemas/learning-plan.ts`).
2. **El estado se deriva, no se guarda**: no existe ningún campo `done` en el
   contrato del plan. Un gate se presenta como "cumplido con evidencia citada"
   solo si trae citas; sin citas, el estado es el marcado manual del usuario
   ("marcado a mano"); sin nada, "pendiente".
3. **Contrato aditivo**: `planPhaseSchema` suma `gateEvidence` opcional. `gate`
   sigue siendo el texto localizado del criterio, así el parche del plan B y los
   planes ya redactados siguen siendo solo datos, y `version: 1` no cambia.
4. **Sin marcado manual en gates con evidencia**: si el gate tiene citas, la UI
   reemplaza el toggle por la lista de citas. El dueño del estado es quien
   produce la evidencia (el agente de evidencias, para sus rebanadas); un override manual
   inventaría estado otra vez.
5. **El resumen desglosa**: "gates cumplidos" muestra cuántos son con evidencia
   citada y cuántos marcados a mano, para que el origen del estado sea visible
   de un vistazo.
6. El formato aplica igual en el schema, la isla de `/learning` y la skill
   `capture-learning-plan`, que es la que escribe el plan.

## Alternativas descartadas

- **Un boolean `done` en el gate del plan**: es exactamente el estado inventado
  que el acuerdo prohíbe; además se desincroniza de la evidencia real.
- **Dejar el toggle manual como override sobre la evidencia**: permite marcar
  "cumplido" sin respaldo, que es la brecha que se quiere cerrar.
- **Mapear la evidencia a `learning-progress` (localStorage)**: duplicaría el
  estado en un store local por usuario y perdería la cita de origen; la
  evidencia pertenece al plan, no al progreso del navegador.
- **Hacer el campo `gateEvidence` obligatorio**: los gates sin rebanadas del
  agente de evidencias (fases propias del usuario) no tienen evidencia externa y seguirán
  marcándose a mano.

## Consecuencias

- `/learning` presenta los gates de las rebanadas del agente de evidencias con sus citas
  (commit / URL / archivo, con fecha y fuente) y solo los demás se marcan a mano.
- El plan real, cuando se capture, podrá ir creciendo con las citas que el agente
  de evidencias produzca; no requiere cambio de schema.
- El `learning-progress` del navegador (ADR-0029) sigue vivo para recursos y
  para los gates sin evidencia; su export/import no cambia.
- Tocar el contrato del plan activa el aviso de resync al agente de evidencias
  (acuerdo de coordinación interno, fuera de este repo).
