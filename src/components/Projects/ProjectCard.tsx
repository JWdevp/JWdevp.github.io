import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import type { Project } from '../../data/projects'
import { useLanguage } from '../../hooks/useLanguage'
import { prefersReducedMotionNow } from '../../hooks/usePrefersReducedMotion'

interface Props {
  project: Project
  index: number
  onOpen: (project: Project, origin: DOMRect) => void
}

export function ProjectCard({ project, index, onOpen }: Props) {
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

  const title = project.title[language]
  const description = project.description[language]

  const content = (
    <>
      <span className="project__cover" data-index={index}>
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
      </span>

      {/* Phrasing content throughout: this subtree lives inside a <button>,
          which cannot legally contain headings, paragraphs or lists. */}
      <span className="project__body">
        <span className="project__title">{title}</span>
        <span className="project__description">{description}</span>

        <span className="project__tech">
          {project.technologies.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </span>

        <span className="project__action">
          {t.projects.openDetail}
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
        </span>
      </span>
    </>
  )

  return (
    <article
      ref={cardRef}
      className="project card"
      onPointerMove={handlePointerMove}
    >
      {/* The whole card is the control. Opening happens in place, so this is a
          button rather than a link — there is no other page to go to. */}
      <button
        type="button"
        className="project__link"
        onClick={() => {
          const rect = cardRef.current?.getBoundingClientRect()
          if (rect) onOpen(project, rect)
        }}
      >
        {content}
      </button>
    </article>
  )
}
