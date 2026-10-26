import type { Resume } from '../../schemas/resume';
import { SECTION_TITLES, clientBlock } from '../../lib/resume-sections';

/**
 * Vista "CV adaptado" del visor de "Ofertas": el adapted-resume.json de la
 * carpeta, render compacto del CV (locale en del documento).
 */
export default function AdaptedCvView({ data }: { data: Resume }) {
  const cv = data.en ?? data.es;
  const contact = [cv.contact.email, cv.contact.phone, cv.contact.location, cv.contact.linkedin, cv.contact.github]
    .filter((item) => Boolean(item))
    .join(' · ');

  return (
    <div className="of-cv">
      <header className="of-cv-head">
        <p className="of-cv-name">{cv.name}</p>
        <p className="of-cv-role">{cv.title}</p>
        {contact && <p className="of-cv-contact">{contact}</p>}
      </header>

      <section>
        <h4>{SECTION_TITLES.en.summary}</h4>
        {cv.summary.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </section>

      <section>
        <h4>{SECTION_TITLES.en.skills}</h4>
        {cv.skills.map((skill, i) => (
          <p key={i} className="of-cv-line">
            <b>{skill.category}:</b> <span className="muted">{skill.items}</span>
          </p>
        ))}
      </section>

      <section>
        <h4>{SECTION_TITLES.en.experience}</h4>
        {cv.experience.map((job, i) => (
          <div key={i} className="of-cv-job">
            <p className="of-cv-line">
              <b>{job.role}</b> - {job.company} <span className="muted">({job.startDate} - {job.endDate})</span>
            </p>
            {job.projects.map((project, j) => (
              <div key={j} className="of-cv-project">
                <p className="of-cv-line muted">
                  {clientBlock(project.name, project.startDate, project.endDate, 'en')}
                </p>
                {project.url && <p className="of-cv-line muted">{project.url}</p>}
                {project.bullets.length > 0 && (
                  <ul>
                    {project.bullets.map((bullet, k) => (
                      <li key={k}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>

      <section>
        <h4>{SECTION_TITLES.en.education}</h4>
        {cv.education.map((edu, i) => (
          <p key={i} className="of-cv-line">
            <b>{edu.institution}</b> - {edu.degree} <span className="muted">({edu.startDate} - {edu.endDate})</span>
            {edu.note && <span className="muted"> - {edu.note}</span>}
          </p>
        ))}
      </section>

      <section>
        <h4>{SECTION_TITLES.en.certifications}</h4>
        {cv.certifications.map((cert, i) => (
          <p key={i} className="of-cv-line">
            <b>{cert.name}</b>
            {cert.note && <span className="muted"> - {cert.note}</span>}
          </p>
        ))}
      </section>
    </div>
  );
}
