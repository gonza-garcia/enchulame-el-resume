---
name: capture-learning-plan
description: Capturar el plan de estudios del usuario y escribirlo como contrato JSON validado en src/content/learning-plan.json. Usar cuando el usuario quiera cargar o actualizar su plan de estudios, o cuando la app del CV genere un prompt que referencia esta skill. Sigue el patron de capture-job-offer: modo app (output JSON) y modo directo (guardado y validacion). NO investiga contenido del banco (eso es research-content) ni disena quizzes (eso es content-designer).
---

# Capture Learning Plan

Capturar el plan de estudios del usuario (fases, recursos, skills con demanda,
roles que habilitan, anti-lista y senales de salida) y dejarlo como
`src/content/learning-plan.json`, el contrato del plan de ADR-0028, que pasa la
validacion Zod del schema `src/schemas/learning-plan.ts` en build. El plan real
del usuario es gitignored; el ejemplo commiteado es
`src/content/learning-plan.example.json` y sale de una version desidentificada.

## Modo de operacion

La skill corre en dos modos, decididos por quien la invoca:

- **Modo app**: el prompt pide devolver SOLO un bloque JSON del plan. El usuario
  lo pega en la app o donde corresponda. No escribas archivos salvo que el
  prompt lo pida explicitamente.
- **Modo directo**: el usuario pide capturar y guardar. Aplicas todos los pasos,
  incluido el guardado en disco y la validacion en build.

El output del modo app y el archivo del modo directo producen la misma
informacion: mismos campos, mismos formatos, mismo destino.

## Contrato (resumen operativo)

Campos del JSON (detalle exacto en `src/schemas/learning-plan.ts`):

- `version`, `id`, `title`: version del contrato, id del plan y titulo.
  Todo texto localizado es `{ es, en }` con los dos obligatorios.
- `roles`: orden de ataque de roles (id, name, summary). El excluyente de cada
  rol se expresa dentro del summary.
- `antiList` y `exitSignals`: listas de texto localizado.
- `skills`: catalogo con id estable, name localizado y `demand` opcional
  (label localizado, source y asOf). La demanda cuelga de la skill, nunca del
  recurso (ADR-0028), y cada claim de demanda cita dataset y ventana temporal.
- `phases`: fases ordenadas (id, order, title, duration, topics, enablesRoles,
  skillIds, interviewArea, project opcional, gate, resourceIds). Sin huecos en
  order; cada fase con al menos un recurso y un gate.
- `resources`: catalogo plano en muchos a muchos con skills (id, title como
  nombre propio sin traducir, url, creator, platform, price, duration,
  language del material, confidence opcional con fecha de captura, opinion,
  skillIds).

Reglas cruzadas que la validacion exige: skillIds y resourceIds referenciados
existentes, order de fases sin huecos, cada fase con recurso y gate, y ambos
idiomas en cada texto localizado.

## Pasos

### 1. Identificar el input

- **Plan existente en texto** (un documento como `docs/planning/plan-estudios-ai.md`, un
  outline, notas). Convertirlo al contrato campo por campo.
- **Entrevista al usuario** (si no hay documento): preguntar objetivo y
  horizonte, fases con sus gates y proyectos, recursos por fase (link, creador,
  plataforma, precio, duracion, idioma del material, opinion) y las skills que
  cada recurso enseña, con su demanda si se conoce.
- **Nada util**: pedir el material al usuario. No fabricar fases ni recursos.

### 2. Armar el contrato

- Skills con id estable en kebab-case y sin mezclar con los id del perfil: la
  union plan-perfil es por nombre normalizado y se resuelve en `/learning`, no
  en el contrato. (Si el usuario tiene su perfil cargado, se pueden alinear los
  ids a mano para que los joins salgan exactos; eso es un ajuste posterior.)
- Textos en es y en. Los titulos de recursos (nombres propios de cursos o
  libros) no se traducen; el resto de campos si.
- Demanda: solo con fuente y fecha. Datasets validos: Field Guide de Grigorev o
  serie de nothiring.me (ver `research-content`). Sin fuente, sin demanda.

### 3. Validar

- `pnpm run check && pnpm run build` con el plan guardado: el build valida el
  contrato con Zod y falla ruidosamente con referencias rotas, huecos de order
  o textos sin los dos idiomas.
- Correr tambien contra el ejemplo si se toco: `learning-plan.example.json`
  debe seguir validando.

### 4. Guardar (solo modo directo)

- Escribir `src/content/learning-plan.json` (gitignored, nunca commitear).
- Confirmar al usuario que el build quedo verde y resumir fases, recursos y
  skills capturadas.

## Limites

- Un solo plan por usuario en v1 (AI). El contrato es generico pero la app no
  tiene selector de planes.
- El progreso de estudio no vive en el contrato: es dato del usuario en
  `localStorage` (`learning-progress`), exportable e importable desde
  `/learning`.
- No commitear el plan real ni copiar datos personales al ejemplo. El ejemplo
  del producto es desidentificado por definicion (ADR-0028).
