import type { AnalysisJson, CoverLetterJson } from './contract';
import { composeMatchReport, composeCoverLetterMd } from './contract';

export const SKILL_CAPTURE = 'skills/job-seeking/capture-job-offer/SKILL.md';
export const SKILL_ADAPT = 'skills/job-seeking/adapt-resume-to-offer/SKILL.md';

export const OFFER_PLACEHOLDER = '[INSERTAR TEXTO DE OFERTA AQUI]';

const JSON_RULES = `Reglas de output:
- Devolv\u00e9 SOLO un bloque \`\`\`json en tu respuesta final, sin texto alrededor.
- Sin em-dashes, en-dashes ni flechas en el contenido: us\u00e1 guiones simples, palabras o comas.
- No inventes campos que la oferta no declara: us\u00e1 null donde corresponda.`;

function commonContext(): string {
  return `Contexto del proyecto: repositorio de un CV con interview prep. El perfil del usuario vive en src/content/profile.json (si no existe, el build usa el ejemplo ficticio src/content/profile.example.json) y las ofertas capturadas viven en docs/job-offers/. Est\u00e1s corriendo en una sesi\u00f3n nueva, as\u00ed que lo primero que hac\u00e9s es leer la skill indicada para conocer los pasos exactos.`;
}

export function capturePrompt(options: {
  link: string | null;
  ofertaTexto: string | null;
}): string {
  const { link, ofertaTexto } = options;
  const input =
    link
      ? `El link de la oferta es:
${link}
Si el texto completo de la oferta no es accesible con la estrategia de la skill, pedime el texto pegado.`
      : ofertaTexto && ofertaTexto.trim()
        ? `El texto completo de la oferta (ya lo tengo, no hace falta pedirlo):

${ofertaTexto.trim()}`
        : `El texto completo de la oferta est\u00e1 ac\u00e1 abajo entre los marcadores (el usuario lo completa al pegar este prompt):

${OFFER_PLACEHOLDER}`;
  return `# Tarea: capturar una oferta de trabajo

${commonContext()}

1. Le\u00e9 la skill \`${SKILL_CAPTURE}\` y segui sus pasos en modo app (devolver JSON, no escribir archivos).
2. Modo de input:
${input}
3. Extra\u00e9 la metadata (empresa, rol, fecha, url, modalidad, location, salario, recruiter, descripcion_empresa) y el texto verbatim de la oferta.

${JSON_RULES}
La forma del JSON exacta est\u00e1 definida en la skill (seccion "Devolver el JSON (modo app)").

Esto lo ejecuta un agente externo sin contexto previo del proyecto: la skill y este prompt son todo tu contexto.`;
}

export function analyzePrompt(offer: {
  empresa: string;
  rol: string;
  slug: string;
}): string {
  return `# Tarea: analizar el match de una oferta contra el CV base

${commonContext()}

1. Le\u00e9 la skill \`skills/job-seeking/adapt-resume-to-offer/SKILL.md\` y segui sus pasos en modo app (devolver JSON de analisis, no escribir archivos).
2. Oferta objetivo: ${offer.empresa} - ${offer.rol} (carpeta docs/job-offers/${offer.slug}).
3. Le\u00e9 el CV base en src/content/resume.json y la oferta capturada en docs/job-offers/${offer.slug}/offer.md.
4. Devolv\u00e9 el JSON de analisis con match_score, match_fuerte, gaps_parciales, gaps_reales, ajustes_recomendados, temas_entrevista y score_explicacion.

${JSON_RULES}
El score es honesto: no inflar. Si un gap es real, queda como gap.

Esto lo ejecuta un agente externo sin contexto previo: la skill y este prompt son todo tu contexto.`;
}

export function adaptPrompt(offer: { empresa: string; rol: string; slug: string }): string {
  return `# Tarea: generar el CV adaptado para una oferta

${commonContext()}

1. Le\u00e9 la skill \`skills/job-seeking/adapt-resume-to-offer/SKILL.md\` y segui sus pasos en modo app (devolver JSON, no escribir archivos).
2. Oferta objetivo: ${offer.empresa} - ${offer.rol} (carpeta docs/job-offers/${offer.slug}/).
3. Le\u00e9 el CV base en src/content/resume.json, el schema en src/schemas/resume.ts, y si existen docs/job-offers/${offer.slug}/match-report.md y offer.md.
4. Aplic\u00e1 los ajustes del analisis sobre una copia del CV base, en ambos locales (es y en), manteniendo el schema exacto.
5. Devolv\u00e9 SOLO un bloque \`\`\`json con el CV adaptado completo (misma forma que resume.json: es + en). Sin texto alrededor.

Reglas de contenido (estan detalladas en la skill): solo skills defendibles en entrevista, los gaps reales quedan como gaps, titulo Frontend Developer, sin em-dashes ni en-dashes ni flechas, "incl." prohibido.

Esto lo ejecuta un agente externo sin contexto previo: la skill y este prompt son todo tu contexto.`;
}

export interface FileToWrite {
  path: string;
  content: string;
}

export function savePrompt(
  files: FileToWrite[],
  skillHint: string
): string {
  const block = files
    .map((f) => `RUTA: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join('\n\n');
  return `# Tarea: guardar archivos verbatim (sin interpretar)

Estas en la raiz del repositorio. Tu trabajo es mec\u00e1nico: crear los archivos exactamente con el contenido que te doy, sin corregirlos, sin reformatearlos, sin agregar ni quitar nada. Si un archivo ya existe, reemplazalo.

${skillHint ? `Referencia de contexto (contrato de carpetas): \`${skillHint}\` (leelo solo si necesitas el contexto del contrato).` : ''}

Archivos a escribir:

${block}

Al terminar, verific\u00e1 que los archivos existen con ls y confirm\u00e1 las rutas creadas. No ejecutes build ni tests.`;
}

export function coverLetterPrompt(offer: { empresa: string; rol: string; slug: string }): string {
  return `# Tarea: escribir la cover letter de una oferta

${commonContext()}

1. Le\u00e9 la skill \`skills/job-seeking/adapt-resume-to-offer/SKILL.md\`, seccion "Cover letter", y segui sus pasos en modo app (devolver JSON, no escribir archivos).
2. Oferta objetivo: ${offer.empresa} - ${offer.rol} (carpeta docs/job-offers/${offer.slug}/).
3. Le\u00e9 docs/job-offers/${offer.slug}/offer.md, match-report.md si existe, y adapted-resume.json si existe (si no, src/content/resume.json).
4. Idioma: el de la oferta. Estructura de 3 a 4 parrafos, 250 a 350 palabras, claims solo del CV y el match report, gaps sin disimular, numeros reales.
5. Mostrame la carta completa y preguntame si apruebo el texto antes de devolver el JSON final. Si pido cambios, reescribila y mostrame la version nueva.
6. Devolv\u00e9 SOLO un bloque \`\`\`json con { "subject": string o null, "letter": "texto completo con parrafos separados por doble salto", "locale": "en" o "es", el idioma usado en la carta }. Sin texto alrededor.

${JSON_RULES}

Esto lo ejecuta un agente externo sin contexto previo: la skill y este prompt son todo tu contexto.`;
}

export function coverLetterFilesForOffer(
  slug: string,
  meta: { empresa: string; rol: string; fecha: string },
  letter: CoverLetterJson
): FileToWrite[] {
  return [
    {
      path: `docs/job-offers/${slug}/cover-letter.md`,
      content: composeCoverLetterMd(meta, letter)
    }
  ];
}

export function analysisFilesForOffer(slug: string, analysis: AnalysisJson): FileToWrite[] {
  return [
    { path: `docs/job-offers/${slug}/match-report.md`, content: composeMatchReport(analysis) }
  ];
}

export function adaptedFilesForOffer(slug: string, adapted: unknown): FileToWrite[] {
  return [
    {
      path: `docs/job-offers/${slug}/adapted-resume.json`,
      content: JSON.stringify(adapted, null, 2) + '\n'
    }
  ];
}
