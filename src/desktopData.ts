import {
  IconCalculator,
  IconDeviceDesktop,
  IconDeviceGamepad2,
  IconFolder,
  IconMail,
  IconSettings,
  IconTerminal2,
  IconTrash,
} from '@tabler/icons-react'

import type { ComponentType } from 'react'

export type WindowId =
  | 'about'
  | 'projects'
  | 'games'
  | 'skills'
  | 'contact'
  | 'terminal'
  | 'calculator'
  | 'recycle'

export type WindowState = {
  open: boolean
  minimized: boolean
  z: number
  x: number
  y: number
  width: number
  height: number
}

export type DesktopState = {
  windows: Record<WindowId, WindowState>
  topZ: number
}

export type WindowConfig = {
  id: WindowId
  title: string
  defaultWidth: number
  defaultHeight: number
  defaultX: number
  defaultY: number
}

export type AppIconComponent = ComponentType<{
  size?: number
  stroke?: number
  className?: string
  'aria-hidden'?: boolean
}>

export type Action =
  | { type: 'open'; id: WindowId }
  | { type: 'close'; id: WindowId }
  | { type: 'minimize'; id: WindowId }
  | { type: 'restore'; id: WindowId }
  | { type: 'focus'; id: WindowId }
  | { type: 'move'; id: WindowId; x: number; y: number }
  | { type: 'resize'; id: WindowId; x: number; y: number; width: number; height: number }

export type LanyardActivity = {
  name: string
  type: number
  state?: string
  details?: string
}

export type LanyardSpotify = {
  song: string
  artist: string
  album_art_url: string
  timestamps: {
    start: number
    end: number
  }
}

export type LanyardData = {
  discord_status: 'online' | 'idle' | 'dnd' | 'offline'
  listening_to_spotify: boolean
  spotify?: LanyardSpotify
  activities: LanyardActivity[]
}

export type LanyardResponse = {
  success: boolean
  data: LanyardData
}

export const windowConfigs: WindowConfig[] = [
  { id: 'about', title: 'About Me', defaultWidth: 700, defaultHeight: 550, defaultX: 80, defaultY: 40 },
  { id: 'projects', title: 'Projects', defaultWidth: 350, defaultHeight: 450, defaultX: 160, defaultY: 60 },
  { id: 'games', title: 'Games', defaultWidth: 560, defaultHeight: 360, defaultX: 190, defaultY: 80 },
  { id: 'skills', title: 'Skills.exe', defaultWidth: 500, defaultHeight: 620, defaultX: 110, defaultY: 80 },
  { id: 'contact', title: 'Contact', defaultWidth: 340, defaultHeight: 260, defaultX: 130, defaultY: 100 },
  { id: 'terminal', title: 'Terminal', defaultWidth: 700, defaultHeight: 700, defaultX: 210, defaultY: 65 },
  { id: 'calculator', title: 'Calculator', defaultWidth: 320, defaultHeight: 360, defaultX: 250, defaultY: 120 },
  { id: 'recycle', title: 'Recycle Bin', defaultWidth: 315, defaultHeight: 275, defaultX: 150, defaultY: 120 },
]

export const windowDefaults = Object.fromEntries(
  windowConfigs.map(({ id, defaultWidth, defaultHeight, defaultX, defaultY }) => [id, { defaultWidth, defaultHeight, defaultX, defaultY }]),
) as Record<WindowId, { defaultWidth: number; defaultHeight: number; defaultX: number; defaultY: number }>

export const icons: Record<WindowId, AppIconComponent> = {
  about: IconDeviceDesktop,
  projects: IconFolder,
  games: IconDeviceGamepad2,
  skills: IconSettings,
  contact: IconMail,
  terminal: IconTerminal2,
  calculator: IconCalculator,
  recycle: IconTrash,
}

export const projectRows = [
  {
    name: 'Kraken Hosting',
    type: 'Platform',
    description: 'Game hosting and infrastructure with a focus on stability and low-friction management.',
    tags: ['Hosting', 'Networking', 'Gaming', 'Ops'],
    href: 'https://krakenhosting.net',
  },
  {
    name: 'GIrDAd',
    type: 'Hardware Project',
    description: 'A modern port/dongle for IrDA SIR communication, with a usb c port.',
    tags: ['Hardware', 'Electronics', 'Embedded', 'KiCad'],
    href: 'https://github.com/ras-rap/girdad',
  },
  {
    name: 'SNAB',
    type: 'Hardware Project',
    description: 'A portable device for injecting RCM payloads into the switch, along with a stand, and bluetooth controller to usb adapter.',
    tags: ['Hardware', 'Electronics', 'Embedded', 'KiCad'],
    href: 'https://github.com/ras-rap/SNAB',
  },
  {
    name: 'DMS',
    type: 'Web Application',
    description: 'A website for managing D&D campaigns, with virtual dice, character sheets, and more.',
    tags: ['NextJS', 'React', 'TS'],
    href: 'https://github.com/ras-rap/dm-screen',
  },
  {
    name: 'MCT',
    type: 'Web Application and API',
    description: 'A website for tracking the uptime and player counts of Minecraft servers, along with an API for accessing that data.',
    tags: ['Python', 'TS', 'React', 'FastAPI'],
    href: 'https://github.com/ras-rap/MCT',
  },
  {
    name: 'This Website',
    type: 'Web Application',
    description: 'A portfolio website designed to look like a vintage operating system, built with React and TypeScript.',
    tags: ['React', 'TS', 'Vite'],
    href: 'https://github.com/ras-rap/website',
  }
]

export const skillRows = [
  { name: 'TypeScript', value: 92 },
  { name: 'Python', value: 85 },
  { name: 'Java', value: 75 },
  { name: 'C#', value: 60 },
  { name: 'PHP', value: 30 },
  { name: 'React', value: 90 },
  { name: 'Bun', value: 95 },
  { name: 'FastAPI', value: 70 },
  { name: 'Express', value: 65 },
  { name: 'Git', value: 70 },
  { name: 'Docker', value: 75 },
  { name: 'Pterodactyl', value: 90 },
  { name: 'Linux', value: 95 },
  { name: 'Networking', value: 80 },
  { name: 'Security', value: 70 },
  { name: 'KiCad', value: 80 },
  { name: '3D Modeling', value: 60 },
  { name: 'PCB Design', value: 70 },
  { name: 'Soldering', value: 80 },
]

export const skillGroups = [
  {
    title: 'Programming Languages',
    items: ['TypeScript', 'Python', 'Java', 'C#', 'PHP'],
  },
  {
    title: 'Frameworks and Libraries',
    items: ['React', 'Bun', 'FastAPI', 'Express'],
  },
  {
    title: 'Tools and Platforms',
    items: ['Git', 'Docker', 'Pterodactyl'],
  },
  {
    title: 'Systems and Administration',
    items: ['Linux', 'Networking', 'Security'],
  },
  { 
    title: 'Hardware and Design',
    items: ['KiCad', '3D Modeling', 'PCB Design', 'Soldering']
  },

]

export const recycleItems = [
  '"Homework"',
  'startup_pitch_v14.pptx',
  'name_accronym_generator.zip',
  'sleep_schedule.csv',
  '1099-NEC.docx',
  'that_one_time_i_said_something_cringey.mp4',
  'new_years_resolution.txt',
]

export const profileFacts = [
  { key: 'Role', value: 'Developer of all things' },
  { key: 'Focus', value: 'Hardware design and web development' },
  { key: 'Stack', value: 'All of it' },
  { key: 'Working Style', value: 'Build it, test it, (maybe) simplify it' },
]

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const initialState: DesktopState = {
  topZ: 2,
  windows: {
    about: { open: false, minimized: false, z: 1, x: 80, y: 40, width: 340, height: 320 },
    projects: { open: false, minimized: false, z: 1, x: 160, y: 60, width: 420, height: 360 },
    games: { open: false, minimized: false, z: 1, x: 190, y: 80, width: 560, height: 360 },
    skills: { open: false, minimized: false, z: 1, x: 110, y: 80, width: 360, height: 320 },
    contact: { open: false, minimized: false, z: 1, x: 130, y: 100, width: 320, height: 260 },
    terminal: { open: false, minimized: false, z: 1, x: 210, y: 65, width: 560, height: 360 },
    calculator: { open: false, minimized: false, z: 1, x: 250, y: 120, width: 320, height: 360 },
    recycle: { open: false, minimized: false, z: 1, x: 150, y: 120, width: 300, height: 240 },
  },
}

export function reducer(state: DesktopState, action: Action): DesktopState {
  switch (action.type) {
    case 'open': {
      const nextZ = state.topZ + 1
      const defaults = windowDefaults[action.id]
      return {
        topZ: nextZ,
        windows: {
          ...state.windows,
          [action.id]: {
            ...state.windows[action.id],
            open: true,
            minimized: false,
            z: nextZ,
            width: defaults.defaultWidth,
            height: defaults.defaultHeight,
            x: defaults.defaultX,
            y: defaults.defaultY,
          },
        },
      }
    }
    case 'close':
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...state.windows[action.id],
            open: false,
            minimized: false,
          },
        },
      }
    case 'minimize':
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...state.windows[action.id],
            minimized: true,
          },
        },
      }
    case 'restore': {
      const nextZ = state.topZ + 1
      return {
        topZ: nextZ,
        windows: {
          ...state.windows,
          [action.id]: {
            ...state.windows[action.id],
            open: true,
            minimized: false,
            z: nextZ,
          },
        },
      }
    }
    case 'focus': {
      if (!state.windows[action.id].open) {
        return state
      }

      const nextZ = state.topZ + 1
      return {
        topZ: nextZ,
        windows: {
          ...state.windows,
          [action.id]: {
            ...state.windows[action.id],
            open: true,
            minimized: false,
            z: nextZ,
          },
        },
      }
    }
    case 'move':
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...state.windows[action.id],
            x: action.x,
            y: action.y,
          },
        },
      }
    case 'resize':
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...state.windows[action.id],
            x: action.x,
            y: action.y,
            width: action.width,
            height: action.height,
          },
        },
      }
    default:
      return state
  }
}
