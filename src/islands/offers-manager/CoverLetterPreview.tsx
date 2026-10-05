import { useState } from 'react';
import InfoTip from './InfoTip';
import { type CoverLetterJson, composeCoverLetterMd } from './contract';

/**
 * Vista previa de la cover letter antes de guardar: el usuario ve la carta
 * completa, puede editarla, descargarla, y confirma para pasar al guardado
 * (prompt al agente o descarga manual, igual que los demas archivos).
 */
export default function CoverLetterPreview({ open, meta, locale, initial, onSave, onClose }: {
  open: boolean;
  meta: { empresa: string; rol: string; slug: string; fecha: string };
  locale: 'en' | 'es';
  initial: CoverLetterJson;
  onSave: (letter: CoverLetterJson) => void;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(initial.subject ?? '');
  const [letter, setLetter] = useState(initial.letter);

  if (!open) return null;

  const words = letter.trim().split(/\s+/).filter(Boolean).length;

  const download = () => {
    const content = composeCoverLetterMd(
      { empresa: meta.empresa, rol: meta.rol, fecha: meta.fecha },
      { subject: subject || null, letter, locale }
    );
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cover-letter.md';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Cover letter">
      <div className="modal-box modal-cover">
        <div className="modal-head">
          <h3>Cover letter: {meta.empresa}</h3>
          <div className="modal-head-actions">
            <InfoTip>
              {'La carta que escribi\u00f3 el agente, lista para revisar. Pod\u00e9s editar el texto ac\u00e1 mismo antes de guardar: lo que quede en este cuadro es lo que se compone en docs/job-offers/' + meta.slug + '/cover-letter.md. Descargala cuando quieras. Al continuar, el guardado pasa por el mismo flujo verbatim de siempre (prompt al agente que escribe el archivo, o descarga manual, y verificaci\u00f3n inline).'}
            </InfoTip>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <label className="form-field">
          <span className="form-label">Subject (asunto del email, opcional)</span>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>

        <textarea
          className="cover-text"
          rows={16}
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
        />
        <p className={`cover-words${words > 350 ? ' over' : ''}`}>
          {words} palabras {words > 350 ? '(la skill recomienda 250-350: recort\u00e1 antes de enviar)' : ''}
        </p>

        <div className="modal-actions cover-actions">
          <button type="button" className="link-btn" onClick={download}>
            Descargar cover-letter.md
          </button>
          <span className="spacer-h"></span>
          <button type="button" className="primary-btn" onClick={() => onSave({ subject: subject || null, letter, locale })}>
            Continuar al guardado
          </button>
        </div>
      </div>
    </div>
  );
}
