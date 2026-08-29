import { useCallback } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { prefersReducedMotionNow } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollToPlugin)

/**
 * Smooth, short scroll to a section. Fast on purpose: navigation should feel
 * like a cut, not like a ride. Honours reduced-motion by jumping instantly.
 */
/** Clearance for the floating island, which sits on top on desktop and at the
 *  bottom on mobile. */
function navOffset(): number {
  if (typeof window === 'undefined') return 0
  return window.matchMedia('(max-width: 720px)').matches ? 28 : 96
}

export function useScrollTo() {
  return useCallback((targetId: string) => {
    const target =
      targetId === 'top' ? 0 : document.getElementById(targetId)
    if (target === null) return

    if (prefersReducedMotionNow()) {
      window.scrollTo({
        top: target === 0 ? 0 : (target as HTMLElement).offsetTop - navOffset(),
        behavior: 'auto',
      })
      return
    }

    gsap.to(window, {
      duration: 0.72,
      ease: 'power3.inOut',
      scrollTo: {
        y: target === 0 ? 0 : (target as HTMLElement),
        offsetY: target === 0 ? 0 : navOffset(),
        autoKill: true,
      },
      overwrite: 'auto',
    })
  }, [])
}
