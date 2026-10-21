export const SECTION_TITLES: Record<'en' | 'es', Record<string, string>> = {
  en: {
    summary: 'Professional Summary',
    skills: 'Skills',
    experience: 'Work Experience',
    education: 'Education',
    certifications: 'Certifications',
    projects: 'Personal Projects'
  },
  es: {
    summary: 'Resumen Profesional',
    skills: 'Skills',
    experience: 'Experiencia Laboral',
    education: 'Educación',
    certifications: 'Certificaciones',
    projects: 'Proyectos Personales'
  }
};

export function positioningLabel(id: string): string {
  if (id.toLowerCase() === 'ai') return 'AI';
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/** Etiqueta visible de proyecto de trabajo dentro de un empleo (formato ATS, ADR-0039). */
export const PROJECT_LABEL: Record<'en' | 'es', string> = {
  en: 'Project:',
  es: 'Proyecto:'
};
