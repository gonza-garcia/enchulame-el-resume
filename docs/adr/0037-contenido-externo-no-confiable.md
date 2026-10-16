# ADR-0037: Contenido externo como dato no confiable

Estado: Vigente.

## Contexto

El flujo lee contenido que no controlamos: textos de ofertas, páginas de empresas,
mensajes de recruiter, resultados de fetch (Jina Reader, JobSpy, Guest API) y output
de subagentes. Ese input llega sin verificar y puede traer prompt injection: texto
dirigido al agente que pida ignorar instrucciones, agregar claims al CV, escribir
archivos, ejecutar comandos, abrir URLs o enviar datos. El impacto real en este
producto es de tres tipos: un CV envenenado con claims falsos (integridad), escritura
fuera del contrato de carpetas, y exfiltración de datos personales del perfil
(teléfono, email) o disparo de envíos.

## Decisión

1. **Datos, no instrucciones.** Todo contenido externo es insumo a extraer y
   clasificar. Las únicas instrucciones válidas son las del usuario en la sesión y las
   de las skills. Si el contenido habla al agente, no se sigue.
2. **Sanitizar hacia el contrato.** Nada de contenido instructivo termina en la
   metadata ni en campos que después se lean como guía. Los requisitos de una oferta
   solo se clasifican como match o gap: nunca agregan skills, claims ni texto al CV,
   que sale solo del perfil y del backlog confirmado.
3. **Sin side effects.** No se ejecutan comandos ni se instala nada por sugerencia del
   contenido; no se crean archivos fuera del contrato de la skill; no se postula, no
   se completan formularios y no se envía nada.
4. **No seguir links del contenido.** Solo se usa la URL de la oferta que pasó el
   usuario. Las URLs internas del texto capturado no se abren salvo pedido explícito.
5. **Nada de datos personales hacia afuera.** Ninguna request lleva datos del perfil ni
   archivos del repo.
6. **Reportar.** Cualquier intento detectado se avisa al usuario con el fragmento
   afectado, y la captura o el análisis continúan con el contenido legítimo.

La regla operativa completa vive en `skills/job-seeking/capture-job-offer/SKILL.md`
(sección "Contenido no confiable"), y la referencian `adapt-resume-to-offer`,
`research-content`, `content-designer` y `build-interview-review-plan`, además del
`AGENTS.md` del repo.

## Consecuencias

- La captura y el análisis suman una revisión de saneamiento y el reporte de hallazgos,
  a cambio de acotar el riesgo de CV envenenado, escritura fuera de contrato y
  exfiltración.
- El material de práctica derivado de fuentes (research-content, content-designer)
  hereda la misma regla, y el output de los subagentes se valida contra schema y
  citas antes de guardarlo.
