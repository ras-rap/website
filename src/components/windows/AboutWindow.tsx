import { IconBrandDiscord, IconBrandGithub } from '@tabler/icons-react'
import { type LanyardData, profileFacts } from '../../desktopData'
import { formatDiscordStatus } from '../../desktopUtils'

export function AboutWindow({
  lanyardData,
  lanyardConfigured,
}: {
  lanyardData: LanyardData | null
  lanyardConfigured: boolean
}) {
  const customStatus = lanyardData?.activities.find((activity) => activity.type === 4)
  const customStatusText = customStatus?.state?.trim() || customStatus?.name?.trim()

  return (
    <div className="about-content">
      <div className="about-hero">
        <div className="about-hero__copy">
          <p className="about-kicker">Profile</p>
          <div className="name">Ras</div>
          <p className="about-subtitle">
            Just a trans girl with too many hobbies and not enough time. I build random stuff that normally has no purpose outside of its niche.
          </p>
        </div>
        <div className="about-badge">
          <span className="about-badge__label">Ras OS 1.0</span>
          <span className="about-badge__value">Online</span>
        </div>
      </div>

      <div className="about-panels">
        <section className="about-panel">
          <h3>What I work on</h3>
          <p>
            Minecraft plugins, Random websites, Hardware design, Game servers, and miscellaneous tools. If I want something to exist, I build it.
          </p>
        </section>

        <section className="about-panel">
          <h3>Quick facts</h3>
          <div className="about-facts">
            {profileFacts.map((fact) => (
              <div key={fact.key} className="about-fact-row">
                <span>{fact.key}</span>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="about-current">
        <strong>Status:</strong>{' '}
        {lanyardConfigured
          ? customStatusText ?? (lanyardData ? `Discord is ${formatDiscordStatus(lanyardData.discord_status)}.` : 'Checking Discord status...')
          : 'Set VITE_DISCORD_USER_ID to enable live Discord activity.'}
      </div>

      <hr className="inset-rule" />
      <p className="accent-line">Open to collabs on anything and everything.</p>
      <div className="window__links">
        <a href="https://discordapp.com/users/867970591267881000" target="_blank" rel="noreferrer">
          <IconBrandDiscord size={16} stroke={1.8} />
          Discord
        </a>
        <a href="https://github.com/ras-rap" target="_blank" rel="noreferrer">
          <IconBrandGithub size={16} stroke={1.8} />
          GitHub
        </a>
      </div>
    </div>
  )
}
