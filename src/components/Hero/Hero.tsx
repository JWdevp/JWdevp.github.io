import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import { Suspense, lazy, useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { motionBudget } from '../../hooks/usePrefersReducedMotion'
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
      const budget = motionBudget()
      const targets = gsap.utils.toArray<HTMLElement>('[data-hero-item]')
      const stage = root.current?.querySelector('.hero__stage')

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.08,
      })

      tl.from(targets, {
        opacity: 0,
        y: budget.travel(18),
        duration: budget.duration(0.72),
        stagger: budget.stagger(0.075),
      })

      if (stage) {
        tl.from(
          stage,
          {
            opacity: 0,
            scale: budget.reduced ? 1 : 0.94,
            duration: budget.duration(1.05),
            ease: 'power2.out',
          },
          budget.reduced ? 0 : 0.1,
        )
      }
    },
    { scope: root, dependencies: [language] },
  )

  return (
    <section id="home" className="section hero" ref={root}>
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 className="hero__greeting" data-hero-item>
            {t.hero.greeting}
          </h1>

          <p className="hero__tagline" data-hero-item>
            {t.hero.tagline}
          </p>

          <p className="hero__intro" data-hero-item>
            {t.hero.intro}
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

    </section>
  )
}
