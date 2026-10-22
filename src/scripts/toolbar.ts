import { generateLinkedInText } from './linkedin-export';
import { downloadResumeDocx } from './docx-export';
import { LANG_STORAGE_KEY as STORAGE_KEY, POSITIONING_STORAGE_KEY } from './storage-keys';
import { exportFileName } from '../lib/file-name';
import type { ResumeLocale } from '../schemas/resume';

type Locale = 'es' | 'en';

// ===== Datos de export provistos por cada pagina =====
declare global {
  interface Window {
    __exportResume?: Record<Locale, unknown> | Record<Locale, never> | null;
    __adaptedExportResume?: Record<Locale, unknown> | Record<Locale, never> | null;
  }
}

const PAGE_TITLE = document.title;

function getExportResume(): Record<Locale, unknown> | null {
  // El export actua sobre el documento activo: en la tab "CVs adaptados" es el
  // adapted-resume de la oferta seleccionada; en "CVs base", la proyeccion activa.
  const onAdaptedTab = document.documentElement.getAttribute('data-cv-tab') === 'adapted';
  const fromWindow = onAdaptedTab ? window.__adaptedExportResume : window.__exportResume;
  if (fromWindow && 'es' in fromWindow && 'en' in fromWindow) {
    return fromWindow as Record<Locale, unknown>;
  }
  if (onAdaptedTab) return null;
  const dataEl = document.getElementById('resume-data');
  if (dataEl && dataEl.textContent) {
    try {
      return JSON.parse(dataEl.textContent) as Record<Locale, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

// ===== Toggle de idioma =====
const btnEn = document.getElementById('btn-en') as HTMLButtonElement | null;
const btnEs = document.getElementById('btn-es') as HTMLButtonElement | null;

function currentLang(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    // localStorage no disponible: default EN
  }
  return 'en';
}

function setLangButtons(lang: Locale) {
  btnEn?.setAttribute('aria-pressed', String(lang === 'en'));
  btnEs?.setAttribute('aria-pressed', String(lang === 'es'));
}

setLangButtons(currentLang());

function changeLang(lang: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // storage no disponible
  }
  setLangButtons(lang);
  document.dispatchEvent(new CustomEvent('toolbar:lang-change', { detail: { lang } }));
}

btnEn?.addEventListener('click', () => changeLang('en'));
btnEs?.addEventListener('click', () => changeLang('es'));

// ===== Toggle de posicionamiento =====
const positioningButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('button[data-positioning]')
);

function currentPositioning(): string {
  const ids = positioningButtons.map((button) => button.dataset.positioning || '');
  try {
    const saved = localStorage.getItem(POSITIONING_STORAGE_KEY);
    if (saved && ids.includes(saved)) return saved;
  } catch {
    // localStorage no disponible
  }
  return ids[0] ?? '';
}

function setPositioningButtons(id: string) {
  positioningButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.positioning === id));
  });
}

function changePositioning(id: string) {
  try {
    localStorage.setItem(POSITIONING_STORAGE_KEY, id);
  } catch {
    // storage no disponible
  }
  setPositioningButtons(id);
  document.dispatchEvent(new CustomEvent('toolbar:positioning-change', { detail: { positioning: id } }));
}

if (positioningButtons.length > 0) {
  setPositioningButtons(currentPositioning());
  positioningButtons.forEach((button) => {
    button.addEventListener('click', () => changePositioning(button.dataset.positioning || ''));
  });
}

// ===== Dropdown de export =====
const exportBtn = document.getElementById('btn-export');
const exportMenu = document.querySelector('.export-menu') as HTMLElement | null;
let exportOpen = false;

function setExport(open: boolean) {
  exportOpen = open;
  if (exportBtn) exportBtn.setAttribute('aria-expanded', String(open));
  if (!exportMenu) return;
  if (open) {
    exportMenu.hidden = false;
    exportMenu.classList.add('open');
  } else {
    exportMenu.classList.remove('open');
    setTimeout(() => {
      if (!exportOpen) exportMenu!.hidden = true;
    }, 140);
  }
}

exportBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  setExport(!exportOpen);
});
// Las cards de posicionamiento piden abrir el menu de export sobre su CV activo.
document.addEventListener('toolbar:export-open', () => setExport(true));
document.addEventListener('click', (e) => {
  if (exportOpen && !exportMenu?.contains(e.target as Node) && e.target !== exportBtn) setExport(false);
});

document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((item) => {
  item.addEventListener('click', () => {
    const action = item.dataset.export;
    setExport(false);
    if (action === 'pdf') {
      // Nombre neutro (sin empresa ni rol: un CV llamado como la oferta delata
      // que esta adaptado, ADR-0036). `base` ya viene en forma de archivo.
      const base = document.querySelector<HTMLElement>('.toolbar')?.dataset.pdfTitle ?? PAGE_TITLE;
      const lang = currentLang().toUpperCase();
      document.title = [base, lang].filter(Boolean).join(' - ');
      const restore = () => {
        document.title = PAGE_TITLE;
      };
      window.addEventListener('afterprint', restore, { once: true });
      window.print();
      setTimeout(restore, 4000);
    } else if (action === 'json') {
      document.dispatchEvent(new CustomEvent('toolbar:export-json'));
    } else if (action === 'docx') {
      void exportDocx();
    } else if (action === 'linkedin') {
      openLinkedIn('sections');
    }
  });
});

/** Export DOCX del CV activo (proyeccion del perfil o CV adaptado segun la pagina). */
async function exportDocx(): Promise<void> {
  const data = getExportResume();
  if (!data) return;
  const lang = currentLang();
  const resume = data[lang] as ResumeLocale | undefined;
  if (!resume || !resume.name) return;
  const filename = exportFileName(resume.name, 'CV', lang, 'docx');
  await downloadResumeDocx(resume, filename, lang);
}

// ===== Modal de LinkedIn (compartido por todas las paginas con Toolbar) =====
const modal = document.getElementById('linkedin-modal');
const out = document.getElementById('linkedin-output') as HTMLTextAreaElement | null;
const postOut = document.getElementById('linkedin-post') as HTMLTextAreaElement | null;
const modalBtnEn = document.getElementById('modal-btn-en') as HTMLButtonElement | null;
const modalBtnEs = document.getElementById('modal-btn-es') as HTMLButtonElement | null;

function buildPost(resume: ResumeLocale | undefined, lang: Locale): string {
  // El copy del post se arma desde la proyección del perfil: este archivo de código
  // no debe contener datos personales (regla ADR-0027, el repo público lo exporta tal cual).
  const title = resume?.title?.trim() || 'Frontend';
  const location = resume?.contact.location?.trim() || (lang === 'es' ? 'tu ciudad' : 'your city');
  const jobs = resume?.experience ?? [];
  const latest = jobs[0];
  const latestLine = latest ? (lang === 'es' ? `${latest.role} en ${latest.company}` : `${latest.role} at ${latest.company}`) : '';
  const companies = jobs.map((job) => job.company.trim()).filter(Boolean);
  const previous = companies.length > 0 ? companies.join(', ') : (lang === 'es' ? 'experiencia previa' : 'previous experience');

  if (lang === 'es') {
    return `Hola red, estoy abierto a nuevos roles ${title}, remoto.

${latestLine ? `Tras construir aplicaciones en producción \u2014 últimamente ${latestLine} \u2014 y con adopción intensiva de desarrollo asistido por IA como forma principal de trabajar, busco mi próximo desafío.` : 'Con experiencia construyendo aplicaciones en producción y adopción intensiva de desarrollo asistido por IA como forma principal de trabajar, busco mi próximo desafío.'}

Basado en ${location}, abierto a roles remotos globales.

Si conocés un equipo que esté buscando, mandame DM o dejá un comentario. Encantado de reconectar.

#TrabajoRemoto #Frontend #React

\ud83d\udcbc Buscando: roles ${title}
\ud83c\udf10 Abierto a: Remoto (global) y ${location}
\u2b50 Anterior: ${previous}`;
  }

  return `Hi network, I'm open to new ${title} roles, remote-first.

${latestLine ? `After building production applications \u2014 most recently ${latestLine} \u2014 and heavily adopting AI-assisted development as my main way of working, I'm looking for my next challenge.` : 'After building production applications and heavily adopting AI-assisted development as my main way of working, I am looking for my next challenge.'}

Based in ${location}, open to remote roles globally.

If your team is hiring, or you know of something, DM me or comment below. Always happy to reconnect.

#OpenToWork #Frontend #React #RemoteJobs

\ud83d\udcbc Looking for: ${title} roles
\ud83c\udf10 Open to: Remote (global) and ${location}
\u2b50 Previous: ${previous}`;
}

const CONN_DRAFTS: { name: string; text: Record<Locale, string> }[] = [
  {
    name: 'Recruiter tech',
    text: {
      en: 'Hi! I saw the Frontend role and I think it fits. Quick question: is the position still open?',
      es: 'Hola! Vi la búsqueda de Frontend. Te consulto: sigue abierta la posición?'
    }
  },
  {
    name: 'Ex manager',
    text: {
      en: 'Hi! Long time. I am exploring new opportunities and would love your perspective. Do you have 15 minutes this week?',
      es: 'Hola! Cuanto tiempo. Estoy explorando oportunidades nuevas y me gustaria tu punto de vista. Tenes 15 minutos esta semana?'
    }
  },
  {
    name: 'Ex teammate',
    text: {
      en: 'Hi! If your team needs a Frontend Developer, here is my resume. Any referral helps a lot.',
      es: 'Hola! Si tu equipo necesita Frontend, te paso mi resume. Cualquier referencia ayuda un monton.'
    }
  }
];

function setModalLang(lang: Locale) {
  if (modalBtnEn) modalBtnEn.setAttribute('aria-pressed', String(lang === 'en'));
  if (modalBtnEs) modalBtnEs.setAttribute('aria-pressed', String(lang === 'es'));
  const resume = getExportResume();
  if (out) out.value = resume ? generateLinkedInText(resume[lang] as never, lang) : '';
  if (postOut) postOut.value = buildPost(resume ? (resume[lang] as ResumeLocale) : undefined, lang);
  renderConnDrafts(lang);
}

modalBtnEn?.addEventListener('click', () => setModalLang('en'));
modalBtnEs?.addEventListener('click', () => setModalLang('es'));

function renderConnDrafts(lang: Locale) {
  document.querySelectorAll<HTMLElement>('.conn-draft').forEach((d, i) => {
    const idx = Number(d.getAttribute('data-draft-index') ?? i);
    const draft = CONN_DRAFTS[idx];
    if (!draft) return;
    const name = d.querySelector<HTMLElement>('.conn-name');
    const ta = d.querySelector<HTMLTextAreaElement>('.conn-textarea');
    if (name) name.textContent = draft.name;
    if (ta) ta.value = draft.text[lang];
  });
  updateConnCounters();
}

function updateConnCounters() {
  document.querySelectorAll<HTMLElement>('.conn-counter').forEach((c) => {
    const ta = document.getElementById(c.getAttribute('data-counter-for') || '') as HTMLTextAreaElement | null;
    if (ta) c.textContent = `${(ta.value || '').length}/200`;
  });
}

const connTextareas = document.querySelectorAll<HTMLTextAreaElement>('.conn-textarea');
connTextareas.forEach((ta) => ta.addEventListener('input', updateConnCounters));
renderConnDrafts(currentLang());

function switchTab(tab: 'sections' | 'posts' | 'connections') {
  const tabs = [
    { btn: document.getElementById('tab-sections'), panel: document.getElementById('panel-sections'), id: 'sections' as const },
    { btn: document.getElementById('tab-posts'), panel: document.getElementById('panel-posts'), id: 'posts' as const },
    { btn: document.getElementById('tab-connections'), panel: document.getElementById('panel-connections'), id: 'connections' as const }
  ];
  for (const t of tabs) {
    if (!t.btn || !t.panel) continue;
    const active = t.id === tab;
    t.btn.setAttribute('aria-selected', String(active));
    t.panel.hidden = !active;
  }
  if (tab === 'connections') renderConnDrafts(currentLang());
}

function openLinkedIn(initialTab: 'sections' | 'posts' | 'connections' = 'sections') {
  if (!modal) return;
  setModalLang(currentLang());
  switchTab(initialTab);
  modal.classList.add('open');
}

document.getElementById('tab-sections')?.addEventListener('click', () => switchTab('sections'));
document.getElementById('tab-posts')?.addEventListener('click', () => switchTab('posts'));
document.getElementById('tab-connections')?.addEventListener('click', () => switchTab('connections'));

document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.id === 'tab-sections') switchTab('sections');
    else if (btn.id === 'tab-posts') switchTab('posts');
    else if (btn.id === 'tab-connections') switchTab('connections');
  });
});

document.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-copy-target');
    if (!targetId) return;
    const ta = document.getElementById(targetId) as HTMLTextAreaElement | null;
    if (!ta) return;
    try {
      await navigator.clipboard.writeText(ta.value);
      const original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => {
        if (btn.textContent === 'Copied') btn.textContent = original;
      }, 1200);
    } catch {
      // clipboard no disponible
    }
  });
});

document.getElementById('btn-linkedin-close')?.addEventListener('click', () => modal?.classList.remove('open'));

let isResizing = false;
let startY = 0;
let startHeight = 0;
const modalBox = modal?.querySelector<HTMLElement>('.box');
const resizeHandle = modal?.querySelector<HTMLElement>('.resize-handle');
modal?.addEventListener('mousedown', (e) => {
  if (e.target === resizeHandle) {
    isResizing = true;
    startY = e.clientY;
    if (modalBox) startHeight = modalBox.offsetHeight;
    resizeHandle?.classList.add('dragging');
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }
});
document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  const delta = e.clientY - startY;
  const newHeight = Math.max(200, Math.min(window.innerHeight * 0.92 - 40, startHeight + delta));
  if (modalBox) modalBox.style.height = newHeight + 'px';
});
document.addEventListener('mouseup', () => {
  if (!isResizing) return;
  isResizing = false;
  resizeHandle?.classList.remove('dragging');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (exportOpen) setExport(false);
  modal?.classList.remove('open');
});

// ===== Panel de tema (compartido) =====
const THEME_KEY = 'resume-theme';
const ACCENTS_KEY = 'resume-accents';
const CUSTOM_KEY = 'resume-theme-custom';
const DEFAULT_THEME = 'navy';
const DEFAULT_ACCENT = '#1a365d';
const DEFAULT_ACCENTS = ['name', 'sections', 'urls', 'skills'];
const AAA_THRESHOLD = 7;

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastVsWhite(hex: string) {
  return (1.0 + 0.05) / (luminance(hex) + 0.05);
}

const rootEl = document.documentElement;
const themeButtons = document.querySelectorAll<HTMLButtonElement>('.theme-presets button[data-theme]');
const accentCbs = document.querySelectorAll<HTMLInputElement>('input[data-accent]');
const customPicker = document.querySelector<HTMLInputElement>('#theme-custom-color');
const customPickerWrap = document.querySelector<HTMLLabelElement>('.theme-picker');
const customSwatch = document.querySelector<HTMLElement>('[data-custom-swatch]');
const feedback = document.getElementById('theme-feedback');

function applyTheme(theme: string) {
  let effective = theme;
  if (theme === 'custom') {
    const c = localStorage.getItem(CUSTOM_KEY) || DEFAULT_ACCENT;
    if (contrastVsWhite(c) < AAA_THRESHOLD) {
      effective = 'navy';
      try { localStorage.setItem(THEME_KEY, 'navy'); } catch {}
    }
  }
  rootEl.setAttribute('data-theme', effective);
  themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === effective)));
  const isCustom = effective === 'custom';
  if (customPickerWrap) customPickerWrap.hidden = !isCustom;
  if (isCustom && customPicker) {
    const c = localStorage.getItem(CUSTOM_KEY) || DEFAULT_ACCENT;
    rootEl.style.setProperty('--accent', c);
    customPicker.value = c;
    if (customSwatch) customSwatch.style.background = c;
    if (feedback) {
      const r = contrastVsWhite(c);
      feedback.textContent = `Contraste ${r.toFixed(1)}:1 \u2014 ok`;
      feedback.className = 'theme-feedback ok';
      feedback.hidden = false;
    }
  } else {
    rootEl.style.removeProperty('--accent');
    if (customSwatch) {
      customSwatch.style.background =
        getComputedStyle(rootEl).getPropertyValue('--accent').trim() || DEFAULT_ACCENT;
    }
    if (feedback) feedback.hidden = true;
  }
}

function applyAccents(accents: string[]) {
  rootEl.setAttribute('data-accents', accents.join(' '));
  accentCbs.forEach((cb) => { cb.checked = accents.includes(cb.dataset.accent || ''); });
}

applyTheme(localStorage.getItem(THEME_KEY) || DEFAULT_THEME);
applyAccents((localStorage.getItem(ACCENTS_KEY) || DEFAULT_ACCENTS.join(' ')).split(/\s+/).filter(Boolean));

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.theme || DEFAULT_THEME;
    applyTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  });
});

customPicker?.addEventListener('input', (e) => {
  const v = (e.target as HTMLInputElement).value;
  const ratio = contrastVsWhite(v);
  if (ratio >= AAA_THRESHOLD) {
    rootEl.style.setProperty('--accent', v);
    if (customSwatch) customSwatch.style.background = v;
    try { localStorage.setItem(CUSTOM_KEY, v); } catch {}
    if (feedback) {
      feedback.textContent = `Contraste ${ratio.toFixed(1)}:1 \u2014 ok`;
      feedback.className = 'theme-feedback ok';
      feedback.hidden = false;
    }
  } else {
    if (feedback) {
      feedback.textContent = `Contraste ${ratio.toFixed(1)}:1 \u2014 m\u00ednimo ${AAA_THRESHOLD}:1`;
      feedback.className = 'theme-feedback error';
      feedback.hidden = false;
    }
  }
});

accentCbs.forEach((cb) => {
  cb.addEventListener('change', () => {
    const acc: string[] = [];
    accentCbs.forEach((c) => { if (c.checked) acc.push(c.dataset.accent || ''); });
    applyAccents(acc);
    try { localStorage.setItem(ACCENTS_KEY, acc.join(' ')); } catch {}
  });
});
