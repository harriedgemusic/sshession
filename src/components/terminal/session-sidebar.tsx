'use client'

import { useEffect, useState } from 'react'
import { useSSHStore } from '@/store/ssh-store'
import { useSSHSocket } from '@/hooks/use-ssh-socket'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Star,
  Server,
  ChevronRight,
  Folder,
  Settings,
  Monitor
} from 'lucide-react'
import type { SSHSession } from '@/types/ssh'

export function SessionSidebar() {
  const { 
    sessions, 
    tabs, 
    addTab, 
    sidebarOpen, 
    toggleSidebar,
    setQuickConnectOpen,
    setSettingsOpen
  } = useSSHStore()
  const { connect } = useSSHSocket()
  const [search, setSearch] = useState('')
  const [groups, setGroups] = useState<string[]>([])
  
  // Fetch groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/sessions/groups')
        const data = await res.json()
        setGroups(data.groups)
      } catch (error) {
        console.error('Failed to fetch groups:', error)
      }
    }
    fetchGroups()
  }, [])
  
  const handleConnect = async (session: SSHSession) => {
    // Get full session data with credentials
    try {
      const res = await fetch(`/api/sessions/${session.id}/connect`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.session) {
        // Create tab
        const tabId = addTab(session)
        
        // Connect via WebSocket
        connect({
          config: {
            host: data.session.host,
            port: data.session.port,
            username: data.session.username,
            password: data.session.password || undefined,
            privateKey: data.session.privateKey || undefined,
            passphrase: data.session.passphrase || undefined,
            timeout: data.session.timeout,
            terminalType: data.session.terminalType,
            cols: data.session.cols,
            rows: data.session.rows,
          },
          tabId
        })
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }
  
  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.host.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  )
  
  const favoriteSessions = filteredSessions.filter(s => s.isFavorite)
  const ungroupedSessions = filteredSessions.filter(s => !s.group && !s.isFavorite)
  
  const getSessionStatus = (sessionId: string) => {
    const connectedTabs = tabs.filter(t => t.sessionId === sessionId && t.status === 'connected')
    return connectedTabs.length > 0 ? 'connected' : 'disconnected'
  }
  
  if (!sidebarOpen) {
    return (
      <div className="w-12 bg-gray-900 flex flex-col items-center py-4 border-r border-gray-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="mt-4 space-y-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuickConnectOpen(true)}
            className="text-gray-400 hover:text-white"
            title="Quick Connect"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="text-gray-400 hover:text-white"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-64 bg-gray-900 flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-white">SSH Terminal</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white h-6 w-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>
      
      {/* Quick Connect Button */}
      <div className="p-3 border-b border-gray-800">
        <Button
          onClick={() => setQuickConnectOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Connect
        </Button>
      </div>
      
      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Favorites */}
          {favoriteSessions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                <Star className="w-3 h-3" />
                Favorites
              </div>
              {favoriteSessions.map(session => (
                <SessionItem
                  key={session.id}
                  session={session}
                  status={getSessionStatus(session.id)}
                  onConnect={() => handleConnect(session)}
                />
              ))}
            </div>
          )}
          
          {/* Groups */}
          {groups.map(group => {
            const groupSessions = filteredSessions.filter(s => s.group === group)
            if (groupSessions.length === 0) return null
            
            return (
              <div key={group} className="mb-4">
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                  <Folder className="w-3 h-3" />
                  {group}
                </div>
                {groupSessions.map(session => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    status={getSessionStatus(session.id)}
                    onConnect={() => handleConnect(session)}
                  />
                ))}
              </div>
            )
          })}
          
          {/* Ungrouped */}
          {ungroupedSessions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                <Server className="w-3 h-3" />
                Sessions
              </div>
              {ungroupedSessions.map(session => (
                <SessionItem
                  key={session.id}
                  session={session}
                  status={getSessionStatus(session.id)}
                  onConnect={() => handleConnect(session)}
                />
              ))}
            </div>
          )}
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sessions found</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <Button
          variant="outline"
          onClick={() => setSettingsOpen(true)}
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}

interface SessionItemProps {
  session: SSHSession
  status: 'connected' | 'disconnected'
  onConnect: () => void
}

function SessionItem({ session, status, onConnect }: SessionItemProps) {
  return (
    <button
      onClick={onConnect}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-800 text-left group transition-colors"
    >
      <div className={`w-2 h-2 rounded-full ${
        status === 'connected' ? 'bg-green-500' : 'bg-gray-600'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-white truncate">
            {session.name}
          </span>
          {session.isFavorite && (
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {session.username}@{session.host}:{session.port}
        </div>
      </div>
      {session.connectionCount > 0 && (
        <Badge variant="secondary" className="text-xs bg-gray-800">
          {session.connectionCount}
        </Badge>
      )}
    </button>
  )
}
