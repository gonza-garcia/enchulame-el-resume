import type { LocalizedText, Profile } from '../schemas/profile';

export interface ProfileSkillReadModel {
  id: string;
  name: LocalizedText;
  category: LocalizedText;
  level: LocalizedText;
  evidence?: LocalizedText;
}

export interface ProfilePositioningReadModel {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
}

export interface ProfileFactReadModel {
  kind: 'experience-bullet' | 'project';
  label: LocalizedText;
  text: LocalizedText;
  skillIds: string[];
}

export interface ProfileReadModel {
  skills: ProfileSkillReadModel[];
  activePositioning: ProfilePositioningReadModel;
  facts: ProfileFactReadModel[];
}

function buildFacts(profile: Profile): ProfileFactReadModel[] {
  const facts: ProfileFactReadModel[] = [];

  for (const job of profile.facts.experience) {
    for (const project of job.projects) {
      for (const bullet of project.bullets) {
        facts.push({
          kind: 'experience-bullet',
          label: project.name,
          text: bullet.text,
          skillIds: bullet.skillIds ? [...bullet.skillIds] : []
        });
      }
    }
  }

  for (const project of profile.facts.projects) {
    facts.push({
      kind: 'project',
      label: project.name,
      text: project.description,
      skillIds: project.skillIds ? [...project.skillIds] : []
    });
  }

  return facts;
}

export function buildProfileReadModel(profile: Profile, positioningId?: string): ProfileReadModel {
  const positioning = positioningId
    ? profile.positionings.find((candidate) => candidate.id === positioningId)
    : profile.positionings[0];

  if (!positioning) {
    throw new Error(`Unknown positioning id "${positioningId ?? ''}"`);
  }

  return {
    skills: profile.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      level: skill.level,
      evidence: skill.evidence
    })),
    activePositioning: {
      id: positioning.id,
      title: positioning.title,
      summary: positioning.summary
    },
    facts: buildFacts(profile)
  };
}
