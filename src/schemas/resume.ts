import { z } from 'astro/zod';

const contactSchema = z.object({
  phone: z.string(),
  email: z.email(),
  location: z.string(),
  linkedin: z.string(),
  github: z.string()
});

const skillLineSchema = z.object({
  category: z.string(),
  items: z.string()
});

const projectEntrySchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string())
});

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().optional(),
  projects: z.array(projectEntrySchema)
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  note: z.string().optional()
});

const certificationSchema = z.object({
  name: z.string(),
  note: z.string().optional()
});

const personalProjectSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  date: z.string().optional(),
  description: z.string()
});

export const resumeLocaleSchema = z.object({
  name: z.string(),
  title: z.string(),
  contact: contactSchema,
  summary: z.string(),
  skills: z.array(skillLineSchema),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  projects: z.array(personalProjectSchema)
});

export const resumeSchema = z.object({
  es: resumeLocaleSchema,
  en: resumeLocaleSchema
});

export type ResumeLocale = z.infer<typeof resumeLocaleSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type SkillLine = z.infer<typeof skillLineSchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type PersonalProject = z.infer<typeof personalProjectSchema>;
