import { useRef } from 'react'
import { skillGroups } from '../../data/skills'
import { useLanguage } from '../../hooks/useLanguage'
import { useReveal } from '../../hooks/useReveal'
import './skills.css'

export function Skills() {
  const { t } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  return (
    <div className="skills" ref={root}>
      <div className="container">
        <header className="section__head">
          <p className="eyebrow" data-reveal>
            {t.skills.eyebrow}
          </p>
          <h2 className="section__title" data-reveal>
            {t.skills.title}
          </h2>
        </header>

        <div className="skills__groups">
          {skillGroups.map((group) => (
            <section className="skills__group" key={group.category} data-reveal>
              <h3 className="skills__group-title">
                {t.skills.categories[group.category]}
              </h3>
              <ul className="skills__list">
                {group.items.map((item) => (
                  <li className="skills__item" key={item.name}>
                    <span className="skills__name">{item.name}</span>
                    {item.note ? (
                      <span className="skills__note">{item.note(t)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="skills__languages" data-reveal>
          <h3 className="skills__group-title">{t.skills.languagesTitle}</h3>
          <ul className="skills__language-list">
            {t.skills.languages.map((entry) => (
              <li className="skills__language" key={entry.name}>
                <span className="skills__language-name">{entry.name}</span>
                <span className="skills__language-rule" aria-hidden="true" />
                <span className="skills__language-level">{entry.level}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
