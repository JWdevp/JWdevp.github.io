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
  portrait: `${import.meta.env.BASE_URL}images/JW.jpg`,
  /**
   * CV offered for download in the About section. The button only appears once
   * the file is actually there, so this can point at a file that has not been
   * added yet without leaving a dead link on the page.
   */
  cv: `${import.meta.env.BASE_URL}cv/jason-wiersum-lebenslauf.pdf`,
  links: {
    linkedin: 'https://www.linkedin.com/in/jason-wiersum',
    github: 'https://github.com/jasonwiersum',
  },
} as const

export const SECTION_IDS = ['home', 'work', 'about', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]
