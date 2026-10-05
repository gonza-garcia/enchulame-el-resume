import {
  Fragment,
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent
} from 'react';
import {
  INTERVIEW_FREQUENCIES,
  INTERVIEW_LEVELS,
  INTERVIEW_ROLES,
  type InterviewFrequency,
  type InterviewLevel,
  type InterviewMcq,
  type InterviewProgress,
  type InterviewProgressEntry,
  type InterviewRole,
  type InterviewScenario
} from '../../schemas/interview-questions';
import {
  areaLabel,
  countProgressedQuestions,
  filterAndSortQuestions,
  FREQUENCY_LABELS,
  interviewProgressStore,
  LEVEL_LABELS,
  PROGRESS_STATUSES,
  PROGRESS_STATUS_LABELS,
  questionProgress,
  ROLE_LABELS,
  setQuestionProgress,
  type InterviewFilters,
  type InterviewQuestionView,
  type InterviewSort,
  type RenderedCodeBlock
} from '../../lib/interview-prep';
import {
  CLEAR_MESSAGE,
  clearProgress as clearStoredProgress,
  exportProgress,
  importProgressFile,
  loadProgress,
  saveProgress
} from '../../lib/progress-storage';
import { LEVEL_STYLE_STORAGE_KEY } from '../../scripts/storage-keys';

const LEVEL_STYLES = ['traffic', 'cool', 'neutral'] as const;
type LevelStyle = (typeof LEVEL_STYLES)[number];
const LEVEL_STYLE_LABELS: Record<LevelStyle, string> = {
  traffic: 'Semáforo',
  cool: 'Fría',
  neutral: 'Neutra'
};

interface SourceLink {
  label: string;
  url: string;
}

interface RenderedScenario extends Omit<InterviewScenario, 'code'> {
  code: RenderedCodeBlock;
}

interface QuizView {
  area: string;
  mcqs: InterviewMcq[];
  scenarios: RenderedScenario[];
}

interface AreaGroup {
  label: string;
  areas: string[];
}

interface PlanAreaLink {
  phaseId: string;
  phaseTitle: { es: string; en: string };
  skillNames: { es: string; en: string }[];
}

interface InterviewPrepProps {
  questions: InterviewQuestionView[];
  quizzes: QuizView[];
  areaLabels: Record<string, string>;
  areaGroups: AreaGroup[];
  sources: SourceLink[];
  planLinks?: Record<string, PlanAreaLink>;
}

const ALL_LEVELS: InterviewLevel[] = [...INTERVIEW_LEVELS];
const ALL_ROLES: InterviewRole[] = [...INTERVIEW_ROLES];
const ALL_FREQUENCIES: InterviewFrequency[] = [...INTERVIEW_FREQUENCIES];

function initialFilters(areas: string[]): InterviewFilters {
  return {
    areas,
    levels: ALL_LEVELS,
    roles: ALL_ROLES,
    frequencies: ALL_FREQUENCIES,
    search: '',
    onlyTricky: false,
    onlyCode: false
  };
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function levelClass(level: InterviewLevel): string {
  return `level-${level}`;
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
      })}
    </>
  );
}

function MarkdownText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="answer-copy">
      {blocks.map((block, blockIndex) => {
        const lines = block.split(/\r?\n/);
        const isList = lines.every((line) => line.trimStart().startsWith('- '));
        if (isList) {
          return (
            <ul key={`${blockIndex}-${block}`}>
              {lines.map((line) => <li key={line}><InlineText text={line.trimStart().slice(2)} /></li>)}
            </ul>
          );
        }
        return (
          <p key={`${blockIndex}-${block}`}>
            {lines.map((line, lineIndex) => (
              <Fragment key={`${line}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                <InlineText text={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function CodeBlock({ block }: { block: RenderedCodeBlock }) {
  return (
    <figure className="interview-code">
      <div className="code-label">
        <span>{block.language}</span>
        <span>{block.caption}</span>
      </div>
      <div className="code-output" dangerouslySetInnerHTML={{ __html: block.html }} />
    </figure>
  );
}

function CheckboxGroup<T extends string>({
  label,
  values,
  selected,
  labels,
  onToggle
}: {
  label: string;
  values: T[];
  selected: T[];
  labels: Record<T, string>;
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      <div className="checkbox-list">
        {values.map((value) => (
          <label key={value} className="checkbox-row">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
            />
            <span>{labels[value]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FilterSidebar({
  filters,
  areas,
  areaGroups,
  areaLabels,
  levelStyle,
  onUpdate,
  onSetLevelStyle,
  onReset
}: {
  filters: InterviewFilters;
  areas: string[];
  areaGroups: AreaGroup[];
  areaLabels: Record<string, string>;
  levelStyle: LevelStyle;
  onUpdate: (updater: (current: InterviewFilters) => InterviewFilters) => void;
  onSetLevelStyle: (style: LevelStyle) => void;
  onReset: () => void;
}) {
  const selectedAreaCount = filters.areas.length;

  return (
    <aside className="interview-filters" aria-label="Filtros de preguntas">
      <div className="filters-heading">
        <div>
          <p className="eyebrow">Afiná tu práctica</p>
          <h2>Filtros</h2>
        </div>
        <button type="button" className="text-button" onClick={onReset}>Limpiar</button>
      </div>

      <label className="search-field">
        <span>Buscar</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onUpdate((current) => ({ ...current, search: event.target.value }))}
          placeholder="React, caching, leadership..."
          aria-label="Buscar en las preguntas"
        />
      </label>

      <div className="filter-summary" aria-live="polite">
        {selectedAreaCount === areas.length ? 'Todas las áreas' : `${selectedAreaCount} áreas seleccionadas`}
      </div>

      <fieldset className="filter-group area-filter-group">
        <legend>Área</legend>
        <div className="area-groups">
          {areaGroups.map((group) => (
            <div key={group.label} className="area-group">
              <p>{group.label}</p>
              {group.areas.map((area) => (
                <label key={area} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={filters.areas.includes(area)}
                    onChange={() => onUpdate((current) => ({
                      ...current,
                      areas: toggleValue(current.areas, area)
                    }))}
                  />
                  <span>{areaLabel(area, areaLabels)}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </fieldset>

      <CheckboxGroup
        label="Nivel"
        values={ALL_LEVELS}
        selected={filters.levels}
        labels={LEVEL_LABELS}
        onToggle={(value) => onUpdate((current) => ({
          ...current,
          levels: toggleValue(current.levels, value) as InterviewLevel[]
        }))}
      />
      <CheckboxGroup
        label="Rol"
        values={ALL_ROLES}
        selected={filters.roles}
        labels={ROLE_LABELS}
        onToggle={(value) => onUpdate((current) => ({
          ...current,
          roles: toggleValue(current.roles, value) as InterviewRole[]
        }))}
      />
      <CheckboxGroup
        label="Frecuencia"
        values={ALL_FREQUENCIES}
        selected={filters.frequencies}
        labels={FREQUENCY_LABELS}
        onToggle={(value) => onUpdate((current) => ({
          ...current,
          frequencies: toggleValue(current.frequencies, value) as InterviewFrequency[]
        }))}
      />

      <fieldset className="filter-group">
        <legend>Atajos</legend>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={filters.onlyTricky}
            onChange={(event) => onUpdate((current) => ({ ...current, onlyTricky: event.target.checked }))}
          />
          <span>Solo tricky</span>
        </label>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={filters.onlyCode}
            onChange={(event) => onUpdate((current) => ({ ...current, onlyCode: event.target.checked }))}
          />
          <span>Tiene código</span>
        </label>
      </fieldset>

      <fieldset className="filter-group level-style-group">
        <legend>Colores por nivel</legend>
        <div className="style-picker" role="group" aria-label="Estilo de colores por nivel">
          {LEVEL_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              className={levelStyle === style ? 'style-choice active' : 'style-choice'}
              aria-pressed={levelStyle === style}
              onClick={() => onSetLevelStyle(style)}
            >
              {LEVEL_STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}

function QuestionCard({
  question,
  areaLabel,
  active,
  onSelect
}: {
  question: InterviewQuestionView;
  areaLabel: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? 'question-card active' : 'question-card'}
      aria-pressed={active}
      onClick={onSelect}
    >
      <span className="card-topline">
        <span className={`level-pill ${levelClass(question.level)}`}>{LEVEL_LABELS[question.level]}</span>
        <span className="card-index">{question.id.split('-').slice(-1)[0]}</span>
      </span>
      <span className="card-area">{areaLabel}</span>
      <span className="card-question">{question.question.en}</span>
      <span className="card-footer">
        <span>{question.topic.replaceAll('-', ' ')}</span>
        <span className="card-flags" aria-label="Características">
          {question.trickies.length > 0 && <span title="Tiene tricky">T</span>}
          {question.codeBlocks.length > 0 && <span title="Tiene código">&lt;/&gt;</span>}
        </span>
      </span>
    </button>
  );
}

function DetailPanel({
  question,
  areaLabel,
  answerOpen,
  progress,
  onToggleAnswer,
  onPractice,
  onProgressChange
}: {
  question: InterviewQuestionView | null;
  areaLabel: string;
  answerOpen: boolean;
  progress: InterviewProgressEntry;
  onToggleAnswer: () => void;
  onPractice: () => void;
  onProgressChange: (patch: Partial<InterviewProgressEntry>) => void;
}) {
  if (!question) {
    return (
      <section className="detail-panel empty-detail" aria-label="Detalle de pregunta">
        <p className="eyebrow">No hay coincidencias</p>
        <h2>Probá con otros filtros</h2>
        <p>Ampliá el área, el nivel o la búsqueda para volver a ver preguntas.</p>
      </section>
    );
  }

  return (
    <section className="detail-panel" aria-label="Detalle de pregunta" data-question-id={question.id}>
      <div className="detail-topline">
        <div className="detail-meta">
          <span className={`level-pill ${levelClass(question.level)}`}>{LEVEL_LABELS[question.level]}</span>
          <span className="detail-area">{areaLabel}</span>
          <span className="detail-frequency">{FREQUENCY_LABELS[question.frequency]}</span>
        </div>
        <button type="button" className="practice-link" onClick={onPractice}>
          Practicar esta área
        </button>
      </div>
      <p className="detail-topic">{question.topic.replaceAll('-', ' ')}</p>
      <h2>{question.question.en}</h2>

      <button
        type="button"
        className="answer-toggle"
        aria-expanded={answerOpen}
        aria-controls={`answer-${question.id}`}
        onClick={onToggleAnswer}
      >
        <span>{answerOpen ? 'Ocultar respuesta' : 'Ver respuesta'}</span>
        <span aria-hidden="true">{answerOpen ? '−' : '+'}</span>
      </button>

      <div id={`answer-${question.id}`} className="answer-panel" hidden={!answerOpen}>
        <MarkdownText text={question.answer.en} />
        {question.codeBlocks.map((block) => <CodeBlock key={`${question.id}-${block.caption}`} block={block} />)}
      </div>

      {question.trickies.length > 0 && (
        <div className="tricky-list">
          <div className="section-kicker">
            <span className="section-dot" />
            Follow-ups tricky
          </div>
          {question.trickies.map((tricky, index) => (
            <article key={`${tricky.question}-${index}`} className="tricky-item">
              <h3>{tricky.question}</h3>
              <p><strong>Respuesta:</strong> {tricky.answer}</p>
              <p className="trap-note"><strong>El trap:</strong> {tricky.trap}</p>
            </article>
          ))}
        </div>
      )}

      <div className="progress-block">
        <div className="section-kicker">
          <span className="section-dot" />
          Tu progreso
        </div>
        <div className="status-picker" role="group" aria-label="Estado de aprendizaje">
          {PROGRESS_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={progress.status === status ? 'status-choice active' : 'status-choice'}
              aria-pressed={progress.status === status}
              onClick={() => onProgressChange({ status })}
            >
              {PROGRESS_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        <label className="note-field">
          <span>Notas</span>
          <textarea
            value={progress.note}
            onChange={(event) => onProgressChange({ note: event.target.value })}
            placeholder="Tu resumen, trampas a recordar, links..."
            rows={4}
          />
        </label>
      </div>

      <div className="detail-bottom">
        <div className="role-list" aria-label="Roles relacionados">
          {question.roles.map((role) => <span key={role}>{ROLE_LABELS[role]}</span>)}
        </div>
        <div className="source-links">
          {question.sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuizPanel({ quiz, areaTitle }: { quiz: QuizView; areaTitle: string }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  return (
    <div className="quiz-panel">
      <div className="quiz-intro">
        <p className="eyebrow">Práctica guiada</p>
        <h3>{areaTitle}</h3>
        <p>Contestá sin mirar y abrí la explicación para calibrar tu respuesta.</p>
      </div>
      <div className="mcq-list">
        {quiz.mcqs.map((mcq, index) => {
          const selected = answers[mcq.id];
          const answered = selected !== undefined;
          return (
            <fieldset className="mcq" key={mcq.id}>
              <legend><span>{String(index + 1).padStart(2, '0')}</span>{mcq.question}</legend>
              <div className="mcq-options">
                {mcq.options.map((option, optionIndex) => (
                  <label
                    key={option}
                    className={answered && optionIndex === mcq.correctIndex ? 'mcq-option correct' : 'mcq-option'}
                  >
                    <input
                      type="radio"
                      name={mcq.id}
                      value={optionIndex}
                      checked={selected === optionIndex}
                      onChange={() => setAnswers((current) => ({ ...current, [mcq.id]: optionIndex }))}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {answered && (
                <div className={selected === mcq.correctIndex ? 'mcq-feedback good' : 'mcq-feedback'}>
                  <strong>{selected === mcq.correctIndex ? 'Correcto' : 'Revisá esta'}</strong>
                  <p>{mcq.explanation}</p>
                </div>
              )}
            </fieldset>
          );
        })}
      </div>
      <div className="scenario-list">
        <div className="section-kicker"><span className="section-dot" />Escenarios de código</div>
        {quiz.scenarios.map((scenario) => (
          <details className="scenario" key={scenario.id}>
            <summary>{scenario.prompt}</summary>
            <CodeBlock block={scenario.code} />
            <div className="scenario-answer">
              <h4>Respuesta modelo</h4>
              <MarkdownText text={scenario.modelAnswer} />
              <h4>Qué busca el entrevistador</h4>
              <ul>
                {scenario.rubric.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function InterviewPrep({
  questions,
  quizzes,
  areaLabels,
  areaGroups,
  sources,
  planLinks = {}
}: InterviewPrepProps) {
  const areas = areaGroups.flatMap((group) => group.areas);
  const [filters, setFilters] = useState<InterviewFilters>(() => initialFilters(areas));
  const [sort, setSort] = useState<InterviewSort>('level-asc');
  const [randomSeed, setRandomSeed] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [levelStyle, setLevelStyle] = useState<LevelStyle>('traffic');
  const [practiceArea, setPracticeArea] = useState<string | null>(null);
  const [progress, setProgress] = useState<InterviewProgress>(() =>
    loadProgress(interviewProgressStore)
  );
  const [progressFeedback, setProgressFeedback] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const deferredSearch = useDeferredValue(filters.search);
  const effectiveFilters = { ...filters, search: deferredSearch };
  const visibleQuestions = filterAndSortQuestions(
    questions,
    effectiveFilters,
    sort,
    randomSeed,
    areaLabels
  );
  const selected = visibleQuestions.find((question) => question.id === selectedId) ?? visibleQuestions[0] ?? null;
  const selectedAreaLabel = selected ? areaLabel(selected.area, areaLabels) : '';
  const selectedQuiz = practiceArea ? quizzes.find((quiz) => quiz.area === practiceArea) ?? null : null;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEVEL_STYLE_STORAGE_KEY);
      if (stored && (LEVEL_STYLES as readonly string[]).includes(stored)) {
        setLevelStyle(stored as LevelStyle);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LEVEL_STYLE_STORAGE_KEY, levelStyle);
    } catch {}
  }, [levelStyle]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('quiz');
    if (requested && quizzes.some((quiz) => quiz.area === requested)) {
      setPracticeArea(requested);
      window.requestAnimationFrame(() => {
        document.getElementById('practice')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [quizzes]);

  useEffect(() => {
    setProgress(loadProgress(interviewProgressStore));
  }, []);

  useEffect(() => {
    saveProgress(interviewProgressStore, progress);
  }, [progress]);

  useEffect(() => {
    if (selected?.id !== selectedId) setSelectedId(selected?.id ?? null);
  }, [selected?.id, selectedId]);

  useEffect(() => {
    setAnswerOpen(false);
  }, [selected?.id]);

  const resetFilters = () => {
    startTransition(() => setFilters(initialFilters(areas)));
  };

  const changeSort = (nextSort: InterviewSort) => {
    setSort(nextSort);
    if (nextSort === 'random') setRandomSeed((seed) => seed + 1);
  };

  const reshuffleRandom = () => {
    setRandomSeed((seed) => seed + 1);
  };

  const showPractice = (area: string) => {
    setPracticeArea(area);
    window.requestAnimationFrame(() => {
      document.getElementById('practice')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const updateQuestionProgress = (patch: Partial<InterviewProgressEntry>) => {
    if (!selected) return;
    setProgress((current) => setQuestionProgress(current, selected.id, patch));
    setProgressFeedback(null);
  };

  const exportProgressFile = () => {
    exportProgress(interviewProgressStore, progress, 'interview-progress.json');
  };

  const importProgress = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = await importProgressFile(interviewProgressStore, file);
    if (result.ok) setProgress(result.value);
    setProgressFeedback(result.message);
  };

  const clearProgress = () => {
    setProgress(clearStoredProgress(interviewProgressStore));
    setProgressFeedback(CLEAR_MESSAGE);
  };

  return (
    <div className={`interview-app level-style-${levelStyle}`}>
      <header className="interview-header">
        <div className="interview-header-inner">
          <div className="interview-brand-row">
            <a className="interview-back" href="/">← CV principal</a>
            <span className="header-rule" aria-hidden="true" />
            <span className="header-label">Interview prep</span>
          </div>
          <div className="interview-heading">
            <div>
              <p className="eyebrow">Una pregunta a la vez</p>
              <h1>Prep entrevistas</h1>
              <p className="header-description">
                Un mapa de estudio para responder con claridad, reconocer el trap y practicar lo que realmente preguntan.
              </p>
            </div>
            <div className="header-stats" aria-label="Resumen del banco">
              <div><strong>{questions.length}</strong><span>preguntas</span></div>
              <div><strong>{questions.filter((question) => question.trickies.length > 0).length}</strong><span>con tricky</span></div>
              <div><strong>{quizzes.length}</strong><span>áreas de quiz</span></div>
            </div>
          </div>
        </div>
      </header>

      <div className="interview-layout">
        <FilterSidebar
          filters={filters}
          areas={areas}
          areaGroups={areaGroups}
          areaLabels={areaLabels}
          levelStyle={levelStyle}
          onUpdate={setFilters}
          onSetLevelStyle={setLevelStyle}
          onReset={resetFilters}
        />

        <main className="interview-main" id="main-content">
          <div className="results-toolbar">
            <div>
              <p className="eyebrow">Banco de preguntas</p>
              <p className="results-count" aria-live="polite">
                <strong>{visibleQuestions.length}</strong> resultados
              </p>
            </div>
            <div className="toolbar-tools">
              <div className="progress-tools" role="group" aria-label="Progreso de estudio">
                <span className="progress-count">
                  {countProgressedQuestions(progress)}/{questions.length} con avance
                </span>
                <button type="button" className="progress-btn" onClick={exportProgressFile}>
                  Exportar progreso
                </button>
                <button type="button" className="progress-btn" onClick={() => importInputRef.current?.click()}>
                  Importar progreso
                </button>
                <button type="button" className="progress-btn" onClick={clearProgress}>
                  Limpiar progreso
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  aria-label="Archivo de progreso"
                  onChange={importProgress}
                />
              </div>
              <div className="sort-controls">
                <label className="sort-field">
                  <span>Ordenar</span>
                  <select value={sort} onChange={(event) => changeSort(event.target.value as InterviewSort)}>
                    <option value="level-asc">Nivel, de menor a mayor</option>
                    <option value="level-desc">Nivel, de mayor a menor</option>
                    <option value="frequency">Frecuencia</option>
                    <option value="random">Aleatorio</option>
                    <option value="area">Por área</option>
                  </select>
                </label>
                {sort === 'random' && (
                  <button type="button" className="reshuffle-button" onClick={reshuffleRandom}>
                    Re-mezclar
                  </button>
                )}
              </div>
            </div>
          </div>

          {progressFeedback && (
            <p className="progress-feedback" role="status">{progressFeedback}</p>
          )}

          <DetailPanel
            question={selected}
            areaLabel={selectedAreaLabel}
            answerOpen={answerOpen}
            progress={selected ? questionProgress(progress, selected.id) : { status: 'sin-marcar', note: '' }}
            onToggleAnswer={() => setAnswerOpen((open) => !open)}
            onPractice={() => selected && showPractice(selected.area)}
            onProgressChange={updateQuestionProgress}
          />

          <section className="question-section" aria-labelledby="question-grid-title">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Explorá el banco</p>
                <h2 id="question-grid-title">Preguntas</h2>
              </div>
              <span className="section-count">{visibleQuestions.length} tarjetas</span>
            </div>
            {visibleQuestions.length > 0 ? (
              <div className="question-grid">
                {visibleQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    areaLabel={areaLabel(question.area, areaLabels)}
                    active={question.id === selected?.id}
                    onSelect={() => {
                      setSelectedId(question.id);
                      setAnswerOpen(false);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <span className="no-results-mark">/</span>
                <h3>No encontramos preguntas con esos filtros.</h3>
                <p>Limpiá algún filtro o probá con otra palabra clave.</p>
                <button type="button" className="primary-button" onClick={resetFilters}>Restablecer filtros</button>
              </div>
            )}
          </section>

          <section className="practice-section" id="practice" aria-labelledby="practice-title">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Más allá de la respuesta</p>
                <h2 id="practice-title">Práctica y quizzes</h2>
              </div>
              <span className="section-count">{quizzes.reduce((count, quiz) => count + quiz.mcqs.length, 0)} preguntas de quiz</span>
            </div>
            <div className="quiz-area-picker" role="list" aria-label="Áreas de quiz">
              {quizzes.map((quiz) => {
                const planLink = planLinks[quiz.area];
                return (
                  <div key={quiz.area} role="listitem" className="quiz-area-item">
                    <button
                      type="button"
                      className={practiceArea === quiz.area ? 'quiz-area-button active' : 'quiz-area-button'}
                      aria-pressed={practiceArea === quiz.area}
                      onClick={() => setPracticeArea(quiz.area)}
                    >
                      <span>{areaLabel(quiz.area, areaLabels)}</span>
                      <small>{quiz.mcqs.length} preguntas · {quiz.scenarios.length} escenarios</small>
                    </button>
                    {planLink && (
                      <div className="quiz-area-plan">
                        <small>
                          Fase del plan: {planLink.phaseTitle.es}. Skills:{' '}
                          {planLink.skillNames.map((name) => name.es).join(', ')}
                        </small>
                        <a href={`/learning/#${planLink.phaseId}`}>Ver en el plan</a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedQuiz ? (
              <QuizPanel quiz={selectedQuiz} areaTitle={areaLabel(selectedQuiz.area, areaLabels)} />
            ) : (
              <div className="quiz-placeholder">
                <span className="placeholder-line" />
                <p>Elegí un área para abrir su quiz y sus escenarios de código.</p>
              </div>
            )}
          </section>

          <section className="sources-section" aria-labelledby="sources-title">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Lecturas de respaldo</p>
                <h2 id="sources-title">Fuentes globales</h2>
              </div>
              <span className="section-count">{sources.length} enlaces</span>
            </div>
            <div className="sources-grid">
              {sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                  <span>{source.label}</span>
                  <small>{new URL(source.url).hostname.replace(/^www\./, '')}</small>
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
