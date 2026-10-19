import type { CoverLetterFile } from '../../lib/job-offers';
import { downloadCoverLetterDocx } from '../../scripts/docx-export';
import { exportFileName, fileAsName } from '../../lib/file-name';
import InfoTip from './InfoTip';

interface CoverLetterModalProps {
  open: boolean;
  userName: string;
  meta: { empresa: string; rol: string; slug: string; fecha: string };
  letter: CoverLetterFile | null;
  onClose: () => void;
}

/**
 * Lectura de la cover letter ya guardada en disco. La carta la escribe la skill
 * adapt-resume-to-offer (la propone, pide aprobacion y la guarda directo), asi
 * que aca solo se muestra, se imprime a PDF y se exporta a DOCX.
 */
export default function CoverLetterModal({ open, userName, meta, letter, onClose }: CoverLetterModalProps) {
  if (!open) return null;

  const body = letter?.letter ?? '';
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const paragraphs = body.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  const downloadDocx = async () => {
    await downloadCoverLetterDocx(
      {
        subject: letter?.subject ?? null,
        letter: body,
        empresa: meta.empresa,
        rol: meta.rol
      },
      exportFileName(userName, 'Cover Letter', letter?.locale ?? 'en', 'docx')
    );
  };

  const printPdf = () => {
    const esc = (raw: string) =>
      raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!doctype html>
<html lang="${letter?.locale ?? 'en'}">
<head>
<meta charset="utf-8">
<title>${esc(`${fileAsName(userName)} - Cover Letter - ${(letter?.locale ?? 'en').toUpperCase()}`)}</title>
<style>
  @page { margin: 2.2cm; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #111; max-width: 42em; margin: 0 auto; }
  h1 { font-size: 13pt; margin: 0 0 18pt; }
  p { margin: 0 0 12pt; }
</style>
</head>
<body>
${letter?.subject ? `<h1>${esc(letter.subject)}</h1>` : ''}
${paragraphs.map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('\n')}
</body>
</html>`;
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    frame.srcdoc = html;
    frame.onload = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } finally {
        setTimeout(() => frame.remove(), 1500);
      }
    };
    document.body.appendChild(frame);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Cover letter: ${meta.empresa}`}>
      <div className="modal-box modal-cover">
        <div className="modal-head">
          <h3>Cover letter: {meta.empresa}</h3>
          <div className="modal-head-actions">
            <InfoTip>
              {'La carta la escribe y guarda la skill adapt-resume-to-offer, asi que aca solo se lee. Queda en docs/job-offers/' +
                meta.slug +
                '/cover-letter.md y no cambia el estado de la oferta. Podes imprimirla a PDF (usa el dialogo del navegador) o bajarla en DOCX.'}
            </InfoTip>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {letter?.subject && <p className="cover-subject">{letter.subject}</p>}

        <div className="cover-text" tabIndex={0}>
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <p className="cover-words">
          {words} palabras · docs/job-offers/{meta.slug}/cover-letter.md
        </p>

        <div className="modal-actions">
          <button type="button" className="primary-btn" onClick={printPdf}>
            Guardar como PDF
          </button>
          <button type="button" onClick={downloadDocx}>
            Descargar DOCX
          </button>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
