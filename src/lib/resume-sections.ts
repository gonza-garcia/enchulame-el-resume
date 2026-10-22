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

/** Etiqueta visible de la asignación por cliente dentro de un empleo (ADR-0039 v4). */
export const CLIENT_LABEL: Record<'en' | 'es', string> = {
  en: 'Client:',
  es: 'Cliente:'
};

/**
 * Anos compactos de una asignacion ("2023-2026"). El detalle completo vive en el
 * JSON; en el CV los anos van entre parentesis dentro de la linea de cliente.
 */
export function projectYears(startDate: string, endDate: string): string {
  const start = (startDate.match(/\d{4}/g) ?? [])[0];
  const endYears = endDate.match(/\d{4}/g) ?? [];
  const end = endYears[endYears.length - 1] ?? start;
  if (!start) return end ?? '';
  if (!end || start === end) return start;
  return `${start}-${end}`;
}

/**
 * Linea de cliente dentro de un empleo:
 * "Client: Aeronix (2023-2026) | cargo operations console".
 * El nombre del proyecto sigue la convencion "Marca cliente - descriptor" (ADR-0039)
 * y el separador " - " permite mostrar cliente y descriptor por separado, con los
 * anos justo despues del cliente. Sin separador, el nombre va completo.
 */
export function clientBlock(name: string, startDate: string, endDate: string, locale: 'en' | 'es'): string {
  const years = projectYears(startDate, endDate);
  const label = CLIENT_LABEL[locale];
  const sep = name.indexOf(' - ');
  if (sep > 0) {
    return `${label} ${name.slice(0, sep)} (${years}) | ${name.slice(sep + 3)}`;
  }
  return `${label} ${name} (${years})`;
}
