import { Moon, Sun } from 'lucide' // icon data, not components
import { MorphIcon } from 'morphicons/react'
import { useLanguage } from '../../hooks/useLanguage'
import { useTheme } from '../../hooks/useTheme'

/**
 * Light/dark switch.
 *
 * One icon that morphs between the two shapes rather than two icons crossing
 * over each other, the same as the settings gear beside it — the sun's rays
 * draw back into the moon's crescent and out again, so the two controls in the
 * island behave alike.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <button
      type="button"
      className="island island--theme glass theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t.a11y.switchToLight : t.a11y.switchToDark}
      aria-pressed={theme === 'dark'}
    >
      <MorphIcon
        className="theme-toggle__icon"
        icon={theme === 'dark' ? Moon : Sun}
        size={17}
        strokeWidth={1.9}
        spring="snappy"
        /* A 17px glyph changing shape in place is not a vestibular trigger, so
           it keeps animating under prefers-reduced-motion — "user" made it swap
           instantly on any machine with the OS setting on. Same call as the
           gear next to it. */
        reducedMotion="never"
      />
    </button>
  )
}
