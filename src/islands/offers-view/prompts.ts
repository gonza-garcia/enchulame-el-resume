export const SKILL_BUILD_PROFILE = 'skills/job-seeking/build-profile/SKILL.md';

/**
 * Puente de prompts del boton "+ Agregar perfil": el mismo mecanismo que el
 * gestor de ofertas con `capture-job-offer` (copiar el prompt y pegarlo en una
 * sesion de agente con acceso al repo). La skill no se toca: este prompt la
 * referencia y acota su modo directo a un posicionamiento nuevo.
 */
export function addProfilePrompt(): string {
  return `# Tarea: agregar un nuevo perfil (posicionamiento) a mi perfil maestro

Contexto del proyecto: repositorio de un CV con interview prep. El perfil del usuario vive en src/content/profile.json (schema en src/schemas/profile.ts) y los "perfiles" son los posicionamientos de ese perfil (cada uno con id, titulo es/en, resumen es/en, skillIds y bulletIds).

1. Leé la skill \`${SKILL_BUILD_PROFILE}\` y seguí su modo directo, acotado a un NUEVO posicionamiento (perfil): no rehagas la entrevista completa ni reescribas el perfil entero.
2. Entrevistame solo sobre el perfil nuevo: titulo (es y en), resumen de posicionamiento (es y en), las skills que lo defienden y la evidencia (experiencia y proyectos) que lo respalda.
3. Agregá el posicionamiento a src/content/profile.json respetando el schema: ids unicos, skillIds y bulletIds que existan en el perfil (crea las skills y bullets nuevas que hagan falta, con su evidencia).
4. Validá con \`pnpm run build\` antes de terminar.

Reglas: no cambies ni borres datos existentes del perfil; lo nuevo tiene que ser defendible en entrevista (sin inflar skills). El Submit de cualquier postulacion lo aprieta siempre el usuario.

Esto lo ejecuta un agente con acceso al repo en una sesion nueva: la skill y este prompt son todo tu contexto.`;
}
