import { z } from 'astro/zod';

const nonEmptyString = z.string().min(1);

export const localizedTextSchema = z.object({
  es: nonEmptyString,
  en: nonEmptyString
});

export const planDemandSchema = z.object({
  label: localizedTextSchema,
  source: nonEmptyString,
  asOf: nonEmptyString
});

export const planSkillSchema = z.object({
  id: nonEmptyString,
  name: localizedTextSchema,
  demand: planDemandSchema.optional()
});

export const planRoleSchema = z.object({
  id: nonEmptyString,
  name: localizedTextSchema,
  summary: localizedTextSchema
});

export const planResourceConfidenceSchema = z.object({
  text: localizedTextSchema,
  asOf: nonEmptyString
});

export const planResourceSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  url: z.url(),
  creator: nonEmptyString,
  platform: nonEmptyString,
  price: localizedTextSchema,
  duration: localizedTextSchema,
  language: nonEmptyString,
  confidence: planResourceConfidenceSchema.optional(),
  opinion: localizedTextSchema,
  skillIds: z.array(nonEmptyString).min(1)
});

export const planPhaseSchema = z.object({
  id: nonEmptyString,
  order: z.int().min(0),
  title: localizedTextSchema,
  duration: localizedTextSchema,
  topics: z.array(localizedTextSchema).min(1),
  enablesRoles: z.array(nonEmptyString),
  skillIds: z.array(nonEmptyString).min(1),
  interviewArea: nonEmptyString.optional(),
  project: localizedTextSchema.optional(),
  gate: localizedTextSchema,
  resourceIds: z.array(nonEmptyString).min(1)
});

export const learningPlanSchema = z
  .object({
    version: z.literal(1),
    id: nonEmptyString,
    title: localizedTextSchema,
    roles: z.array(planRoleSchema).min(1),
    antiList: z.array(localizedTextSchema).min(1),
    exitSignals: z.array(localizedTextSchema).min(1),
    skills: z.array(planSkillSchema).min(1),
    phases: z.array(planPhaseSchema).min(1),
    resources: z.array(planResourceSchema).min(1)
  })
  .superRefine((plan, ctx) => {
    const checkUnique = (label: string, ids: string[], basePath: (string | number)[]) => {
      const seen = new Set<string>();
      for (const [index, id] of ids.entries()) {
        if (seen.has(id)) {
          ctx.addIssue({
            code: 'custom',
            path: [...basePath, index, 'id'],
            message: `Duplicate ${label} id "${id}"`
          });
        }
        seen.add(id);
      }
    };

    checkUnique('role', plan.roles.map((role) => role.id), ['roles']);
    checkUnique('skill', plan.skills.map((skill) => skill.id), ['skills']);
    checkUnique('phase', plan.phases.map((phase) => phase.id), ['phases']);
    checkUnique('resource', plan.resources.map((resource) => resource.id), ['resources']);

    const skillIds = new Set(plan.skills.map((skill) => skill.id));
    const roleIds = new Set(plan.roles.map((role) => role.id));
    const resourceIds = new Set(plan.resources.map((resource) => resource.id));

    for (const [index, resource] of plan.resources.entries()) {
      for (const [skillIndex, skillId] of resource.skillIds.entries()) {
        if (!skillIds.has(skillId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['resources', index, 'skillIds', skillIndex],
            message: `Unknown skill id "${skillId}"`
          });
        }
      }
    }

    for (const [index, phase] of plan.phases.entries()) {
      for (const [roleIndex, roleId] of phase.enablesRoles.entries()) {
        if (!roleIds.has(roleId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['phases', index, 'enablesRoles', roleIndex],
            message: `Unknown role id "${roleId}"`
          });
        }
      }
      for (const [skillIndex, skillId] of phase.skillIds.entries()) {
        if (!skillIds.has(skillId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['phases', index, 'skillIds', skillIndex],
            message: `Unknown skill id "${skillId}"`
          });
        }
      }
      for (const [resourceIndex, resourceId] of phase.resourceIds.entries()) {
        if (!resourceIds.has(resourceId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['phases', index, 'resourceIds', resourceIndex],
            message: `Unknown resource id "${resourceId}"`
          });
        }
      }
    }

    const orders = plan.phases.map((phase) => phase.order).sort((left, right) => left - right);
    for (const [index, order] of orders.entries()) {
      if (order !== index) {
        ctx.addIssue({
          code: 'custom',
          path: ['phases'],
          message: `Phase orders must run from 0 to ${plan.phases.length - 1} without gaps; found ${orders.join(', ')}`
        });
        break;
      }
    }
  });

export const learningResourceStatusSchema = z.enum(['sin-marcar', 'en-curso', 'hecho', 'skipped']);
export const learningGateStatusSchema = z.enum(['pendiente', 'cumplido']);

export const learningProgressEntrySchema = z.object({
  status: learningResourceStatusSchema
});

export const learningGateEntrySchema = z.object({
  status: learningGateStatusSchema
});

export const learningProgressSchema = z.object({
  version: z.literal(1),
  entries: z.record(z.string(), learningProgressEntrySchema),
  gates: z.record(z.string(), learningGateEntrySchema)
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type PlanDemand = z.infer<typeof planDemandSchema>;
export type PlanSkill = z.infer<typeof planSkillSchema>;
export type PlanRole = z.infer<typeof planRoleSchema>;
export type PlanResourceConfidence = z.infer<typeof planResourceConfidenceSchema>;
export type PlanResource = z.infer<typeof planResourceSchema>;
export type PlanPhase = z.infer<typeof planPhaseSchema>;
export type LearningPlan = z.infer<typeof learningPlanSchema>;
export type LearningResourceStatus = z.infer<typeof learningResourceStatusSchema>;
export type LearningGateStatus = z.infer<typeof learningGateStatusSchema>;
export type LearningProgressEntry = z.infer<typeof learningProgressEntrySchema>;
export type LearningGateEntry = z.infer<typeof learningGateEntrySchema>;
export type LearningProgress = z.infer<typeof learningProgressSchema>;
