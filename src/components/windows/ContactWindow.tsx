import { IconBrandDiscord, IconBrandGithub, IconBrandSteam, IconExternalLink } from '@tabler/icons-react'

export function ContactWindow() {
  return (
    <div className="contact-window">
      <p className="contact-window__body">Contact hub</p>
      <h3>Find me where I actually respond</h3>
      <p className="contact-window__body">
        Discord is the fastest way to reach me. GitHub is where the projects live. If I’m active anywhere else, it will usually be linked from here.
      </p>
      <div className="contact-window__links">
        <a href="https://discordapp.com/users/867970591267881000" target="_blank" rel="noreferrer">
          <IconBrandDiscord size={16} stroke={1.8} />
          Discord
          <IconExternalLink size={14} stroke={1.8} />
        </a>
        <a href="https://github.com/ras-rap" target="_blank" rel="noreferrer">
          <IconBrandGithub size={16} stroke={1.8} />
          GitHub
          <IconExternalLink size={14} stroke={1.8} />
        </a>
        <a href="https://steamcommunity.com/id/Ras_rap/" target="_blank" rel="noreferrer">
          <IconBrandSteam size={14} stroke={1.8} />
          Steam
          <IconExternalLink size={14} stroke={1.8} />
        </a>
      </div>
    </div>
  )
}
