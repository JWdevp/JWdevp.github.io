import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LANGUAGE,
  HTML_LANG,
  LANGUAGES,
  translations,
  type Language,
  type Translation,
} from '../i18n/translations'

const STORAGE_KEY = 'jw-language'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language)
}

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)

  // Keep the document metadata in sync so screen readers, browsers and
  // crawlers see the language that is actually on screen.
  useEffect(() => {
    const t = translations[language]
    document.documentElement.lang = HTML_LANG[language]
    document.title = t.meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t.meta.description)
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', t.meta.description)
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute('content', HTML_LANG[language])
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      /* ignore */
    }
  }, [language])

  const setLanguage = useCallback(
    (next: Language) => setLanguageState(next),
    [],
  )

  const value = useMemo(
    () => ({ language, setLanguage, t: translations[language] }),
    [language, setLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context)
    throw new Error('useLanguage must be used inside <LanguageProvider>')
  return context
}
