import { useState } from 'react'
import type { WindowId } from '../../desktopData'

export function TerminalWindow({
  onLaunchApp,
  onOpenPresence,
}: {
  onLaunchApp: (id: WindowId) => void
  onOpenPresence: () => void
}) {
  const [lines, setLines] = useState<string[]>([
    'RasOS Terminal v0.1',
    'Type "help" for available commands.',
  ])
  const [input, setInput] = useState('')

  const pushLine = (value: string) => {
    setLines((current) => [...current.slice(-30), value])
  }

  const runCommand = (raw: string) => {
    const command = raw.trim().toLowerCase()

    if (!command) {
      return
    }

    pushLine(`ras@desktop:$ ${raw}`)

    if (command === 'help') {
      pushLine('Commands: help, about, projects, games, skills, contact, calc, presence, date, clear')
      return
    }

    if (command === 'clear') {
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

    if (command === 'games') {
      onLaunchApp('games')
      pushLine('Opened Games folder.')
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
