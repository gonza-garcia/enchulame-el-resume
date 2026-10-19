# ADR-0032: Cover letter propuesta y guardada por la skill, sin agente externo

Estado: Vigente.

## Contexto

La cover letter era el único artefacto del flujo que pedía dos idas y vueltas con un
agente externo: la app armaba un prompt, el usuario lo copiaba a otro agente, pegaba el
JSON de la carta, la revisaba en un modal editable, confirmaba, y recién ahí la app
armaba un segundo prompt para que otro agente escribiera `cover-letter.md` verbatim.
Dos rondas de copiar y pegar para un texto que ya nace en el repo y que se guarda al
lado del resto de los archivos de la oferta.

Ese flujo además dejaba piezas sueltas: un componente de vista previa editable, un
schema de JSON de carta y un composer de markdown que solo usaban esos dos round trips.

## Decisión

La cover letter la produce y guarda `adapt-resume-to-offer`, la misma skill que genera
el CV adaptado:

1. Al quedar aprobado el CV adaptado, la skill **ofrece** escribir la carta (el usuario
   no la pide).
2. La muestra completa y pide aprobación con pregunta interactiva. Si el usuario pide
   cambios, se reescribe y se vuelve a mostrar.
3. Con el OK, la skill escribe `docs/job-offers/<slug>/cover-letter.md` directo, igual
   que `offer.md`, `match-report.md` y `adapted-resume.json`. Sin prompts de guardado y
   sin otro agente de por medio.

En la app se elimina el flujo de cover letter: se van el modal de captura por JSON, la
vista previa editable, `coverLetterPrompt`, `coverLetterFilesForOffer`,
`coverLetterJsonSchema`, `parseCoverLetter` y `composeCoverLetterMd`. Lo que queda es un
**modal de solo lectura**, con el botón visible únicamente cuando `cover-letter.md`
existe en disco, y dos exportaciones desde ahí: PDF (impresión del navegador) y DOCX.

El subject va en el frontmatter del archivo, nunca como heading dentro de la carta, que
es lo que la app parsea para mostrarlo.

## Consecuencias

- Cero copiar y pegar para la carta: el único intermediario es el agente que corre la
  skill con acceso al repo.
- La app deja de componer cartas: solo lee, muestra y exporta. El texto aprobado es el
  que queda en disco.
- El contrato de archivos no cambia: misma carpeta, mismo nombre, mismo lugar. El estado
  de la oferta sigue sin depender de la carta.
- El modal de lectura y el export DOCX aplican también al CV (menú "Export to" del
  header), con la librería `docx` del lado del cliente.
