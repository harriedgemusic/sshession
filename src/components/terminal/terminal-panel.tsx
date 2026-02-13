'use client'

import { useCallback } from 'react'
import { XTermTerminal } from './xterm-terminal'
import { useSSHStore } from '@/store/ssh-store'
import { useSSHSocket } from '@/hooks/use-ssh-socket'
import { AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TerminalTab } from '@/types/ssh'

interface TerminalPanelProps {
  tab: TerminalTab
}

export function TerminalPanel({ tab }: TerminalPanelProps) {
  const { sessions, themes, currentTheme, removeTab } = useSSHStore()
  const { sendInput, resize, disconnect } = useSSHSocket()
  
  const session = sessions.find(s => s.id === tab.sessionId)
  const theme = themes.find(t => t.name === (session?.theme || currentTheme))
  
  const handleSendInput = useCallback((input: string) => {
    if (tab.connectionId) {
      sendInput(tab.connectionId, input)
    }
  }, [tab.connectionId, sendInput])
  
  const handleResize = useCallback((cols: number, rows: number) => {
    if (tab.connectionId) {
      resize(tab.connectionId, cols, rows)
    }
  }, [tab.connectionId, resize])
  
  const handleReconnect = useCallback(() => {
    // Remove tab and let user reconnect from sidebar
    removeTab(tab.id)
  }, [tab.id, removeTab])
  
  if (tab.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] text-white p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
        <p className="text-gray-400 text-center mb-4 max-w-md">
          {tab.error || 'Failed to connect to SSH server'}
        </p>
        <Button onClick={handleReconnect} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }
  
  if (tab.status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] text-white p-8">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connecting...</h3>
        <p className="text-gray-400">{tab.host}</p>
      </div>
    )
  }
  
  if (tab.status === 'disconnected') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] text-white p-8">
        <WifiOff className="w-16 h-16 text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Disconnected</h3>
        <p className="text-gray-400 text-center mb-4">
          The SSH connection has been closed
        </p>
        <Button onClick={handleReconnect} variant="outline">
          Reconnect
        </Button>
      </div>
    )
  }
  
  return (
    <div className="h-full w-full">
      <XTermTerminal
        connectionId={tab.connectionId}
        theme={theme}
        fontSize={session?.fontSize || 14}
        fontFamily={session?.fontFamily || "Menlo, Monaco, 'Courier New', monospace"}
        onSendInput={handleSendInput}
        onResize={handleResize}
      />
    </div>
  )
}
