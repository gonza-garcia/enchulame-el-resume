import { useState } from 'react';
import { type OfferView, POST_BADGE_CLASS } from './contract';
import { type Resume } from '../../schemas/resume';
import { SECTION_TITLES, clientBlock } from '../../lib/resume-sections';

interface OfferPanelProps {
  offer: OfferView;
  lang: 'es' | 'en';
}

function AdaptedCv({ data, activeLang }: { data: Resume; activeLang: 'es' | 'en' }) {
  return (
    <>
      {(['en', 'es'] as const).map((langKey) => (
        <article key={langKey} className={`lang${langKey === activeLang ? ' active' : ''}`} data-lang={langKey} aria-hidden={langKey !== activeLang}>
          <header>
            <h1>{data[langKey].name}</h1>
            <p className="titleline">{data[langKey].title}</p>
            <p className="contactline">
              <span>{data[langKey].contact.phone}</span><span className="sep"> • </span>
              <span>{data[langKey].contact.email}</span><span className="sep"> • </span>
              <span>{data[langKey].contact.location}</span><span className="sep"> • </span>
              <span>{data[langKey].contact.linkedin}</span><span className="sep"> • </span>
              <span>{data[langKey].contact.github}</span>
            </p>
          </header>
          <section>
            <h2>{SECTION_TITLES[langKey].summary}</h2>
            {data[langKey].summary.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </section>
          <section>
            <h2>{SECTION_TITLES[langKey].skills}</h2>
            {data[langKey].skills.map((skill, i) => (
              <div className="skill-line" key={i}>
                <span className="skill-cat">{skill.category}</span>
                <span className="skill-items">{skill.items}</span>
              </div>
            ))}
          </section>
          <section>
            <h2>{SECTION_TITLES[langKey].experience}</h2>
            {data[langKey].experience.map((job, i) => (
              <div className="job" key={i}>
                <div className="job-head">
                  <div className="job-role">{job.role}</div>
                  <div className="job-company">{job.company}</div>
                  <div className="job-dates">{job.startDate} - {job.endDate}</div>
                </div>
                {job.projects.map((project, j) => (
                  <div className="subproject" key={j}>
                    <ul className="bullets">
                      <li className="proj-line"><span aria-hidden="true">{'\u2022 '}</span>{clientBlock(project.name, project.startDate, project.endDate, langKey)}</li>
                      {project.url && <li className="proj-url"><span aria-hidden="true">{'- '}</span>{project.url}</li>}
                      {project.bullets.map((bullet, k) => <li className="bullet-item" key={k}><span aria-hidden="true">{'- '}</span>{bullet}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </section>
          <section>
            <h2>{SECTION_TITLES[langKey].education}</h2>
            {data[langKey].education.map((edu, i) => (
              <div className="edu-entry" key={i}>
                <div className="edu-head">
                  <span className="edu-name">{edu.institution} - {edu.degree}</span>
                  <span className="edu-dates">{edu.startDate} - {edu.endDate}</span>
                </div>
                {edu.note && <div className="edu-note">{edu.note}</div>}
              </div>
            ))}
          </section>
          <section>
            <h2>{SECTION_TITLES[langKey].certifications}</h2>
            {data[langKey].certifications.map((cert, i) => (
              <div className="cert-entry" key={i}>
                <span className="cert-name">{cert.name}</span>
                {cert.note && <div className="cert-note">{cert.note}</div>}
              </div>
            ))}
          </section>
        </article>
      ))}
    </>
  );
}

export default function OfferPanel({ offer, lang }: OfferPanelProps) {
  const [tab, setTab] = useState<'oferta' | 'report'>('oferta');
  const { listing, offerHtml, reportHtml, adaptedResume } = offer;

  return (
    <div className="split-screen">
      <div className="split-left">
        <div className="split-header">
          <h3>Oferta: {listing.meta.empresa} - {listing.meta.rol}</h3>
          {reportHtml && (
            <div className="split-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={tab === 'oferta'} className={tab === 'oferta' ? 'active' : ''} onClick={() => setTab('oferta')}>
                Oferta
              </button>
              <button type="button" role="tab" aria-selected={tab === 'report'} className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>
                Match report
              </button>
            </div>
          )}
        </div>
        {tab === 'oferta' ? (
          <div className="split-content markdown-body" dangerouslySetInnerHTML={{ __html: offerHtml }} />
        ) : (
          <div className="split-content markdown-body" dangerouslySetInnerHTML={{ __html: reportHtml ?? '' }} />
        )}
      </div>
      <div className="split-right">
        {/* Seccion "Postulacion" (Cambio 3): el registro de application.md.
            Sin application.md queda el mensaje neutro, sin acciones: el Submit de
            cualquier postulacion lo aprieta siempre el usuario. */}
        <section className="offer-post" aria-label="Postulación">
          <h4>Postulación</h4>
          {listing.application ? (
            <>
              <div className="offer-post-head">
                <span
                  className={`of-badge ${POST_BADGE_CLASS[listing.application.estado] ?? 'of-badge-borrador'}`}
                >
                  {listing.application.estado}
                </span>
                <span className="offer-post-meta">
                  {listing.application.fecha ?? listing.meta.fecha}
                  {listing.application.ats ? ` · ${listing.application.ats}` : ''}
                </span>
              </div>
              {listing.application.outcome && (
                <p>
                  <b>Outcome:</b> {listing.application.outcome}
                  {listing.application.outcome_fecha ? ` (${listing.application.outcome_fecha})` : ''}
                </p>
              )}
              {listing.application.motivo && (
                <p>
                  <b>Motivo:</b> {listing.application.motivo}
                </p>
              )}
              {listing.application.confirmacion && (
                <>
                  <p className="offer-post-label">Confirmación registrada:</p>
                  <div className="offer-post-quote">{listing.application.confirmacion}</div>
                </>
              )}
              <p className="offer-post-label">Documentos:</p>
              {[listing.application.cv_enviado, listing.application.cover_enviado].filter(Boolean)
                .length > 0 ? (
                <div className="offer-post-row">
                  {[listing.application.cv_enviado, listing.application.cover_enviado]
                    .filter(Boolean)
                    .map((doc) => (
                      <span key={doc} className="chip">
                        {doc}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="offer-post-empty">Sin documentos registrados en application.md.</p>
              )}
            </>
          ) : (
            <p className="offer-post-empty">
              Oferta capturada sin postular: no hay application.md en la carpeta.
            </p>
          )}
        </section>
        {adaptedResume ? (
          <div className="split-content adapted-cv">
            <AdaptedCv data={adaptedResume} activeLang={lang} />
          </div>
        ) : (
          <div className="adapted-empty">
            {listing.hasAdapted ? (
              <p>Hay un adapted-resume.json pero no pasa la validacion de schema. Abrilo y corregilo a mano.</p>
            ) : (
              <>
                <p>Esta oferta todav\u00eda no tiene CV adaptado.</p>
                <p>Us\u00e1 el bot\u00f3n Adaptar CV en la sidebar cuando est\u00e9 en estado Analizada.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
