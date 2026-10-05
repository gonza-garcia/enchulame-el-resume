# ADR-0028: Contrato del plan de estudios con demanda colgada de la skill

Estado: Vigente.

## Contexto

`/learning` necesita un plan de estudios navegable (fases ordenadas por los roles que
habilitan, recursos verificados con link, precio, duración y opinión) mapeados a skills y a la
demanda del mercado. El plan personal de su autora no puede commitearse al repo público, pero
la página sí necesita contenido de ejemplo para buildear y para que el usuario nuevo vea el
producto funcionando. Además el dato de demanda ("N ofertas piden X") no debe colgarse del
curso: un recurso hereda la demanda a través de la skill que enseña.

## Decisión

El plan es un contrato propio en JSON estructurado con Zod en build (mismo patrón que el
banco de entrevistas), distinto del perfil: `learning-plan.json` gitignored para el plan real
del usuario y `learning-plan.example.json` como plan de ejemplo. Las fases se ordenan por los
roles que habilitan; los recursos (link, precio, duración, opinión, idioma) están en relación
muchos a muchos con skills; la demanda de mercado (de la investigación de roles de AI) se
cuelga de la skill dentro del contrato del plan. Los gaps se calculan por join de skill id
entre plan y perfil. El plan de ejemplo sale del plan personal desidentificado: se quitan
nombre, diagnóstico, objetivo y horizonte, y se conservan el orden de ataque y la anti-lista
reworded en genérico.

## Consecuencias

- El progreso del usuario (hecho, en curso, skipped) no vive en el contrato: queda como dato
  del usuario y su persistencia se decide en el grilling de `/learning`.
- Cambiar la ubicación de la demanda (por ejemplo, colgarla del curso o calcularla desde las
  ofertas del usuario) cambiaría el sentido de esta decisión y del modelo de `/learning`.
- El plan de ejemplo conserva criterio curado de su autora presentado como genérico: riesgo
  aceptado y registrado.

## Addendum: fuentes de demanda verificadas (5 oct 2026)

La reevaluación del plan de estudios con las dos fuentes nuevas (detalle en
`docs/research/ai-learning-reevaluacion-2026-10.md`) confirma esta decisión sin cambios de
forma y da contenido concreto al campo `demand` del contrato: dos datasets citables con ventana
temporal, el AI Engineering Field Guide de Alexey Grigorev (6.964 descripciones de
builtin.com en seis mercados, ocho scrapes de 2026) y la serie de nothiring.me sobre España
(1.136 ofertas de IA y ML y 1.878 perfiles, julio a septiembre de 2026). La comparación del
propio artículo de nothiring valida que la demanda de skills española es transferible al target
internacional (diferencias menores a 6 puntos), y la regla de sembrar la demanda de la skill y
no del recurso se mantiene: cada dato de demanda lleva fuente y fecha de captura. El seed del
plan de ejemplo sale de la versión actualizada del plan personal desidentificada.
