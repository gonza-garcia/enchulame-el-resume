import fs from 'node:fs';
import path from 'node:path';

export type OfferState = 'agregada' | 'analizada' | 'adaptada';

export interface OfferMeta {
  empresa: string;
  rol: string;
  fecha: string;
  url: string | null;
  modalidad: string;
  location: string | null;
  salario: string | null;
  recruiter: string | null;
}

export interface OfferListing {
  slug: string;
  meta: OfferMeta;
  estado: OfferState;
  /** Oferta ficticia de demostracion: la unica que entra en un build publicable. */
  demo: boolean;
  hasOffer: boolean;
  hasReport: boolean;
  hasAdapted: boolean;
  hasCoverLetter: boolean;
  hasReviewPlan: boolean;
  matchScore: number | null;
}

export const JOBS_DIR = 'docs/job-offers';
export const OFFER_FILE = 'offer.md';
export const REPORT_FILE = 'match-report.md';
export const ADAPTED_FILE = 'adapted-resume.json';
export const COVER_LETTER_FILE = 'cover-letter.md';
export const REVIEW_PLAN_FILE = 'interview-review-plan.json';

/**
 * Que ofertas entran en el listado. En dev se ve todo: es la app viva con los
 * datos reales del usuario. En un build de produccion solo entran las ofertas
 * demo (ficticias), salvo que se pida explicitamente OFFERS_SOURCE=local, que es
 * lo que usan `pnpm run build:personal` y la suite E2E.
 */
export function offersSource(): 'demo' | 'local' {
  const explicit = process.env.OFFERS_SOURCE;
  if (explicit === 'local' || explicit === 'demo') return explicit;
  return import.meta.env.DEV ? 'local' : 'demo';
}

/** Oferta ficticia de demostracion: se marca con `demo: true` en el frontmatter. */
export function isDemoOffer(raw: string): boolean {
  return (parseFrontmatter(raw).demo || '').toLowerCase() === 'true';
}

/** Cover letter ya guardada por la skill, lista para mostrar. */
export interface CoverLetterFile {
  subject: string | null;
  letter: string;
  locale: 'en' | 'es';
}

export function parseCoverLetterFile(raw: string): CoverLetterFile {
  const fm = parseFrontmatter(raw);
  return {
    subject: fm.subject && fm.subject !== 'N/A' ? fm.subject : null,
    letter: stripFrontmatter(raw).trim(),
    locale: fm.locale === 'es' ? 'es' : 'en'
  };
}

export function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm: Record<string, string> = {};
  if (!match) return fm;
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) fm[key] = value;
  }
  return fm;
}

export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildSlug(empresa: string, rol: string, fecha: string): string {
  return `${fecha}-${slugify(empresa)}-${slugify(rol)}`;
}

function metaFromOfferMd(slug: string, raw: string): OfferMeta {
  const fm = parseFrontmatter(raw);
  return {
    empresa: fm.empresa || 'Unknown',
    rol: fm.rol || 'Unknown',
    fecha: fm.fecha || slug.slice(0, 10),
    url: fm.url && fm.url !== 'N/A' ? fm.url : null,
    modalidad: fm.modalidad || 'unknown',
    location: fm.location || null,
    salario: fm.salario && fm.salario !== 'N/A' ? fm.salario : null,
    recruiter: fm.recruiter && fm.recruiter !== 'N/A' ? fm.recruiter : null
  };
}

/** Lista fisica de ofertas en docs/job-offers con estado derivado del disco. */
export function listOffers(cwd: string = process.cwd()): OfferListing[] {
  const root = path.resolve(cwd, JOBS_DIR);
  if (!fs.existsSync(root)) return [];

  const source = offersSource();
  const offers: OfferListing[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const dir = path.join(root, slug);

    const hasOffer = fs.existsSync(path.join(dir, OFFER_FILE));
    if (!hasOffer) continue;

    const raw = fs.readFileSync(path.join(dir, OFFER_FILE), 'utf-8');
    const demo = isDemoOffer(raw);
    if (source === 'demo' && !demo) continue;

    const hasReport = fs.existsSync(path.join(dir, REPORT_FILE));
    const hasAdapted = fs.existsSync(path.join(dir, ADAPTED_FILE));
    const hasCoverLetter = fs.existsSync(path.join(dir, COVER_LETTER_FILE));
    const hasReviewPlan = fs.existsSync(path.join(dir, REVIEW_PLAN_FILE));

    const estado: OfferState = hasAdapted && hasReport
      ? 'adaptada'
      : hasReport
        ? 'analizada'
        : 'agregada';

    let matchScore: number | null = null;
    if (hasReport) {
      const fm = parseFrontmatter(fs.readFileSync(path.join(dir, REPORT_FILE), 'utf-8'));
      const parsed = parseInt(fm.match_score || '', 10);
      if (Number.isFinite(parsed)) matchScore = parsed;
    }

    offers.push({
      slug,
      meta: metaFromOfferMd(slug, raw),
      estado,
      demo,
      hasOffer,
      hasReport,
      hasAdapted,
      hasCoverLetter,
      hasReviewPlan,
      matchScore
    });
  }

  offers.sort((a, b) => b.slug.localeCompare(a.slug));
  return offers;
}

export interface OfferDetail {
  slug: string;
  offerRaw: string;
  reportRaw: string | null;
  adaptedResume: unknown | null;
  coverLetterRaw: string | null;
}

/** Contenido completo de una oferta para el render del split-view. */
export function readOfferDetail(slug: string, cwd: string = process.cwd()): OfferDetail | null {
  const dir = path.resolve(cwd, JOBS_DIR, slug);
  if (!fs.existsSync(path.join(dir, OFFER_FILE))) return null;
  const offerRaw = fs.readFileSync(path.join(dir, OFFER_FILE), 'utf-8');
  const reportPath = path.join(dir, REPORT_FILE);
  const adaptedPath = path.join(dir, ADAPTED_FILE);
  const coverLetterPath = path.join(dir, COVER_LETTER_FILE);
  const reportRaw = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf-8') : null;
  let adaptedResume: unknown = null;
  if (fs.existsSync(adaptedPath)) {
    try {
      adaptedResume = JSON.parse(fs.readFileSync(adaptedPath, 'utf-8'));
    } catch {
      adaptedResume = null;
    }
  }
  const coverLetterRaw = fs.existsSync(coverLetterPath)
    ? fs.readFileSync(coverLetterPath, 'utf-8')
    : null;
  return { slug, offerRaw, reportRaw, adaptedResume, coverLetterRaw };
}
