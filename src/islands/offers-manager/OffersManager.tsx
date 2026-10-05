import { useEffect, useState } from 'react';
import { type OfferView, type OfferFormValues, type CoverLetterJson, buildSlug, slugWithCollision, parseAnalysis, parseAdaptedResume, parseCoverLetter, composeOfferMd, composeMatchReport, todayIso } from './contract';
import { analyzePrompt, adaptPrompt, coverLetterPrompt, analysisFilesForOffer, adaptedFilesForOffer, coverLetterFilesForOffer, type FileToWrite } from './prompts';
import OfferCard from './OfferCard';
import OfferPanel from './OfferPanel';
import AddOfferModal from './AddOfferModal';
import AIModal from './AIModal';
import SaveModal from './SaveModal';
import CoverLetterPreview from './CoverLetterPreview';
import InfoTip from './InfoTip';
import { LANG_STORAGE_KEY } from '../../scripts/storage-keys';

const MATCH_REPORT_TEMPLATE = composeMatchReport({
  match_score: 0,
  match_fuerte: ['item con evidencia'],
  gaps_parciales: ['item con explicaci\u00f3n'],
  gaps_reales: ['item con evaluaci\u00f3n honesta'],
  ajustes_recomendados: ['cambio concreto'],
  temas_entrevista: ['tema con contexto'],
  score_explicacion: 'desglose del score'
});

type Flow =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'analyze'; slug: string }
  | { kind: 'analyzeManual'; slug: string }
  | { kind: 'adapt'; slug: string }
  | { kind: 'coverLetter'; slug: string }
  | { kind: 'coverLetterPreview'; slug: string; letter: CoverLetterJson }
  | { kind: 'save'; slug: string; title: string; tooltip: string; files: FileToWrite[] };

interface OffersManagerProps {
  offers: OfferView[];
  isDev: boolean;
}

export default function OffersManager({ offers, isDev }: OffersManagerProps) {
  const [selected, setSelected] = useState<string | null>(offers[0]?.listing.slug ?? null);
  const [lang, setLang] = useState<'es' | 'en'>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'es') setLang('es');
    } catch {}
    document.documentElement.setAttribute('data-offers-hydrated', 'true');

    const onLang = (e: Event) => {
      const lang = (e as CustomEvent<{ lang: 'es' | 'en' }>).detail.lang;
      setLang(lang);
    };
    document.addEventListener('toolbar:lang-change', onLang);
    return () => document.removeEventListener('toolbar:lang-change', onLang);
  }, []);

  useEffect(() => {
    const current = offers.find((o) => o.listing.slug === selected);
    const target = window as unknown as { __exportResume?: unknown; __printCompany?: string | null };
    target.__exportResume = current?.adaptedResume ?? null;
    target.__printCompany = current?.listing.meta.empresa ?? null;
  }, [offers, selected]);

  useEffect(() => {
    const onExportJson = () => {
      const current = offers.find((o) => o.listing.slug === selected);
      if (!current?.adaptedResume) return;
      const blob = new Blob([JSON.stringify(current.adaptedResume, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${current.listing.slug}-adapted-resume.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
    document.addEventListener('toolbar:export-json', onExportJson);
    return () => document.removeEventListener('toolbar:export-json', onExportJson);
  }, [offers, selected]);
  const [flow, setFlow] = useState<Flow>({ kind: 'none' });
  const [manualText, setManualText] = useState<string>(MATCH_REPORT_TEMPLATE);

  const offer = offers.find((o) => o.listing.slug === selected) ?? offers[0];

  const submitAdd = (values: OfferFormValues) => {
    const fecha = values.fecha || todayIso();
    const base = buildSlug(values.empresa, values.rol, fecha);
    const taken = offers.map((o) => o.listing.slug);
    const slug = slugWithCollision(base, taken);
    const metaText = composeOfferMd(
      {
        empresa: values.empresa,
        rol: values.rol,
        fecha,
        url: values.url || null,
        modalidad: values.modalidad,
        location: values.location || null,
        salario: values.salario || null,
        recruiter: values.recruiter || null,
        descripcion_empresa: values.descripcionEmpresa || null,
        oferta_texto: values.ofertaTexto
      },
      values.ofertaTexto
    );
    const extras: string[] = [];
    if (values.seniority) extras.push(`- Seniority requerido: ${values.seniority}`);
    if (values.stack) extras.push(`- Stack pedido: ${values.stack}`);
    if (values.descripcionEmpresa) extras.push(`- Sobre la empresa: ${values.descripcionEmpresa}`);
    const content = extras.length
      ? metaText + ['', '# Notas de captura', '', ...extras, ''].join('\n')
      : metaText;
    setFlow({
      kind: 'save',
      slug,
      title: 'Guardar oferta',
      tooltip:
        'Este modal muestra exactamente qué archivos se van a crear. El prompt copiable instruye a un agente con acceso al repo (ej: opencode o Claude Code en otra sesión) a escribirlos verbatim según el contrato de capture-job-offer. Como alternativa, descargá los archivos y ubicalos a mano. Verificar consulta el listado en disco sin recargar la página.',
      files: [{ path: `docs/job-offers/${slug}/offer.md`, content }]
    });
  };

  const startAnalyze = (slug: string) => {
    const target = offers.find((o) => o.listing.slug === slug);
    if (!target) return;
    setFlow({
      kind: 'analyze',
      slug
    });
  };

  const startAdapt = (slug: string) => {
    const target = offers.find((o) => o.listing.slug === slug);
    if (!target) return;
    setFlow({ kind: 'adapt', slug });
  };

  const handleAnalyzed = (slug: string, raw: string) => {
    const analysis = parseAnalysis(raw);
    setFlow({
      kind: 'save',
      slug,
      title: 'Guardar an\u00e1lisis de match',
      tooltip:
        'El an\u00e1lisis se compuso a partir del JSON validado. El agente lo escribe verbatim como match-report.md en la carpeta de la oferta. Despu\u00e9s verific\u00e1 y el badge pasa a Analizada.',
      files: analysisFilesForOffer(slug, analysis)
    });
  };

  const handleAdapted = (slug: string, raw: string) => {
    const adapted = parseAdaptedResume(raw);
    setFlow({
      kind: 'save',
      slug,
      title: 'Guardar CV adaptado',
      tooltip:
        'El CV adaptado (es + en) se valid\u00f3 contra el schema. El agente lo escribe verbatim como adapted-resume.json en la carpeta de la oferta. Despu\u00e9s verific\u00e1 y el badge pasa a CV adaptado.',
      files: adaptedFilesForOffer(slug, adapted)
    });
  };

  const handleCoverLetterJson = (slug: string, raw: string) => {
    const letter = parseCoverLetter(raw);
    setFlow({ kind: 'coverLetterPreview', slug, letter });
  };

  const handleCoverLetterSave = (slug: string, letter: CoverLetterJson) => {
    const target = offers.find((o) => o.listing.slug === slug);
    if (!target) return;
    setFlow({
      kind: 'save',
      slug,
      title: 'Guardar cover letter',
      tooltip:
        'La carta aprobada se compone como cover-letter.md en la carpeta de la oferta. El agente la escribe verbatim, o descargala y ubic\u00e1la a mano. La verificaci\u00f3n consulta el disco sin recargar. La carta no cambia el estado de la oferta.',
      files: coverLetterFilesForOffer(slug, target.listing.meta, letter)
    });
  };

  const handleManualReport = () => {
    const slug = flow.kind === 'analyzeManual' ? flow.slug : null;
    if (!slug) return;
    setFlow({
      kind: 'save',
      slug,
      title: 'Guardar an\u00e1lisis (manual)',
      tooltip:
        'Completaste el match report a mano: la app lo escribe como match-report.md v\u00eda el agente o descarga, igual que los otros flujos.',
      files: [{ path: `docs/job-offers/${slug}/match-report.md`, content: manualText }]
    });
  };

  const analyzeTarget = flow.kind === 'analyze' ? offers.find((o) => o.listing.slug === flow.slug) : null;
  const flowTarget =
    flow.kind === 'adapt' || flow.kind === 'coverLetter'
      ? offers.find((o) => o.listing.slug === flow.slug)
      : null;

  return (
    <div className="adapted-app">
      <aside className="offer-sidebar">
        <div className="sidebar-header">
          <h2>Ofertas</h2>
          <div className="sidebar-actions">
            <InfoTip>
              Agregar una oferta nueva: abre el formulario donde carg\u00e1s link, empresa, rol y
              texto de la oferta (o us\u00e1s IA para capturarla). Requiere: empresa, rol, y link o
              texto completo. Al guardar, la app compone docs/job-offers/&lt;slug&gt;/offer.md y te
              da el prompt para el agente que escribe los archivos, con verificaci\u00f3n inline.
              Solo disponible en entorno local.
            </InfoTip>
            <button type="button" className="add-offer-btn" disabled={!isDev} onClick={() => setFlow({ kind: 'add' })}>
              + Agregar oferta
            </button>
          </div>
          <a href="/" className="back-link">&larr; CV principal</a>
        </div>
        <div className="offer-list">
          {offers.map((o) => (
            <OfferCard
              key={o.listing.slug}
              offer={o}
              active={o.listing.slug === selected}
              isDev={isDev}
              onSelect={() => setSelected(o.listing.slug)}
              onAnalyze={() => startAnalyze(o.listing.slug)}
              onManualAnalyze={() => {
                setManualText(MATCH_REPORT_TEMPLATE);
                setFlow({ kind: 'analyzeManual', slug: o.listing.slug });
              }}
              onAdapt={() => startAdapt(o.listing.slug)}
              onCoverLetter={() => setFlow({ kind: 'coverLetter', slug: o.listing.slug })}
            />
          ))}
          {offers.length === 0 && (
            <div className="offer-empty">
              <p>No hay ofertas analizadas todav\u00eda.</p>
              <p>Us\u00e1 el bot\u00f3n Agregar oferta para capturar la primera.</p>
            </div>
          )}
        </div>
      </aside>

      <div className="offer-panels">
        {offer ? (
          <OfferPanel offer={offer} lang={lang} />
        ) : (
          <div className="offer-empty" />
        )}
      </div>

      <AddOfferModal
        open={flow.kind === 'add'}
        isDev={isDev}
        onClose={() => setFlow({ kind: 'none' })}
        onSubmit={submitAdd}
      />

      {flow.kind === 'analyze' && analyzeTarget && (
        <AIModal
          open
          title={`Analizar match: ${analyzeTarget.listing.meta.empresa}`}
          tooltip="La app arma un prompt con la skill adapt-resume-to-offer del repo (an\u00e1lisis de match honesto: match fuerte, gaps parciales, gaps reales, ajustes, temas de entrevista y score). Copi\u00e1s el prompt a tu agente externo, \u00e9l lee el CV base y el offer.md del repo, y devuelve el JSON de an\u00e1lisis que peg\u00e1s ac\u00e1. La app lo valida y compone match-report.md."
          prompt={analyzePrompt({
            empresa: analyzeTarget.listing.meta.empresa,
            rol: analyzeTarget.listing.meta.rol,
            slug: analyzeTarget.listing.slug
          })}
          pasteHint="El agente devuelve un bloque ```json con el an\u00e1lisis."
          onPaste={(raw) => handleAnalyzed(flow.slug, raw)}
          onClose={() => setFlow({ kind: 'none' })}
          acceptLabel="Analizar"
        />
      )}

      {flow.kind === 'adapt' && flowTarget && (
        <AIModal
          open
          title={`Adaptar CV: ${flowTarget.listing.meta.empresa}`}
          tooltip="La app arma un prompt con la skill adapt-resume-to-offer: el agente lee el CV base, el schema Zod y el match report, aplica los ajustes y devuelve el CV adaptado completo (es y en) en un bloque JSON. La app lo valida contra el schema y compone adapted-resume.json."
          prompt={adaptPrompt({
            empresa: flowTarget.listing.meta.empresa,
            rol: flowTarget.listing.meta.rol,
            slug: flowTarget.listing.slug
          })}
          pasteHint="El agente devuelve un bloque ```json con el CV adaptado completo (es + en)."
          onPaste={(raw) => handleAdapted(flow.slug, raw)}
          onClose={() => setFlow({ kind: 'none' })}
          acceptLabel="Generar CV adaptado"
        />
      )}

      {flow.kind === 'coverLetter' && flowTarget && (
        <AIModal
          open
          title={`Cover letter: ${flowTarget.listing.meta.empresa}`}
          tooltip="La app arma un prompt con la skill adapt-resume-to-offer (seccion Cover letter): el agente lee la oferta, el match report y el CV adaptado, te muestra la carta y pregunta tu aprobacion, y devuelve el JSON final. Al pegarlo ac\u00e1, la app abre la vista previa: pod\u00e9s editar el texto, descargarlo y confirmar antes de guardar cover-letter.md en la carpeta de la oferta."
          prompt={coverLetterPrompt({
            empresa: flowTarget.listing.meta.empresa,
            rol: flowTarget.listing.meta.rol,
            slug: flowTarget.listing.slug
          })}
          pasteHint="El agente devuelve un bloque ```json con { subject, letter, locale }."
          onPaste={(raw) => handleCoverLetterJson(flow.slug, raw)}
          onClose={() => setFlow({ kind: 'none' })}
          acceptLabel="Revisar carta"
        />
      )}

      {flow.kind === 'coverLetterPreview' && (() => {
        const target = offers.find((o) => o.listing.slug === flow.slug);
        if (!target) return null;
        return (
          <CoverLetterPreview
            open
            meta={{ empresa: target.listing.meta.empresa, rol: target.listing.meta.rol, slug: target.listing.slug, fecha: target.listing.meta.fecha }}
            locale={flow.letter.locale}
            initial={flow.letter}
            onSave={(letter) => handleCoverLetterSave(target.listing.slug, letter)}
            onClose={() => setFlow({ kind: 'none' })}
          />
        );
      })()}

      {flow.kind === 'analyzeManual' && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Analizar a mano">
          <div className="modal-box modal-manual">
            <div className="modal-head">
              <h3>Analizar a mano</h3>
              <div className="modal-head-actions">
                <InfoTip>
                  V\u00eda sin agente: edit\u00e1 el template del match report a mano, con las mismas
                  secciones que el formato can\u00f3nico. Al continuar, pasa por el mismo guardado
                  (prompt al agente o descarga) que los dem\u00e1s flujos.
                </InfoTip>
                <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setFlow({ kind: 'none' })}>
                  ×
                </button>
              </div>
            </div>
            <textarea
              className="manual-report"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={22}
            />
            <div className="modal-actions">
              <button type="button" className="primary-btn" onClick={handleManualReport}>
                Continuar al guardado
              </button>
            </div>
          </div>
        </div>
      )}

      {flow.kind === 'save' && (
        <SaveModal
          open
          title={flow.title}
          tooltip={flow.tooltip}
          files={flow.files}
          verifySlug={flow.slug}
          onClose={() => setFlow({ kind: 'none' })}
        />
      )}
    </div>
  );
}
