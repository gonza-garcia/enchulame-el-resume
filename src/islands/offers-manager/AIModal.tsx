import { useMemo, useState } from 'react';
import InfoTip from './InfoTip';

interface AIModalProps {
  open: boolean;
  title: string;
  tooltip: string;
  prompt: string;
  /** Placeholder del textarea de pegado. */
  pasteHint: string;
  /** Valida el texto pegado y devuelve el dato parseado, o error. */
  onPaste: (raw: string) => void;
  onClose: () => void;
  acceptLabel?: string;
}

/**
 * Modal de dos columnas reutilizado por capturar, analizar y adaptar:
 * columna 1 = prompt compuesto para copiar; columna 2 = output del agente.
 */
export default function AIModal({ open, title, tooltip, prompt, onPaste, onClose, acceptLabel = 'Continuar' }: AIModalProps) {
  const [pasted, setPasted] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => pasted.trim().length > 0, [pasted]);

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

  const handleContinue = () => {
    try {
      onPaste(pasted);
      setPasted('');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-box modal-ai">
        <div className="modal-head">
          <h3>{title}</h3>
          <div className="modal-head-actions">
            <InfoTip>{tooltip}</InfoTip>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <div className="ai-columns">
          <div className="ai-col">
            <div className="ai-col-title">
              <span>1. Prompt para el agente externo</span>
              <button type="button" className="copy-btn" onClick={copyPrompt}>
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <textarea className="ai-prompt" readOnly value={prompt} onFocus={(e) => e.currentTarget.select()} />
          </div>
          <div className="ai-col">
            <div className="ai-col-title">
              <span>2. Pegá el output del agente</span>
            </div>
            <textarea
              className="ai-paste"
              placeholder={pastePlaceholder}
              value={pasted}
              onChange={(e) => {
                setPasted(e.target.value);
                setError(null);
              }}
            />
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" disabled={!canContinue} onClick={handleContinue}>
                {acceptLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const pastePlaceholder =
  'Peg\u00e1 ac\u00e1 la respuesta completa del agente externo (incluyendo el bloque ```json).';
