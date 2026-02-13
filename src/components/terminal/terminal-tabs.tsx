'use client'

import { useSSHStore } from '@/store/ssh-store'
import { useSSHSocket } from '@/hooks/use-ssh-socket'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { X, Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TerminalTabs() {
  const { tabs, activeTabId, setActiveTab, removeTab, updateTab } = useSSHStore()
  const { disconnect } = useSSHSocket()
  
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const tab = tabs.find(t => t.id === tabId)
    if (tab?.connectionId) {
      disconnect(tab.connectionId)
    }
    removeTab(tabId)
  }
  
  if (tabs.length === 0) {
    return null
  }
  
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <ScrollArea className="w-full">
        <div className="flex">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-r border-gray-700 cursor-pointer min-w-[180px] max-w-[250px] group",
                activeTabId === tab.id 
                  ? "bg-gray-900 text-white" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-750"
              )}
            >
              {/* Status Icon */}
              {tab.status === 'connecting' && (
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0" />
              )}
              {tab.status === 'connected' && (
                <Wifi className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              )}
              {tab.status === 'disconnected' && (
                <WifiOff className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              )}
              {tab.status === 'error' && (
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              )}
              
              {/* Tab Name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {tab.sessionName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {tab.host}
                </div>
              </div>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleCloseTab(tab.id, e)}
                className={cn(
                  "h-5 w-5 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-gray-700 text-gray-400 hover:text-white"
                )}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>
    </div>
  )
}
