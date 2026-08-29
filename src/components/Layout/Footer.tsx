import { ArrowUp } from 'lucide-react'
import { SITE } from '../../config/site'
import { useLanguage } from '../../hooks/useLanguage'
import { useScrollTo } from '../../hooks/useScrollTo'
import './footer.css'

export function Footer() {
  const { t } = useLanguage()
  const scrollTo = useScrollTo()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__meta">
          <p className="footer__name">{SITE.name}</p>
          <p className="footer__tagline">{t.footer.tagline}</p>
        </div>

        <div className="footer__side">
          <p className="footer__legal">
            © {year} {SITE.name} · {t.footer.location} · {t.footer.rights}
          </p>
          <button
            type="button"
            className="footer__top"
            onClick={() => scrollTo('top')}
          >
            {t.footer.backToTop}
            <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
