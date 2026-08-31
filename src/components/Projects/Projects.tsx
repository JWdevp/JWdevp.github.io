import { useRef } from 'react'
import { projects } from '../../data/projects'
import { useLanguage } from '../../hooks/useLanguage'
import { useReveal } from '../../hooks/useReveal'
import { ProjectCard } from './ProjectCard'
import './projects.css'

export function Projects() {
  const { t } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root, { y: 28 })

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
              <ProjectCard project={project} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
