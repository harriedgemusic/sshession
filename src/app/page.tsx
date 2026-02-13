'use client'

import { useEffect } from 'react'
import { useSSHStore } from '@/store/ssh-store'
import { SessionSidebar } from '@/components/terminal/session-sidebar'
import { TerminalTabs } from '@/components/terminal/terminal-tabs'
import { TerminalPanel } from '@/components/terminal/terminal-panel'
import { QuickConnectDialog } from '@/components/terminal/quick-connect-dialog'
import { SettingsDialog } from '@/components/terminal/settings-dialog'
import { Terminal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { 
    tabs, 
    activeTabId, 
    sessions,
    setSessions,
    themes,
    setThemes,
    setQuickConnectOpen 
  } = useSSHStore()
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sessions
        const sessionsRes = await fetch('/api/sessions')
        const sessionsData = await sessionsRes.json()
        setSessions(sessionsData.sessions)
        
        // Fetch themes
        const themesRes = await fetch('/api/themes')
        const themesData = await themesRes.json()
        setThemes(themesData.themes)
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
      }
    }
    fetchData()
  }, [setSessions, setThemes])
  
  const activeTab = tabs.find(t => t.id === activeTabId)
  
  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <SessionSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            <span className="font-medium">SSH Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickConnectOpen(true)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Connection
            </Button>
          </div>
        </header>
        
        {/* Tabs */}
        <TerminalTabs />
        
        {/* Terminal Content */}
        <main className="flex-1 overflow-hidden">
          {activeTab ? (
            <TerminalPanel tab={activeTab} />
          ) : (
            <WelcomeScreen 
              hasSessions={sessions.length > 0}
              onNewConnection={() => setQuickConnectOpen(true)}
            />
          )}
        </main>
      </div>
      
      {/* Dialogs */}
      <QuickConnectDialog />
      <SettingsDialog />
    </div>
  )
}

interface WelcomeScreenProps {
  hasSessions: boolean
  onNewConnection: () => void
}

function WelcomeScreen({ hasSessions, onNewConnection }: WelcomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 p-8">
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
        <Terminal className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">SSH Terminal</h1>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Connect to your servers securely with a modern, feature-rich terminal interface.
      </p>
      
      <div className="flex flex-col gap-3">
        <Button
          onClick={onNewConnection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Connection
        </Button>
        
        {!hasSessions && (
          <p className="text-sm text-gray-500 text-center mt-4">
            No saved sessions yet. Create your first connection to get started.
          </p>
        )}
      </div>
      
      {/* Features */}
      <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl">
        <FeatureCard
          icon="🔌"
          title="Quick Connect"
          description="Connect to any SSH server with just a few clicks"
        />
        <FeatureCard
          icon="📑"
          title="Multi-Tab"
          description="Open multiple terminal sessions in tabs"
        />
        <FeatureCard
          icon="🎨"
          title="Themes"
          description="Customize your terminal with beautiful themes"
        />
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="text-center p-4 rounded-lg bg-gray-800/50 border border-gray-700">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  )
}
