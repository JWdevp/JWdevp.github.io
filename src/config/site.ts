/**
 * Personal data and external links.
 * Everything a future update is likely to touch lives here.
 */
export const SITE = {
  name: 'Jason Wiersum',
  role: 'Anwendungsentwickler',
  location: 'Nürnberg, Bayern',
  /**
   * Portrait shown in the About section. Point this at whatever the file in
   * `public/images/` is called; if it is missing the figure removes itself.
   */
  portrait: `${import.meta.env.BASE_URL}images/sanfran.grey.wide.jpg`,
  links: {
    linkedin: 'https://www.linkedin.com/in/jason-wiersum',
    github: 'https://github.com/jasonwiersum',
  },
} as const

export const SECTION_IDS = ['home', 'work', 'about', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]
