import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import type { Project } from '../../data/projects'
import { useLanguage } from '../../hooks/useLanguage'
import { prefersReducedMotionNow } from '../../hooks/usePrefersReducedMotion'

interface Props {
  project: Project
  index: number
}

export function ProjectCard({ project, index }: Props) {
  const { t, language } = useLanguage()
  const cardRef = useRef<HTMLElement>(null)

  // Pointer position is written straight to CSS custom properties: no React
  // state, so moving the cursor never re-renders anything.
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const card = cardRef.current
    if (!card || prefersReducedMotionNow()) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width) * 100}%`)
    card.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height) * 100}%`)
  }

  const isLinked = project.url !== null
  const title = project.title[language]
  const description = project.description[language]

  const content = (
    <>
      <div className="project__cover" data-index={index}>
        {project.image ? (
          <img
            src={`${import.meta.env.BASE_URL}${project.image.replace(/^\//, '')}`}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="project__cover-mark" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="project__body">
        <h3 className="project__title">{title}</h3>
        <p className="project__description">{description}</p>

        <ul className="project__tech">
          {project.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        {isLinked ? (
          <span className="project__action">
            {t.projects.viewProject}
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </>
  )

  return (
    <article
      ref={cardRef}
      className="project card"
      data-linked={isLinked || undefined}
      onPointerMove={handlePointerMove}
    >
      {isLinked ? (
        <a
          className="project__link"
          href={project.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
          <span className="visually-hidden">{t.a11y.openInNewTab}</span>
        </a>
      ) : (
        <div className="project__link">{content}</div>
      )}
    </article>
  )
}
