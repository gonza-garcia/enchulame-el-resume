import type { ResumeLocale } from '../schemas/resume';

const LABELS = {
  en: {
    about: 'ABOUT',
    experience: 'EXPERIENCE',
    education: 'EDUCATION',
    certifications: 'LICENSES & CERTIFICATIONS',
    skills: 'SKILLS',
    contact: 'CONTACT',
    projects: 'PROJECTS',
    phone: 'Phone',
    email: 'Email',
    location: 'Location',
    linkedin: 'LinkedIn',
    github: 'GitHub'
  },
  es: {
    about: 'ACERCA DE',
    experience: 'EXPERIENCIA LABORAL',
    education: 'EDUCACIÓN',
    certifications: 'LICENCIAS Y CERTIFICACIONES',
    skills: 'SKILLS',
    contact: 'CONTACTO',
    projects: 'PROYECTOS',
    phone: 'Teléfono',
    email: 'Email',
    location: 'Ubicación',
    linkedin: 'LinkedIn',
    github: 'GitHub'
  }
} as const;

export function generateLinkedInText(data: ResumeLocale, lang: 'en' | 'es' = 'en'): string {
  const t = LABELS[lang];
  const lines: string[] = [];

  lines.push(`${data.name} - ${data.title}`);
  lines.push('='.repeat(60));
  lines.push('');

  lines.push(t.about);
  lines.push('-'.repeat(60));
  lines.push(data.summary);
  lines.push('');

  lines.push(t.experience);
  lines.push('-'.repeat(60));
  for (const job of data.experience) {
    lines.push(`${job.company} | ${job.role} | ${job.startDate} - ${job.endDate}`);
    for (const project of job.projects) {
      const projectLine = [project.name, project.url, `${project.startDate} - ${project.endDate}`].filter(Boolean).join(' | ');
      lines.push(`  ${projectLine}`);
      for (const bullet of project.bullets) {
        lines.push(`    - ${bullet}`);
      }
    }
    lines.push('');
  }

  lines.push(t.education);
  lines.push('-'.repeat(60));
  for (const edu of data.education) {
    lines.push(`${edu.institution} | ${edu.degree} | ${edu.startDate} - ${edu.endDate}`);
    if (edu.note) lines.push(`  ${edu.note}`);
  }
  lines.push('');

  lines.push(t.certifications);
  lines.push('-'.repeat(60));
  for (const cert of data.certifications) {
    lines.push(`${cert.name}`);
    if (cert.note) lines.push(`  ${cert.note}`);
  }
  lines.push('');

  lines.push(t.skills);
  lines.push('-'.repeat(60));
  for (const skill of data.skills) {
    lines.push(`${skill.category}: ${skill.items}`);
  }
  lines.push('');

  lines.push(t.contact);
  lines.push('-'.repeat(60));
  lines.push(`${t.phone}: ${data.contact.phone}`);
  lines.push(`${t.email}: ${data.contact.email}`);
  lines.push(`${t.location}: ${data.contact.location}`);
  lines.push(`${t.linkedin}: ${data.contact.linkedin}`);
  lines.push(`${t.github}: ${data.contact.github}`);
  lines.push('');

  if (data.projects.length > 0) {
    lines.push(t.projects);
    lines.push('-'.repeat(60));
    for (const project of data.projects) {
      const meta = [project.url, project.date].filter(Boolean).join(' | ');
      lines.push(`${project.name}${meta ? ' | ' + meta : ''}`);
      lines.push(`  ${project.description}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}