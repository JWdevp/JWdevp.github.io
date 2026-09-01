import { useEffect, useState } from 'react'

/**
 * Tracks which section currently owns the viewport.
 *
 * Uses IntersectionObserver with a band centred on the upper third of the
 * screen, so a section becomes "active" as it settles into reading position
 * rather than the instant its first pixel appears. Falls back to the first id
 * when nothing intersects (e.g. very short viewports).
 */
export function useSectionObserver(
  sectionIds: readonly string[],
  rootMargin = '-45% 0px -50% 0px',
): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '')

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio)
          } else {
            visible.delete(entry.target.id)
          }
        }

        if (visible.size === 0) return

        // Preserve document order when several sections share the band.
        let winner = ''
        for (const id of sectionIds) {
          if (visible.has(id)) {
            winner = id
            break
          }
        }
        if (winner) setActiveId(winner)
      },
      { rootMargin, threshold: [0, 0.01, 0.5, 1] },
    )

    elements.forEach((el) => observer.observe(el))

    // The band sits mid-screen, so the ends of the page need their own rule:
    // at the top nothing has reached the band yet, and at the bottom the last
    // section has already scrolled out of it — the footer occupies the bottom
    // of the viewport — which would otherwise leave the previous section lit.
    const onScroll = () => {
      if (window.scrollY < 40) {
        setActiveId(sectionIds[0] ?? '')
        return
      }
      const remaining =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      if (remaining < 40) setActiveId(sectionIds[sectionIds.length - 1] ?? '')
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [sectionIds, rootMargin])

  return activeId
}
