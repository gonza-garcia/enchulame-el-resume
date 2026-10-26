import { type OfferView, estadoLabel, type OfferState, POST_BADGE_CLASS } from './contract';

interface OfferCardProps {
  offer: OfferView;
  active: boolean;
  isDev: boolean;
  onSelect: () => void;
  onAnalyze: () => void;
  onManualAnalyze: () => void;
  onAdapt: () => void;
  onCoverLetter: () => void;
  onReviewPlan: () => void;
}

function scoreClass(score: number): string {
  return score >= 80 ? 'high' : score >= 60 ? 'med' : 'low';
}

function badgeClass(estado: OfferState): string {
  if (estado === 'adaptada') return 'offer-card-badge has-adapted';
  if (estado === 'analizada') return 'offer-card-badge badge-analizada';
  return 'offer-card-badge badge-agregada';
}

export default function OfferCard({
  offer,
  active,
  isDev,
  onSelect,
  onAnalyze,
  onManualAnalyze,
  onAdapt,
  onCoverLetter,
  onReviewPlan
}: OfferCardProps) {
  const { listing, adaptedResume } = offer;
  const score = listing.matchScore;
  return (
    <div
      className={`offer-card${active ? ' active' : ''}`}
    >
      <button type="button" className="offer-card-select" onClick={onSelect}>
        <span className="offer-card-header">
          <span className="offer-card-empresa">{listing.meta.empresa}</span>
          {score !== null && (
            <span className={`offer-card-score ${scoreClass(score)}`}>{score}/100</span>
          )}
        </span>
        <span className="offer-card-rol">{listing.meta.rol}</span>
        <span className="offer-card-meta">
          <span>{listing.meta.fecha}</span>
          {listing.meta.modalidad !== 'unknown' && <span>·</span>}
          {listing.meta.modalidad !== 'unknown' && <span>{listing.meta.modalidad}</span>}
          {listing.meta.location && <span>· {listing.meta.location}</span>}
          {listing.meta.salario && <span>· {listing.meta.salario}</span>}
        </span>
        <span className={badgeClass(listing.estado)}>
          {adaptedResume === null && listing.estado === 'adaptada'
            ? 'Adaptada (JSON invalido)'
            : estadoLabel(listing.estado)}
        </span>
        {listing.application && (
          <span
            className={`of-badge ${POST_BADGE_CLASS[listing.application.estado] ?? 'of-badge-borrador'} offer-card-post`}
            title="Estado de la postulacion registrado en application.md"
          >
            Postulación: {listing.application.estado}
          </span>
        )}
      </button>
      {isDev && listing.estado === 'agregada' && (
        <div className="offer-actions">
          <button type="button" className="offer-action-btn" onClick={onAnalyze}>
            Analizar
          </button>
          <button type="button" className="offer-action-btn offer-action-manual" onClick={onManualAnalyze}>
            Analizar a mano
          </button>
        </div>
      )}
      {isDev && listing.estado === 'analizada' && (
        <div className="offer-actions">
          <button type="button" className="offer-action-btn" onClick={onAdapt}>
            Adaptar CV
          </button>
        </div>
      )}
      {listing.hasReport && (
        <div className="offer-actions">
          <button
            type="button"
            className="offer-action-btn offer-action-review"
            disabled={!listing.hasReviewPlan}
            title={
              listing.hasReviewPlan
                ? 'Carga el repaso de esta oferta en /interview: los temas priorizados del match-report con sus preguntas del banco y los huecos a repasar fuera.'
                : `Esta oferta todavía no tiene plan de repaso. Se genera con la skill build-interview-review-plan (skills/job-seeking/build-interview-review-plan/SKILL.md) en una sesión con acceso al repo, y queda guardado en docs/job-offers/${listing.slug}/interview-review-plan.json.`
            }
            onClick={onReviewPlan}
          >
            Cargar repaso
          </button>
        </div>
      )}
      {isDev && listing.hasCoverLetter && (
        <div className="offer-actions">
          <button type="button" className="offer-action-btn offer-action-cover" onClick={onCoverLetter}>
            Cover letter
          </button>
        </div>
      )}
    </div>
  );
}
