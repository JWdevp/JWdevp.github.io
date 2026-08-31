import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ChevronRight, Settings } from 'lucide' // icon data, not components
import { MorphIcon } from 'morphicons/react'
import { useRef, useState } from 'react'
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
export function SettingsIsland() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useGSAP(
    () => {
      const items = panel.current?.children
      if (!items) return

      // Reduced motion keeps the disclosure legible as a cross-fade: the slide
      // distance and the overshoot go, the fade stays.
      const budget = motionBudget()
      const slide = budget.travel(26)
      const shrink = budget.reduced ? 1 : 0.88

      const first = !started.current
      started.current = true

      if (first) {
        gsap.set(items, { autoAlpha: open ? 1 : 0, x: open ? 0 : slide, scale: open ? 1 : shrink })
        return
      }

      const tl = gsap.timeline()

      if (open) {
        // Emerge from behind the gear, nearest island first.
        tl.fromTo(
          items,
          { autoAlpha: 0, x: slide, scale: shrink },
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: budget.duration(0.42),
            ease: budget.reduced ? 'power2.out' : 'back.out(1.6)',
            stagger: { each: budget.stagger(0.07), from: 'end' },
          },
          0,
        )
      } else {
        tl.to(
          items,
          {
            autoAlpha: 0,
            x: slide,
            scale: shrink,
            duration: budget.duration(0.26),
            ease: 'power2.in',
            stagger: { each: budget.stagger(0.05), from: 'start' },
          },
          0,
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

      <button
        type="button"
        className="island island--settings glass settings__toggle"
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
             so it keeps animating under prefers-reduced-motion — "user" made it
             swap instantly on any machine with the OS setting on. */
          reducedMotion="never"
        />
      </button>
    </div>
  )
}
