import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { RefObject } from 'react'
import { motionBudget } from './usePrefersReducedMotion'

gsap.registerPlugin(useGSAP)

/**
 * Scroll-linked entrance for a section.
 *
 * Any descendant carrying `data-reveal` fades and lifts into place as it comes
 * into view, staggered in document order.
 *
 * Driven by IntersectionObserver rather than ScrollTrigger on purpose. Sections
 * carry their own scroll-scrubbed transform (see `useSectionTransitions`), which
 * moves their children continuously — and a ScrollTrigger start position, once
 * computed, does not know about that. The result was elements sitting at
 * opacity 0 inside the viewport until something forced a refresh.
 * IntersectionObserver reports real rendered geometry every time, so the two
 * effects can no longer disagree.
 *
 * Under `prefers-reduced-motion` the lift collapses to zero and the timings
 * tighten, so the entrance becomes a quick cross-fade rather than disappearing
 * altogether — see `motionBudget`.
 */
export function useReveal(
  scope: RefObject<HTMLElement | null>,
  options: { stagger?: number; y?: number; duration?: number } = {},
) {
  const { stagger = 0.2, y = 22, duration = 0.3 } = options

  useGSAP(
    () => {
      const budget = motionBudget()
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      if (targets.length === 0) return

      const lift = budget.travel(y)
      gsap.set(targets, { opacity: 0, y: lift })

      // Elements that cross the line within the same tick animate as one
      // staggered group; a later arrival starts its own group.
      let queued: HTMLElement[] = []
      let flush: ReturnType<typeof setTimeout> | undefined

      const play = () => {
        const batch = queued
        queued = []
        if (batch.length === 0) return
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: budget.duration(duration),
          ease: 'power2.inOut',
          stagger: budget.stagger(stagger),
          overwrite: 'auto',
        })
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            queued.push(entry.target as HTMLElement)
            observer.unobserve(entry.target) // reveal once, then stop watching
          }
          if (queued.length > 0) {
            clearTimeout(flush)
            flush = setTimeout(play, 60)
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
      )

      targets.forEach((target) => observer.observe(target))

      return () => {
        observer.disconnect()
        clearTimeout(flush)
      }
    },
    { scope, dependencies: [stagger, y, duration] },
  )
}
