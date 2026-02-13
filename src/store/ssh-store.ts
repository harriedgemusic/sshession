import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { SSHSession, TerminalTab, TerminalTheme } from '@/types/ssh'

interface SSHStore {
  // Sessions
  sessions: SSHSession[]
  setSessions: (sessions: SSHSession[]) => void
  addSession: (session: SSHSession) => void
  updateSession: (id: string, data: Partial<SSHSession>) => void
  removeSession: (id: string) => void
  
  // Tabs
  tabs: TerminalTab[]
  activeTabId: string | null
  addTab: (session: SSHSession) => string
  updateTab: (id: string, data: Partial<TerminalTab>) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string | null) => void
  
  // Themes
  themes: TerminalTheme[]
  setThemes: (themes: TerminalTheme[]) => void
  currentTheme: string
  setCurrentTheme: (theme: string) => void
  
  // UI State
  sidebarOpen: boolean
  toggleSidebar: () => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  
  // Quick Connect
  quickConnectOpen: boolean
  setQuickConnectOpen: (open: boolean) => void
}

export const useSSHStore = create<SSHStore>((set, get) => ({
  // Sessions
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session] 
  })),
  updateSession: (id, data) => set((state) => ({
    sessions: state.sessions.map(s => s.id === id ? { ...s, ...data } : s)
  })),
  removeSession: (id) => set((state) => ({
    sessions: state.sessions.filter(s => s.id !== id),
    tabs: state.tabs.filter(t => t.sessionId !== id)
  })),
  
  // Tabs
  tabs: [],
  activeTabId: null,
  addTab: (session) => {
    const tabId = uuidv4()
    const tab: TerminalTab = {
      id: tabId,
      sessionId: session.id,
      sessionName: session.name,
      host: session.host,
      status: 'connecting'
    }
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tabId
    }))
    return tabId
  },
  updateTab: (id, data) => set((state) => ({
    tabs: state.tabs.map(t => t.id === id ? { ...t, ...data } : t)
  })),
  removeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== id)
    const newActiveId = state.activeTabId === id 
      ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
      : state.activeTabId
    return { tabs: newTabs, activeTabId: newActiveId }
  }),
  setActiveTab: (id) => set({ activeTabId: id }),
  
  // Themes
  themes: [],
  setThemes: (themes) => set({ themes }),
  currentTheme: 'default',
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  
  // Quick Connect
  quickConnectOpen: false,
  setQuickConnectOpen: (open) => set({ quickConnectOpen: open }),
}))
