import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { LANGUAGE_LABELS, type Language } from '../../i18n/translations'
import { useLanguage } from '../../hooks/useLanguage'
import { prefersReducedMotionNow } from '../../hooks/usePrefersReducedMotion'

/** Order shown in the UI. */
const ORDER: Language[] = ['de', 'en', 'es']

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const wrapRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const buttons = useRef<Partial<Record<Language, HTMLButtonElement | null>>>({})
  const positioned = useRef(false)

  useGSAP(
    () => {
      const pill = pillRef.current
      const active = buttons.current[language]
      if (!pill || !active) return

      const to = {
        x: active.offsetLeft,
        width: active.offsetWidth,
        autoAlpha: 1,
      }

      if (!positioned.current || prefersReducedMotionNow()) {
        gsap.set(pill, to)
        positioned.current = true
        return
      }
      gsap.to(pill, { ...to, duration: 0.38, ease: 'power3.out', overwrite: 'auto' })
    },
    { dependencies: [language] },
  )

  return (
    <div
      ref={wrapRef}
      className="island island--lang glass"
      role="group"
      aria-label={t.a11y.languageSelector}
    >
      <span className="island__pill island__pill--sm" ref={pillRef} aria-hidden="true" />
      {ORDER.map((code) => (
        <button
          key={code}
          type="button"
          ref={(node) => {
            buttons.current[code] = node
          }}
          className="lang__item"
          data-active={language === code || undefined}
          aria-pressed={language === code}
          lang={code}
          onClick={() => setLanguage(code)}
        >
          {LANGUAGE_LABELS[code]}
        </button>
      ))}
    </div>
  )
}
