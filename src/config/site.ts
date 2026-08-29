/**
 * Personal data and external links.
 * Everything a future update is likely to touch lives here.
 */
export const SITE = {
  name: 'Jason Wiersum',
  role: 'Anwendungsentwickler',
  location: 'Nürnberg, Bayern',
  /** Path of the optional character model, resolved against the Vite base. */
  characterModel: `${import.meta.env.BASE_URL}models/character.glb`,
  links: {
    linkedin: 'https://www.linkedin.com/in/jason-wiersum',
    github: 'https://github.com/JWdevp',
  },
} as const

export const SECTION_IDS = ['home', 'about', 'projects', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]
