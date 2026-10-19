import { z } from 'astro/zod';

const nonEmptyString = z.string().min(1);

export const reviewPlanItemSchema = z
  .object({
    /** Id estable del tema en kebab-case, unico dentro del plan. */
    id: nonEmptyString,
    /** Etiqueta visible del tema (en espanol, como el match-report). */
    tema: nonEmptyString,
    /** Por que importa este tema en esta oferta concreta. Opcional. */
    why: nonEmptyString.nullable(),
    /** Ids completos de preguntas existentes del banco (minimo una). */
    questionIds: z.array(nonEmptyString).min(1)
  })
  .superRefine((item, ctx) => {
    const seen = new Set<string>();
    for (const [index, questionId] of item.questionIds.entries()) {
      if (seen.has(questionId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['questionIds', index],
          message: `Duplicate question id "${questionId}"`
        });
      }
      seen.add(questionId);
    }
  });

export const reviewPlanGapSchema = z.object({
  /** Tema que el banco no cubre: se repasa fuera de /interview. */
  topic: nonEmptyString,
  /** Como repasarlo fuera del banco. Opcional. */
  note: nonEmptyString.nullable()
});

/**
 * Contrato del plan de repaso de una oferta (ADR-0035):
 * `docs/job-offers/<slug>/interview-review-plan.json`.
 *
 * No toca el contrato del banco: solo referencia ids de pregunta existentes y no
 * agrega preguntas nuevas (eso es Fase C).
 */
export const interviewReviewPlanSchema = z
  .object({
    version: z.literal(1),
    slug: nonEmptyString,
    empresa: nonEmptyString,
    rol: nonEmptyString,
    generatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    matchScore: z.number().min(0).max(100).nullable(),
    /** Prioridades de repaso, en orden: el orden del array es la prioridad. */
    items: z.array(reviewPlanItemSchema).min(1),
    /** Huecos del banco para esta oferta: se repasan fuera de /interview. */
    gaps: z.array(reviewPlanGapSchema)
  })
  .superRefine((plan, ctx) => {
    const seen = new Set<string>();
    for (const [index, item] of plan.items.entries()) {
      if (seen.has(item.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['items', index, 'id'],
          message: `Duplicate item id "${item.id}"`
        });
      }
      seen.add(item.id);
    }
  });

/** Estado del repaso en localStorage: clave propia `interview-review` (ADR-0035). */
export const reviewPlanStatusSchema = z.enum(['pendiente', 'dominado']);

export const interviewReviewStateSchema = z.object({
  version: z.literal(1),
  /** Slug del plan de repaso cargado en /interview, o null si no hay ninguno. */
  activeSlug: z.string().nullable(),
  /** Marcas por tema, con clave "<slug>/<itemId>". */
  marks: z.record(z.string(), reviewPlanStatusSchema)
});

export type ReviewPlanItem = z.infer<typeof reviewPlanItemSchema>;
export type ReviewPlanGap = z.infer<typeof reviewPlanGapSchema>;
export type InterviewReviewPlan = z.infer<typeof interviewReviewPlanSchema>;
export type ReviewPlanStatus = z.infer<typeof reviewPlanStatusSchema>;
export type InterviewReviewState = z.infer<typeof interviewReviewStateSchema>;
