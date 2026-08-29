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
