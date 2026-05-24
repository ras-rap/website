import { IconExternalLink, IconFolder } from '@tabler/icons-react'
import { projectRows } from '../../desktopData'

export function ProjectsWindow({
  windowWidth,
}: {
  windowWidth: number
}) {
  const isGrid = windowWidth >= 420

  return (
    <ul className={`projects-list${isGrid ? ' is-grid' : ''}`}>
      {projectRows.map((project) => (
        <li key={project.name} className="project-row">
          <div className="project-row__top">
            <IconFolder size={16} stroke={1.8} />
            <div>
              <strong>{project.name}</strong>
              <div className="project-row__type">{project.type}</div>
            </div>
          </div>
          <p>{project.description}</p>
          <div className="project-row__tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {project.href ? (
            <a href={project.href} target="_blank" rel="noreferrer">
              Open link <IconExternalLink size={14} stroke={1.8} />
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
