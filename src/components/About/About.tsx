import { useRef, useState } from 'react'
import { SITE } from '../../config/site'
import { useLanguage } from '../../hooks/useLanguage'
import { useReveal } from '../../hooks/useReveal'
import './about.css'

/**
 * Portrait. The filename lives in `SITE.portrait`.
 *
 * The figure removes itself if the image fails to load, rather than leaving a
 * broken-image icon in the middle of the section — so renaming or removing the
 * file degrades quietly instead of breaking the layout.
 */
function Portrait({ alt }: { alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <figure className="about__portrait" data-reveal>
      <img
        src={SITE.portrait}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </figure>
  )
}

export function About() {
  const { t } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  return (
    <div className="about" ref={root}>
      <div className="container">
        <p className="eyebrow about__eyebrow" data-reveal>
          {t.about.eyebrow}
        </p>

        {/* The eyebrow sits above the grid so that the first row starts at the
            title — which is where the portrait's top edge has to line up. */}
        <div className="about__grid">
          <div className="about__main">
            <h2 className="section__title" data-reveal>
              {t.about.title}
            </h2>
            <p className="section__lead" data-reveal>
              {t.about.lead}
            </p>

            <div className="about__prose">
              {t.about.paragraphs.map((paragraph, index) => (
                <p key={index} data-reveal>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside className="about__aside">
            <Portrait alt={t.about.portraitAlt} />
          </aside>
        </div>

        {/* Full width, under both columns: the facts read as one row of labelled
            values rather than a narrow stack beside the portrait. The heading
            sits outside the panel, so the panel holds only the values and can
            centre them. */}
        <section className="about__facts-block" data-reveal>
          <h3 className="about__facts-title">{t.about.factsTitle}</h3>
          <div className="about__facts card">
            <dl className="about__facts-list">
              {t.about.facts.map((fact) => (
                <div className="about__fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
              <div className="about__fact">
                <dt>{t.about.languagesTitle}</dt>
                <dd>
                  {t.about.languages.map((language) => (
                    <span className="about__language" key={language.name}>
                      {language.name}
                      <span className="about__language-level">{language.level}</span>
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <p className="about__closing" data-reveal>
          {t.about.closing}
        </p>
      </div>
    </div>
  )
}
