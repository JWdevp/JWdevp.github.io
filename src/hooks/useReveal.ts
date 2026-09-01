import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { RefObject } from 'react'
import { motionBudget } from './usePrefersReducedMotion'

gsap.registerPlugin(useGSAP)

/**
 * Scroll-linked entrance and exit for a section.
 *
 * Any descendant carrying `data-reveal` fades and lifts into place as it comes
 * into view, staggered in document order, and fades back out once it has left
 * — so scrolling back up plays the entrance again rather than finding
 * everything already there.
 *
 * Two observers rather than one, with different margins. A single observer
 * toggling on the same edge would flicker for anyone stopped right on it: one
 * pixel either way would fade the element in and out. So the box an element
 * has to enter to appear sits *inside* the box it has to leave to disappear,
 * and the gap between them is dead space where nothing changes.
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
 * tighten, so this becomes a cross-fade rather than disappearing altogether —
 * see `motionBudget`.
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

      // Elements crossing a line within the same tick animate as one staggered
      // group; a later arrival starts its own group.
      let entering: HTMLElement[] = []
      let leaving: { el: HTMLElement; above: boolean }[] = []
      let flush: ReturnType<typeof setTimeout> | undefined

      const play = () => {
        const shown = entering
        const hidden = leaving
        entering = []
        leaving = []

        if (shown.length > 0) {
          gsap.to(shown, {
            opacity: 1,
            y: 0,
            duration: budget.duration(duration),
            ease: 'power2.inOut',
            stagger: budget.stagger(stagger),
            overwrite: 'auto',
          })
        }

        for (const { el, above } of hidden) {
          gsap.to(el, {
            opacity: 0,
            // Back the way it came: something that left over the top lifts
            // away upwards, not down into the viewport it just left.
            y: above ? -lift : lift,
            duration: budget.duration(duration),
            ease: 'power2.inOut',
            overwrite: 'auto',
          })
        }
      }

      const schedule = () => {
        clearTimeout(flush)
        flush = setTimeout(play, 60)
      }

      // Inner box: an element appears once it is properly inside the viewport.
      const show = new IntersectionObserver(
        (entries) => {
          let queued = false
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entering.push(entry.target as HTMLElement)
            queued = true
          }
          if (queued) schedule()
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
      )

      // Outer box: it only disappears once it is clear of the viewport, well
      // past the line that brought it in.
      const hide = new IntersectionObserver(
        (entries) => {
          let queued = false
          for (const entry of entries) {
            if (entry.isIntersecting) continue
            leaving.push({
              el: entry.target as HTMLElement,
              above: entry.boundingClientRect.top < 0,
            })
            queued = true
          }
          if (queued) schedule()
        },
        { rootMargin: '15% 0px 15% 0px', threshold: 0 },
      )

      targets.forEach((target) => {
        show.observe(target)
        hide.observe(target)
      })

      return () => {
        show.disconnect()
        hide.disconnect()
        clearTimeout(flush)
      }
    },
    { scope, dependencies: [stagger, y, duration] },
  )
}
