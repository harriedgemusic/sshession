'use client'

import { useSSHStore } from '@/store/ssh-store'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { TerminalTheme } from '@/types/ssh'

interface ThemePreviewProps {
  theme: TerminalTheme
  onSelect: () => void
}

export function ThemePreview({ theme, onSelect }: ThemePreviewProps) {
  const { currentTheme } = useSSHStore()
  const isSelected = currentTheme === theme.name
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative p-3 rounded-lg border transition-all text-left",
        isSelected 
          ? "border-blue-500 ring-2 ring-blue-500/30" 
          : "border-gray-700 hover:border-gray-600"
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      
      <div className="text-sm font-medium mb-2">{theme.displayName}</div>
      
      {/* Terminal Preview */}
      <div 
        className="rounded overflow-hidden text-xs"
        style={{ backgroundColor: theme.background }}
      >
        <div 
          className="h-6 flex items-center gap-1 px-2"
          style={{ backgroundColor: theme.brightBlack }}
        >
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        <div className="p-2 font-mono space-y-1">
          <div style={{ color: theme.foreground }}>
            <span style={{ color: theme.green }}>$</span> ssh user@server
          </div>
          <div style={{ color: theme.foreground }}>
            <span style={{ color: theme.blue }}>user@server</span>
            <span style={{ color: theme.foreground }}>:</span>
            <span style={{ color: theme.cyan }}>~</span>
            <span style={{ color: theme.foreground }}>$</span>
            <span className="animate-pulse">▋</span>
          </div>
        </div>
      </div>
      
      {/* Color Palette */}
      <div className="flex gap-0.5 mt-2">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.black }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.red }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.green }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.yellow }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.blue }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.magenta }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.cyan }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.white }} />
      </div>
    </button>
  )
}
