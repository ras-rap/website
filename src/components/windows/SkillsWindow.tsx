import { skillGroups, skillRows } from '../../desktopData'

export function SkillsWindow() {
  const lookup = new Map(skillRows.map((skill) => [skill.name, skill.value]))

  return (
    <div className="skills-window">
      <div className="skills-window__summary">
        <strong>System Capabilities</strong>
        <p>Practical experience shaped by production hosting, multiplayer operations, and hardware experiments.</p>
      </div>
      <div className="skills-grid">
        {skillGroups.map((group) => (
          <section key={group.title} className="skill-group">
            <h3>{group.title}</h3>
            {group.items.map((item) => {
              const value = lookup.get(item) ?? 64

              return (
                <div key={item} className="skill-bar-wrap">
                  <span className="skill-name">{item}</span>
                  <div className="skill-bar">
                    <div className="skill-fill" style={{ width: `${value}%` }} />
                  </div>
                </div>
              )
            })}
          </section>
        ))}
      </div>
      <div className="skills-terminal">
        <span>&gt; uptime --profile</span>
        <span>Personally debatable, commercially stable</span>
      </div>
    </div>
  )
}
