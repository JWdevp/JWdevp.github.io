import { SECTION_IDS } from './config/site'
import { useLanguage } from './hooks/useLanguage'
import { useSectionObserver } from './hooks/useSectionObserver'
import { About } from './components/About/About'
import { Contact } from './components/Contact/Contact'
import { Hero } from './components/Hero/Hero'
import { Ambience } from './components/Layout/Ambience'
import { Footer } from './components/Layout/Footer'
import { FloatingNavigation } from './components/Navigation/FloatingNavigation'
import { LanguageSwitcher } from './components/Navigation/LanguageSwitcher'
import { ThemeToggle } from './components/Navigation/ThemeToggle'
import { Projects } from './components/Projects/Projects'
import { Skills } from './components/Skills/Skills'
import './components/Navigation/navigation.css'

export default function App() {
  const { t } = useLanguage()
  const activeSection = useSectionObserver(SECTION_IDS)

  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skipToContent}
      </a>

      <Ambience />

      <FloatingNavigation activeSection={activeSection} />
      <LanguageSwitcher />
      <ThemeToggle />

      <main id="main" className="page">
        <Hero />

        {/* About and Skills share one scroll target: they are one chapter. */}
        <section id="about" className="section">
          <About />
          <Skills />
        </section>

        <Projects />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
