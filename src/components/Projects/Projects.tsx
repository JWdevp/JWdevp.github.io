import { useRef, useState } from 'react'
import { projects, type Project } from '../../data/projects'
import { useLanguage } from '../../hooks/useLanguage'
import { useReveal } from '../../hooks/useReveal'
import { ProjectCard } from './ProjectCard'
import { ProjectDialog } from './ProjectDialog'
import './projects.css'

export function Projects() {
  const { t } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root, { y: 28 })

  // The card's rect travels with the selection so the panel can grow out of the
  // exact card that was clicked.
  const [open, setOpen] = useState<{ project: Project; origin: DOMRect } | null>(
    null,
  )

  return (
    <div className="projects" ref={root}>
      <div className="container">
        <header className="section__head">
          <p className="eyebrow" data-reveal>
            {t.projects.eyebrow}
          </p>
          <h2 className="section__title" data-reveal>
            {t.projects.title}
          </h2>
        </header>

        <div className="projects__grid">
          {projects.map((project, index) => (
            <div key={project.id} data-reveal>
              <ProjectCard
                project={project}
                index={index}
                onOpen={(selected, origin) => setOpen({ project: selected, origin })}
              />
            </div>
          ))}
        </div>
      </div>

      {open ? (
        <ProjectDialog
          project={open.project}
          origin={open.origin}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  )
}
