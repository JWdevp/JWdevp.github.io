import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Suspense, lazy, useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { motionBudget } from '../../hooks/usePrefersReducedMotion'

/** The sprite sheet is the single heaviest asset on the page, so the character
 *  arrives in its own chunk and the copy paints first. */
const CharacterStage = lazy(() =>
  import('../Character/CharacterStage').then((module) => ({
    default: module.CharacterStage,
  })),
)
import './hero.css'

export function Hero() {
  const { t, language } = useLanguage()
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

        </div>

        <div className="hero__stage">
          <Suspense fallback={<div className="hero__stage-fallback" aria-hidden="true" />}>
            <CharacterStage />
          </Suspense>
        </div>
      </div>

    </section>
  )
}
