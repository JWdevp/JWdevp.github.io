import type { Translation } from '../i18n/translations'

export interface SkillGroup {
  /** Key into `t.skills.categories` — the label itself is translated. */
  category: keyof Translation['skills']['categories']
  items: SkillItem[]
}

export interface SkillItem {
  name: string
  /** Optional translated note, e.g. Photoshop's 15 years of experience. */
  note?: (t: Translation) => string
}

/**
 * Only the technologies Jason actually works with. No invented tools, no
 * proficiency percentages — the grouping carries the meaning instead.
 */
export const skillGroups: SkillGroup[] = [
  {
    category: 'programming',
    items: [
      { name: 'Java' },
      { name: 'Python' },
      { name: 'HTML' },
      { name: 'CSS' },
      { name: 'JavaScript' },
    ],
  },
  {
    category: 'frameworks',
    items: [{ name: 'Grails' }, { name: 'Spring' }],
  },
  {
    category: 'versionControl',
    items: [{ name: 'Git' }],
  },
  {
    category: 'tools',
    items: [{ name: 'Atlassian' }, { name: 'Adobe Creative Cloud' }],
  },
  {
    category: 'creative',
    items: [
      { name: 'Photoshop', note: (t) => t.skills.photoshopNote },
    ],
  },
]
