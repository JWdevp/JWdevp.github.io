import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { SECTION_IDS, type SectionId } from '../../config/site'
import { useLanguage } from '../../hooks/useLanguage'
import { prefersReducedMotionNow } from '../../hooks/usePrefersReducedMotion'
import { useScrollTo } from '../../hooks/useScrollTo'

interface Props {
  activeSection: string
}

/**
 * The floating navigation island.
 *
 * The active state is a single pill element that physically travels between
 * items — measured from the DOM and moved with GSAP, so it stays correct when
 * the labels change length (three languages) or the island is resized.
 */
export function FloatingNavigation({ activeSection }: Props) {
  const { t, language } = useLanguage()
  const scrollTo = useScrollTo()

  const listRef = useRef<HTMLUListElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const itemRefs = useRef<Partial<Record<SectionId, HTMLButtonElement | null>>>({})
  const hasPositioned = useRef(false)

  const labels: Record<SectionId, string> = {
    home: t.nav.home,
    about: t.nav.about,
    projects: t.nav.projects,
    contact: t.nav.contact,
  }

  const movePill = (animate: boolean) => {
    const pill = pillRef.current
    const list = listRef.current
    const active = itemRefs.current[activeSection as SectionId]
    if (!pill || !list || !active) return

    const x = active.offsetLeft
    const width = active.offsetWidth
    const height = active.offsetHeight
    const y = active.offsetTop

    if (!animate || prefersReducedMotionNow()) {
      gsap.set(pill, { x, y, width, height, autoAlpha: 1 })
      return
    }

    gsap.to(pill, {
      x,
      y,
      width,
      height,
      autoAlpha: 1,
      duration: 0.42,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  useGSAP(() => {
    movePill(hasPositioned.current)
    hasPositioned.current = true
  }, { dependencies: [activeSection, language] })

  // Re-measure on layout changes (viewport resize, font swap, wrap change).
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(() => movePill(false))
    observer.observe(list)
    return () => observer.disconnect()
  }, [activeSection, language])

  return (
    <nav
      className="island island--nav glass"
      aria-label={t.a11y.mainNavigation}
    >
      <ul className="island__list" ref={listRef}>
        <span className="island__pill" ref={pillRef} aria-hidden="true" />
        {SECTION_IDS.map((id) => (
          <li key={id}>
            <button
              type="button"
              ref={(node) => {
                itemRefs.current[id] = node
              }}
              className="island__item"
              data-active={activeSection === id || undefined}
              aria-current={activeSection === id ? 'true' : undefined}
              onClick={() => scrollTo(id)}
            >
              {labels[id]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
