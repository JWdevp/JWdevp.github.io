import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ChevronRight, Settings } from 'lucide' // icon data, not components
import { MorphIcon } from 'morphicons/react'
import { useEffect, useRef, useState } from 'react'
import { useGreetingDone } from '../../hooks/useGreeting'
import { useLanguage } from '../../hooks/useLanguage'
import { motionBudget } from '../../hooks/usePrefersReducedMotion'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

/**
 * Language and theme, tucked behind a gear.
 *
 * They are settings you touch once, so they do not need to occupy the corner
 * permanently. Closed, this is a single gear button; open, the two islands slide
 * out from underneath it and the gear becomes a chevron that puts them back.
 *
 * The panel stays in the layout when closed (hidden via `autoAlpha`, not
 * `display`), so the pills inside it can still measure themselves — a panel that
 * is display:none reports zero widths and the language pill lands in the wrong
 * place the first time you open it.
 *
 * The button's icon is a single `MorphIcon` that interpolates between the gear
 * and the chevron, so the two states are one shape changing rather than two
 * icons trading places.
 */
/** The width at which navigation moves to the bottom and this becomes the only
 *  control in the corner. Matches the breakpoint in navigation.css. */
const MOBILE = 720
/** Downward travel that counts as "done reading", in px. */
const SCROLL_TO_DISMISS = 24

export function SettingsIsland() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const greeted = useGreetingDone()

  /** Whether the gear waits for the greeting before appearing at all. Read once
   *  and kept, so it cannot change under the animation halfway through. */
  const [waits] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(`(max-width: ${MOBILE}px)`).matches,
  )

  /**
   * On a phone the gear is not there to begin with. It arrives once the
   * greeting is over, sliding in from the right, so the wave has the corner to
   * itself while it plays and the control turns up afterwards.
   *
   * Only the button moves, and only its transform. What it does when tapped is
   * untouched, and the panel behind it measures its parked positions from
   * `offsetLeft`, which a transform does not disturb.
   *
   * Parked right off the edge rather than merely faded, which it can afford to
   * be: `body` carries `overflow-x: hidden`, so nothing here drags a scrollbar
   * sideways on the way in.
   */
  useGSAP(
    () => {
      const el = toggle.current
      if (!el || !waits) return
      const budget = motionBudget()
      const inset = parseFloat(getComputedStyle(root.current as Element).right) || 0
      const park = budget.travel(el.offsetWidth + inset)

      if (!greeted) {
        // Set, not animated, and in a layout effect: this lands before the
        // first paint, so the gear is never seen before it is meant to arrive.
        gsap.set(el, { autoAlpha: 0, x: park })
        return
      }
      gsap.fromTo(
        el,
        { autoAlpha: 0, x: park },
        { autoAlpha: 1, x: 0, duration: budget.duration(0.55), ease: 'power3.out' },
      )
    },
    { dependencies: [greeted, waits] },
  )

  /**
   * An open panel puts itself away on the way down the page. It sits over the
   * top of the content, so the first thing you do after reading it is the
   * signal that you are finished with it.
   *
   * Downward only, and past a threshold: a phone reports small scroll jitters
   * on its own, and closing on those would look like a glitch rather than a
   * response. Upward scrolling leaves it alone — you may be coming back to it.
   */
  useEffect(() => {
    if (!open) return
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y > last + SCROLL_TO_DISMISS) setOpen(false)
      else if (y < last) last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useGSAP(
    () => {
      const items = panel.current?.children
      if (!items) return

      // Reduced motion keeps the disclosure legible as a cross-fade: the slide
      // distance goes, the fade stays.
      const budget = motionBudget()
      // How far each island has to travel to sit behind the gear: the distance
      // from its own left edge to the panel's right edge, plus the gap between
      // panel and button. Measured per island, so they genuinely slide out from
      // under the gear rather than nudging into place.
      //
      // From `offsetLeft`, not `getBoundingClientRect`: the rect includes the
      // transform these are already carrying, so when they are parked it
      // reports the parked position and the distance comes out as zero — which
      // is exactly what stopped them moving at all.
      const box = panel.current
      const gap = parseFloat(getComputedStyle(root.current as Element).gap) || 8
      const parked = new Map<Element, number>()
      if (box) {
        for (const item of items) {
          const el = item as HTMLElement
          parked.set(item, budget.travel(box.offsetWidth - el.offsetLeft + gap))
        }
      }
      const park = (_i: number, el: Element) => parked.get(el) ?? budget.travel(26)

      const first = !started.current
      started.current = true

      if (first) {
        gsap.set(items, { autoAlpha: open ? 1 : 0, x: open ? 0 : park, scale: 1 })
        return
      }

      const tl = gsap.timeline()

      if (open) {
        // Slide out from behind the gear, nearest island first. The fade runs
        // well ahead of the movement so what you read is the travel, not an
        // appearance: by a third of the way out they are already solid.
        tl.fromTo(
          items,
          { autoAlpha: 0, x: park },
          {
            x: 0,
            duration: budget.duration(0.52),
            ease: 'power3.out',
            stagger: { each: budget.stagger(0.08), from: 'end' },
          },
          0,
        ).to(
          items,
          {
            autoAlpha: 1,
            duration: budget.duration(0.18),
            ease: 'none',
            stagger: { each: budget.stagger(0.08), from: 'end' },
          },
          0,
        )
      } else {
        tl.to(
          items,
          {
            x: park,
            duration: budget.duration(0.34),
            ease: 'power2.in',
            stagger: { each: budget.stagger(0.06), from: 'start' },
          },
          0,
        ).to(
          items,
          {
            autoAlpha: 0,
            duration: budget.duration(0.16),
            ease: 'none',
            stagger: { each: budget.stagger(0.06), from: 'start' },
          },
          budget.duration(0.18),
        )
      }
    },
    { dependencies: [open] },
  )

  return (
    <div className="settings" ref={root}>
      <div className="settings__panel" ref={panel} inert={!open || undefined}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="settings__pocket">
        <button
          type="button"
          className="island island--settings glass settings__toggle"
          ref={toggle}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? t.a11y.closeSettings : t.a11y.openSettings}
        >
          {/* One icon that morphs between the two shapes rather than two icons
              cross-fading: the gear unwinds into the chevron and back. */}
          <MorphIcon
            className="settings__icon"
            icon={open ? ChevronRight : Settings}
            size={17}
            strokeWidth={1.9}
            spring="snappy"
            /* A 17px glyph changing shape in place is not a vestibular trigger,
               so it keeps animating under prefers-reduced-motion — "user" made
               it swap instantly on any machine with the OS setting on. */
            reducedMotion="never"
          />
        </button>
      </div>
    </div>
  )
}
