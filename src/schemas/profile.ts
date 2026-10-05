import { z } from 'astro/zod';

export const localeSchema = z.enum(['es', 'en']);
export type Locale = z.infer<typeof localeSchema>;

export const localizedTextSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1)
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

const idSchema = z.string().min(1);

const contactSchema = z.object({
  phone: z.string().min(1),
  email: z.email(),
  location: localizedTextSchema,
  linkedin: z.string().min(1),
  github: z.string().min(1)
});

const bulletSchema = z.object({
  id: idSchema,
  text: localizedTextSchema,
  skillIds: z.array(idSchema).optional()
});

const workProjectSchema = z.object({
  name: localizedTextSchema,
  url: z.string().optional(),
  startDate: localizedTextSchema,
  endDate: localizedTextSchema,
  bullets: z.array(bulletSchema).min(1)
});

const experienceSchema = z.object({
  company: localizedTextSchema,
  role: localizedTextSchema,
  startDate: localizedTextSchema,
  endDate: localizedTextSchema,
  location: localizedTextSchema.optional(),
  projects: z.array(workProjectSchema).min(1)
});

const educationSchema = z.object({
  institution: localizedTextSchema,
  degree: localizedTextSchema,
  startDate: localizedTextSchema,
  endDate: localizedTextSchema,
  note: localizedTextSchema.optional()
});

const certificationSchema = z.object({
  name: localizedTextSchema,
  note: localizedTextSchema.optional()
});

const languageSchema = z.object({
  name: localizedTextSchema,
  level: localizedTextSchema,
  evidence: localizedTextSchema.optional()
});

const personalProjectSchema = z.object({
  name: localizedTextSchema,
  url: z.string().optional(),
  date: localizedTextSchema.optional(),
  description: localizedTextSchema,
  skillIds: z.array(idSchema).optional()
});

const skillSchema = z.object({
  id: idSchema,
  name: localizedTextSchema,
  category: localizedTextSchema,
  level: localizedTextSchema,
  evidence: localizedTextSchema.optional()
});

const positioningSchema = z.object({
  id: idSchema,
  title: localizedTextSchema,
  summary: localizedTextSchema,
  skillIds: z.array(idSchema).min(1),
  bulletIds: z.array(idSchema).min(1)
});

export const profileSchema = z
  .object({
    identity: z.object({
      name: localizedTextSchema,
      contact: contactSchema
    }),
    facts: z.object({
      experience: z.array(experienceSchema),
      education: z.array(educationSchema),
      certifications: z.array(certificationSchema),
      languages: z.array(languageSchema),
      projects: z.array(personalProjectSchema)
    }),
    skills: z.array(skillSchema).min(1),
    positionings: z.array(positioningSchema).min(1)
  })
  .superRefine((profile, ctx) => {
    const skillIds = new Set<string>();
    profile.skills.forEach((skill, index) => {
      if (skillIds.has(skill.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['skills', index, 'id'],
          message: `Duplicate skill id "${skill.id}"`
        });
      }
      skillIds.add(skill.id);
    });

    const bulletIds = new Set<string>();
    profile.facts.experience.forEach((job, jobIndex) => {
      job.projects.forEach((project, projectIndex) => {
        project.bullets.forEach((bullet, bulletIndex) => {
          if (bulletIds.has(bullet.id)) {
            ctx.addIssue({
              code: 'custom',
              path: ['facts', 'experience', jobIndex, 'projects', projectIndex, 'bullets', bulletIndex, 'id'],
              message: `Duplicate bullet id "${bullet.id}"`
            });
          }
          bulletIds.add(bullet.id);
          bullet.skillIds?.forEach((skillId, skillIndex) => {
            if (!skillIds.has(skillId)) {
              ctx.addIssue({
                code: 'custom',
                path: [
                  'facts',
                  'experience',
                  jobIndex,
                  'projects',
                  projectIndex,
                  'bullets',
                  bulletIndex,
                  'skillIds',
                  skillIndex
                ],
                message: `Unknown skill id "${skillId}" in experience bullet "${bullet.id}"`
              });
            }
          });
        });
      });
    });

    profile.facts.projects.forEach((project, projectIndex) => {
      project.skillIds?.forEach((skillId, skillIndex) => {
        if (!skillIds.has(skillId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['facts', 'projects', projectIndex, 'skillIds', skillIndex],
            message: `Unknown skill id "${skillId}" in project "${project.name.en}"`
          });
        }
      });
    });

    const positioningIds = new Set<string>();
    profile.positionings.forEach((positioning, index) => {
      if (positioningIds.has(positioning.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['positionings', index, 'id'],
          message: `Duplicate positioning id "${positioning.id}"`
        });
      }
      positioningIds.add(positioning.id);

      positioning.skillIds.forEach((skillId, skillIndex) => {
        if (!skillIds.has(skillId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['positionings', index, 'skillIds', skillIndex],
            message: `Unknown skill id "${skillId}" in positioning "${positioning.id}"`
          });
        }
      });
      positioning.bulletIds.forEach((bulletId, bulletIndex) => {
        if (!bulletIds.has(bulletId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['positionings', index, 'bulletIds', bulletIndex],
            message: `Unknown bullet id "${bulletId}" in positioning "${positioning.id}"`
          });
        }
      });
    });
  });

export type Profile = z.infer<typeof profileSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Bullet = z.infer<typeof bulletSchema>;
export type WorkProject = z.infer<typeof workProjectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Language = z.infer<typeof languageSchema>;
export type PersonalProject = z.infer<typeof personalProjectSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Positioning = z.infer<typeof positioningSchema>;
