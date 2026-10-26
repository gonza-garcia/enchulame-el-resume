import { useState } from 'react';
import { addProfilePrompt } from './prompts';

interface ProfilePromptModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Puente de prompts de "+ Agregar perfil": copia el prompt para una sesion de
 * agente con acceso al repo (mismo mecanismo que el gestor de ofertas con
 * capture-job-offer). La skill build-profile no se toca: el prompt la referencia.
 */
export default function ProfilePromptModal({ open, onClose }: ProfilePromptModalProps) {
  const [copied, setCopied] = useState(false);
  const prompt = addProfilePrompt();

  if (!open) return null;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Agregar perfil"
      onClick={onClose}
    >
      <div className="modal-box modal-ai" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>Agregar perfil</h3>
          <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="ai-columns">
          <div className="ai-col">
            <div className="ai-col-title">
              <span>Prompt para el agente externo</span>
              <button type="button" className="copy-btn" onClick={copyPrompt}>
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <textarea
              className="ai-prompt"
              readOnly
              value={prompt}
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
        </div>
        <p className="of-modal-hint">
          El agente usa <code>skills/job-seeking/build-profile/SKILL.md</code> en modo directo y
          agrega el posicionamiento nuevo a <code>src/content/profile.json</code>. Recargá esta
          página para ver el perfil en los filtros.
        </p>
      </div>
    </div>
  );
}
