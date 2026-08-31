import { useEffect, useRef, useState } from 'react'
import { isProgrammaticScroll } from './useScrollTo'

export type ScrollDirection = 'up' | 'down'

/**
 * Which way the page is currently being scrolled.
 *
 * Two guards keep it from flickering: movements smaller than `threshold` are
 * ignored, so a trackpad's noise does not flip the direction, and anything
 * above the fold always reports "up" — the island belongs on screen when you
 * are at the top, whichever way you arrived.
 *
 * Scrolls started by the navigation itself are ignored entirely; see
 * `isProgrammaticScroll`.
 */
export function useScrollDirection(threshold = 6, topZone = 120): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>('up')
  const last = useRef(0)

  useEffect(() => {
    last.current = window.scrollY
    let frame = 0

    const measure = () => {
      frame = 0
      const y = window.scrollY

      if (isProgrammaticScroll()) {
        last.current = y
        return
      }
      if (y <= topZone) {
        last.current = y
        setDirection('up')
        return
      }

      const delta = y - last.current
      if (Math.abs(delta) < threshold) return
      last.current = y
      setDirection(delta > 0 ? 'down' : 'up')
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [threshold, topZone])

  return direction
}
