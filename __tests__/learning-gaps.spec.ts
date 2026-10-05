import { test, expect } from '@playwright/test';
import { computePlanProfileJoin, significantTokens } from '../src/lib/learning-gaps';
import type { LearningPlan } from '../src/schemas/learning-plan';
import type { ProfileReadModel } from '../src/lib/profile-read-model';

const plan: LearningPlan = {
  version: 1,
  id: 'plan',
  title: { es: 'Plan', en: 'Plan' },
  roles: [{ id: 'r1', name: { es: 'Rol', en: 'Role' }, summary: { es: 's', en: 's' } }],
  antiList: [{ es: 'a', en: 'a' }],
  exitSignals: [{ es: 'e', en: 'e' }],
  skills: [
    {
      id: 'python',
      name: { es: 'Python', en: 'Python' },
      demand: {
        label: { es: '70,8% de las ofertas', en: '70.8% of postings' },
        source: 'dataset',
        asOf: '2026-09'
      }
    },
    {
      id: 'rag',
      name: { es: 'RAG y recuperacion', en: 'RAG and retrieval' },
      demand: {
        label: { es: '56,7% de las ofertas', en: '56.7% of postings' },
        source: 'dataset',
        asOf: '2026-09'
      }
    },
    {
      id: 'agent-patterns',
      name: { es: 'Patrones de agentes', en: 'Agent patterns' }
    },
    {
      id: 'cloud-aws',
      name: { es: 'Cloud (AWS)', en: 'Cloud (AWS)' },
      demand: {
        label: { es: '40,3% de las ofertas', en: '40.3% of postings' },
        source: 'dataset',
        asOf: '2026-08'
      }
    }
  ],
  phases: [
    {
      id: 'f1',
      order: 0,
      title: { es: 'F1', en: 'F1' },
      duration: { es: '1', en: '1' },
      topics: [{ es: 't', en: 't' }],
      enablesRoles: ['r1'],
      skillIds: ['python', 'cloud-aws'],
      gate: { es: 'g', en: 'g' },
      resourceIds: ['res1']
    },
    {
      id: 'f2',
      order: 1,
      title: { es: 'F2', en: 'F2' },
      duration: { es: '2', en: '2' },
      topics: [{ es: 't', en: 't' }],
      enablesRoles: [],
      skillIds: ['rag'],
      gate: { es: 'g', en: 'g' },
      resourceIds: ['res1']
    }
  ],
  resources: [
    {
      id: 'res1',
      title: 'R1',
      url: 'https://example.com',
      creator: 'c',
      platform: 'p',
      price: { es: 'gratis', en: 'free' },
      duration: { es: '1h', en: '1h' },
      language: 'en',
      opinion: { es: 'o', en: 'o' },
      skillIds: ['python']
    }
  ]
};

const profile: ProfileReadModel = {
  skills: [
    {
      id: 'python',
      name: { es: 'Python', en: 'Python' },
      category: { es: 'c', en: 'c' },
      level: { es: 'Avanzado', en: 'Advanced' }
    },
    {
      id: 'ai-agents',
      name: { es: 'Coding agents', en: 'Coding agents' },
      category: { es: 'c', en: 'c' },
      level: { es: 'Alto', en: 'Strong' }
    },
    {
      id: 'react',
      name: { es: 'React', en: 'React' },
      category: { es: 'c', en: 'c' },
      level: { es: 'Alto', en: 'Strong' }
    }
  ],
  activePositioning: {
    id: 'frontend',
    title: { es: 'Frontend', en: 'Frontend' },
    summary: { es: 's', en: 's' }
  },
  facts: [
    {
      kind: 'experience-bullet',
      label: { es: 'Proyecto Uno', en: 'Project One' },
      text: {
        es: 'Construimos un sistema de agentes para automatizar pedidos.',
        en: 'We built an agent system to automate order workflows.'
      },
      skillIds: ['ai-agents']
    },
    {
      kind: 'project',
      label: { es: 'RAG Demo', en: 'RAG Demo' },
      text: {
        es: 'Buscador semantico con embeddings propios.',
        en: 'Semantic search demo with custom embeddings.'
      },
      skillIds: ['react']
    }
  ]
};

test.describe('Derivacion de perfil frente al plan', () => {
  test('cubiertas muestran el nivel del perfil y marcan nombres distintos', () => {
    const join = computePlanProfileJoin(plan, profile);
    const coveredIds = join.covered.map((entry) => entry.planSkill.id);
    expect(coveredIds).toContain('python');
    const python = join.covered.find((entry) => entry.planSkill.id === 'python');
    expect(python?.level.en).toBe('Advanced');
    expect(python?.namesDiffer).toBe(false);
  });

  test('un plan skill sin id comun puede cubrirse por nombre y muestra los dos nombres', () => {
    const renamed: LearningPlan = {
      ...plan,
      skills: [
        {
          id: 'coding-agents-plan',
          name: { es: 'Coding agents', en: 'Coding agents' },
          demand: undefined
        }
      ],
      phases: plan.phases.map((phase) => ({ ...phase, skillIds: ['coding-agents-plan'] }))
    };
    const join = computePlanProfileJoin(renamed, profile);
    expect(join.covered).toHaveLength(1);
    expect(join.covered[0].planSkill.id).toBe('coding-agents-plan');
    expect(join.covered[0].profileName.en).toBe('Coding agents');
    expect(join.covered[0].namesDiffer).toBe(false);
  });

  test('cubierta con nombres distintos en plan y perfil muestra los dos nombres', () => {
    const renamedProfile: ProfileReadModel = {
      ...profile,
      skills: profile.skills.map((skill) =>
        skill.id === 'python'
          ? { ...skill, name: { es: 'Python moderno', en: 'Modern Python' } }
          : skill
      )
    };
    const join = computePlanProfileJoin(plan, renamedProfile);
    const python = join.covered.find((entry) => entry.planSkill.id === 'python');
    expect(python?.profileName.en).toBe('Modern Python');
    expect(python?.namesDiffer).toBe(true);
  });

  test('gaps son skills del plan ausentes en el perfil', () => {
    const join = computePlanProfileJoin(plan, profile);
    const gapIds = join.gaps.map((entry) => entry.planSkill.id);
    expect(gapIds).toEqual(expect.arrayContaining(['rag', 'agent-patterns', 'cloud-aws']));
    expect(gapIds).not.toContain('python');
  });

  test('las sugerencias enlazan gaps con hechos por skillIds y por texto', () => {
    const join = computePlanProfileJoin(plan, profile);
    const agentGap = join.gaps.find((entry) => entry.planSkill.id === 'agent-patterns');
    expect(agentGap?.suggestions.length).toBeGreaterThan(0);
    expect(agentGap?.suggestions[0].factLabel.en).toBe('Project One');

    const ragGap = join.gaps.find((entry) => entry.planSkill.id === 'rag');
    expect(ragGap?.suggestions.length).toBeGreaterThan(0);
    expect(ragGap?.suggestions[0].factLabel.en).toBe('RAG Demo');
  });

  test('las prioridades ordenan por fase y luego por demanda', () => {
    const join = computePlanProfileJoin(plan, profile);
    const gapIds = join.gaps.map((entry) => entry.planSkill.id);
    expect(gapIds.indexOf('cloud-aws')).toBeLessThan(gapIds.indexOf('rag'));
    expect(gapIds.indexOf('rag')).toBeLessThan(gapIds.indexOf('agent-patterns'));
  });

  test('fuera del plan lista las skills del perfil que el plan no toca', () => {
    const join = computePlanProfileJoin(plan, profile);
    const outside = join.outsidePlan.map((entry) => entry.id);
    expect(outside).toContain('react');
    expect(outside).toContain('ai-agents');
    expect(outside).not.toContain('python');
  });

  test('significantTokens descarta ruido y normaliza plurales', () => {
    const tokens = significantTokens('Agent patterns and tool calling', 'Coding agents');
    expect(tokens.has('agent')).toBe(true);
    expect(tokens.has('pattern')).toBe(true);
    expect(tokens.has('and')).toBe(false);
  });
});
