# ADR-0038: Chequeo de duplicados y postulaciones previas antes de capturar

Estado: Vigente.

## Contexto

Capturar una oferta solo comparaba el nombre de carpeta (slug): ante una repetida, el
comportamiento documentado era sufijar `-2`, `-3`, etc. En la práctica eso produjo
carpetas duplicadas de una misma oferta (3pillar req-131 capturada tres veces desde tres
IDs de LinkedIn distintos, Kake dos veces) y nunca avisaba cuando la oferta ya estaba
capturada o ya postulada. El usuario pidió ser avisado, por link o por el contenido de la
oferta misma.

Los datos para detectarlo ya viven en disco: el link de origen en el frontmatter `url` de
`offer.md`, y el estado de postulación en `application.md` por carpeta (`fecha_envio`,
`estado`). Lo que faltaba era cruzarlos antes de capturar.

## Decisión

1. **Chequeo de duplicados y postulaciones previas**, paso obligatorio de
   `capture-job-offer` antes de obtener la oferta, con tres niveles:
   - **Por URL**: comparar el job id o URL del input contra `url` y `url_alternativa` de
     todos los `offer.md` de `docs/job-offers/`. Si coincide: no capturar nada y
     informar la carpeta existente, su estado (Agregada, Analizada, Adaptada) y si tiene
     `application.md` (postulada el `fecha_envio`, con su `estado`).
   - **Por contenido**: comparar empresa y rol normalizados, y el parecido del texto,
     contra las ofertas ya capturadas. Mismo aviso publicado otra vez (texto idéntico o
     casi): una sola carpeta, y el link nuevo se registra en `url_alternativa`. Texto
     parecido pero distinto: capturar normal y marcar el posible duplicado en el lote de
     preguntas del final.
   - **Por postulación**: si la carpeta candidata tiene `application.md`, avisar
     "ya postulada" con fecha y estado antes de hacer cualquier trabajo.
2. **Campo `url_alternativa`** en el frontmatter de `offer.md`: otras URLs del mismo aviso
   (publicaciones duplicadas), sin crear carpeta nueva. Puede repetirse el campo si hay
   más de una. Entra al contrato de captura.
3. El chequeo corre en modo directo y en modo app: en modo app el aviso viaja en la
   respuesta antes del JSON de captura.

## Alternativas descartadas

- **Confiar solo en la colisión de slug**: es lo que produjo los duplicados actuales; dos
  links distintos del mismo aviso generan slugs distintos y nunca chocan.
- **Índice central de ofertas (un registro JSON aparte)**: duplicaría la fuente de verdad,
  que ya es el disco bajo el contrato de carpetas (ADR-0022).
- **Similitud semántica con embeddings**: sobreingeniería para el volumen real (decenas de
  ofertas); la comparación de texto normalizado alcanza.

## Consecuencias

- Capturar una oferta repetida deja de crear carpetas `-2` salvo pedido explícito del
  usuario (ofertas distintas con el mismo slug siguen sufijando: la colisión de slug no
  desaparece).
- La detección de "ya postulada" depende de que exista `application.md`: si el usuario
  postula sin registrarlo, el sistema no lo sabe. El aviso es mejor esfuerzo sobre lo
  que hay en disco, no una verdad absoluta.
- `application.md` queda como archivo de estado reconocido por el flujo (lo escribe el
  agente cuando se postula, ver ADR-0022 para el resto del contrato de carpeta).
