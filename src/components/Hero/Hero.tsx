import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
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

/** Where the hero stacks and the two lines start arriving on their own
 *  schedule. Matches the breakpoint in hero.css. */
const PHONE = 720

export function Hero() {
  const { t, language } = useLanguage()
  const root = useRef<HTMLElement>(null)

  // Which line greets you is drawn once per load, not per render — picking it
  // inline would hand you a different one on every re-render, including the
  // one that happens when you switch language.
  const [pick] = useState(() => Math.floor(Math.random() * 1000))
  const taglines = t.hero.taglines
  const tagline = taglines[pick % taglines.length]

  useGSAP(
    () => {
      const budget = motionBudget()
      const greeting = root.current?.querySelector('.hero__greeting')
      const targets = gsap.utils.toArray<HTMLElement>('[data-hero-item]')
      const stage = root.current?.querySelector('.hero__stage')

      // On a phone the two lines are staged rather than arriving together: the
      // greeting half a second in, the line under it at two. They are the only
      // thing on that first screen, so they can afford to take their time, and
      // the wave is playing beside them in the meantime.
      //
      // Both still animate FROM an offset, so where they finish is where the
      // layout puts them — nothing here decides their position.
      const phone = window.matchMedia(`(max-width: ${PHONE}px)`).matches
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: phone ? 0 : 0.08,
      })

      // The greeting arrives on its own, and quickly — it is the first thing
      // read, so it should be there almost at once rather than easing in over
      // most of a second like the copy that follows it.
      if (greeting) {
        tl.from(
          greeting,
          {
            opacity: 0,
            y: budget.travel(phone ? 22 : 14),
            duration: budget.duration(phone ? 0.6 : 0.3),
          },
          phone ? 0.5 : 0,
        )
      }

      tl.from(
        targets,
        {
          opacity: 0,
          y: budget.travel(phone ? 22 : 18),
          duration: budget.duration(phone ? 0.6 : 0.72),
          stagger: budget.stagger(0.075),
        },
        phone ? 2 : budget.duration(0.16),
      )

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
          <Greeting text={t.hero.greeting} />

          <p className="hero__tagline" data-hero-item>
            {tagline}
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

/**
 * The greeting, lit by the accent colour.
 *
 * With a cursor the light follows it: a small accent-coloured pool clipped to
 * the glyphs, written to CSS custom properties from the pointer handler so it
 * costs a style write and no React render. Without one there is nothing to
 * follow, so a tap lights the whole line for two seconds and it fades back.
 */
function Greeting({ text }: { text: string }) {
  const node = useRef<HTMLHeadingElement>(null)
  const [lit, setLit] = useState(false)

  const fine =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  /** Put the light where the pointer is. Shared by the cursor, which moves it
   *  continuously, and by a tap, which sets it once and leaves it there. */
  const aim = useCallback((event: React.PointerEvent<HTMLHeadingElement>) => {
    const el = node.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--lx', `${((event.clientX - rect.left) / rect.width) * 100}%`)
    // Down the page in px, not per cent: the box this lands in is taller than
    // the heading by `--bleed` at each end, and a percentage would be read
    // against that taller box and put the light above where you touched.
    el.style.setProperty('--ly', `${event.clientY - rect.top}px`)
  }, [])

  const track = useCallback(
    (event: React.PointerEvent<HTMLHeadingElement>) => {
      if (!fine) return
      aim(event)
    },
    [aim, fine],
  )

  // Touch: hold the tint, then let it go.
  useEffect(() => {
    if (!lit) return
    const timer = setTimeout(() => setLit(false), 2000)
    return () => clearTimeout(timer)
  }, [lit])

  return (
    <h1
      className="hero__greeting"
      ref={node}
      data-text={text}
      data-follow={fine || undefined}
      data-lit={lit || undefined}
      onPointerMove={track}
      onPointerDown={(event) => {
        if (fine) return
        // Where you touched, before it lights: the light is anchored here and
        // this is the point it draws back to when it goes.
        aim(event)
        setLit(true)
      }}
    >
      {text}
    </h1>
  )
}
