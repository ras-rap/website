import { useState } from 'react'
import type { WindowId } from '../../desktopData'

export function TerminalWindow({
  onLaunchApp,
  onOpenPresence,
  onSecret,
  onReboot,
  compact,
}: {
  onLaunchApp: (id: WindowId) => void
  onOpenPresence: () => void
  onSecret: (message: string) => void
  onReboot: () => void
  compact: boolean
}) {
  const [lines, setLines] = useState<string[]>([
    'RasOS Terminal v0.1',
    'Type "help" for available commands.',
  ])
  const [input, setInput] = useState('')
  const easterEggs = [
    'whoami - prints the local user.',
    'win95 - activates the secret mode banner.',
    'xyzzy - classic parser easter egg.',
    'idkfa - opens Games and triggers a secret banner.',
    'make it so - acknowledges the console.',
    'clippy - whispers a retro assistant line.',
    'pinball - whispers about the hidden cabinet.',
    'neofetch - prints a fake system summary.',
    'reboot / restart - replays the boot/login screen.',
    'cls - clears the terminal.',
  ]

  const pushLine = (value: string) => {
    setLines((current) => [...current.slice(-30), value])
  }

  const runCommand = (raw: string) => {
    const command = raw.trim().toLowerCase()
    const normalized = command.replace(/\s+/g, ' ')

    if (!normalized) {
      return
    }

    pushLine(`ras@desktop:$ ${raw}`)

    if (command === 'help') {
      pushLine('Commands: help, about, projects, skills, contact, calc, presence, date, clear, reboot')
      pushLine('Hint: there are a few hidden commands too.')
      return
    }

    if (command === 'clear') {
      setLines([])
      return
    }

    if (normalized === 'cls') {
      setLines([])
      return
    }

    if (command === 'date') {
      pushLine(new Date().toString())
      return
    }

    if (command === 'about') {
      onLaunchApp('about')
      pushLine('Opened About Me window.')
      return
    }

    if (command === 'projects') {
      onLaunchApp('projects')
      pushLine('Opened Projects window.')
      return
    }

    if (command === 'skills') {
      onLaunchApp('skills')
      pushLine('Opened Skills.exe window.')
      return
    }

    if (command === 'contact') {
      onLaunchApp('contact')
      pushLine('Opened Contact window.')
      return
    }

    if (command === 'calc') {
      onLaunchApp('calculator')
      pushLine('Opened Calculator.')
      return
    }

    if (command === 'presence') {
      onOpenPresence()
      pushLine('Opened Discord status panel.')
      return
    }

    if (normalized === 'eggs' || normalized === 'secrets' || normalized === 'eastereggs') {
      pushLine('Easter eggs:')
      easterEggs.forEach((egg) => pushLine(`- ${egg}`))
      return
    }

    if (normalized === 'reboot' || normalized === 'restart') {
      pushLine('Rebooting Ras OS...')
      onReboot()
      return
    }

    if (normalized === 'neofetch') {
      pushLine('                         .@@@%: ..+@@@:                      ')
      pushLine('                      .@#              .@@.                  ')
      pushLine('                    #@                   .@@.                ')
      pushLine('                  .@.                      .@.               ')
      pushLine('              .%@@..                         @@              ')
      pushLine('          .@@.              .+@@@@@@@.       .@.             ')
      pushLine('         @@               .@@@@@@@@.@@@@.     .@.            ')
      pushLine('       .@.               @@@@@@@@@@. ..@@.     @.            ')
      pushLine('      .@.               @@@@@@@@@@@@@@  @@.     @.           ')
      pushLine('      @                .@@@@@@@@@@@@@@@.@@@      .@.         ')
      pushLine('      @                .@@@@@@@@@@@@@@@@@@@        .@        ')
      pushLine('      @                 @@@@@@@@@@@@@@@@@@:          @.      ')
      pushLine('      @                  @@@@@@@@@@@@@@@@@           .@      ')
      pushLine('      @:                 .@@@@@@@@@@@@@@#.           .@.     ')
      pushLine('      .@.                  .@@@@@@@@@@*              .@.     ')
      pushLine('       .@*                     ....                  .@.     ')
      pushLine('         .@-                                         -@      ')
      pushLine('            @@@.....                                .@       ')
      pushLine('                ...@@                             .@#        ')
      pushLine('                    @*                          .@@.         ')
      pushLine('                     %@.              ..@@@@@@@.             ')
      pushLine('                      .@@           .@@.                     ')
      pushLine('                         .@@@-..:@@@..                       ')
      pushLine(`RasOS ${compact ? 'Mobile' : 'Desktop'} v0.3.1`)
      pushLine(`Host: virtual ${compact ? 'handheld' : 'desktop'} workstation`)
      pushLine('Shell: VT323 / RasOS Terminal')
      pushLine('WM: fake-resizable windows')
      pushLine(`Theme: Windows 95-ish, but on a ${compact ? 'phone' : 'desktop'}`)
      return
    }

    if (normalized === 'whoami') {
      pushLine('ras')
      return
    }

    if (normalized === 'win95') {
      onSecret('RAS 95 SECRET MODE ACTIVATED')
      pushLine('Launching secret mode...')
      return
    }

    if (normalized === 'xyzzy') {
      onSecret('A hollow voice says: plugh.')
      pushLine('A hollow voice says: "plugh".')
      return
    }

    if (normalized === 'idkfa') {
      onLaunchApp('games')
      onSecret('All the keys are yours now.')
      pushLine('Cheat code accepted. Opening Games...')
      return
    }

    if (normalized === 'make it so') {
      onSecret('The console obeys.')
      pushLine('The console obeys.')
      return
    }

    if (normalized === 'clippy') {
      onSecret('It looks like you are trying to have fun.')
      pushLine('It looks like you are trying to have fun.')
      return
    }

    if (normalized === 'pinball') {
      onSecret('Launching the secret pinball cabinet.')
      pushLine('The hidden cabinet hums somewhere off-screen.')
      return
    }

    pushLine(`Command not found: ${raw}`)
  }

  return (
    <div className="terminal-window">
      <div className="terminal-window__output" aria-live="polite">
        {lines.map((line, index) => (
          <div key={`${line}-${index}`}>{line}</div>
        ))}
      </div>
      <form
        className="terminal-window__input-row"
        onSubmit={(event) => {
          event.preventDefault()
          runCommand(input)
          setInput('')
        }}
      >
        <span>ras@desktop:$</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Terminal input"
          autoComplete="off"
        />
      </form>
    </div>
  )
}
