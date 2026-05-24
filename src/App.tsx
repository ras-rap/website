import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import './App.css'
import {
  type LanyardData,
  type LanyardResponse,
  type WindowId,
  icons,
  initialState,
  reducer,
  recycleItems,
  windowConfigs,
} from './desktopData'
import { formatClock } from './desktopUtils'
import { AboutWindow } from './components/windows/AboutWindow'
import { CalculatorWindow } from './components/windows/CalculatorWindow'
import { ContactWindow } from './components/windows/ContactWindow'
import { GamesWindow } from './components/windows/GamesWindow'
import { ProjectsWindow } from './components/windows/ProjectsWindow'
import { RecycleWindow } from './components/windows/RecycleWindow'
import { SkillsWindow } from './components/windows/SkillsWindow'
import { TerminalWindow } from './components/windows/TerminalWindow'
import { DesktopIconButton } from './components/ui/DesktopIconButton'
import { TaskbarWindowButton } from './components/ui/TaskbarWindowButton'
import { WindowShell } from './components/ui/WindowShell'
import { TaskbarPresence } from './components/widgets/TaskbarPresence'
import { CalendarPopover as CalendarPopoverWidget } from './components/widgets/CalendarPopover'

function App() {
  const discordUserId = (import.meta.env.VITE_DISCORD_USER_ID ?? '').trim()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [selectedIcon, setSelectedIcon] = useState<WindowId | null>('about')
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [recycleFiles, setRecycleFiles] = useState(recycleItems)
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [shutdownState, setShutdownState] = useState<'idle' | 'shutting-down' | 'complete'>('idle')
  const [closingWindows, setClosingWindows] = useState<WindowId[]>([])
  const [lanyardData, setLanyardData] = useState<LanyardData | null>(null)
  const [lanyardError, setLanyardError] = useState<string | null>(null)
  const [lanyardLoading, setLanyardLoading] = useState(Boolean(discordUserId))
  const [presencePanelOpen, setPresencePanelOpen] = useState(false)
  const [presenceNow, setPresenceNow] = useState(() => Date.now())
  const [clockNow, setClockNow] = useState(() => new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const closeTimersRef = useRef<Partial<Record<WindowId, number>>>({})
  const presenceSignatureRef = useRef<string | null>(null)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextDate = new Date()
      setClockNow(nextDate)
      setClock(formatClock(nextDate))
    }, 60_000)

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isCompactLayout = viewportWidth < 768
  const isTinyLayout = viewportWidth < 480

  const playTone = (kind: 'open' | 'close' | 'alert' | 'shutdown') => {
    if (!soundEnabled || typeof window.AudioContext === 'undefined') {
      return
    }

    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextConstructor) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const frequencies: Record<'open' | 'close' | 'alert' | 'shutdown', number> = {
      open: 740,
      close: 490,
      alert: 920,
      shutdown: 220,
    }

    oscillator.type = kind === 'shutdown' ? 'sawtooth' : 'square'
    oscillator.frequency.value = frequencies[kind]
    gainNode.gain.value = 0.0001

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    const now = audioContext.currentTime
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.01)

    if (kind === 'open') {
      oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.08)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
      oscillator.start(now)
      oscillator.stop(now + 0.17)
      return
    }

    if (kind === 'close') {
      oscillator.frequency.exponentialRampToValueAtTime(320, now + 0.06)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
      oscillator.start(now)
      oscillator.stop(now + 0.13)
      return
    }

    if (kind === 'alert') {
      oscillator.frequency.exponentialRampToValueAtTime(1080, now + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)
      oscillator.start(now)
      oscillator.stop(now + 0.12)
      return
    }

    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    oscillator.start(now)
    oscillator.stop(now + 0.24)
  }

  const finishClose = (id: WindowId) => {
    setClosingWindows((current) => current.filter((windowId) => windowId !== id))
    dispatch({ type: 'close', id })
  }

  const openWindow = (id: WindowId) => {
    const existingTimer = closeTimersRef.current[id]

    if (existingTimer) {
      window.clearTimeout(existingTimer)
      delete closeTimersRef.current[id]
    }

    setClosingWindows((current) => current.filter((windowId) => windowId !== id))
    dispatch({ type: state.windows[id].open ? 'focus' : 'open', id })
    setStartMenuOpen(false)
    playTone('open')
  }

  const toggleTaskbarWindow = (id: WindowId) => {
    const windowState = state.windows[id]

    if (windowState.minimized) {
      dispatch({ type: 'restore', id })
      return
    }

    dispatch({ type: 'focus', id })
  }

  const closeWindow = (id: WindowId) => {
    if (closingWindows.includes(id)) {
      return
    }

    setClosingWindows((current) => [...current, id])
    playTone('close')

    closeTimersRef.current[id] = window.setTimeout(() => {
      finishClose(id)
      delete closeTimersRef.current[id]
    }, 120)
  }

  const emptyRecycleBin = () => {
    setRecycleFiles([])
    dispatch({ type: 'focus', id: 'recycle' })
    playTone('alert')
  }

  const triggerShutdown = () => {
    setStartMenuOpen(false)
    setShutdownState('shutting-down')
    playTone('shutdown')

    window.setTimeout(() => {
      setShutdownState('complete')
    }, 800)
  }

  const recoverFromShutdown = () => {
    setShutdownState('idle')
    playTone('open')
  }

  const visibleTaskbarWindows = useMemo(
    () => windowConfigs.filter(({ id }) => state.windows[id].open),
    [state.windows],
  )

  useEffect(
    () => () => {
      Object.values(closeTimersRef.current).forEach((timerId) => {
        if (timerId) {
          window.clearTimeout(timerId)
        }
      })
    },
    [],
  )

  useEffect(() => {
    if (!discordUserId) {
      return
    }

    let isMounted = true
    let timerId: number | null = null

    const fetchPresence = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`)
        const payload = (await response.json()) as LanyardResponse

        if (!response.ok || !payload.success) {
          throw new Error('Could not fetch Discord status.')
        }

        if (!isMounted) {
          return
        }

        setLanyardData(payload.data)
        setLanyardError(null)

        const nextSignature = payload.data.spotify
          ? `${payload.data.listening_to_spotify}:${payload.data.spotify.song}:${payload.data.spotify.timestamps.start}:${payload.data.spotify.timestamps.end}`
          : `${payload.data.listening_to_spotify}:none`

        if (presenceSignatureRef.current && presenceSignatureRef.current !== nextSignature) {
          window.setTimeout(() => {
            if (isMounted) {
              void fetchPresence()
            }
          }, 1500)
        }

        presenceSignatureRef.current = nextSignature
      } catch {
        if (!isMounted) {
          return
        }

        setLanyardError('Lanyard is currently unreachable.')
      } finally {
        if (isMounted) {
          setLanyardLoading(false)
        }
      }
    }

    void fetchPresence()

    timerId = window.setInterval(() => {
      void fetchPresence()
    }, 10_000)

    return () => {
      isMounted = false
      if (timerId) {
        window.clearInterval(timerId)
      }
    }
  }, [discordUserId])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setPresenceNow(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [])

  useEffect(() => {
    if (!startMenuOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setStartMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [startMenuOpen])

  useEffect(() => {
    if (!presencePanelOpen || !discordUserId) {
      return
    }

    void (async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`)
        const payload = (await response.json()) as LanyardResponse

        if (response.ok && payload.success) {
          setLanyardData(payload.data)
          setLanyardError(null)
        }
      } catch {
        setLanyardError('Lanyard is currently unreachable.')
      }
    })()
  }, [presencePanelOpen, discordUserId])

  return (
    <div
      className="desktop"
      onClick={() => {
        setStartMenuOpen(false)
        setCalendarOpen(false)
        setPresencePanelOpen(false)
      }}
    >
      {shutdownState !== 'idle' ? (
        <button type="button" className="shutdown-overlay" onClick={recoverFromShutdown}>
          {shutdownState === 'shutting-down' ? (
            <>
              <div className="shutdown-overlay__title">Shutting down Ras OS...</div>
              <div className="shutdown-overlay__body">Please wait while the system powers down.</div>
            </>
          ) : (
            <>
              <div className="shutdown-overlay__title">It is now safe to close your browser tab.</div>
              <div className="shutdown-overlay__body">Click to return to the desktop.</div>
            </>
          )}
        </button>
      ) : null}

      <main className="desktop__surface" aria-label="Ras OS desktop">
        {isCompactLayout ? (
          <div className="desktop__notice" role="note" aria-label="Mobile notice">
            Best viewed on desktop. Tap an icon to open a window.
          </div>
        ) : null}

        <div className="desktop__icons" aria-label="Desktop icons">
          {windowConfigs.map((config) => (
            <DesktopIconButton
              key={config.id}
              title={config.title}
              icon={icons[config.id]}
              selected={selectedIcon === config.id}
              compact={isCompactLayout}
              onSelect={() => {
                if (isCompactLayout) {
                  openWindow(config.id)
                  return
                }

                setSelectedIcon(config.id)
              }}
              onOpen={() => openWindow(config.id)}
            />
          ))}
        </div>

        {windowConfigs.map((config) => {
          const windowState = state.windows[config.id]

          if ((!windowState.open && !closingWindows.includes(config.id)) || windowState.minimized) {
            return null
          }

          return (
            <Rnd
              key={config.id}
              className={`window${isCompactLayout ? ' is-compact' : ''}${closingWindows.includes(config.id) ? ' is-closing' : ''}`}
              size={{ width: windowState.width, height: windowState.height }}
              position={{ x: windowState.x, y: windowState.y }}
              minWidth={220}
              minHeight={180}
              bounds="parent"
              enableDragging={!isCompactLayout}
              enableResizing={!isCompactLayout}
              dragHandleClassName="window__titlebar"
              cancel=".window__controls, .window__controls *"
              disableDragging={closingWindows.includes(config.id)}
              enableUserSelectHack={false}
              onDragStart={() => dispatch({ type: 'focus', id: config.id })}
              onDragStop={(_event, data) => {
                dispatch({ type: 'move', id: config.id, x: data.x, y: data.y })
              }}
              onResizeStart={() => dispatch({ type: 'focus', id: config.id })}
              onResize={(_event, _direction, ref, _delta, position) => {
                dispatch({
                  type: 'resize',
                  id: config.id,
                  x: position.x,
                  y: position.y,
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                })
              }}
              onResizeStop={(_event, _direction, ref, _delta, position) => {
                dispatch({
                  type: 'resize',
                  id: config.id,
                  x: position.x,
                  y: position.y,
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                })
              }}
              style={{ zIndex: windowState.z }}
            >
              <WindowShell
                title={config.title}
                showMenuBar={config.id !== 'skills'}
                showViewMenu={config.id === 'about'}
                onMinimize={() => dispatch({ type: 'minimize', id: config.id })}
                onClose={() => closeWindow(config.id)}
              >
                {config.id === 'about' ? (
                  <AboutWindow lanyardData={lanyardData} lanyardConfigured={Boolean(discordUserId)} />
                ) : config.id === 'projects' ? (
                  <ProjectsWindow windowWidth={windowState.width} />
                ) : config.id === 'games' ? (
                  <GamesWindow />
                ) : config.id === 'skills' ? (
                  <SkillsWindow />
                ) : config.id === 'contact' ? (
                  <ContactWindow />
                ) : config.id === 'terminal' ? (
                  <TerminalWindow onLaunchApp={openWindow} onOpenPresence={() => setPresencePanelOpen(true)} />
                ) : config.id === 'calculator' ? (
                  <CalculatorWindow />
                ) : (
                  <RecycleWindow items={recycleFiles} onEmpty={emptyRecycleBin} />
                )}
              </WindowShell>
            </Rnd>
          )
        })}

        {startMenuOpen ? (
          <div className="start-menu-anchor">
            <div className="start-menu" role="menu" aria-label="Start menu">
              <div className="start-menu__sidebar">Ras OS v0.3</div>
              <div className="start-menu__items">
                {windowConfigs.map((config) => (
                  <button
                    key={config.id}
                    type="button"
                    className="start-menu__item"
                    role="menuitem"
                    onClick={() => openWindow(config.id)}
                  >
                    <span aria-hidden="true">{icons[config.id]}</span>
                    <span>{config.title}</span>
                  </button>
                ))}
                <a
                  className="start-menu__item"
                  role="menuitem"
                  href="https://krakenhosting.net"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setStartMenuOpen(false)}
                >
                  <span aria-hidden="true">🌐</span>
                  <span>krakenhosting.net</span>
                </a>
                <a
                  className="start-menu__item"
                  role="menuitem"
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setStartMenuOpen(false)}
                >
                  <span aria-hidden="true">💻</span>
                  <span>GitHub</span>
                </a>
                <button type="button" className="start-menu__item is-danger" role="menuitem" onClick={triggerShutdown}>
                  <span aria-hidden="true">🔌</span>
                  <span>Shut Down...</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className={`taskbar${isCompactLayout ? ' is-compact' : ''}`} aria-label="Taskbar">
        <button
          type="button"
          className="start-btn"
          onClick={(event) => {
            event.stopPropagation()
            setStartMenuOpen((current) => !current)
          }}
        >
          ⊞ Start
        </button>
        <div className="taskbar-divider" aria-hidden="true" />
        <div className={`taskbar__windows${isTinyLayout ? ' is-tiny' : ''}`} aria-label="Open windows">
          {visibleTaskbarWindows.length > 0 ? (
            visibleTaskbarWindows.map((config) => {
              const windowState = state.windows[config.id]

              return (
                <TaskbarWindowButton
                  key={config.id}
                  icon={icons[config.id]}
                  title={config.title}
                  active={!windowState.minimized}
                  onClick={() => toggleTaskbarWindow(config.id)}
                />
              )
            })
          ) : (
            <span className="taskbar__empty">No open apps</span>
          )}
        </div>
        <TaskbarPresence
          configured={Boolean(discordUserId)}
          loading={lanyardLoading}
          error={lanyardError}
          lanyardData={lanyardData}
          now={presenceNow}
          open={presencePanelOpen}
          setOpen={setPresencePanelOpen}
          onRefresh={() => {
            if (!discordUserId) {
              return
            }

            void (async () => {
              try {
                const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`)
                const payload = (await response.json()) as LanyardResponse

                if (response.ok && payload.success) {
                  setLanyardData(payload.data)
                  setLanyardError(null)
                }
              } catch {
                setLanyardError('Lanyard is currently unreachable.')
              }
            })()
          }}
        />
        <button
          type="button"
          className={`taskbar__speaker${soundEnabled ? ' is-on' : ''}`}
          aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
          onClick={(event) => {
            event.stopPropagation()
            setSoundEnabled((current) => !current)
            if (!soundEnabled) {
              playTone('alert')
            }
          }}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <div
          className="clock-wrap"
          onMouseEnter={() => setCalendarOpen(true)}
          onMouseLeave={() => setCalendarOpen(false)}
        >
          <div className="clock" aria-label="Clock" tabIndex={0} onFocus={() => setCalendarOpen(true)} onBlur={() => setCalendarOpen(false)}>
            {clock}
          </div>
          {calendarOpen ? <CalendarPopoverWidget now={clockNow} /> : null}
        </div>
      </footer>
    </div>
  )
}

export default App
