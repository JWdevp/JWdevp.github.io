import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowDown, ArrowRight, MapPin } from 'lucide-react'
import { Suspense, lazy, useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { prefersReducedMotionNow } from '../../hooks/usePrefersReducedMotion'
import { useScrollTo } from '../../hooks/useScrollTo'

/**
 * Three.js is by far the heaviest dependency on the page, and nothing above the
 * fold depends on it. Loading it in its own chunk lets the copy paint first.
 */
const CharacterScene = lazy(() =>
  import('../Character/CharacterScene').then((module) => ({
    default: module.CharacterScene,
  })),
)
import './hero.css'

export function Hero() {
  const { t, language } = useLanguage()
  const scrollTo = useScrollTo()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotionNow()) return

      const targets = gsap.utils.toArray<HTMLElement>('[data-hero-item]')
      const stage = root.current?.querySelector('.hero__stage')

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.08,
      })

      tl.from(targets, {
        opacity: 0,
        y: 18,
        duration: 0.72,
        stagger: 0.075,
      })

      if (stage) {
        tl.from(
          stage,
          { opacity: 0, scale: 0.94, duration: 1.05, ease: 'power2.out' },
          0.1,
        )
      }
    },
    { scope: root, dependencies: [language] },
  )

  return (
    <section id="home" className="section hero" ref={root}>
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow" data-hero-item>
            <MapPin size={12} strokeWidth={2} aria-hidden="true" />
            {t.hero.location}
          </p>

          <h1 className="hero__greeting" data-hero-item>
            {t.hero.greeting}
          </h1>

          <p className="hero__tagline" data-hero-item>
            {t.hero.tagline}
          </p>

          <p className="hero__role" data-hero-item>
            <span className="hero__role-dot" aria-hidden="true" />
            {t.hero.role}
          </p>

          <p className="hero__intro" data-hero-item>
            {t.hero.intro}
          </p>

          <p className="hero__triad" data-hero-item>
            {t.hero.triad}
          </p>

          <div className="hero__actions" data-hero-item>
            <button
              type="button"
              className="btn"
              onClick={() => scrollTo('projects')}
            >
              {t.hero.ctaProjects}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => scrollTo('contact')}
            >
              {t.hero.ctaContact}
            </button>
          </div>
        </div>

        <div className="hero__stage">
          <Suspense fallback={<div className="hero__stage-fallback" aria-hidden="true" />}>
            <CharacterScene />
          </Suspense>
          <p className="visually-hidden">{t.a11y.character3d}</p>
        </div>
      </div>

      <button
        type="button"
        className="hero__scroll"
        onClick={() => scrollTo('about')}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ArrowDown size={13} strokeWidth={2} />
        {t.hero.scrollHint}
      </button>
    </section>
  )
}
