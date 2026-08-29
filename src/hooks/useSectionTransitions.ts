import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'
import { prefersReducedMotionNow } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Scroll transitions between sections.
 *
 * Each section owns one scrubbed timeline covering its whole passage through
 * the viewport: it rises and resolves as it arrives, holds while it is being
 * read, then settles back and dims as it leaves. Because it is a single
 * timeline per section, the arriving and departing phases can never fight over
 * the same properties.
 *
 * Amounts are deliberately small — this is depth between chapters, not a
 * carousel. The first section skips the arrival phase: it is already on screen
 * at first paint and must never start dimmed.
 */
export function useSectionTransitions(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotionNow()) return

      const sections = gsap.utils.toArray<HTMLElement>(':scope > section')
      if (sections.length === 0) return

      sections.forEach((section, index) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        })

        if (index > 0) {
          timeline.fromTo(
            section,
            { opacity: 0.4, y: 42 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          )
        } else {
          timeline.set(section, { opacity: 1, y: 0 })
          timeline.to(section, { duration: 0.3 })
        }

        // Held at rest for most of its passage — a tall section must stay
        // fully legible while its last screenful is still being read.
        timeline.to(section, { duration: 0.52 })

        timeline.to(section, {
          opacity: 0.42,
          y: -30,
          duration: 0.18,
          ease: 'power2.in',
        })
      })

      // Layout settles after fonts and the 3D chunk land; recalculate once.
      const refresh = () => ScrollTrigger.refresh()
      window.addEventListener('load', refresh)
      return () => window.removeEventListener('load', refresh)
    },
    { scope },
  )
}
