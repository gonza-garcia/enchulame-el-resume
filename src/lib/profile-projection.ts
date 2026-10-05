import type {
  Certification,
  Education,
  Experience,
  PersonalProject,
  ResumeLocale,
  SkillLine
} from '../schemas/resume';
import type { Bullet, Language, LocalizedText, Locale, Profile, Skill } from '../schemas/profile';

export interface BilingualProjection {
  es: ResumeLocale;
  en: ResumeLocale;
}

const LANGUAGES_CATEGORY: Record<Locale, string> = {
  es: 'Idiomas',
  en: 'Languages'
};

function pick(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

function formatSkillItem(skill: Skill, locale: Locale): string {
  const name = pick(skill.name, locale);
  return skill.evidence ? `${name} (${pick(skill.evidence, locale)})` : name;
}

function formatLanguageItem(language: Language, locale: Locale): string {
  const details = [pick(language.level, locale), language.evidence ? pick(language.evidence, locale) : null]
    .filter(Boolean)
    .join(', ');
  return `${pick(language.name, locale)} (${details})`;
}

function projectSkillLines(profile: Profile, skillIds: string[], locale: Locale): SkillLine[] {
  const byCategory = new Map<string, string[]>();
  for (const skillId of skillIds) {
    const skill = profile.skills.find((candidate) => candidate.id === skillId);
    if (!skill) {
      throw new Error(`Unknown skill id "${skillId}" while projecting skills`);
    }
    const category = pick(skill.category, locale);
    const items = byCategory.get(category) ?? [];
    items.push(formatSkillItem(skill, locale));
    byCategory.set(category, items);
  }

  const lines: SkillLine[] = [...byCategory.entries()].map(([category, items]) => ({
    category,
    items: items.join(', ')
  }));

  if (profile.facts.languages.length > 0) {
    lines.push({
      category: LANGUAGES_CATEGORY[locale],
      items: profile.facts.languages.map((language) => formatLanguageItem(language, locale)).join(', ')
    });
  }
  return lines;
}

function bulletOrder(bulletIds: string[]): Map<string, number> {
  return new Map(bulletIds.map((bulletId, index) => [bulletId, index]));
}

function orderBullets(bullets: Bullet[], order: Map<string, number>): Bullet[] {
  return bullets
    .filter((bullet) => order.has(bullet.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

function projectExperience(profile: Profile, bulletIds: string[], locale: Locale): Experience[] {
  const order = bulletOrder(bulletIds);
  const result: Experience[] = [];

  for (const job of profile.facts.experience) {
    const projects = job.projects
      .map((project) => ({
        name: pick(project.name, locale),
        url: project.url,
        startDate: pick(project.startDate, locale),
        endDate: pick(project.endDate, locale),
        bullets: orderBullets(project.bullets, order).map((bullet) => pick(bullet.text, locale))
      }))
      .filter((project) => project.bullets.length > 0);

    if (projects.length === 0) continue;

    result.push({
      company: pick(job.company, locale),
      role: pick(job.role, locale),
      startDate: pick(job.startDate, locale),
      endDate: pick(job.endDate, locale),
      location: job.location ? pick(job.location, locale) : undefined,
      projects
    });
  }
  return result;
}

function projectEducation(profile: Profile, locale: Locale): Education[] {
  return profile.facts.education.map((entry) => ({
    institution: pick(entry.institution, locale),
    degree: pick(entry.degree, locale),
    startDate: pick(entry.startDate, locale),
    endDate: pick(entry.endDate, locale),
    note: entry.note ? pick(entry.note, locale) : undefined
  }));
}

function projectCertifications(profile: Profile, locale: Locale): Certification[] {
  return profile.facts.certifications.map((entry) => ({
    name: pick(entry.name, locale),
    note: entry.note ? pick(entry.note, locale) : undefined
  }));
}

function projectPersonalProjects(profile: Profile, locale: Locale): PersonalProject[] {
  return profile.facts.projects.map((project) => ({
    name: pick(project.name, locale),
    url: project.url,
    date: project.date ? pick(project.date, locale) : undefined,
    description: pick(project.description, locale)
  }));
}

export function projectProfile(profile: Profile, positioningId: string, locale: Locale): ResumeLocale {
  const positioning = profile.positionings.find((candidate) => candidate.id === positioningId);
  if (!positioning) {
    throw new Error(`Unknown positioning id "${positioningId}"`);
  }

  return {
    name: pick(profile.identity.name, locale),
    title: pick(positioning.title, locale),
    contact: {
      phone: profile.identity.contact.phone,
      email: profile.identity.contact.email,
      location: pick(profile.identity.contact.location, locale),
      linkedin: profile.identity.contact.linkedin,
      github: profile.identity.contact.github
    },
    summary: pick(positioning.summary, locale),
    skills: projectSkillLines(profile, positioning.skillIds, locale),
    experience: projectExperience(profile, positioning.bulletIds, locale),
    education: projectEducation(profile, locale),
    certifications: projectCertifications(profile, locale),
    projects: projectPersonalProjects(profile, locale)
  };
}

export function projectBilingual(profile: Profile, positioningId: string): BilingualProjection {
  return {
    es: projectProfile(profile, positioningId, 'es'),
    en: projectProfile(profile, positioningId, 'en')
  };
}

export function projectAllPositionings(profile: Profile): Record<string, BilingualProjection> {
  const projections: Record<string, BilingualProjection> = {};
  for (const positioning of profile.positionings) {
    projections[positioning.id] = projectBilingual(profile, positioning.id);
  }
  return projections;
}
