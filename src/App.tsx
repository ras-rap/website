import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
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
  const BOOT_FLAG_KEY = 'ras-95-boot-complete'
  const discordUserId = (import.meta.env.VITE_DISCORD_USER_ID ?? '').trim()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [selectedIcon, setSelectedIcon] = useState<WindowId | null>('about')
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [recycleFiles, setRecycleFiles] = useState(recycleItems)
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [shutdownState, setShutdownState] = useState<'idle' | 'shutting-down' | 'complete'>('idle')
  const [bootPhase, setBootPhase] = useState<'booting' | 'login' | 'done'>(() => {
    try {
      return window.sessionStorage.getItem(BOOT_FLAG_KEY) === '1' ? 'done' : 'booting'
    } catch {
      return 'booting'
    }
  })
  const [closingWindows, setClosingWindows] = useState<WindowId[]>([])
  const [lanyardData, setLanyardData] = useState<LanyardData | null>(null)
  const [lanyardError, setLanyardError] = useState<string | null>(null)
  const [lanyardLoading, setLanyardLoading] = useState(Boolean(discordUserId))
  const [presencePanelOpen, setPresencePanelOpen] = useState(false)
  const [presenceNow, setPresenceNow] = useState(() => Date.now())
  const [clockNow, setClockNow] = useState(() => new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [secretBanner, setSecretBanner] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const closeTimersRef = useRef<Partial<Record<WindowId, number>>>({})
  const presenceSignatureRef = useRef<string | null>(null)
  const secretBannerTimerRef = useRef<number | null>(null)

  const playBootTone = useCallback((kind: 'boot' | 'login' | 'success') => {
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
    const frequencies: Record<'boot' | 'login' | 'success', number> = {
      boot: 280,
      login: 520,
      success: 760,
    }

    oscillator.type = 'triangle'
    oscillator.frequency.value = frequencies[kind]
    gainNode.gain.value = 0.0001

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    const now = audioContext.currentTime
    gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    oscillator.start(now)
    oscillator.stop(now + 0.2)
  }, [soundEnabled])

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

  useEffect(() => {
    if (bootPhase === 'done') {
      try {
        window.sessionStorage.setItem(BOOT_FLAG_KEY, '1')
      } catch {
        // Ignore storage failures and continue without persistence.
      }

      return
    }

    const loginDelay = bootPhase === 'booting' ? 1100 : 0
    const completeDelay = bootPhase === 'booting' ? 2300 : 1200

    const loginTimerId = window.setTimeout(() => {
      if (bootPhase === 'booting') {
        setBootPhase('login')
        playBootTone('login')
      }
    }, loginDelay)

    const doneTimerId = window.setTimeout(() => {
      setBootPhase('done')
      playBootTone('success')

      try {
        window.sessionStorage.setItem(BOOT_FLAG_KEY, '1')
      } catch {
        // Ignore storage failures and continue without persistence.
      }
    }, completeDelay)

    return () => {
      window.clearTimeout(loginTimerId)
      window.clearTimeout(doneTimerId)
    }
  }, [bootPhase, playBootTone])

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

  const showSecretBanner = (message: string) => {
    if (secretBannerTimerRef.current) {
      window.clearTimeout(secretBannerTimerRef.current)
    }

    setSecretBanner(message)
    playTone('alert')

    secretBannerTimerRef.current = window.setTimeout(() => {
      setSecretBanner(null)
      secretBannerTimerRef.current = null
    }, 2800)
  }

  const rebootSystem = () => {
    setShutdownState('shutting-down')
    playTone('shutdown')

    window.setTimeout(() => {
      try {
        window.sessionStorage.removeItem(BOOT_FLAG_KEY)
      } catch {
        // Ignore storage failures; the reboot still proceeds.
      }

      window.location.reload()
    }, 700)
  }

  const recoverFromShutdown = () => {
    rebootSystem()
  }

  const triggerShutdown = () => {
    setStartMenuOpen(false)
    rebootSystem()
  }

  const visibleTaskbarWindows = useMemo(
    () => windowConfigs.filter(({ id }) => state.windows[id].open),
    [state.windows],
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
      className={`desktop${isCompactLayout ? ' is-compact' : ''}${secretBanner ? ' has-secret' : ''}`}
      onClick={() => {
        setStartMenuOpen(false)
        setCalendarOpen(false)
        setPresencePanelOpen(false)
      }}
    >
      {bootPhase !== 'done' ? (
        <div className={`boot-screen boot-screen--${bootPhase}`} aria-label="Boot screen" aria-live="polite">
          <div className="boot-screen__window">
            <div className="boot-screen__title">Ras 95 {isCompactLayout ? 'Mobile' : 'Desktop'}</div>
            <div className="boot-screen__body">
              {bootPhase === 'booting' ? 'Starting system components...' : 'Logging in as ras...'}
            </div>
            <div className="boot-screen__progress" aria-hidden="true">
              <span />
            </div>
            <div className="boot-screen__footer">
              {bootPhase === 'booting'
                ? 'Initializing workspace'
                : `Loading ${isCompactLayout ? 'mobile' : 'desktop'} profile`}
            </div>
          </div>
        </div>
      ) : null}

      {shutdownState !== 'idle' ? (
        <button type="button" className="shutdown-overlay" onClick={recoverFromShutdown}>
          {shutdownState === 'shutting-down' ? (
            <>
              <div className="shutdown-overlay__title">Rebooting Ras OS...</div>
              <div className="shutdown-overlay__body">Please wait while the system restarts.</div>
            </>
          ) : (
            <>
              <div className="shutdown-overlay__title">It is now safe to close your browser tab.</div>
              <div className="shutdown-overlay__body">Click to return to the desktop.</div>
            </>
          )}
        </button>
      ) : null}

      {secretBanner ? (
        <div className="secret-banner" role="status" aria-live="polite">
          <span className="secret-banner__label">Secret</span>
          <span>{secretBanner}</span>
        </div>
      ) : null}

      <main className="desktop__surface" aria-label="Ras OS desktop">
        {isCompactLayout ? (
          <header className="mobile-status-bar" aria-label="Mobile status bar">
            <span className="mobile-status-bar__brand">Ras 95 Mobile</span>
            <span className="mobile-status-bar__clock">{clock}</span>
            <span className="mobile-status-bar__indicators" aria-hidden="true">
              <span>◔</span>
              <span>◷</span>
              <span>▮▮▮</span>
            </span>
          </header>
        ) : null}

        {isCompactLayout ? (
          <div className="desktop__notice" role="note" aria-label="Mobile notice">
            Ras 95 Mobile. Tap an app to open it.
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
                  <TerminalWindow
                    onLaunchApp={openWindow}
                    onOpenPresence={() => setPresencePanelOpen(true)}
                    onSecret={showSecretBanner}
                    onReboot={rebootSystem}
                    compact={isCompactLayout}
                  />
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
                {windowConfigs.map((config) => {
                  const Icon = icons[config.id]

                  return (
                    <button
                      key={config.id}
                      type="button"
                      className="start-menu__item"
                      role="menuitem"
                      onClick={() => openWindow(config.id)}
                    >
                      <Icon aria-hidden={true} size={16} stroke={1.9} />
                      <span>{config.title}</span>
                    </button>
                  )
                })}
                <a
                  className="start-menu__item"
                  role="menuitem"
                  href="https://krakenhosting.net"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setStartMenuOpen(false)}
                >
                  <span aria-hidden="true">◉</span>
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
                  <span aria-hidden="true">◎</span>
                  <span>GitHub</span>
                </a>
                <button type="button" className="start-menu__item is-danger" role="menuitem" onClick={triggerShutdown}>
                  <span aria-hidden="true">⏻</span>
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
                  compact={isTinyLayout}
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
          onClick={(event) => {
            event.stopPropagation()
            if (isCompactLayout) {
              setCalendarOpen((current) => !current)
            }
          }}
        >
          <div
            className="clock"
            aria-label="Clock"
            tabIndex={0}
            onFocus={() => setCalendarOpen(true)}
            onBlur={() => setCalendarOpen(false)}
          >
            {clock}
          </div>
          {calendarOpen ? <CalendarPopoverWidget now={clockNow} /> : null}
        </div>
      </footer>
    </div>
  )
}

export default App
