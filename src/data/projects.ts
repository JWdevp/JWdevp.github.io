import type { Language } from '../i18n/translations'

/** A string that exists in every interface language. */
export type LocalizedText = Record<Language, string>

export interface Project {
  id: string
  title: LocalizedText
  description: LocalizedText
  technologies: string[]
  /**
   * Path to a cover image inside `/public`, or `null` while the slot is still a
   * placeholder (a generated gradient is rendered instead).
   */
  image: string | null
  /** Live/repository URL, or `null` when there is nothing to link to yet. */
  url: string | null
}

/**
 * ---------------------------------------------------------------------------
 * PROJECTS — replace these three placeholders with real work.
 * ---------------------------------------------------------------------------
 * For each project: write the three translations, list the technologies,
 * drop a cover image in `public/images/` and point `image` at it
 * (e.g. `image: 'images/my-project.jpg'` — no leading slash, so it keeps
 * working under any GitHub Pages base path) and set `url`. A project without a
 * `url` simply renders without its "view project" link.
 */
export const projects: Project[] = [
  {
    id: 'project-01',
    title: {
      es: 'Proyecto uno',
      en: 'Project one',
      de: 'Projekt eins',
    },
    description: {
      es: 'Espacio reservado para el primer proyecto: qué problema resolvía, qué decisiones tomé y qué aprendí construyéndolo.',
      en: 'Reserved space for the first project: which problem it solved, which decisions I made and what building it taught me.',
      de: 'Platz für das erste Projekt: welches Problem es löste, welche Entscheidungen ich traf und was ich dabei gelernt habe.',
    },
    technologies: ['Java', 'Spring', 'Git'],
    image: null,
    url: null,
  },
  {
    id: 'project-02',
    title: {
      es: 'Proyecto dos',
      en: 'Project two',
      de: 'Projekt zwei',
    },
    description: {
      es: 'Espacio reservado para el segundo proyecto. Aquí irá una descripción breve del alcance y del resultado.',
      en: 'Reserved space for the second project. A short description of the scope and the outcome will go here.',
      de: 'Platz für das zweite Projekt. Hier folgt eine kurze Beschreibung von Umfang und Ergebnis.',
    },
    technologies: ['Python', 'JavaScript', 'Git'],
    image: null,
    url: null,
  },
  {
    id: 'project-03',
    title: {
      es: 'Proyecto tres',
      en: 'Project three',
      de: 'Projekt drei',
    },
    description: {
      es: 'Espacio reservado para el tercer proyecto, donde el lado técnico y el lado gráfico se encuentran.',
      en: 'Reserved space for the third project, where the technical side and the visual side meet.',
      de: 'Platz für das dritte Projekt, in dem technische und gestalterische Seite zusammenkommen.',
    },
    technologies: ['HTML', 'CSS', 'Adobe Creative Cloud'],
    image: null,
    url: null,
  },
]
