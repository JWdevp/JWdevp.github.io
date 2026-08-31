import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Reactive `prefers-reduced-motion` reader. Every animated component asks this
 * before starting a timeline; when it returns true, motion is either dropped or
 * replaced with an instant state change.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) =>
      setPrefersReduced(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}

/** Non-reactive read for imperative code (GSAP callbacks, rAF loops). */
export function prefersReducedMotionNow(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(QUERY).matches
}

/**
 * Motion budget for a single animation.
 *
 * `prefers-reduced-motion: reduce` used to switch every animation off outright,
 * which reads as a broken page rather than a considerate one — nothing appears,
 * the pill teleports, panels blink into place.
 *
 * Distance and duration are what provoke vestibular discomfort; a cross-fade
 * does not. So under the preference, travel collapses to zero and durations are
 * capped, while the fade survives. Genuinely large scroll-linked movement (the
 * section parallax, the character's idle) stays off entirely.
 */
export function motionBudget() {
  const reduced = prefersReducedMotionNow()
  return {
    reduced,
    /** Pixels of travel, or none when motion is reduced. */
    travel: (px: number) => (reduced ? 0 : px),
    /** Seconds, capped when motion is reduced. */
    duration: (seconds: number) => (reduced ? Math.min(seconds, 0.2) : seconds),
    /** Stagger between siblings, tightened when motion is reduced. */
    stagger: (seconds: number) => (reduced ? Math.min(seconds, 0.04) : seconds),
  }
}
