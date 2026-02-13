'use client'

import { useEffect, useRef, useState } from 'react'
import type { TerminalTheme } from '@/types/ssh'

interface XTermTerminalProps {
  connectionId?: string
  theme?: TerminalTheme
  fontSize?: number
  fontFamily?: string
  onSendInput: (input: string) => void
  onResize: (cols: number, rows: number) => void
}

// Loading placeholder
function TerminalLoading({ theme }: { theme?: TerminalTheme }) {
  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ background: theme?.background || '#1e1e1e' }}
    >
      <div className="text-gray-500 animate-pulse">Loading terminal...</div>
    </div>
  )
}

export function XTermTerminal({
  connectionId,
  theme,
  fontSize = 14,
  fontFamily = "Menlo, Monaco, 'Courier New', monospace",
  onSendInput,
  onResize
}: XTermTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<any>(null)
  const fitAddonRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Initialize terminal with dynamic imports
  useEffect(() => {
    if (!terminalRef.current) return
    
    let mounted = true
    
    const initTerminal = async () => {
      try {
        // Dynamic imports for xterm (client-side only)
        const [{ Terminal: XTerm }, { FitAddon }, { WebLinksAddon }] = await Promise.all([
          import('xterm'),
          import('xterm-addon-fit'),
          import('xterm-addon-web-links')
        ])
        
        // Import CSS
        await import('xterm/css/xterm.css')
        
        if (!mounted) return
        
        const xterm = new XTerm({
          cursorBlink: true,
          cursorStyle: 'block',
          fontSize,
          fontFamily,
          lineHeight: 1.2,
          letterSpacing: 0,
          scrollback: 10000,
          allowProposedApi: true,
          theme: theme ? {
            background: theme.background,
            foreground: theme.foreground,
            cursor: theme.cursor,
            cursorAccent: theme.cursorAccent,
            selectionBackground: theme.selection,
            black: theme.black,
            red: theme.red,
            green: theme.green,
            yellow: theme.yellow,
            blue: theme.blue,
            magenta: theme.magenta,
            cyan: theme.cyan,
            white: theme.white,
            brightBlack: theme.brightBlack,
            brightRed: theme.brightRed,
            brightGreen: theme.brightGreen,
            brightYellow: theme.brightYellow,
            brightBlue: theme.brightBlue,
            brightMagenta: theme.brightMagenta,
            brightCyan: theme.brightCyan,
            brightWhite: theme.brightWhite,
          } : undefined
        })
        
        // Add addons
        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()
        
        xterm.loadAddon(fitAddon)
        xterm.loadAddon(webLinksAddon)
        
        // Open terminal
        xterm.open(terminalRef.current!)
        
        // Fit to container
        setTimeout(() => {
          fitAddon.fit()
          const dims = fitAddon.proposeDimensions()
          if (dims) {
            onResize(dims.cols, dims.rows)
          }
        }, 100)
        
        // Store refs
        xtermRef.current = xterm
        fitAddonRef.current = fitAddon
        
        // Handle input
        xterm.onData((data: string) => {
          onSendInput(data)
        })
        
        setIsLoaded(true)
        
        // Handle resize
        const handleResize = () => {
          if (fitAddonRef.current && xtermRef.current) {
            fitAddonRef.current.fit()
            const dims = fitAddonRef.current.proposeDimensions()
            if (dims) {
              onResize(dims.cols, dims.rows)
            }
          }
        }
        
        window.addEventListener('resize', handleResize)
        
        // Store cleanup function
        ;(xtermRef.current as any)._handleResize = handleResize
        
      } catch (error) {
        console.error('Failed to initialize terminal:', error)
      }
    }
    
    initTerminal()
    
    return () => {
      mounted = false
      if (xtermRef.current) {
        if (xtermRef.current._handleResize) {
          window.removeEventListener('resize', xtermRef.current._handleResize)
        }
        xtermRef.current.dispose()
        xtermRef.current = null
        fitAddonRef.current = null
      }
    }
  }, [])
  
  // Update theme
  useEffect(() => {
    if (xtermRef.current && theme) {
      xtermRef.current.options.theme = {
        background: theme.background,
        foreground: theme.foreground,
        cursor: theme.cursor,
        cursorAccent: theme.cursorAccent,
        selectionBackground: theme.selection,
        black: theme.black,
        red: theme.red,
        green: theme.green,
        yellow: theme.yellow,
        blue: theme.blue,
        magenta: theme.magenta,
        cyan: theme.cyan,
        white: theme.white,
        brightBlack: theme.brightBlack,
        brightRed: theme.brightRed,
        brightGreen: theme.brightGreen,
        brightYellow: theme.brightYellow,
        brightBlue: theme.brightBlue,
        brightMagenta: theme.brightMagenta,
        brightCyan: theme.brightCyan,
        brightWhite: theme.brightWhite,
      }
    }
  }, [theme])
  
  // Handle incoming data
  useEffect(() => {
    const handleData = (event: CustomEvent<{ connectionId: string; data: string }>) => {
      if (event.detail.connectionId === connectionId && xtermRef.current) {
        xtermRef.current.write(event.detail.data)
      }
    }
    
    window.addEventListener('ssh:data', handleData as EventListener)
    
    return () => {
      window.removeEventListener('ssh:data', handleData as EventListener)
    }
  }, [connectionId])
  
  if (!isLoaded) {
    return <TerminalLoading theme={theme} />
  }
  
  return (
    <div 
      ref={terminalRef} 
      className="w-full h-full p-1"
      style={{ background: theme?.background || '#1e1e1e' }}
    />
  )
}
