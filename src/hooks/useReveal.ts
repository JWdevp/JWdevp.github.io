import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'
import { prefersReducedMotionNow } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Scroll-linked entrance for a section.
 *
 * Any descendant carrying `data-reveal` fades and lifts into place once the
 * section enters the viewport, staggered in document order. `useGSAP` scopes
 * every tween to the container and reverts them — ScrollTriggers included — on
 * unmount, so nothing leaks between renders.
 *
 * Elements are visible by default in CSS; the hook hides them only when it is
 * actually going to animate them, so a reduced-motion visitor (or a failed
 * script) still sees a complete page.
 */
export function useReveal(
  scope: RefObject<HTMLElement | null>,
  options: { stagger?: number; y?: number; start?: string } = {},
) {
  const { stagger = 0.07, y = 22, start = 'top 82%' } = options

  useGSAP(
    () => {
      if (prefersReducedMotionNow()) return

      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      if (targets.length === 0) return

      gsap.set(targets, { opacity: 0, y })

      ScrollTrigger.batch(targets, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.62,
            ease: 'power3.out',
            stagger,
            overwrite: true,
          }),
      })
    },
    { scope, dependencies: [stagger, y, start] },
  )
}
