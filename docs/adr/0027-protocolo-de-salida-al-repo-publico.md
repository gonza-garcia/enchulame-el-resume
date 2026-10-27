# ADR-0027: Protocolo de salida al repo público

Estado: Vigente.

## Contexto

La historia de este repo está pushada en GitHub y contiene el CV personal, ofertas reales,
cover letters, decisiones de carrera y de hosting. Un `git filter-repo` no la salva: reescribe
los SHAs igual, exige purgar paths, mensajes y blobs a la vez, deja cualquier archivo perdido
como leak, y los objetos viejos siguen accesibles por SHA en GitHub un tiempo. El criterio de
aceptación original pide además migrar los issues a un repo privado de planning.

## Decisión

El repo público del producto se crea como repo nuevo desde un commit huérfano con solo código
genérico, schemas y datos demo. La historia personal jamás se hace push ahí. Este repo se
renombra con el sufijo `-planning`, queda privado para siempre y conserva los issues,
los documentos personales y la historia como legado; el criterio del ticket sobre migrar
issues se cumple en su intención, que es que los issues y los datos personales nunca queden a
la vista pública. Cada usuario despliega desde su propia instancia: fork privado del repo
público con sus datos commiteados. `git filter-repo` queda descartado.

El criterio de clasificación es: genérico es lo que otro usuario puede usar tal cual sin que
le hable de la vida de su autora o autor; personal es lo que lo identifica o describe a él o a
terceros reales, y todo archivo que los contenga. Los datos demo son siempre ficticios
(persona y empresas inventadas), nunca datos reales con nombres cambiados.

## Consecuencias

- Se pierde a propósito la historia de desarrollo del producto en el repo público: su memoria
  vive en los ADRs de producto y en el planning privado.
- La ejecución del protocolo (renombrar, crear el repo público, exportar lo genérico, montar
  la instancia) es un trabajo mecánico posterior, verificable con un chequeo de marcadores
  personales y con build y tests verdes sobre la demo.
- El despliegue de frontends se mantiene en Cloudflare Pages (ADR-0016 reescrito en genérico),
  con Coolify como respaldo documentado.
