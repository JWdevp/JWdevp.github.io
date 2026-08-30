import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ChevronRight, Settings } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { prefersReducedMotionNow } from '../../hooks/usePrefersReducedMotion'
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
 */
export function SettingsIsland() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const gear = useRef<HTMLSpanElement>(null)
  const chevron = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useGSAP(
    () => {
      const items = panel.current?.children
      if (!items || !gear.current || !chevron.current) return

      const shown = open ? chevron.current : gear.current
      const hidden = open ? gear.current : chevron.current
      const instant = !started.current || prefersReducedMotionNow()
      started.current = true

      if (instant) {
        gsap.set(items, {
          autoAlpha: open ? 1 : 0,
          x: open ? 0 : 26,
          scale: open ? 1 : 0.88,
        })
        gsap.set(shown, { autoAlpha: 1, rotate: 0, scale: 1 })
        gsap.set(hidden, { autoAlpha: 0, rotate: open ? -90 : 90, scale: 0.6 })
        return
      }

      const tl = gsap.timeline()

      tl.to(hidden, { autoAlpha: 0, rotate: open ? 90 : -90, scale: 0.6, duration: 0.24, ease: 'power2.in' }, 0)
        .fromTo(
          shown,
          { autoAlpha: 0, rotate: open ? -90 : 90, scale: 0.6 },
          { autoAlpha: 1, rotate: 0, scale: 1, duration: 0.3, ease: 'power2.out' },
          0.06,
        )

      if (open) {
        // Emerge from behind the gear, nearest island first.
        tl.fromTo(
          items,
          { autoAlpha: 0, x: 26, scale: 0.88 },
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 0.42,
            ease: 'back.out(1.6)',
            stagger: { each: 0.07, from: 'end' },
          },
          0,
        )
      } else {
        tl.to(
          items,
          {
            autoAlpha: 0,
            x: 26,
            scale: 0.88,
            duration: 0.26,
            ease: 'power2.in',
            stagger: { each: 0.05, from: 'start' },
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
        <span className="settings__icon" ref={gear}>
          <Settings size={16} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <span className="settings__icon" ref={chevron}>
          <ChevronRight size={17} strokeWidth={2.1} aria-hidden="true" />
        </span>
      </button>
    </div>
  )
}
