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
  hasOffer: boolean;
  hasReport: boolean;
  hasAdapted: boolean;
  hasCoverLetter: boolean;
  matchScore: number | null;
}

export const JOBS_DIR = 'docs/job-offers';
export const OFFER_FILE = 'offer.md';
export const REPORT_FILE = 'match-report.md';
export const ADAPTED_FILE = 'adapted-resume.json';
export const COVER_LETTER_FILE = 'cover-letter.md';

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

  const offers: OfferListing[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const dir = path.join(root, slug);

    const hasOffer = fs.existsSync(path.join(dir, OFFER_FILE));
    if (!hasOffer) continue;
    const hasReport = fs.existsSync(path.join(dir, REPORT_FILE));
    const hasAdapted = fs.existsSync(path.join(dir, ADAPTED_FILE));
    const hasCoverLetter = fs.existsSync(path.join(dir, COVER_LETTER_FILE));

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

    const raw = fs.readFileSync(path.join(dir, OFFER_FILE), 'utf-8');
    offers.push({
      slug,
      meta: metaFromOfferMd(slug, raw),
      estado,
      hasOffer,
      hasReport,
      hasAdapted,
      hasCoverLetter,
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
}

/** Contenido completo de una oferta para el render del split-view. */
export function readOfferDetail(slug: string, cwd: string = process.cwd()): OfferDetail | null {
  const dir = path.resolve(cwd, JOBS_DIR, slug);
  if (!fs.existsSync(path.join(dir, OFFER_FILE))) return null;
  const offerRaw = fs.readFileSync(path.join(dir, OFFER_FILE), 'utf-8');
  const reportPath = path.join(dir, REPORT_FILE);
  const adaptedPath = path.join(dir, ADAPTED_FILE);
  const reportRaw = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf-8') : null;
  let adaptedResume: unknown = null;
  if (fs.existsSync(adaptedPath)) {
    try {
      adaptedResume = JSON.parse(fs.readFileSync(adaptedPath, 'utf-8'));
    } catch {
      adaptedResume = null;
    }
  }
  return { slug, offerRaw, reportRaw, adaptedResume };
}
