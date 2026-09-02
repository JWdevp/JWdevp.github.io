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
