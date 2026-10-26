import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InfoTip from './InfoTip';
import {
  type OfferFormValues,
  todayIso,
  parsePlainOffer,
  parseCapture
} from './contract';
import { capturePrompt } from './prompts';
import AIModal from './AIModal';

const formSchema = z
  .object({
    url: z.union([z.literal(''), z.url('El link no es una URL valida')]),
    fecha: z.string().min(1),
    empresa: z.string().trim().min(1, 'Requerido'),
    rol: z.string().min(1, 'Requerido'),
    ofertaTexto: z.string(),
    modalidad: z.enum(['remote', 'hybrid', 'onsite', 'unknown']),
    location: z.string().trim(),
    descripcionEmpresa: z.string().trim(),
    salario: z.string().trim(),
    recruiter: z.string().trim(),
    seniority: z.string().trim(),
    stack: z.string().trim(),
    perfiles: z.string().trim()
  })
  .refine((v) => (v.url ? true : (v.ofertaTexto ?? '').trim().length > 0), {
    message: 'Necesit\u00e1s el link O el texto completo de la oferta',
    path: ['ofertaTexto']
  })
  .refine((v) => ((v.ofertaTexto ?? '').trim() ? true : !!v.url), {
    message: 'Necesit\u00e1s el link O el texto de la oferta',
    path: ['url']
  });

interface AddOfferModalProps {
  open: boolean;
  isDev: boolean;
  onClose: () => void;
  onSubmit: (values: OfferFormValues) => void;
}

export default function AddOfferModal({ open, isDev, onClose, onSubmit }: AddOfferModalProps) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLink, setAiLink] = useState<string | null>(null);

  const defaults: OfferFormValues = useMemo(
    () => ({
      url: '',
      fecha: todayIso(),
      empresa: '',
      rol: '',
      ofertaTexto: '',
      modalidad: 'unknown',
      location: '',
      descripcionEmpresa: '',
      salario: '',
      recruiter: '',
      seniority: '',
      stack: '',
      perfiles: ''
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors }
  } = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, reset, defaults]);

  if (!open) return null;

  const openAi = (withLink: boolean) => {
    const values = getValues();
    setAiLink(withLink ? values.url || null : null);
    setAiOpen(true);
  };

  const handleCapture = (raw: string) => {
    const parsed = parseCapture(raw);
    reset({
      ...getValues(),
      url: parsed.url ?? getValues().url ?? '',
      fecha: parsed.fecha || todayIso(),
      empresa: parsed.empresa,
      rol: parsed.rol,
      ofertaTexto: parsed.oferta_texto,
      modalidad: parsed.modalidad,
      location: parsed.location ?? '',
      salario: parsed.salario ?? getValues().salario,
      recruiter: parsed.recruiter ?? getValues().recruiter,
      descripcionEmpresa: parsed.descripcion_empresa ?? getValues().descripcionEmpresa,
      perfiles: (parsed.perfiles ?? []).join(', ') || getValues().perfiles
    });
    setAiOpen(false);
  };

  const parsePlainText = () => {
    const text = getValues().ofertaTexto;
    if (!text.trim()) return;
    const inferred = parsePlainOffer(text);
    reset({ ...getValues(), ...inferred });
  };

  return (
    <>
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Agregar oferta">
        <div className="modal-box modal-form">
          <div className="modal-head">
            <h3>Agregar oferta</h3>
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-label">
                  Link de la oferta
                  <InfoTip>
                    Opcional. Si la oferta viene de internet, pegá el link (LinkedIn, Indeed,
                    GetOnBoard, Greenhouse, Lever, etc.). Con este link, el botón de abajo arma un
                    prompt para un agente externo que la extrae usando la skill
                    capture-job-offer (fetch con fallbacks: Guest API de LinkedIn, Jina Reader,
                    JobSpy). Si la oferta no viene de internet, dejalo vacío y pegá el texto abajo.
                  </InfoTip>
                </span>
                <input type="url" placeholder="https://..." {...register('url')} />
              </label>

              <label className="form-field">
                <span className="form-label">
                  Fecha
                  <InfoTip>Por defecto, hoy. Cambiala si la oferta tiene otra fecha.</InfoTip>
                </span>
                <input type="date" {...register('fecha')} />
              </label>

              <label className="form-field">
                <span className="form-label">
                  Empresa *
                  <InfoTip>
                    Requerido. Nombre de la empresa como aparece en la oferta. El IA lo llena si
                    usás "Usar IA".
                  </InfoTip>
                </span>
                <input type="text" placeholder="Ej: Aurora Labs" {...register('empresa')} />
                {errors.empresa && <span className="form-error">{errors.empresa.message}</span>}
              </label>

              <label className="form-field">
                <span className="form-label">
                  Rol *
                  <InfoTip>
                    Requerido. Título del puesto tal como aparece en la oferta, sin inventar
                    seniority.
                  </InfoTip>
                </span>
                <input type="text" placeholder="Ej: ReactJS Frontend Developer" {...register('rol')} />
                {errors.rol && <span className="form-err">{errors.rol.message}</span>}
              </label>

              <div className="form-field form-full">
                <span className="form-label">
                  Texto completo de la oferta *
                  <InfoTip>
                    Requerido si no hay link. Pegá la oferta completa tal como la recibiste
                    (email, chat, web). Con el texto en este campo podés intentar el parseo
                    heurístico con el botón de abajo, que autocompleta empresa, rol y demás si
                    detecta etiquetas. También es la materia prima del análisis.
                  </InfoTip>
                  <button type="button" className="link-btn" onClick={parsePlainText}>
                    Parsear texto pegado
                  </button>
                </span>
                <textarea rows={8} placeholder="Pegá acá el texto completo de la oferta..." {...register('ofertaTexto')} />
                {errors.ofertaTexto && <span className="form-err">{errors.ofertaTexto.message}</span>}
              </div>

              <label className="form-field">
                <span className="form-label">
                  Modalidad
                  <InfoTip>Se infiere del análisis IA o del texto. Default: unknown.</InfoTip>
                </span>
                <select {...register('modalidad')}>
                  <option value="unknown">Desconocida</option>
                  <option value="remote">Remota</option>
                  <option value="hybrid">Híbrida</option>
                  <option value="onsite">Presencial</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-label">
                  Ubicación
                  <InfoTip>Opcional. Ciudad y país.</InfoTip>
                </span>
                <input type="text" placeholder="Ej: Córdoba, Argentina" {...register('location')} />
              </label>

              <label className="form-field">
                <span className="form-label">
                  Perfiles
                  <InfoTip>
                    Opcional. Ids de los posicionamientos del perfil a los que apunta la oferta,
                    separados por coma (ej: frontend, ai). Quedan en el frontmatter de offer.md
                    como `perfiles` y alimentan el filtro de perfiles de la vista de ofertas.
                  </InfoTip>
                </span>
                <input type="text" placeholder="Ej: frontend, ai" {...register('perfiles')} />
              </label>

              <div className="form-field form-full">
                <span className="form-label">
                  Sobre la empresa (opcional)
                  <InfoTip>Descripción de la empresa si la oferta la trae. Opcional.</InfoTip>
                </span>
                <textarea rows={3} {...register('descripcionEmpresa')} />
              </div>
            </div>

            <details className="form-extras">
              <summary>Extras opcionales</summary>
              <div className="form-grid">
                <label className="form-field">
                  <span className="form-label">Salario o rango</span>
                  <input type="text" {...register('salario')} />
                </label>
                <label className="form-field">
                  <span className="form-label">Recruiter / contacto</span>
                  <input type="text" {...register('recruiter')} />
                </label>
                <label className="form-field">
                  <span className="form-label">Seniority requerido</span>
                  <input type="text" {...register('seniority')} />
                </label>
                <label className="form-field">
                  <span className="form-label">Stack pedido</span>
                  <input type="text" {...register('stack')} />
                </label>
              </div>
            </details>

            <div className="modal-actions">
              {!isDev && (
                <span className="dev-only-note">
                  Crear ofertas solo funciona en el entorno local (pnpm dev).
                </span>
              )}
              <button
                type="button"
                className="ai-btn"
                disabled={!isDev}
                onClick={() => openAi(!!getValues().url)}
              >
                Usar IA
              </button>
              <button type="submit" className="primary-btn" disabled={!isDev}>
                Guardar oferta
              </button>
            </div>
          </form>
        </div>
      </div>

      <AIModal
        open={aiOpen}
        title="Capturar con IA"
        tooltip="Armamos un prompt con la skill capture-job-offer del repo para que un agente externo obtenga y ordene la oferta. Copiás el prompt (reemplazando el placeholder si no hay link), lo pegás en tu agente (Claude, ChatGPT, opencode en otra sesión) y pegás acá el resultado JSON. La app valida y autocompleta el formulario."
        prompt={capturePrompt({
          link: aiLink,
          ofertaTexto: aiLink ? null : getValues().ofertaTexto || null
        })}
        pasteHint="El agente devuelve un bloque ```json con la metadata y el texto verbatim."
        onPaste={handleCapture}
        onClose={() => setAiOpen(false)}
      />
    </>
  );
}
