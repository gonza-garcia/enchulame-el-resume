import { useState } from 'react';
import InfoTip from './InfoTip';
import { type OfferListing } from './contract';
import { type FileToWrite, savePrompt, SKILL_ADAPT, SKILL_CAPTURE } from './prompts';

interface SaveModalProps {
  open: boolean;
  title: string;
  tooltip: string;
  files: FileToWrite[];
  /** Verifica contra el endpoint que el archivo de la acción existe en disco. */
  verifySlug: string | null;
  onClose: () => void;
}

const FILE_FLAGS: Record<string, keyof Pick<OfferListing, 'hasOffer' | 'hasReport' | 'hasAdapted' | 'hasCoverLetter'>> = {
  'offer.md': 'hasOffer',
  'match-report.md': 'hasReport',
  'adapted-resume.json': 'hasAdapted',
  'cover-letter.md': 'hasCoverLetter'
};

export default function SaveModal({ open, title, tooltip, files, verifySlug, onClose }: SaveModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<'idle' | 'checking' | 'ok' | 'missing'>('idle');
  const [verifyDetail, setVerifyDetail] = useState<string>('');

  if (!open) return null;

  const firstFile = files[0]?.path.split('/').pop() ?? '';
  const skillHint = firstFile === 'offer.md' ? SKILL_CAPTURE : SKILL_ADAPT;
  const fullPrompt = savePrompt(files, skillHint);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied('prompt');
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const download = (file: FileToWrite) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.path.split('/').pop() || 'archivo.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const verify = async () => {
    if (!verifySlug) return;
    setVerifyState('checking');
    try {
      const res = await fetch('/api/job-offers.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { offers: OfferListing[] };
      const listing = data.offers.find((o) => o.slug === verifySlug);
      const flag = FILE_FLAGS[firstFile];
      const fileFound = Boolean(listing && flag && listing[flag]);
      if (fileFound) {
        setVerifyState('ok');
        setVerifyDetail(`El archivo ${firstFile} de ${verifySlug} est\u00e1 en disco.`);
      } else if (listing) {
        setVerifyState('missing');
        setVerifyDetail(
          `La carpeta existe pero todav\u00eda no hay ${firstFile} en docs/job-offers/${verifySlug}/. Si el agente termin\u00f3 hace poco, esper\u00e1 unos segundos y reintent\u00e1 (en dev el endpoint se recalcula por request).`
        );
      } else {
        setVerifyState('missing');
        setVerifyDetail(
          `La app no encontr\u00f3 docs/job-offers/${verifySlug}/. Si el agente termin\u00f3 hace poco, esper\u00e1 unos segundos y reintent\u00e1 (en dev el endpoint se recalcula por request).`
        );
      }
    } catch (e) {
      setVerifyState('missing');
      setVerifyDetail(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-box modal-save">
        <div className="modal-head">
          <h3>{title}</h3>
          <div className="modal-head-actions">
            <InfoTip>{tooltip}</InfoTip>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <ol className="save-steps">
          <li>
            Copiá el prompt y pegalo en tu agente (con acceso a este repo, p.ej. opencode o Claude
            Code en otra sesión): escribe los archivos verbatim usando el contrato de
            capture-job-offer.
          </li>
          <li>
            Sin agente a mano: descargá los archivos y ubicalos a mano en las rutas indicadas.
          </li>
          <li>
            Cuando el agente termine, apretá Verificar: la app consulta el listado en disco y te
            confirma acá mismo (sin recargar la página).
          </li>
        </ol>

        <div className="save-files">
          {files.map((f) => (
            <div className="save-file" key={f.path}>
              <div className="save-file-head">
                <code>{f.path}</code>
                <div className="save-file-actions">
                  <button type="button" className="link-btn" onClick={() => setExpanded(expanded === f.path ? null : f.path)}>
                    {expanded === f.path ? 'Ocultar' : 'Ver contenido'}
                  </button>
                  <button type="button" className="link-btn" onClick={() => download(f)}>
                    Descargar
                  </button>
                </div>
              </div>
              {expanded === f.path && <pre className="save-file-content">{f.content}</pre>}
            </div>
          ))}
        </div>

        <div className="modal-actions save-actions">
          <button type="button" className="primary-btn" onClick={copyPrompt}>
            {copied === 'prompt' ? 'Prompt copiado' : 'Copiar prompt para el agente'}
          </button>
          <button type="button" onClick={verify} disabled={!verifySlug || verifyState === 'checking'}>
            {verifyState === 'checking' ? 'Verificando...' : 'Verificar'}
          </button>
        </div>

        {verifyState === 'ok' && (
          <p className="verify-result verify-ok">
            ✓ {verifyDetail} Cerrá este modal y recarg\u00e1 la página para ver la sidebar y el badge actualizados.
          </p>
        )}
        {verifyState === 'missing' && (
          <p className="verify-result verify-bad">✗ {verifyDetail}</p>
        )}
      </div>
    </div>
  );
}
