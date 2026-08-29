import { useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useReveal } from '../../hooks/useReveal'
import './about.css'

export function About() {
  const { t } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  return (
    <div className="about" ref={root}>
      <div className="container">
        <header className="section__head">
          <p className="eyebrow" data-reveal>
            {t.about.eyebrow}
          </p>
          <h2 className="section__title" data-reveal>
            {t.about.title}
          </h2>
          <p className="section__lead" data-reveal>
            {t.about.lead}
          </p>
        </header>

        <div className="about__grid">
          <div className="about__prose">
            {t.about.paragraphs.map((paragraph, index) => (
              <p key={index} data-reveal>
                {paragraph}
              </p>
            ))}
          </div>

          <aside className="about__facts card" data-reveal>
            <h3 className="about__facts-title">{t.about.factsTitle}</h3>
            <dl className="about__facts-list">
              {t.about.facts.map((fact) => (
                <div className="about__fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="about__pillars">
          <h3 className="about__pillars-title" data-reveal>
            {t.about.pillarsTitle}
          </h3>
          <ul className="about__pillar-list">
            {t.about.pillars.map((pillar, index) => (
              <li className="about__pillar" key={pillar.title} data-reveal>
                <span className="about__pillar-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h4 className="about__pillar-heading">{pillar.title}</h4>
                <p className="about__pillar-text">{pillar.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
