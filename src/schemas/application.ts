import { z } from 'zod';

/**
 * Contrato de resultado de una postulacion (Fase F, ADR-0042): el frontmatter de
 * `docs/job-offers/<slug>/application.md` es lo que la app lee y muestra como
 * "postulacion". El tracker del pipeline es el dueno del estado para el flujo de
 * postulaciones; este contrato no lo duplica, solo describe el resultado por oferta.
 */
export const APPLICATION_STATES = [
  'borrador',
  'en preparacion',
  'enviada',
  'confirmada',
  'vetada',
  'descartada'
] as const;

/** Resultado posterior registrado por el flujo (sin seguimiento). */
export const APPLICATION_OUTCOMES = ['rechazada', 'entrevista', 'oferta'] as const;

const optionalText = z.string().min(1).nullable().optional();

export const applicationSchema = z
  .object({
    empresa: z.string().min(1),
    rol: z.string().min(1),
    /** Fecha de envio o de decision. Alias legacy: `fecha_envio` (ver parser). */
    fecha: optionalText,
    estado: z.enum(APPLICATION_STATES),
    /** Razon del veto o del descarte. Requerido cuando no se envio. */
    motivo: optionalText,
    ats: optionalText,
    /** Texto devuelto por el ATS (capturado en pantalla o por mail). */
    confirmacion: optionalText,
    /** Documentos enviados: rutas o nombres de archivo, strings opacos. */
    cv_enviado: optionalText,
    cover_enviado: optionalText,
    outcome: z.enum(APPLICATION_OUTCOMES).nullable().optional(),
    outcome_fecha: optionalText
  })
  .superRefine((application, ctx) => {
    if ((application.estado === 'vetada' || application.estado === 'descartada') && !application.motivo) {
      ctx.addIssue({
        code: 'custom',
        path: ['motivo'],
        message: 'motivo es requerido cuando el estado es vetada o descartada'
      });
    }
  });

export type Application = z.infer<typeof applicationSchema>;
export type ApplicationState = (typeof APPLICATION_STATES)[number];
export type ApplicationOutcome = (typeof APPLICATION_OUTCOMES)[number];
