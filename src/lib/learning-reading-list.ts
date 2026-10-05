import type { LocalizedText } from '../schemas/learning-plan';

export interface LearningReadingItem {
  id: string;
  title: string;
  description: LocalizedText;
  url: string;
}

export const LEARNING_READING_LIST: LearningReadingItem[] = [
  {
    id: 'nothiring-que-es',
    title: 'Qué es un AI Engineer (nothiring.me)',
    description: {
      es: 'Los cuatro trabajos que cubre el titulo AI Engineer (Modelo, Plataforma, Aplicacion, Negocio) y que exige cada uno, cruzando datos de Espana con el dataset internacional de Grigorev.',
      en: 'The four jobs the AI Engineer title covers (Model, Platform, Application, Business) and what each demands, crossing Spain data with Grigorev\'s international dataset.'
    },
    url: 'http://nothiring.me/blog/roles/ai-engineer-espana'
  },
  {
    id: 'nothiring-perfil',
    title: 'Quién es el AI Engineer en España (nothiring.me)',
    description: {
      es: 'Quien ocupa el rol, de donde viene, cuanta experiencia trae y por que la puerta de entrada casi no existe. La ruta real desde software.',
      en: 'Who holds the role, where they come from, how much experience they bring and why the entry door barely exists. The real route from software.'
    },
    url: 'http://nothiring.me/blog/roles/ai-engineer-perfil-espana'
  },
  {
    id: 'nothiring-salario',
    title: 'Cuánto cobra un AI Engineer en España (nothiring.me)',
    description: {
      es: 'Bandas del rol, la brecha entre producto y consultora por el mismo titulo, y cuanta competencia acumula cada oferta.',
      en: 'Pay bands for the role, the product versus consultancy gap for the same title, and how much competition each posting gathers.'
    },
    url: 'http://nothiring.me/blog/roles/ai-engineer-salario-espana'
  },
  {
    id: 'grigorev-field-guide',
    title: 'AI Engineering Field Guide (Alexey Grigorev)',
    description: {
      es: 'Repo con 6.964 job descriptions analizadas, patrones de entrevista de mas de 100 fuentes, rutas de aprendizaje por origen profesional y guia de portfolio.',
      en: 'Repo with 6,964 job descriptions analysed, interview patterns from 100+ sources, learning paths by professional background and a portfolio guide.'
    },
    url: 'https://github.com/alexeygrigorev/ai-engineering-field-guide'
  },
  {
    id: 'ng-skill-map',
    title: 'Mapa de habilidades de ingeniería de IA (Andrew Ng)',
    description: {
      es: 'Las cuatro habilidades de primer nivel del rol y las seis piezas de construir y desplegar aplicaciones de AI, a partir de mas de 10.000 ofertas.',
      en: 'The role\'s four top-level skills and the six pieces of building and deploying AI applications, drawn from 10,000+ job postings.'
    },
    url: 'https://x.com/AndrewYNg/status/2088302050706686198'
  },
  {
    id: 'hamel-evals',
    title: 'Your AI Product Needs Evals (Hamel Husain)',
    description: {
      es: 'El metodo de error analysis: leer trazas reales, etiquetar fallos a mano y publicar la taxonomia con numeros. Es lo que las ofertas entienden por evaluacion.',
      en: 'The error analysis method: read real traces, label failures by hand and publish the taxonomy with numbers. It is what job postings mean by evaluation.'
    },
    url: 'https://hamel.dev/evals/'
  },
  {
    id: 'chip-huyen-stack',
    title: 'The AI Engineering Stack (Chip Huyen)',
    description: {
      es: 'La definicion que separa ingenieria de AI de ML: adaptar y evaluar modelos, no construirlos. Prompting contra fine-tuning como dos vias.',
      en: 'The definition that separates AI engineering from ML: adapt and evaluate models, not build them. Prompting versus fine-tuning as two paths.'
    },
    url: 'https://newsletter.pragmaticengineer.com/p/the-ai-engineering-stack'
  }
];
