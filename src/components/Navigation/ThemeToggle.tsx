import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Moon, Sun } from 'lucide-react'
import { useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { prefersReducedMotionNow } from '../../hooks/usePrefersReducedMotion'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const sunRef = useRef<HTMLSpanElement>(null)
  const moonRef = useRef<HTMLSpanElement>(null)
  const positioned = useRef(false)

  useGSAP(
    () => {
      const sun = sunRef.current
      const moon = moonRef.current
      if (!sun || !moon) return

      const isDark = theme === 'dark'
      const shown = isDark ? moon : sun
      const hidden = isDark ? sun : moon

      if (!positioned.current || prefersReducedMotionNow()) {
        gsap.set(shown, { autoAlpha: 1, rotate: 0, scale: 1 })
        gsap.set(hidden, { autoAlpha: 0, rotate: -70, scale: 0.6 })
        positioned.current = true
        return
      }

      gsap
        .timeline({ defaults: { duration: 0.34, ease: 'power2.out' } })
        .to(hidden, { autoAlpha: 0, rotate: 70, scale: 0.6 }, 0)
        .fromTo(
          shown,
          { autoAlpha: 0, rotate: -70, scale: 0.6 },
          { autoAlpha: 1, rotate: 0, scale: 1 },
          0.06,
        )
    },
    { dependencies: [theme] },
  )

  return (
    <button
      type="button"
      className="island island--theme glass theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t.a11y.switchToLight : t.a11y.switchToDark}
      aria-pressed={theme === 'dark'}
    >
      <span className="theme-toggle__icon" ref={sunRef}>
        <Sun size={16} strokeWidth={1.9} aria-hidden="true" />
      </span>
      <span className="theme-toggle__icon" ref={moonRef}>
        <Moon size={16} strokeWidth={1.9} aria-hidden="true" />
      </span>
    </button>
  )
}
