import type { LearningPlan, LocalizedText, PlanSkill } from '../schemas/learning-plan';
import type { ProfileReadModel } from './profile-read-model';

export interface CoveredPlanSkill {
  planSkill: PlanSkill;
  profileName: LocalizedText;
  level: LocalizedText;
  namesDiffer: boolean;
}

export interface GapSuggestion {
  factKind: 'experience-bullet' | 'project';
  factLabel: LocalizedText;
}

export interface GapPlanSkill {
  planSkill: PlanSkill;
  firstPhaseOrder: number | null;
  demandRank: number;
  suggestions: GapSuggestion[];
}

export interface OutsideProfileSkill {
  id: string;
  name: LocalizedText;
  level: LocalizedText;
}

export interface PlanProfileJoin {
  covered: CoveredPlanSkill[];
  gaps: GapPlanSkill[];
  outsidePlan: OutsideProfileSkill[];
}

const STOPWORDS = new Set([
  'and',
  'the',
  'with',
  'for',
  'from',
  'that',
  'this',
  'your',
  'into',
  'over',
  'more',
  'than',
  'then',
  'them',
  'they',
  'what',
  'when',
  'will',
  'role',
  'out',
  'not',
  'con',
  'del',
  'las',
  'los',
  'una',
  'como',
  'para',
  'por',
  'sus',
  'y',
  'o',
  'en'
]);

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function stem(token: string): string {
  return token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token;
}

export function significantTokens(...values: string[]): Set<string> {
  const tokens = new Set<string>();
  for (const value of values) {
    for (const raw of normalize(value).split(/[^a-z0-9]+/)) {
      if (raw.length < 3) continue;
      const token = stem(raw);
      if (token.length < 3 || STOPWORDS.has(token)) continue;
      tokens.add(token);
    }
  }
  return tokens;
}

function textsOf(text: LocalizedText): string[] {
  return [text.es, text.en];
}

function namesMatch(left: LocalizedText, right: LocalizedText): boolean {
  const leftSet = new Set(textsOf(left).map(normalize));
  return textsOf(right).map(normalize).some((name) => leftSet.has(name));
}

function namesDiffer(left: LocalizedText, right: LocalizedText): boolean {
  return left.es !== right.es || left.en !== right.en;
}

function demandRank(skill: PlanSkill): number {
  if (!skill.demand) return 0;
  const matches = `${skill.demand.label.es} ${skill.demand.label.en}`.match(/\d+(?:[.,]\d+)?\s*%/g);
  if (!matches) return 0;
  return Math.max(
    ...matches.map((match) => Number(match.replace('%', '').trim().replace(',', '.')))
  );
}

export function computePlanProfileJoin(
  plan: LearningPlan,
  profile: ProfileReadModel
): PlanProfileJoin {
  const profileById = new Map(profile.skills.map((skill) => [skill.id, skill]));
  const covered: CoveredPlanSkill[] = [];
  const gaps: GapPlanSkill[] = [];
  const matchedProfileIds = new Set<string>();

  const phaseOrderBySkill = new Map<string, number>();
  for (const phase of [...plan.phases].sort((left, right) => left.order - right.order)) {
    for (const skillId of phase.skillIds) {
      if (!phaseOrderBySkill.has(skillId)) phaseOrderBySkill.set(skillId, phase.order);
    }
  }

  for (const planSkill of plan.skills) {
    const byId = profileById.get(planSkill.id);
    const byName = profile.skills.find((skill) => namesMatch(skill.name, planSkill.name));
    const match = byId ?? byName;

    if (match) {
      matchedProfileIds.add(match.id);
      covered.push({
        planSkill,
        profileName: match.name,
        level: match.level,
        namesDiffer: namesDiffer(match.name, planSkill.name)
      });
      continue;
    }

    const planTokens = significantTokens(planSkill.id, ...textsOf(planSkill.name));
    const suggestions: GapSuggestion[] = [];
    for (const fact of profile.facts) {
      const factProfileNames = fact.skillIds
        .map((skillId) => profileById.get(skillId)?.name)
        .filter((name): name is LocalizedText => Boolean(name))
        .flatMap(textsOf);
      const factTokens = significantTokens(
        ...textsOf(fact.label),
        ...textsOf(fact.text),
        ...factProfileNames
      );
      const overlaps = [...planTokens].some((token) => factTokens.has(token));
      const idHit = fact.skillIds.includes(planSkill.id);
      if (overlaps || idHit) {
        suggestions.push({ factKind: fact.kind, factLabel: fact.label });
      }
    }

    gaps.push({
      planSkill,
      firstPhaseOrder: phaseOrderBySkill.get(planSkill.id) ?? null,
      demandRank: demandRank(planSkill),
      suggestions
    });
  }

  gaps.sort((left, right) => {
    const leftOrder = left.firstPhaseOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.firstPhaseOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    if (left.demandRank !== right.demandRank) return right.demandRank - left.demandRank;
    return left.planSkill.id.localeCompare(right.planSkill.id);
  });

  const outsidePlan: OutsideProfileSkill[] = profile.skills
    .filter((skill) => !matchedProfileIds.has(skill.id))
    .map((skill) => ({ id: skill.id, name: skill.name, level: skill.level }));

  return { covered, gaps, outsidePlan };
}
