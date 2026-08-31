import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { SECTION_IDS, type SectionId } from '../../config/site'
import { useLanguage } from '../../hooks/useLanguage'
import { motionBudget } from '../../hooks/usePrefersReducedMotion'

interface Props {
  activeSection: string
  onSelect: (id: SectionId) => void
}

/**
 * The floating navigation island.
 *
 * The active state is a single pill element that physically travels between
 * items — measured from the DOM and moved with GSAP, so it stays correct when
 * the labels change length (three languages) or the island is resized.
 *
 * Which item is active is decided by App, not here: during a click-driven scroll
 * the target is held fixed so the pill glides once to its destination instead of
 * hopping through every section the page passes on the way.
 */
export function FloatingNavigation({ activeSection, onSelect }: Props) {
  const { t, language } = useLanguage()

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

    if (!animate) {
      gsap.set(pill, { x, y, width, height, autoAlpha: 1 })
      return
    }

    // A small indicator sliding a couple of hundred pixels is not a vestibular
    // trigger, so reduced motion shortens the travel rather than removing it.
    const budget = motionBudget()
    gsap.to(pill, {
      x,
      y,
      width,
      height,
      autoAlpha: 1,
      duration: budget.duration(0.42),
      ease: budget.reduced ? 'power1.out' : 'power3.out',
      overwrite: 'auto',
    })
  }

  useGSAP(() => {
    movePill(hasPositioned.current)
    hasPositioned.current = true
  }, { dependencies: [activeSection, language] })

  // Keep the latest measurement closure reachable from an observer that is
  // created once and never re-created.
  const movePillRef = useRef(movePill)
  useEffect(() => {
    movePillRef.current = movePill
  })

  // Re-measure on real layout changes (viewport resize, font swap, wrap change).
  //
  // Created once, on purpose. Re-creating it whenever the active item changed
  // meant `observe()` fired its initial callback in the middle of the travel
  // tween and hard-set the pill to the destination, so every navigation showed
  // a jump to the target and then a slide back into it.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    let initial = true
    const observer = new ResizeObserver(() => {
      if (initial) {
        initial = false // observe() always reports once straight away
        return
      }
      movePillRef.current(false)
    })
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

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
              onClick={() => onSelect(id)}
            >
              {labels[id]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
