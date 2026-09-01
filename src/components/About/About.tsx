import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SITE } from '../../config/site'
import { useLanguage } from '../../hooks/useLanguage'
import { useReveal } from '../../hooks/useReveal'
import './about.css'

/**
 * Download button for the CV, shown only once the file is actually served.
 *
 * A link is checked rather than assumed: the rest of the section already
 * removes a missing portrait and a missing project shot rather than leaving
 * something broken on the page, and a download that 404s is worse than no
 * button at all.
 */
function CvButton({ label, hint }: { label: string; hint: string }) {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(SITE.cv, { method: 'HEAD' })
      .then((response) => {
        // The status alone is not enough: a dev server (and any host with an
        // SPA fallback) answers an unknown path with index.html and a 200, so
        // a missing PDF would still look present. Ask what came back.
        const type = response.headers.get('content-type') ?? ''
        if (!cancelled && response.ok && type.includes('pdf')) setAvailable(true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!available) return null

  return (
    <a className="btn about__cv" href={SITE.cv} download>
      <Download size={16} strokeWidth={1.9} aria-hidden="true" />
      {label}
      <span className="about__cv-hint">{hint}</span>
    </a>
  )
}

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

            <div data-reveal>
              <CvButton label={t.about.cv} hint={t.about.cvHint} />
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
