'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSSHStore } from '@/store/ssh-store'

interface SSHConnectData {
  config: {
    host: string
    port: number
    username: string
    password?: string
    privateKey?: string
    passphrase?: string
    timeout?: number
    terminalType?: string
    cols?: number
    rows?: number
  }
  tabId: string
}

export function useSSHSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { updateTab, tabs } = useSSHStore()
  
  useEffect(() => {
    // Connect to SSH WebSocket service
    socketRef.current = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 30000
    })
    
    const socket = socketRef.current
    
    socket.on('connect', () => {
      console.log('SSH socket connected')
      setIsConnected(true)
    })
    
    socket.on('disconnect', () => {
      console.log('SSH socket disconnected')
      setIsConnected(false)
    })
    
    socket.on('ssh:ready', (data) => {
      console.log('SSH service ready:', data)
    })
    
    socket.on('ssh:connecting', (data) => {
      console.log('SSH connecting:', data)
    })
    
    socket.on('ssh:connected', (data) => {
      console.log('SSH connected:', data)
      updateTab(data.tabId, {
        status: 'connected',
        connectionId: data.connectionId
      })
    })
    
    socket.on('ssh:data', (data) => {
      // Emit custom event for terminal to handle
      window.dispatchEvent(new CustomEvent('ssh:data', { 
        detail: data 
      }))
    })
    
    socket.on('ssh:error', (data) => {
      console.error('SSH error:', data)
      updateTab(data.tabId, {
        status: 'error',
        error: data.error
      })
    })
    
    socket.on('ssh:closed', (data) => {
      console.log('SSH closed:', data)
      const tab = tabs.find(t => t.connectionId === data.connectionId)
      if (tab) {
        updateTab(tab.id, {
          status: 'disconnected',
          connectionId: undefined
        })
      }
    })
    
    return () => {
      socket.disconnect()
    }
  }, [updateTab, tabs])
  
  const connect = useCallback((data: SSHConnectData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ssh:connect', data)
    }
  }, [])
  
  const sendInput = useCallback((connectionId: string, input: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ssh:input', { connectionId, input })
    }
  }, [])
  
  const resize = useCallback((connectionId: string, cols: number, rows: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ssh:resize', { connectionId, cols, rows })
    }
  }, [])
  
  const disconnect = useCallback((connectionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ssh:disconnect', { connectionId })
    }
  }, [])
  
  return {
    connect,
    sendInput,
    resize,
    disconnect,
    isConnected
  }
}
