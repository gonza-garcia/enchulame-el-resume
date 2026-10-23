import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type {
  LearningPlan,
  LearningResourceStatus,
  LocalizedText,
  PlanEvidence,
  PlanPhase,
  PlanResource,
  PlanSkill
} from '../../schemas/learning-plan';
import type { LearningReadingItem } from '../../lib/learning-reading-list';
import type { ProfileReadModel } from '../../lib/profile-read-model';
import { computePlanProfileJoin } from '../../lib/learning-gaps';
import {
  emptyLearningProgress,
  gateEvidence,
  gateStatus,
  LEARNING_GATE_STATUS_LABELS,
  LEARNING_RESOURCE_STATUS_LABELS,
  LEARNING_RESOURCE_STATUSES,
  learningProgressStore,
  resourceStatus,
  setGateStatus,
  setResourceStatus,
  summarizeProgress
} from '../../lib/learning-progress';
import {
  CLEAR_MESSAGE,
  clearProgress as clearStoredProgress,
  exportProgress,
  importProgressFile,
  loadProgress,
  saveProgress
} from '../../lib/progress-storage';
import { LANG_STORAGE_KEY, POSITIONING_STORAGE_KEY } from '../../scripts/storage-keys';

type Lang = 'es' | 'en';

const EVIDENCE_TYPE_LABELS: Record<PlanEvidence['type'], string> = {
  commit: 'Commit',
  url: 'URL',
  file: 'Archivo'
};

interface LearningPlanProps {
  plan: LearningPlan;
  positionings: { id: string; title: LocalizedText }[];
  readingList: LearningReadingItem[];
  profile: ProfileReadModel;
}

function pick(text: LocalizedText, lang: Lang): string {
  return text[lang];
}

function SkillChip({ skill, lang }: { skill: PlanSkill; lang: Lang }) {
  return (
    <span className="learning-chip" title={skill.demand ? pick(skill.demand.label, lang) : undefined}>
      <span className="learning-chip-name">{pick(skill.name, lang)}</span>
      {skill.demand && (
        <span className="learning-chip-demand">{pick(skill.demand.label, lang)}</span>
      )}
    </span>
  );
}

function ResourceCard({
  resource,
  skills,
  lang,
  status,
  onStatus
}: {
  resource: PlanResource;
  skills: Map<string, PlanSkill>;
  lang: Lang;
  status: LearningResourceStatus;
  onStatus: (status: LearningResourceStatus) => void;
}) {
  return (
    <article className="learning-resource">
      <h5 className="learning-resource-title">
        <a href={resource.url} target="_blank" rel="noreferrer">
          {resource.title}
        </a>
      </h5>
      <p className="learning-resource-meta">
        <span>{resource.creator}</span>
        <span>{resource.platform}</span>
        <span>{pick(resource.price, lang)}</span>
        <span>{pick(resource.duration, lang)}</span>
        <span>{resource.language}</span>
      </p>
      {resource.confidence && (
        <p className="learning-resource-confidence">
          {pick(resource.confidence.text, lang)} ({resource.confidence.asOf})
        </p>
      )}
      <p className="learning-resource-opinion">{pick(resource.opinion, lang)}</p>
      <div className="learning-chips" aria-label="Skills que enseña">
        {resource.skillIds.map((skillId) => {
          const skill = skills.get(skillId);
          return skill ? <SkillChip key={skillId} skill={skill} lang={lang} /> : null;
        })}
      </div>
      <div className="learning-status" role="group" aria-label={`Progreso de ${resource.title}`}>
        {LEARNING_RESOURCE_STATUSES.map((option) => (
          <button
            key={option}
            type="button"
            className="learning-status-btn"
            aria-pressed={status === option}
            onClick={() => onStatus(option)}
          >
            {LEARNING_RESOURCE_STATUS_LABELS[option]}
          </button>
        ))}
      </div>
    </article>
  );
}

function PhaseSection({
  phase,
  plan,
  skills,
  lang,
  progress,
  onResourceStatus,
  onGateStatus
}: {
  phase: PlanPhase;
  plan: LearningPlan;
  skills: Map<string, PlanSkill>;
  lang: Lang;
  progress: ReturnType<typeof emptyLearningProgress>;
  onResourceStatus: (resourceId: string, status: LearningResourceStatus) => void;
  onGateStatus: (status: 'pendiente' | 'cumplido') => void;
}) {
  const roles = plan.roles.filter((role) => phase.enablesRoles.includes(role.id));
  const resources = plan.resources.filter((resource) => phase.resourceIds.includes(resource.id));
  const gate = gateStatus(progress, phase.id);
  const evidence = gateEvidence(phase);

  return (
    <section
      className="learning-phase"
      id={phase.id}
      aria-label={pick(phase.title, lang)}
    >
      <header className="learning-phase-header">
        <span className="learning-phase-order">Fase {phase.order}</span>
        <h3 className="learning-phase-title">{pick(phase.title, lang)}</h3>
        <span className="learning-phase-duration">{pick(phase.duration, lang)}</span>
      </header>
      {phase.interviewArea && (
        <p className="learning-phase-quiz-link">
          <a href={`/interview/?quiz=${phase.interviewArea}`}>
            Practicar el quiz de esta fase en /interview
          </a>
        </p>
      )}
      {roles.length > 0 && (
        <p className="learning-phase-roles">
          <strong>Habilita roles:</strong> {roles.map((role) => pick(role.name, lang)).join(' / ')}
        </p>
      )}
      <div className="learning-chips learning-phase-skills" aria-label="Skills de la fase">
        {phase.skillIds.map((skillId) => {
          const skill = skills.get(skillId);
          return skill ? <SkillChip key={skillId} skill={skill} lang={lang} /> : null;
        })}
      </div>
      <div className="learning-phase-body">
        <div>
          <h4>Temas</h4>
          <ul className="learning-topics">
            {phase.topics.map((topic) => (
              <li key={topic.en}>{pick(topic, lang)}</li>
            ))}
          </ul>
          {phase.project && (
            <p className="learning-phase-project">
              <strong>Proyecto:</strong> {pick(phase.project, lang)}
            </p>
          )}
          <p className="learning-phase-gate">
            <strong>Gate:</strong> {pick(phase.gate, lang)}
          </p>
          {evidence.length > 0 ? (
          <div
            className="learning-gate-evidence"
            role="group"
            aria-label={`Gate de ${pick(phase.title, lang)}`}
          >
            <span className="learning-gate-label">Estado del gate:</span>
            <strong className="learning-gate-evidence-state">Cumplido con evidencia citada</strong>
            <ul className="learning-gate-evidence-list">
              {evidence.map((item) => (
                <li key={`${item.type}-${item.ref}`}>
                  <span className="learning-gate-evidence-kind">{EVIDENCE_TYPE_LABELS[item.type]}</span>{' '}
                  {item.type === 'url' ? (
                    <a href={item.ref}>{item.ref}</a>
                  ) : (
                    <code>{item.ref}</code>
                  )}{' '}
                  — {pick(item.label, lang)}{' '}
                  <span className="learning-gate-evidence-meta">
                    ({item.asOf}, {item.source})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="learning-gate" role="group" aria-label={`Gate de ${pick(phase.title, lang)}`}>
            <span className="learning-gate-label">Estado del gate (marcado a mano):</span>
            {(['pendiente', 'cumplido'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className="learning-gate-btn"
                aria-pressed={gate === option}
                onClick={() => onGateStatus(option)}
              >
                {LEARNING_GATE_STATUS_LABELS[option]}
              </button>
            ))}
          </div>
        )}
        </div>
        <div className="learning-phase-resources">
          <h4>Recursos</h4>
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              skills={skills}
              lang={lang}
              status={resourceStatus(progress, resource.id)}
              onStatus={(status) => onResourceStatus(resource.id, status)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LearningPlanIsland({
  plan,
  positionings,
  readingList,
  profile
}: LearningPlanProps) {
  const [lang, setLang] = useState<Lang>('en');
  const [positioningId, setPositioningId] = useState<string>(positionings[0]?.id ?? '');
  const [progress, setProgress] = useState(emptyLearningProgress);
  const [progressFeedback, setProgressFeedback] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'es') setLang('es');
    } catch {}

    const onLang = (event: Event) => {
      setLang((event as CustomEvent<{ lang: Lang }>).detail.lang);
    };
    document.addEventListener('toolbar:lang-change', onLang);
    return () => document.removeEventListener('toolbar:lang-change', onLang);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(POSITIONING_STORAGE_KEY);
      if (saved && positionings.some((candidate) => candidate.id === saved)) {
        setPositioningId(saved);
      }
    } catch {}

    const onPositioning = (event: Event) => {
      const next = (event as CustomEvent<{ positioning: string }>).detail.positioning;
      if (positionings.some((candidate) => candidate.id === next)) setPositioningId(next);
    };
    document.addEventListener('toolbar:positioning-change', onPositioning);
    return () => document.removeEventListener('toolbar:positioning-change', onPositioning);
  }, [positionings]);

  useEffect(() => {
    setProgress(loadProgress(learningProgressStore));
  }, []);

  useEffect(() => {
    saveProgress(learningProgressStore, progress);
  }, [progress]);

  const changeLang = (next: Lang) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {}
    setLang(next);
    document.dispatchEvent(new CustomEvent('toolbar:lang-change', { detail: { lang: next } }));
  };

  const activePositioning =
    positionings.find((candidate) => candidate.id === positioningId) ?? positionings[0];

  const skills = new Map(plan.skills.map((skill) => [skill.id, skill]));
  const phases = [...plan.phases].sort((left, right) => left.order - right.order);
  const phaseByRole = new Map<string, PlanPhase>();
  for (const phase of phases) {
    for (const roleId of phase.enablesRoles) {
      if (!phaseByRole.has(roleId)) phaseByRole.set(roleId, phase);
    }
  }

  const summary = summarizeProgress(
    progress,
    plan.resources.map((resource) => resource.id),
    phases
  );

  const join = computePlanProfileJoin(plan, profile);

  const updateResource = (resourceId: string, status: LearningResourceStatus) => {
    setProgress((current) => setResourceStatus(current, resourceId, status));
    setProgressFeedback(null);
  };

  const updateGate = (phaseId: string, status: 'pendiente' | 'cumplido') => {
    setProgress((current) => setGateStatus(current, phaseId, status));
    setProgressFeedback(null);
  };

  const exportProgressFile = () => {
    exportProgress(learningProgressStore, progress, 'learning-progress.json');
  };

  const importProgress = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = await importProgressFile(learningProgressStore, file);
    if (result.ok) setProgress(result.value);
    setProgressFeedback(result.message);
  };

  const clearProgress = () => {
    setProgress(clearStoredProgress(learningProgressStore));
    setProgressFeedback(CLEAR_MESSAGE);
  };

  return (
    <div className="learning-app">
      <header className="learning-header">
        <div className="learning-header-row">
          <a className="learning-back" href="/">
            Volver al CV
          </a>
          <div className="learning-lang" role="group" aria-label="Idioma del plan">
            <button
              type="button"
              className="learning-lang-btn"
              aria-pressed={lang === 'es'}
              onClick={() => changeLang('es')}
            >
              ES
            </button>
            <button
              type="button"
              className="learning-lang-btn"
              aria-pressed={lang === 'en'}
              onClick={() => changeLang('en')}
            >
              EN
            </button>
          </div>
        </div>
        <p className="learning-eyebrow">Plan de estudios</p>
        <h1>{pick(plan.title, lang)}</h1>
        <p className="learning-positioning">
          Estás mirando la ruta desde el posicionamiento:{' '}
          <strong>{activePositioning ? pick(activePositioning.title, lang) : ''}</strong>
        </p>
        <div className="learning-progress-block">
          <p className="learning-progress-count" role="status">
            <strong>
              {summary.markedResources}/{summary.totalResources}
            </strong>{' '}
            recursos con marca y{' '}
            <strong>
              {summary.metGates}/{summary.totalGates}
            </strong>{' '}
            gates cumplidos ({summary.evidenceGates} con evidencia citada ·{' '}
            {summary.manualGates} marcados a mano)
          </p>
          <div className="learning-progress-tools" role="group" aria-label="Progreso del plan">
            <button type="button" className="learning-progress-btn" onClick={exportProgressFile}>
              Exportar
            </button>
            <button
              type="button"
              className="learning-progress-btn"
              onClick={() => importInputRef.current?.click()}
            >
              Importar
            </button>
            <button type="button" className="learning-progress-btn" onClick={clearProgress}>
              Borrar
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={importProgress}
            />
          </div>
          {progressFeedback && (
            <p className="learning-progress-feedback" role="status">
              {progressFeedback}
            </p>
          )}
        </div>
      </header>

      <section className="learning-profile-plan" aria-label="Perfil frente al plan">
        <h2>Perfil frente al plan</h2>
        <div className="learning-profile-grid">
          <div>
            <h3>Cubiertas</h3>
            {join.covered.length === 0 ? (
              <p className="learning-profile-empty">Ninguna skill del plan declarada todavía.</p>
            ) : (
              <ul className="learning-profile-list">
                {join.covered.map((entry) => (
                  <li key={entry.planSkill.id}>
                    <strong>
                      {pick(entry.planSkill.name, lang)}
                      {entry.namesDiffer ? ` (${pick(entry.profileName, lang)})` : ''}
                    </strong>
                    <span className="learning-profile-level">{pick(entry.level, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3>Gaps</h3>
            {join.gaps.length === 0 ? (
              <p className="learning-profile-empty">Sin gaps: cubrís todas las skills del plan.</p>
            ) : (
              <ol className="learning-profile-list">
                {join.gaps.map((entry) => (
                  <li key={entry.planSkill.id}>
                    <strong>{pick(entry.planSkill.name, lang)}</strong>
                    {entry.planSkill.demand && (
                      <span className="learning-profile-demand">
                        {pick(entry.planSkill.demand.label, lang)}
                      </span>
                    )}
                    {entry.suggestions.length > 0 && (
                      <span className="learning-profile-suggestion">
                        Esto ya lo tocaste en:{' '}
                        {entry.suggestions.map((suggestion) => pick(suggestion.factLabel, lang)).join(', ')}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <h3>Lo que ya tenés fuera del plan</h3>
            {join.outsidePlan.length === 0 ? (
              <p className="learning-profile-empty">Nada fuera del plan.</p>
            ) : (
              <ul className="learning-profile-list">
                {join.outsidePlan.map((entry) => (
                  <li key={entry.id}>
                    <strong>{pick(entry.name, lang)}</strong>
                    <span className="learning-profile-level">{pick(entry.level, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="learning-roles" aria-label="Orden de ataque de roles">
        <h2>Orden de ataque de roles</h2>
        <ol className="learning-role-list">
          {plan.roles.map((role) => {
            const phase = phaseByRole.get(role.id);
            return (
              <li key={role.id} className="learning-role">
                <h3>{pick(role.name, lang)}</h3>
                <p>{pick(role.summary, lang)}</p>
                <p className="learning-role-phase">
                  {phase ? (
                    <>
                      <strong>Fase que lo habilita:</strong> {pick(phase.title, lang)}
                    </>
                  ) : (
                    <span>Sin fase asignada en el plan</span>
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="learning-phases" aria-label="Fases del plan">
        <h2>Fases del plan</h2>
        {phases.map((phase) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            plan={plan}
            skills={skills}
            lang={lang}
            progress={progress}
            onResourceStatus={updateResource}
            onGateStatus={(status) => updateGate(phase.id, status)}
          />
        ))}
      </section>

      <section className="learning-anti" aria-label="Anti-lista">
        <h2>Qué no hacer</h2>
        <ul>
          {plan.antiList.map((item) => (
            <li key={item.en}>{pick(item, lang)}</li>
          ))}
        </ul>
      </section>

      <section className="learning-exit" aria-label="Señales de salida">
        <h2>Señales de salida</h2>
        <ul>
          {plan.exitSignals.map((item) => (
            <li key={item.en}>{pick(item, lang)}</li>
          ))}
        </ul>
      </section>

      <section className="learning-reading" aria-label="Material de investigación">
        <h2>Material de investigación</h2>
        <p className="learning-reading-note">
          Lecturas del dominio, ordenadas para profundizar. No forman parte del contrato del plan
          ni del perfil.
        </p>
        <ol className="learning-reading-list">
          {readingList.map((item) => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.title}
              </a>
              <p>{pick(item.description, lang)}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
